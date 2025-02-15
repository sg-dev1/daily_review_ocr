import React from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookType } from '../lib/types/BookType';
import { globalStyles as styles } from './styles';

interface EditableListProps {
  books: BookType[];
  setBooks: (value: BookType[]) => void;
}

const EditableList = ({ books, setBooks }: EditableListProps) => {
  const updateItem = (text: string, index: number, prop: 'author' | 'title') => {
    const newBooks = [...books];
    newBooks[index][prop] = text;
    setBooks(newBooks);
  };

  const removeItem = (index: number) => {
    setBooks(books.filter((_, i) => i !== index));
  };

  return (
    <View style={localStyles.container}>
      <FlatList
        data={books}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={localStyles.itemContainer}>
            <View style={styles.formRowContainer}>
              <Text style={styles.formLabel}>Title:</Text>
              <TextInput
                style={styles.formTextInput}
                value={item.title}
                onChangeText={(text) => updateItem(text, index, 'title')}
              />
            </View>
            <View style={styles.formRowContainer}>
              <Text style={styles.formLabel}>Author:</Text>
              <TextInput
                style={styles.formTextInput}
                value={item.author}
                onChangeText={(text) => updateItem(text, index, 'author')}
              />
            </View>

            <TouchableOpacity onPress={() => removeItem(index)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  itemContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'blue',
    padding: 5,
    borderRadius: 10,
  },
});

export default EditableList;
