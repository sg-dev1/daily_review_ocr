import {
  CameraCapturedPicture,
  CameraOrientation,
  CameraPictureOptions,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Button } from 'react-native';
import OcrModule from '../../modules/ocr-module';
import CustomScrollView from '../CustomScrollView';
//import ImageResizer from 'react-native-image-resizer';  // to be decided if this can be removed from dependencies
import { manipulateAsync } from 'expo-image-manipulator';
import * as ScreenOrientation from 'expo-screen-orientation';

interface CustomCameraViewProps {
  setText: (value: string) => void;
  setCapturedPicture: (data: CameraCapturedPicture | null) => void;
}

const CustomCameraView = ({ setText, setCapturedPicture }: CustomCameraViewProps) => {
  const debugImageCapture = true;
  const debugTextprocessing = false;

  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [cameraOrientation, setCameraOrientation] = useState<CameraOrientation>('portrait');

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

      const result = await manipulateAsync(uri, [{ rotate: rotateValue }]);
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

    //const captureOptions: CameraPictureOptions = { quality: 1, exif: true };
    const captureOptions: CameraPictureOptions = { exif: true, skipProcessing: true };

    const data = await cameraRef.current.takePictureAsync(captureOptions);
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
      await recognizeTextFromImage(data.uri, logMessages);
      setCapturedPicture(data);
    } else {
      console.warn('cameraRef.current.takePictureAsync returned undefined');
    }
  };

  const recognizeTextFromImage = async (path: string, logMessages: string[]) => {
    setIsLoading(true);

    try {
      const recognizedText = await OcrModule.recognizeTextAsync(path);
      const textParts = recognizedText.split('<TERMINATOR>');

      if (debugTextprocessing) {
        // BEGIN DEBUG
        console.log('---');
        for (let i = 0; i < textParts.length; i++) {
          console.log(i, ':', textParts[i]);
        }
        console.log('---');
        // END DEBUG
      }

      let resultText = textParts[0];
      if (debugImageCapture) {
        const logMsg = logMessages.join('\n-\n');
        resultText = '/// BEGIN DEBUG ///\n' + logMsg + '\n/// END DEBUG ///' + '\n\n\n' + textParts[0];
      }

      setText(resultText);
    } catch (err) {
      console.error(err);
      setText('');
    }

    setIsLoading(false);
  };

  return (
    <CustomScrollView>
      <View style={styles.cameraView}>
        <CameraView
          style={styles.camera}
          facing={'back'}
          ref={cameraRef}
          ratio="4:3"
          responsiveOrientationWhenOrientationLocked={true}
          onResponsiveOrientationChanged={(event) => {
            setCameraOrientation(event.orientation);
          }}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity disabled={isLoading} style={styles.button} onPress={toggleImageRecognition}>
              <Text style={styles.buttonText}>Recognize</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </CustomScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingTop: 0,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  cameraView: {
    height: 500,
  },
  camera: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  text: {
    flex: 1,
    width: '100%',
    borderWidth: 1,
    borderColor: 'blue',
    padding: 10,
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: 200,
  },
});

export default CustomCameraView;
