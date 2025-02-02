import { CameraCapturedPicture, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Button } from 'react-native';
import OcrModule from '../../modules/ocr-module';
import CustomScrollView from '../CustomScrollView';

interface CustomCameraViewProps {
  setText: (value: string) => void;
  setCapturedPicture: (data: CameraCapturedPicture | null) => void;
}

const CustomCameraView = ({ setText, setCapturedPicture }: CustomCameraViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
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
      const textParts = recognizedText.split('<TERMINATOR>');
      // BEGIN DEBUG
      console.log('---');
      for (let i = 0; i < textParts.length; i++) {
        console.log(i, ':', textParts[i]);
      }
      console.log('---');
      // END DEBUG
      setText(textParts[0]);
    } catch (err) {
      console.error(err);
      setText('');
    }

    setIsLoading(false);
  };

  return (
    <CustomScrollView>
      <View style={styles.cameraView}>
        <CameraView style={styles.camera} facing={'back'} ref={cameraRef}>
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
