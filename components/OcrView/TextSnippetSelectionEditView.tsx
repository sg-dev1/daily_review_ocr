import React, { useState } from 'react';
import CustomScrollView from '../CustomScrollView';
import { TextInput, TouchableOpacity, View, Text } from 'react-native';
import { globalStyles as styles } from '../styles';

interface TextSnippedSelectionEditViewProps {
  onBackButtonPressed: () => void;
  onNextButtonPressed: () => void;
  text: string;
  setText: (value: string) => void;
}

const TextSnippedSelectionEditView = ({
  onBackButtonPressed,
  onNextButtonPressed,
  text,
  setText,
}: TextSnippedSelectionEditViewProps) => {
  const debug = true;
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  const insertTextAtCursor = (insertText: string) => {
    const newText = text.slice(0, selection.start) + insertText + text.slice(selection.end);
    setText(newText);
    // place the cursor
    const newPos = selection.start + insertText.length;
    setSelection({ start: newPos, end: newPos });
  };

  return (
    <>
      <CustomScrollView>
        <TextInput
          editable
          multiline
          autoFocus={true}
          selection={selection}
          onSelectionChange={(event) => {
            setSelection(event.nativeEvent.selection);
          }}
          onChangeText={(text) => setText(text)}
          value={text}
          style={{
            flex: 1,
            width: '100%',
            borderWidth: 1,
            borderColor: 'blue',
            padding: 10,
            marginBottom: 20,
            borderRadius: 10,
          }}
        />
      </CustomScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onBackButtonPressed}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onNextButtonPressed}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => insertTextAtCursor('[...]')}>
          <Text style={styles.buttonText}>[...]</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default TextSnippedSelectionEditView;
