import React, { useState } from 'react';
import CustomScrollView from '../CustomScrollView';
import { TouchableOpacity, View, Text, Image, TextInput } from 'react-native';
import { globalStyles as styles } from '../styles';
import { CameraCapturedPicture } from 'expo-camera';

interface TextSnippetEditViewProps {
  capturedPicture: CameraCapturedPicture | null;
  onResetButtonPressed: () => void;
  onNextButtonPressed: () => void;
  text: string;
  setText: (value: string) => void;
  selection: { start: number; end: number };
  setSelection: (newSelection: { start: number; end: number }) => void;
}

const TextSnippetEditView = ({
  capturedPicture,
  onResetButtonPressed,
  onNextButtonPressed,
  text,
  setText,
  selection,
  setSelection,
}: TextSnippetEditViewProps) => {
  const debug = false;

  if (debug) {
    if (capturedPicture) {
      console.log(
        `Captured picture width: ${capturedPicture.width}, height: ${capturedPicture.height}, uri: ${capturedPicture.uri}`
      );
      console.log('Exif:', capturedPicture.exif);
      //console.log('Base64:', capturedPicture.base64);
    }
  }

  return (
    <CustomScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onResetButtonPressed}>
          <Text style={styles.buttonText}>Back</Text>
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
              //flex: 1,
              resizeMode: 'contain',
              height: undefined,
              aspectRatio: 3 / 4,
              //transform: [{ rotate: '90deg' }],
            }}
            source={capturedPicture}
            //resizeMode="contain"
          />
        </View>
      )}
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
          borderRadius: 10,
        }}
      />
    </CustomScrollView>
  );
};

export default TextSnippetEditView;
