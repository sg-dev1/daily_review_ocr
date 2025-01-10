import { CameraCapturedPicture } from 'expo-camera';
import React, { useState } from 'react';
import { StyleSheet, Text, Image, TouchableOpacity, View } from 'react-native';
import CustomScrollView from './CustomScrollView';
import CustomCameraView from './CustomCameraView';

const OcrView = () => {
  const [text, setText] = useState('');
  const [capturedPicture, setCapturedPicture] = useState<CameraCapturedPicture | null>(null);

  const isLoading = false;

  const reset = () => {
    setText('');
    setCapturedPicture(null);
  };

  if (text === '') {
    return <CustomCameraView setText={setText} setCapturedPicture={setCapturedPicture} />;
  } else {
    return (
      <CustomScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity disabled={isLoading} style={styles.button} onPress={reset}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
        {capturedPicture && (
          <View style={styles.imageView}>
            <Image style={styles.image} source={capturedPicture} resizeMode="contain" />
          </View>
        )}
        {!isLoading && <Text style={styles.text}>{text}</Text>}
      </CustomScrollView>
    );
  }
};

const styles = StyleSheet.create({
  text: {
    flex: 1,
    width: '100%',
    borderWidth: 1,
    borderColor: 'blue',
    padding: 10,
    borderRadius: 10,
  },
  imageView: {
    height: 500,
  },
  image: {
    width: '100%',
    flex: 1,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'blue',
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
});

export default OcrView;
