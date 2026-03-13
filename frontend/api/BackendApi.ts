import axios from 'axios';

const BACKEND_API_URL = "https://srv833678.hstgr.cloud:8085";

export const api = axios.create({
    baseURL: BACKEND_API_URL,
    timeout: 3000
});


export const testApi = {
    postText: (text: string) => api.post('/text', {message: text}),
    getText: () => api.get('/text')
};