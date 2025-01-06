import React, { useState, useRef } from 'react';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { StyleSheet, Text, View, TouchableOpacity, Button, Image } from 'react-native';
import OcrModule from '../modules/ocr-module';

// TODOs: This needs a scroll view to be fully usable, e.g. adapted version
// of ParallaxScrollView.tsx
export const OcrView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [capturedPicture, setCapturedPicture] = useState<CameraCapturedPicture | null>(null);
  const [text, setText] = useState('');
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();

  // ---

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

  const toggleImageRecognition = async () => {
    if (!cameraRef.current) return;

    const data = await cameraRef.current.takePictureAsync();
    if (data) {
      await recognizeTextFromImage(data.uri);
      setCapturedPicture(data);
    } else {
      console.warn('cameraRef.current.takePictureAsync returned undefined');
    }
  };

  const recognizeTextFromImage = async (path: string) => {
    setIsLoading(true);

    try {
      const recognizedText = await OcrModule.recognizeTextAsync(path);
      setText(recognizedText);
    } catch (err) {
      console.error(err);
      setText('');
    }

    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={'back'} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity disabled={isLoading} style={styles.button} onPress={toggleImageRecognition}>
            <Text style={styles.buttonText}>Recognize</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {capturedPicture && <Image style={styles.image} source={capturedPicture} />}
      {!isLoading && <Text style={styles.text}>{text}</Text>}
    </View>
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
  camera: {
    flex: 1,
    width: '100%',
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
