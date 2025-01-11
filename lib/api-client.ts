// TODO this should be shared with the web "fronted" of the project
//   --> this app project needs to be integrated into the turbo repo project
import axios, { AxiosError } from 'axios';

const debug = true;

interface UserLoginDtoType {
  username: string;
  password: string;
}

interface TextSnippetDtoType {
  text: string;
  bookTitle: string;
  bookAuthor: string;
  note: string;
  location: string;
}

export const checkedAxiosError = (error: unknown): string => {
  let result = '';
  if (error instanceof AxiosError) {
    result = error.message + ', ' + error.code + ', Http Status:' + error.response?.status;
    if (error.response?.data?.message) {
      result += ', ' + error.response.data.message;
    }
  } else {
    result = 'Unknown error: ' + String(error);
  }
  return result;
};

const buildBackendUrl = (endpoint: string, baseUrlToUse?: string): string => {
  let baseUrl = baseUrlToUse;
  //baseUrl = 'http://192.168.1.13:7777/api/';
  if (!baseUrl) {
    baseUrl = 'http://localhost:7777/api/';
    console.info('API_BASE_URL env variable was undefined. Using ', baseUrl);
  }
  const finalUrl = baseUrl + endpoint;
  if (debug) {
    console.log('finalUrl', finalUrl);
  }
  return finalUrl;
};

export const postLogin = async (data: UserLoginDtoType, baseUrl?: string) => {
  try {
    const response = await axios.post(buildBackendUrl('auth/login', baseUrl), data);
    if (debug) {
      console.log('postLogin response', response.status, response.data);
    }
    return response;
  } catch (error: unknown) {
    const checkedErrorMsg = checkedAxiosError(error);
    if (debug) {
      console.log('checkedErrorMsg', checkedErrorMsg);
      console.log('UserLoginDtoType username=', data.username, ', pw-length:', data.password.length);
    }
    return checkedErrorMsg;
  }
};

export const postTextSnippet = async (data: TextSnippetDtoType, baseUrl?: string) => {
  try {
    const response = await axios.post(buildBackendUrl('text-snippet', baseUrl), data);
    if (debug) {
      console.log('postLogin response', response.status, response.data);
    }
    return response;
  } catch (error: unknown) {
    const checkedErrorMsg = checkedAxiosError(error);
    if (debug) {
      console.log('checkedErrorMsg', checkedErrorMsg);
    }
    return checkedErrorMsg;
  }
};
