import axios, { InternalAxiosRequestConfig } from "axios";
import {QuizUserAnswerData, TrackData} from "@/shared/types";

export const BACKEND_API_URL = "https://unisson.qbert.fr";

export const api = axios.create({
    baseURL: BACKEND_API_URL,
    timeout: 10000
});

let authTokenReady = false;
export const getApiReady = () => authTokenReady;

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error(`${error.response.status}]`, error.response.data);
        } else {
            console.error(error.message);
        }
        return Promise.reject(error)
    }
)

export const setAuthToken = (token: string | null) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log("Token set to : " + token);
    authTokenReady = true;
};

export const ApiCall = {
    admin: {
        forwardTime: (hrs: number) =>
            api.post("/api/admin/time/forward", {hrs: hrs}),
        getServerTime: () =>
            api.get("/api/admin/time")
    },
    auth: {
        GGLogIn: (idToken: string, authCode : string | null) =>
            api.post("/api/auth/google", { idToken: idToken, authCode : authCode }),
    },
    users: {
        //All groups
        getAllGroup: () => api.get('/api/users/me/groups'),

        getProfile: () => api.get('/api/users/me'),
    },
    groups: {
        getGroupData: (
            groupID: number,
            includeUsers = true
        ) => api.get(`/api/groups/${groupID}?includeUsers=${includeUsers}`),

        createGroup: (
            name: string,
            maxUsers: number
        ) => api.post('/api/groups/', {
            name: name,
            maxUsers: maxUsers,
        }),

        leaveGroup: (id: number) =>
            api.delete(`/api/groups/${id}/members/me`),

        setTheme: (id: number, theme: string) =>
            api.post(`/api/groups/${id}/theme`, { theme }),

        getSongs: (id: number) =>
            api.get(`/api/groups/${id}/songs`),

        addSong: (
            id: number,
            track: TrackData
        ) =>
            api.post(`/api/groups/${id}/songs`, track),

        createInvite: (id: number) =>
            api.post(`/api/groups/${id}/invite`),

        forceChangeStatus: (id: number) =>
            api.post(`/api/groups/${id}/status`),

        forceChangeChosen: (id: number, chosenOneUserID: number) =>
            api.post(`/api/groups/${id}/chosen`, { chosenOneUserID }),

        submitChosenQuizAnswers: (id: number, answers: QuizUserAnswerData) =>
            api.post(`/api/groups/${id}/chosenquiz`, { answers }),

        submitChosenRank: (id: number, ranking : {userId: number, trackId: number}[]) =>
            api.post(`/api/groups/${id}/chosenrank`, { ranking }),

        submitPredRank: (id: number, ranking : {userId: number, trackId: number}[]) =>
            api.post(`/api/groups/${id}/predrank`, { ranking }),
    },
    invites: {
        tokenInfo: (token: string) => api.get(`/api/invites/${token}`),

        join: (token: string) => api.post(`/api/invites/${token}`)
    }
};