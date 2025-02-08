package expo.modules.ocrmodule

import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.Text.TextBlock
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class OcrModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('OcrModule')` in JavaScript.
    Name("OcrModule")

    AsyncFunction("recognizeTextAsync") { uriString: String, promise: Promise ->
      val context = appContext.reactContext
        ?: throw Exceptions.ReactContextLost()

      val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

      // Convert string -> Uri -> InputImage
      val imageUri = Uri.parse(uriString)
      val inputImage = try {
        InputImage.fromFilePath(context, imageUri)
      } catch (e: Exception) {
        promise.reject(CodedException("Failed to load image: $e"))
        return@AsyncFunction
      }

      recognizer.process(inputImage)
        .addOnSuccessListener { textResult ->
          val textBlocksList = mutableListOf<Map<String, Any?>>()

          textResult.textBlocks.forEach { block ->
            val linesList = mutableListOf<Map<String, Any?>>()

            block.lines.forEach { line ->
              val wordsList = mutableListOf<Map<String, String>>()

              line.elements.forEach { element ->
                wordsList.add(
                  mapOf(
                    "text" to element.text
                  )
                )
              }

              linesList.add(
                mapOf(
                  "text" to line.text,
                  "words" to wordsList
                )
              )
            }

            val blockMap = mapOf(
              "text" to block.text,
              "boundingBox" to block.boundingBox?.let { bbox ->
                mapOf(
                  "left" to bbox.left,
                  "top" to bbox.top,
                  "right" to bbox.right,
                  "bottom" to bbox.bottom
                )
              },
              "lines" to linesList
            )
            textBlocksList.add(blockMap)
          }

          val resultMap = mapOf(
            "text" to textResult.text,
            "textBlocks" to textBlocksList
          )

          promise.resolve(resultMap)
        }
        .addOnFailureListener { e ->
          promise.reject(CodedException("ML Kit error: ${e.message}", e))
        }
        .addOnCanceledListener {
          promise.reject(CodedException("recognizeTextAsync was canceled."))
        }
    }
  }
}
