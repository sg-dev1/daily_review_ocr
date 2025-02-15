import React from 'react';
import CustomScrollView from './CustomScrollView';
import { Text, TextInput, View } from 'react-native';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';
import EditableBookList from './EditableBookList';
import { BookType } from '../lib/types/BookType';
import { globalStyles as styles } from './styles';

const storage = new MMKVLoader().initialize();
const SettingsView = () => {
  const [url, setUrl] = useMMKVStorage<string>('url', storage);
  const [username, setUsername] = useMMKVStorage<string>('username', storage);
  const [password, setPassword] = useMMKVStorage<string>('password', storage);

  const [books, setBooks] = useMMKVStorage<BookType[]>('books', storage, []);

  return (
    <>
      <CustomScrollView>
        <Text style={styles.headerLabel}>Settings</Text>
        <View style={styles.formRowContainer}>
          <Text style={styles.formLabel}>Url:</Text>
          <TextInput
            placeholder="http://localhost:7777/api/"
            onChangeText={(text) => setUrl(text)}
            value={url}
            style={styles.formTextInput}
            autoCorrect={false}
          />
        </View>

        <View style={styles.formRowContainer}>
          <Text style={styles.formLabel}>Username:</Text>
          <TextInput
            onChangeText={(text) => setUsername(text)}
            value={username}
            style={styles.formTextInput}
            autoCorrect={false}
          />
        </View>

        <View style={styles.formRowContainer}>
          <Text style={styles.formLabel}>Password:</Text>
          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            style={styles.formTextInput}
            autoCorrect={false}
            secureTextEntry={true}
          />
        </View>
      </CustomScrollView>
      <EditableBookList books={books} setBooks={setBooks} />
    </>
  );
};

export default SettingsView;
