import React, { useState } from 'react';
import CustomScrollView from '../CustomScrollView';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { postLogin, postTextSnippet } from '../../lib/api-client';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';
import { globalStyles as styles } from '../styles';
import Dropdown from 'react-native-input-select';
import { TSelectedItem } from 'react-native-input-select/lib/typescript/src/types/index.types';

interface TextSnippetSubmitViewProps {
  text: string;
  resetPreviousSteps: () => void;
}

interface BookType {
  title: string;
  author: string;
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
  const [books, setBooks] = useMMKVStorage<BookType[]>('books', storage, []);

  const [selectedBook, setSelectedBook] = useState<TSelectedItem | TSelectedItem[]>();
  const bookOptions = books.map((book) => ({ label: book.title, value: book.title }));

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

    // store book for later use
    const newBooks = [...books];
    if (newBooks.filter((value) => value.author === author && value.title === bookTitle).length === 0) {
      newBooks.push({ title: bookTitle, author: author });
    }
    setBooks(newBooks);

    resetPreviousSteps();
    setErrorText('');
    setSubmitButtonDisabled(false);
  };

  return (
    <CustomScrollView>
      {errorText && <Text style={styles.errorTextContainer}>{errorText}</Text>}

      <Dropdown
        label="Books"
        placeholder="Select a book..."
        options={bookOptions}
        selectedValue={selectedBook}
        onValueChange={(value) => {
          setSelectedBook(value);
          const bookLst = books.filter((book) => book.title === value);
          if (bookLst.length >= 1) {
            setBookTitle(bookLst[0].title);
            setAuthor(bookLst[0].author);
          } else {
            console.warn('Book with value ', value, ' not found in book list');
          }
        }}
        primaryColor={'green'}
      />

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
