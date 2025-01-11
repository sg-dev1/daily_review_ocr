import { CameraCapturedPicture } from 'expo-camera';
import React, { useState } from 'react';
import CustomCameraView from './CustomCameraView';
import TextSnippetSubmitView from './TextSnippetSubmitView';
import TextSnippetEditView from './TextSnippetEditView';

const OcrView = () => {
  const [text, setText] = useState('');
  const [capturedPicture, setCapturedPicture] = useState<CameraCapturedPicture | null>(null);
  const [nextButtonPressed, setNextButtonPressed] = useState(false);

  const onResetButtonPressed = () => {
    setText('');
    setCapturedPicture(null);
  };

  const onNextButtonPressed = () => {
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
