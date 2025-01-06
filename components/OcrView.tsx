import React, { useState, useEffect, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';
//import RNTesseractOcr from 'react-native-tesseract-ocr';

export const OcrView = () => {
  const [text, setText] = useState('');
  const camera = useRef(null);

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  // ---

  useEffect(() => {
    (async () => {
      const result = await recognizeText('path/to/your/tesseract/language/tessdata', camera.current);
      setText(result.text);
    })();
  }, []);

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

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  // ---

  const recognizeText = async (tessdataPath: string, cameraRef: any) => {
    const data = await cameraRef.current.takePictureAsync();
    //const result = await RNTesseractOcr.recognize(tessdataPath, data.uri);
    const result = { text: '' };
    return result;
  };

  const handleCameraFrame = async (frame: any) => {
    if (!camera.current) return;

    const result = await recognizeText('path/to/your/tesseract/language/tessdata', camera.current);
    setText(result.text);
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity> */}
        </View>
      </CameraView>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
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
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
