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

private const val STRING_TERMINATOR = "<TERMINATOR>"

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
          val sortedTextBlocks = processAndSortTextBlocks(textResult)

          val result = sortedTextBlocks + STRING_TERMINATOR + textResult.text

          promise.resolve(result)
        }
        .addOnFailureListener { e ->
          promise.reject(CodedException("ML Kit error: ${e.message}", e))
        }
        .addOnCanceledListener {
          promise.reject(CodedException("recognizeTextAsync was canceled."))
        }
    }
  }

  /*
  // Generated with help of ChatGpt
  private fun processAndSortTextBlocks(result: Text): String {
    val textBlocks = result.textBlocks

    // Custom comparator to sort by X (columns) first, then Y (top to bottom)
    //val sortedBlocks = textBlocks.sortedWith(compareBy({ it.boundingBox?.left }, { it.boundingBox?.top }))
    // Update 1: Change primary and secondary sorting criteria
    val sortedBlocks = textBlocks.sortedWith(compareBy({ it.boundingBox?.top }, { it.boundingBox?.left }))

    val combinedTexts = sortedBlocks.map { block ->
        // Join all lines in the block into a single line of text
        block.lines.joinToString(" ") { it.text.replace("\n", " ") }
    }

    // Join all combined texts into a single string
    return combinedTexts.joinToString("\n")
  }
  */

  private fun processAndSortTextBlocks(result: Text): String {
    val textBlocks = result.textBlocks

    // Group text blocks by X coordinate (left) to create columns
    val columns = mutableListOf<MutableList<Text.TextBlock>>()

    // Iterate over each text block and assign it to a column based on the X coordinate
    for (block in textBlocks) {
        val left = block.boundingBox?.left ?: continue

        // Find the column to which this block belongs
        val column = columns.find { it.isNotEmpty() && it.first().boundingBox?.left ?: Int.MAX_VALUE <= left } 
          ?: mutableListOf<Text.TextBlock>().also { columns.add(it) }

        // Add the block to the corresponding column
        column.add(block)
    }

    // Debug output: Generate a string that summarizes the columns and their sizes
    val columnInfo = StringBuilder()
    columnInfo.append("Total columns: ${columns.size}\n")
    columns.forEachIndexed { index, column ->
        columnInfo.append("Column $index contains ${column.size} blocks\n")
    }

    // Sort each column by the Y coordinate (top) and concatenate the text
    val sortedColumns = columns.map { column ->
        column.sortedBy { it.boundingBox?.top }
            .map { block ->
                // Join all lines in the block into a single line of text
                block.lines.joinToString(" ") { it.text.replace("\n", " ") }
            }
            .joinToString("\n\n")
    }

    // Join all sorted columns into a single string, separating them by a space (or any separator you prefer)
    return sortedColumns.joinToString("\n\n\n") + STRING_TERMINATOR + columnInfo.toString()
  }
}
