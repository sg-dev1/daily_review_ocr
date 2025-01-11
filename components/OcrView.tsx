import { CameraCapturedPicture } from 'expo-camera';
import React, { useState } from 'react';
import { StyleSheet, Text, Image, TouchableOpacity, View, TextInput } from 'react-native';
import CustomScrollView from './CustomScrollView';
import CustomCameraView from './CustomCameraView';
import { postLogin, postTextSnippet } from '../lib/api-client';

const OcrView = () => {
  const [text, setText] = useState('');
  const [capturedPicture, setCapturedPicture] = useState<CameraCapturedPicture | null>(null);
  const [nextButtonPressed, setNextButtonPressed] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [note, setNote] = useState('');
  const [page, setPage] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const onResetButtonPressed = () => {
    setText('');
    setCapturedPicture(null);
  };

  const onNextButtonPressed = () => {
    setNextButtonPressed(true);
  };

  const onSubmitButtonPressed = async () => {
    setSubmitButtonDisabled(true);
    await postLogin({
      username: 'string',
      password: 'string',
    });

    await postTextSnippet({
      text: text,
      bookTitle: bookTitle,
      bookAuthor: author,
      note: '',
      location: '',
    });

    // TODO give feedback if successful (currently only logged to terminal)

    setNextButtonPressed(false);
    onResetButtonPressed();
    setSubmitButtonDisabled(false);
  };

  if (text === '') {
    return <CustomCameraView setText={setText} setCapturedPicture={setCapturedPicture} />;
  } else {
    if (!nextButtonPressed) {
      return (
        <CustomScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onResetButtonPressed}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onNextButtonPressed}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
          {capturedPicture && (
            <View
              style={{
                height: 500,
              }}
            >
              <Image
                style={{
                  width: '100%',
                  flex: 1,
                  resizeMode: 'contain',
                }}
                source={capturedPicture}
                resizeMode="contain"
              />
            </View>
          )}
          <TextInput
            editable
            multiline
            onChangeText={(text) => setText(text)}
            value={text}
            style={{
              flex: 1,
              width: '100%',
              borderWidth: 1,
              borderColor: 'blue',
              padding: 10,
              borderRadius: 10,
            }}
          />
        </CustomScrollView>
      );
    } else {
      return (
        <CustomScrollView>
          <View style={styles.formRowContainer}>
            <Text style={styles.formLabel}>Book Title:</Text>
            <TextInput
              //editable
              //multiline
              onChangeText={(text) => setBookTitle(text)}
              value={bookTitle}
              style={styles.formTextInput}
            />
          </View>

          <View style={styles.formRowContainer}>
            <Text style={styles.formLabel}>Author:</Text>
            <TextInput onChangeText={(text) => setAuthor(text)} value={author} style={styles.formTextInput} />
          </View>

          <View style={styles.formRowContainer}>
            <Text style={styles.formLabel}>Note:</Text>
            <TextInput onChangeText={(text) => setNote(text)} value={note} style={styles.formTextInput} />
          </View>

          <View style={styles.formRowContainer}>
            <Text style={styles.formLabel}>Page#:</Text>
            <TextInput
              inputMode="numeric"
              onChangeText={(text) => setPage(text)}
              value={page}
              style={styles.formTextInput}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity disabled={submitButtonDisabled} style={styles.button} onPress={onSubmitButtonPressed}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </CustomScrollView>
      );
    }
  }
};

const styles = StyleSheet.create({
  formRowContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  formLabel: {
    flex: 1,
    fontSize: 20,
  },
  formTextInput: {
    flex: 3,
    borderWidth: 1,
    borderColor: 'blue',
    padding: 5,
    borderRadius: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'blue',
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default OcrView;
