// TODO this should be shared with the web "frontend" of the project
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
    result =
      '[' + error.name + '] ' + error.message + ' (code=' + error.code + ') Http Status:' + error.response?.status;
    if (error.response?.data?.message) {
      result += ', ' + error.response.data.message;
    }
    result += '\nStacktrace:\n' + error.stack;
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

// alternative using fetch api
/*
const postRequest = async (endpoint: string, data: any): Promise<Response> => {
  const jsonData = JSON.stringify(data);
  //console.log('jsonData', jsonData);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: jsonData,
  });
  return response;
};
*/

export const postLogin = async (data: UserLoginDtoType, baseUrl?: string) => {
  try {
    const response = await axios.post(buildBackendUrl('auth/login', baseUrl), data);
    //const response = await postRequest(buildBackendUrl('auth/login', baseUrl), data);
    if (debug) {
      console.log('postLogin response', response.status, response.data);
      //console.log('postLogin response', response.status, response);
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
    //const response = await postRequest(buildBackendUrl('text-snippet', baseUrl), data);
    if (debug) {
      console.log('postLogin response', response.status, response.data);
      //console.log('postLogin response', response.status, await response.json());
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
