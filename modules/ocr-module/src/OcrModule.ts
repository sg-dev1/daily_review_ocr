import { NativeModule, requireNativeModule } from 'expo';

export interface OcrWord {
  text: string;
}

export interface OcrLineType {
  text: string;
  words: OcrWord[];
}

export interface OcrBoundingBoxType {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface OcrTextBlock {
  text: string;
  boundingBox: OcrBoundingBoxType;
  lines: OcrLineType[];
}

export interface OcrResult {
  text: string;
  textBlocks: OcrTextBlock[];
}

declare class OcrModule extends NativeModule {
  recognizeTextAsync(uri: string): Promise<OcrResult>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<OcrModule>('OcrModule');
