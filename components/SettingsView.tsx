import React from 'react';
import CustomScrollView from './CustomScrollView';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().initialize();
const SettingsView = () => {
  const [url, setUrl] = useMMKVStorage<string>('url', storage);
  const [username, setUsername] = useMMKVStorage<string>('username', storage);
  const [password, setPassword] = useMMKVStorage<string>('password', storage);

  return (
    <CustomScrollView>
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
  );
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
});

export default SettingsView;
