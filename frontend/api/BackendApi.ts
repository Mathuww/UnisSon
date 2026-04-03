import axios from "axios";

const BACKEND_API_URL = "https://srv833678.hstgr.cloud:8085";

export const api = axios.create({
    baseURL: BACKEND_API_URL,
    timeout: 3000
});

export const ApiCall = {
    test: {
        postText: (text: string) => api.post('/text', {message: text}),
        getText: () => api.get('/text'),
    },
    auth: {
        signIn : (nickname : string) => api.post("/auth/login", {nickname : nickname})
    },
    users: {
        getGroups: (id:number) => api.get('/users/me/groups', 
            {
                headers: {
                    'x-user-id': id // "x-" => headers
                }
            }
        )
        // récupérer id du secure storage
    },
    groups: {
        getGroupData: (userID:number, groupID:number) => api.get(`/groups/${groupID}/members`,
            { headers: {
                    'x-user-id': userID // "x-" => headers
                }
            }
        )    
    }
};