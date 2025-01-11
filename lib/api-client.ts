// TODO this should be shared with the web "fronted" of the project
//   --> this app project needs to be integrated into the turbo repo project
import axios from 'axios';

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

const buildBackendUrl = (endpoint: string): string => {
  let baseUrl = process.env.API_BASE_URL;
  baseUrl = 'http://192.168.1.13:7777/api/';
  if (!baseUrl) {
    baseUrl = 'http://localhost:7777/api/';
    console.info('API_BASE_URL env variable was undefined. Using ', baseUrl);
  }
  return baseUrl + endpoint;
};

export const postLogin = async (data: UserLoginDtoType) => {
  const response = await axios.post(buildBackendUrl('auth/login'), data);
  console.log('postLogin response', response.status, response.data);
  return response;
};

export const postTextSnippet = async (data: TextSnippetDtoType) => {
  const response = await axios.post(buildBackendUrl('text-snippet'), data);
  console.log('postLogin response', response.status, response.data);
  return response;
};
