import React, { useState } from 'react';
import CustomScrollView from '../CustomScrollView';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { postLogin, postTextSnippet } from '../../lib/api-client';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';
import { globalStyles as styles } from '../styles';

interface TextSnippetSubmitViewProps {
  text: string;
  resetPreviousSteps: () => void;
}

const storage = new MMKVLoader().initialize();
const TextSnippetSubmitView = ({ text, resetPreviousSteps }: TextSnippetSubmitViewProps) => {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [note, setNote] = useState('');
  const [page, setPage] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [url] = useMMKVStorage<string>('url', storage);
  const [username] = useMMKVStorage<string>('username', storage);
  const [password] = useMMKVStorage<string>('password', storage);

  const onSubmitButtonPressed = async () => {
    if (!username || !password || !url) {
      const errorMsg = 'Error: username, password, or url not set';
      console.log(errorMsg);
      setErrorText(errorMsg);
      return;
    }
    if (text.length === 0 || bookTitle.length === 0 || author.length === 0) {
      const errorMsg = 'Error: text, bookTitle, or author is empty';
      console.log(errorMsg);
      setErrorText(errorMsg);
      return;
    }

    setSubmitButtonDisabled(true);
    const loginResult = await postLogin(
      {
        username: username,
        password: password,
      },
      url
    );

    if (typeof loginResult === 'string') {
      setErrorText(loginResult);
      return;
    }

    const postTextSnippetResult = await postTextSnippet(
      {
        text: text,
        bookTitle: bookTitle,
        bookAuthor: author,
        note: note,
        location: page,
      },
      url
    );

    if (typeof postTextSnippetResult === 'string') {
      setErrorText(postTextSnippetResult);
      return;
    }

    resetPreviousSteps();
    setErrorText('');
    setSubmitButtonDisabled(false);
  };

  return (
    <CustomScrollView>
      {errorText && <Text style={styles.errorTextContainer}>{errorText}</Text>}

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
};

export default TextSnippetSubmitView;
