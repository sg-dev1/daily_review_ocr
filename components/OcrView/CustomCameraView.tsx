import {
  CameraCapturedPicture,
  CameraOrientation,
  CameraPictureOptions,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Button, Dimensions } from 'react-native';
import OcrModule from '../../modules/ocr-module';
import { ImageManipulator } from 'expo-image-manipulator';
import * as ScreenOrientation from 'expo-screen-orientation';
import { OcrResult, OcrTextBlock } from '../../modules/ocr-module/src/OcrModule';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CustomCameraViewProps {
  setText: (value: string) => void;
  setCapturedPicture: (data: CameraCapturedPicture | null) => void;
  onSuccess: () => void;
}

// Type as used in ImageManipulatorContext.resize()  (expo-image-manipulator/src/ImageManipulatorContext.ts)
type ImageResizeType = { width?: number | null; height?: number | null };

const CustomCameraView = ({ setText, setCapturedPicture, onSuccess }: CustomCameraViewProps) => {
  const debugImageCapture = true;
  const debugTextprocessing = true;

  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [cameraOrientation, setCameraOrientation] = useState<CameraOrientation>('portrait');
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);

  const [cameraHeight, setCameraHeight] = useState(screenHeight);

  const [permission, requestPermission] = useCameraPermissions();

  // ---

  /*
  Availaible picture sizes ["4032x3024", "4000x3000", "4032x2268", "3840x2160", "4000x2000", "3264x2448", 
                            "3264x1836", "2560x1920", "2688x1512", "1920x1920", "2560x1280", "2048x1536", 
                            "1920x1440", "1920x1080", "4624x3472"]
  const printInfo = useCallback(async () => {
    if (cameraRef.current) {
      const pictureSizes = await cameraRef.current.getAvailablePictureSizesAsync();
      console.log('Availaible picture sizes', pictureSizes);
    }
  }, [cameraRef.current]);

  useEffect(() => {
    printInfo();
  }, [printInfo]);
  */

  useEffect(() => {
    // It seems orientation is initially locked per default...
    // (maybe the app.json is also only respected after a new build?)
    ScreenOrientation.unlockAsync();

    // Bei 4:3-Ratio: Höhe = Breite * 4/3
    const ratioHeight = screenWidth * (4 / 3);
    setCameraHeight(ratioHeight);
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // ---
  // helpers, may be moved to other file

  const cameraCapturedPictureToString = (picture: CameraCapturedPicture | undefined) => {
    if (!picture) {
      return 'undefined';
    } else {
      return `CameraCapturedPicture {width: ${picture.width}, height: ${picture.height}, uri: ${picture.uri}}`;
    }
  };

  const screenOrientationToFriendlyName = (orientation: ScreenOrientation.Orientation) => {
    let name = '';
    switch (orientation) {
      case ScreenOrientation.Orientation.PORTRAIT_UP:
        name = 'PORTRAIT_UP';
        break;
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        name = 'PORTRAIT_DOWN';
        break;
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        name = 'LANDSCAPE_LEFT';
        break;
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        name = 'LANDSCAPE_RIGHT';
        break;
      case ScreenOrientation.Orientation.UNKNOWN:
        name = 'UNKNOWN';
        break;
      default:
        name = 'INVALID';
    }

    return `${name}(${orientation})`;
  };

  const exifOrientationToFriendlyName = (exifOrientation: number) => {
    /*    
    exifOrientation --> Description
    1: Normal (0° rotation)
    3: Upside-down (180° rotation)
    6: Rotated 90° counterclockwise (270° clockwise)
    8: Rotated 90° clockwise (270° counterclockwise)
    */
    let name = 'unknown';
    if (1 === exifOrientation) {
      name = 'Normal (0° rotation)';
    } else if (3 === exifOrientation) {
      name = 'Upside-down (180° rotation)';
    } else if (6 === exifOrientation) {
      name = 'Rotated 90° counterclockwise (270° clockwise)';
    } else if (8 === exifOrientation) {
      name = 'Rotated 90° clockwise (270° counterclockwise)';
    }

    return `[${name}] (${exifOrientation})`;
  };

  // ---
  //
  // Logic to take and manipulate a camera image
  //

  // Wrapper around the new object-oriented API of expo-image-manipulator
  const imageManipulatorWrapper = async (uri: string, rotationInDegrees?: number, resize?: ImageResizeType) => {
    let manipulatorCtx = ImageManipulator.manipulate(uri);

    if (resize) {
      manipulatorCtx = manipulatorCtx.resize(resize);
    }
    if (rotationInDegrees) {
      manipulatorCtx = manipulatorCtx.rotate(rotationInDegrees);
    }

    const imgRef = await manipulatorCtx.renderAsync();
    const result = await imgRef.saveAsync({ base64: false, compress: 1 });
    return result;
  };

  // These values are tested with a Google Pixel 7a
  // (May be different on other phone, I don't know)
  const fixRotation = async (
    uri: string,
    exifOrientation: number,
    orientation: ScreenOrientation.Orientation,
    logMessages: string[]
  ) => {
    /*    
    exifOrientation --> Description
    1: Normal (0° rotation)
    3: Upside-down (180° rotation)
    6: Rotated 90° counterclockwise (270° clockwise)
    8: Rotated 90° clockwise (270° counterclockwise)
    */
    if (debugImageCapture) {
      const logMsg = `exif orientation: ${exifOrientationToFriendlyName(exifOrientation)}`;
      console.log(logMsg);
      logMessages.push(logMsg);
    }

    if (orientation === ScreenOrientation.Orientation.PORTRAIT_UP) {
      // 90° counterclockwise rotated
      if (exifOrientation === 6) {
        if (debugImageCapture) {
          const logMsg = 'Exif Orientation is already 6 (Screenorientation = PORTRAIT_UP). No need for rotation.';
          console.log(logMsg);
          logMessages.push(logMsg);
        }
        return uri;
      }

      let rotateValue = 0;
      if (exifOrientation === 1) {
        rotateValue = 90;
      } else if (exifOrientation === 3) {
        // verified as correct rotation
        rotateValue = -90;
      } else if (exifOrientation === 8) {
        rotateValue = 180;
      } else {
        const logMsg = `Unknown rotate value given: ${exifOrientation}`;
        console.warn(logMsg);
        logMessages.push(logMsg);
        return uri;
      }

      if (debugImageCapture) {
        const logMsg = `Rotating image by ${rotateValue}°, because exif Orientation is ${exifOrientation}`;
        console.log(logMsg);
        logMessages.push(logMsg);
      }

      const result = await imageManipulatorWrapper(uri, rotateValue);
      return result.uri;
    } else {
      if (exifOrientation === 1 && orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
        // normal orientation of the camera
        if (debugImageCapture) {
          const logMsg = 'Exif Orientation is already 1 (Screenorientation = LANDSCAPE_RIGHT). No need for rotation.';
          console.log(logMsg);
          logMessages.push(logMsg);
        }
        return uri;
      }

      if (exifOrientation === 3 && orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT) {
        // upside down orientation of the camera
        if (debugImageCapture) {
          const logMsg = 'Exif Orientation is already 3 (Screenorientation = LANDSCAPE_LEFT). No need for rotation.';
          console.log(logMsg);
          logMessages.push(logMsg);
        }
        return uri;
      }

      if (exifOrientation === 8 && orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN) {
        // 90° clockwise rotated orientation of the camera
        if (debugImageCapture) {
          const logMsg = 'Exif Orientation is already 3 (Screenorientation = LANDSCAPE_LEFT). No need for rotation.';
          console.log(logMsg);
          logMessages.push(logMsg);
        }
        return uri;
      }

      // not implemented
      const logMsg = `Correction for orientation ${screenOrientationToFriendlyName(
        orientation
      )} is not yet implemented`;
      console.warn(logMsg);
      if (debugImageCapture) {
        logMessages.push(logMsg);
      }
      return uri;
    }
  };

  const toggleImageRecognition = async () => {
    if (!cameraRef.current) return;

    const screenOrientation = await ScreenOrientation.getOrientationAsync();
    const logMessages: string[] = [];
    if (debugImageCapture) {
      const logMsg = `Screenorientation: ${screenOrientationToFriendlyName(
        screenOrientation
      )}, CameraOrientation: ${cameraOrientation}`;
      console.log(logMsg);
      logMessages.push(logMsg);
    }

    //await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

    // Settings in previous version
    //const captureOptions: CameraPictureOptions = { exif: true, skipProcessing: true };
    // Settings as suggested by ChatGPT
    const captureOptions: CameraPictureOptions = { exif: true, quality: 1, base64: false, skipProcessing: false };

    let data = await cameraRef.current.takePictureAsync(captureOptions);
    if (debugImageCapture) {
      const logMsg = 'CameraCapturedPicture: ' + cameraCapturedPictureToString(data);
      console.log(logMsg);
      logMessages.push(logMsg);
    }

    //await ScreenOrientation.unlockAsync();

    if (data) {
      data.uri = await fixRotation(data.uri, data.exif.Orientation, screenOrientation, logMessages);
      //console.log('create rresized image...');
      //const result = await ImageResizer.createResizedImage(data.uri, 4000, 3000, 'JPEG', 100, 0);
      //console.log('Image resized, result=', result);

      // Resize the image to smaller size
      data = await imageManipulatorWrapper(data.uri, undefined /*rotationInDegrees*/, { width: 1600 });

      if (debugImageCapture) {
        const logMsg = 'Using image for text recognition: ' + cameraCapturedPictureToString(data);
        console.log(logMsg);
        logMessages.push(logMsg);
      }
      await recognizeTextFromImage(data.uri, data.width, data.height, screenOrientation, logMessages);
      setCapturedPicture(data);

      onSuccess();
    } else {
      console.warn('cameraRef.current.takePictureAsync returned undefined');
    }
  };

  const toggleFlash = () => {
    setIsFlashEnabled((v) => !v);
  };

  // ---
  //
  // Text recognition in image using Google's ML Kit
  //

  const printTextBlocks = (textBlocks: OcrTextBlock[]) => {
    for (let i = 0; i < textBlocks.length; i++) {
      const textBlock = textBlocks[i];
      console.log(`\tBLOCK[${i}] = ${printTextBlock(textBlock)}`);
    }
  };

  const printTextBlock = (textBlock: OcrTextBlock) => {
    const textStart = textBlock.text.slice(0, 20);
    return (
      `boundingBox={left: ${textBlock.boundingBox.left.toFixed(2)}, top: ${textBlock.boundingBox.top.toFixed(2)}, ` +
      `right: ${textBlock.boundingBox.right.toFixed(2)}, bottom: ${textBlock.boundingBox.bottom.toFixed(2)}}, lines=${
        textBlock.lines.length
      }, textStart=${textStart}`
    );
  };

  const recognizeTextFromImage = async (
    path: string,
    imageWidth: number,
    imageHeight: number,
    screenOrientation: ScreenOrientation.Orientation,
    logMessages: string[]
  ) => {
    setIsLoading(true);

    try {
      const result: OcrResult = await OcrModule.recognizeTextAsync(path);
      const { text, ...processingResultRest } = result;

      if (debugTextprocessing) {
        console.log(`\nNumber of text blocks ${processingResultRest.textBlocks.length}`);
        printTextBlocks(processingResultRest.textBlocks);
      }

      // 1) Sort according to top (e.g. blocks sorted from top to bottom)
      const sortedTextBlocks = processingResultRest.textBlocks
        .map((textBlock: OcrTextBlock) => {
          let xNormalizer, yNormalizer;
          if (
            screenOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
            screenOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
          ) {
            xNormalizer = imageHeight;
            yNormalizer = imageWidth;
          } else {
            xNormalizer = imageWidth;
            yNormalizer = imageHeight;
          }

          const normalizedBoundingBox = {
            left: textBlock.boundingBox.left / xNormalizer,
            top: textBlock.boundingBox.top / yNormalizer,
            right: textBlock.boundingBox.right / xNormalizer,
            bottom: textBlock.boundingBox.bottom / yNormalizer,
          };

          return { text: textBlock.text, boundingBox: normalizedBoundingBox, lines: textBlock.lines } as OcrTextBlock;
        })
        .sort((block1: OcrTextBlock, block2: OcrTextBlock) => block1.boundingBox.top - block2.boundingBox.top);

      if (debugTextprocessing) {
        console.log('---\n');
        printTextBlocks(sortedTextBlocks);
      }

      // 2) Address problems with blocks that are in the same row (sort on left for the row)
      // -- Main issue here is to detect what is part of a row and what belongs to the next row
      //    (e.g. do we have multiple rows at all, or only single row, etc.)
      // -- Downside without having this fix is that rows may be sorted incorrectly if there are more than one column
      //
      // - Only valid for PORTRAIT_UP and PORTRAIT_DOWN (for LANDSCAPE it is swapped)
      //   boundingBox.{top, bottom}   (=y)   < CameraCapturedPicture.width   (e.g. 4032)
      //   boundingBox.{left, right}   (=x)   < CameraCapturedPicture.height  (e.g. 3024)
      // - Use this to normalize {left, top, right, bottom} to be in [0;1]
      // - Examples for column detection:
      //    - 2 Columns left and right < 0.5 --> 1st column
      //                                else --> 2nd column
      //    - For 3 Columns [0.33, 0.66] as split points for left and right
      //    - For 4 Columns [0.25, 0.5, 0.75]
      //    ...
      // TODO

      // 3) Merge a final result text
      const recognizedText = sortedTextBlocks.map((block: OcrTextBlock) => block.text).join('\n\n');

      // 4) Store text for next render (incl. debug info)
      let resultText = recognizedText;
      if (debugImageCapture) {
        const logMsg = logMessages.join('\n-\n');
        resultText = '/// BEGIN DEBUG ///\n' + logMsg + '\n/// END DEBUG ///' + '\n\n\n' + recognizedText; //+ textParts[0];
      }

      setText(resultText);
    } catch (err) {
      console.error(err);
      setText('');
    }

    setIsLoading(false);
  };

  // ---

  return (
    <View style={styles.container}>
      <View style={[styles.cameraView, { height: cameraHeight }]}>
        <CameraView
          style={styles.camera}
          facing="back"
          ratio="4:3"
          ref={cameraRef}
          enableTorch={isFlashEnabled}
          responsiveOrientationWhenOrientationLocked
          onResponsiveOrientationChanged={(event) => setCameraOrientation(event.orientation)}
          autofocus="on"
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity disabled={isLoading} style={styles.button} onPress={toggleImageRecognition}>
              <Text style={styles.buttonText}>Recognize</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={isLoading} style={styles.button} onPress={toggleFlash}>
              <Text style={styles.buttonText}>Toggle Flash</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraView: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
});

export default CustomCameraView;
