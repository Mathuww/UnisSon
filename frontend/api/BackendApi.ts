import axios from "axios";

const BACKEND_API_URL = "https://srv833678.hstgr.cloud:8085";

export const api = axios.create({
    baseURL: BACKEND_API_URL,
    timeout: 3000
});

export const ApiCall = {
    auth: {
        GGLogIn : (idToken : string) => api.post("/api/auth/google", {idToken : idToken}),
    },
    users: {
        //All groups
        getAllGroup: (apptoken : string) => api.get('/api/users/me/groups',
            {
                headers: {
                    'authorization' : "Bearer " + apptoken
                }
            }
        ),
        getProfile: (apptoken : string) => api.get('/api/users/me', {
            headers: {
                'authorization' : "Bearer " + apptoken
            }
        }),
    },
    groups: {
        getGroupData: (apptoken: string, groupID:number) => api.get(`/api/groups/${groupID}/members`, {
            headers: {
                'authorization' : "Bearer " + apptoken
            }
        }),    
    }
};