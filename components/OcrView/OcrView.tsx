import { CameraCapturedPicture } from 'expo-camera';
import React, { useState } from 'react';
import CustomCameraView from './CustomCameraView';
import TextSnippetSubmitView from './TextSnippetSubmitView';
import TextSnippetEditView from './TextSnippetEditView';
import TextSnippetSelectionEditView from './TextSnippetSelectionEditView';

const OcrView = () => {
  const [text, setText] = useState('');
  const [capturedPicture, setCapturedPicture] = useState<CameraCapturedPicture | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [nextButtonPressed, setNextButtonPressed] = useState(false);

  const onResetButtonPressed = () => {
    setText('');
    setCapturedPicture(null);
  };

  const onNextButtonPressed = () => {
    const currentSelectedText = text.slice(selection.start, selection.end);
    console.log('selection', selection, 'selected text', currentSelectedText);
    setSelectedText(currentSelectedText);

    setNextButtonPressed(true);
  };

  if (text === '') {
    return <CustomCameraView setText={setText} setCapturedPicture={setCapturedPicture} />;
  } else {
    if (!nextButtonPressed) {
      return (
        <TextSnippetEditView
          capturedPicture={capturedPicture}
          onNextButtonPressed={onNextButtonPressed}
          onResetButtonPressed={onResetButtonPressed}
          text={text}
          setText={setText}
          selection={selection}
          setSelection={setSelection}
        />
      );
    } else if (selectedText !== '') {
      // This screen is optional, if you select something on the TextSnippetEditView
      // you can see (and edit) it on the following view
      return (
        <TextSnippetSelectionEditView
          text={selectedText}
          setText={setSelectedText}
          onBackButtonPressed={() => {
            setNextButtonPressed(false);
          }}
          onNextButtonPressed={() => {
            setText(selectedText);
            setSelectedText('');
          }}
        />
      );
    } else {
      return (
        <TextSnippetSubmitView
          text={text}
          resetPreviousSteps={() => {
            setNextButtonPressed(false);
            onResetButtonPressed();
          }}
        />
      );
    }
  }
};

export default OcrView;
