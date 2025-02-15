import { CameraCapturedPicture } from 'expo-camera';
import React, { useState } from 'react';
import CustomCameraView from './CustomCameraView';
import TextSnippetSubmitView from './TextSnippetSubmitView';
import TextSnippetEditView from './TextSnippetEditView';
import TextSnippetSelectionEditView from './TextSnippetSelectionEditView';

// UI state machine
enum OcrViewStates {
  IMAGE_CAPTURE,
  TEXT_SNIPPET_EDIT,
  TEXT_SNIPPET_SELECTION_EDIT,
  TEXT_SNIPPET_SUBMIT,
}

const OcrView = () => {
  const debug = false;

  const [text, setText] = useState('');
  const [capturedPicture, setCapturedPicture] = useState<CameraCapturedPicture | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [viewState, setViewState] = useState(OcrViewStates.IMAGE_CAPTURE);

  const onResetButtonPressed = () => {
    setText('');
    setCapturedPicture(null);
    setSelection({ start: 0, end: 0 });
    setSelectedText('');
    setViewState(OcrViewStates.IMAGE_CAPTURE);
  };

  const onNextButtonPressed = () => {
    const currentSelectedText = text.slice(selection.start, selection.end);
    if (debug) {
      console.log('selection', selection, 'selected text', currentSelectedText);
    }
    setSelectedText(currentSelectedText);

    if ('' === currentSelectedText) {
      setViewState(OcrViewStates.TEXT_SNIPPET_SUBMIT);
    } else {
      setViewState(OcrViewStates.TEXT_SNIPPET_SELECTION_EDIT);
    }
  };

  if (viewState === OcrViewStates.IMAGE_CAPTURE) {
    return (
      <CustomCameraView
        setText={setText}
        setCapturedPicture={setCapturedPicture}
        onSuccess={() => setViewState(OcrViewStates.TEXT_SNIPPET_EDIT)}
      />
    );
  } else if (viewState === OcrViewStates.TEXT_SNIPPET_EDIT) {
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
  } else if (viewState === OcrViewStates.TEXT_SNIPPET_SELECTION_EDIT) {
    // This screen is optional, if you select something on the TextSnippetEditView
    // you can see (and edit) it on the following view
    return (
      <TextSnippetSelectionEditView
        text={selectedText}
        setText={setSelectedText}
        onBackButtonPressed={() => {
          setSelectedText('');
          setSelection({ start: 0, end: 0 });
          setViewState(OcrViewStates.TEXT_SNIPPET_EDIT);
        }}
        onNextButtonPressed={() => {
          //setText(selectedText);
          //setSelectedText('');
          setViewState(OcrViewStates.TEXT_SNIPPET_SUBMIT);
        }}
      />
    );
  } else {
    // viewState === OcrViewStates.TEXT_SNIPPET_SUBMIT
    return (
      <TextSnippetSubmitView
        text={selectedText !== '' ? selectedText : text}
        resetPreviousSteps={() => {
          onResetButtonPressed();
        }}
        onBackButtonPressed={() => {
          // just jump back to the TextSnippetSelectionEditView
          //setSelectedText(text);
          if ('' === selectedText) {
            setViewState(OcrViewStates.TEXT_SNIPPET_EDIT);
          } else {
            setViewState(OcrViewStates.TEXT_SNIPPET_SELECTION_EDIT);
          }
        }}
      />
    );
  }
};

export default OcrView;
