import {create} from "zustand"
import {persist, createJSONStorage} from "zustand/middleware"
import {getItem, setItem, deleteItemAsync} from "expo-secure-store"
import {GoogleSignin} from '@react-native-google-signin/google-signin'
import {ApiCall} from "@/api/BackendApi";

type UserState = {
    isLoggedIn: boolean;
    hasCompletedProfile: boolean;
    userInfo : {
        id : string;
    } | null;
    appToken : string | null;

    GoogleLogIn : (idToken : string) => void;
    GoogleLogOut: () => void;
    completeProfile: () => void;
}

export const useAuthStore = create(
    persist<UserState>(
    (set) => ({
        isLoggedIn : false,
        hasCompletedProfile: false,
        userInfo : null,
        appToken : null,

        GoogleLogIn : async (idToken : string) => {
            try {
                const response = await ApiCall.auth.GGLogIn(idToken)
                const data = response.data

                set({
                    isLoggedIn : true,
                    hasCompletedProfile: true, //change to data.hasCompletedProfile at some point
                    userInfo : {
                        id : data.userId
                    },
                    appToken : data.token,
                })
            } catch (error) {
                console.error(error)
            }
        },
        GoogleLogOut: async () => {
            try {
                await  GoogleSignin.signOut()
                set({
                    isLoggedIn : false,
                    hasCompletedProfile: false,
                    userInfo : null,
                    appToken : null,
                })
            } catch (error) {
                console.error(error)
            }
        },
        completeProfile : () => {
            set((state) => ({
                ...state,
                hasCompletedProfile : true,
            }))
        }
    }),
        {
            name : "auth-store",
            storage : createJSONStorage(() => ({
                setItem,
                getItem,
                removeItem : deleteItemAsync,
            })),
        }
    ));