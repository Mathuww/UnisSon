import {create} from "zustand"
import {persist, createJSONStorage} from "zustand/middleware"
import {getItem, setItem, deleteItemAsync} from "expo-secure-store"
import {GoogleSignin} from '@react-native-google-signin/google-signin'
import {ApiCall} from "@/api/BackendApi";

type UserState = {
    isLoggedIn: boolean;
    shouldCreateAccount: boolean;
    userInfo : {
        id : string;
    } | null;
    appToken : string | null;

    GoogleLogIn : (idToken : string) => void;
    GoogleLogOut: () => void;
}

export const useAuthStore = create(
    persist<UserState>(
    (set) => ({
        isLoggedIn : false,
        shouldCreateAccount: false,
        userInfo : null,
        appToken : null,
        GoogleLogIn : async (idToken : string) => {
            try {
                const data = await ApiCall.auth.GGLogIn(idToken)

                set((state) => {
                    return {
                        ...state,
                        isLoggedIn : true,
                        appToken : data.appToken,
                        userInfo : data.userInfo,
                    }
                })
            } catch (error) {
                console.error(error)
            }
        },
        GoogleLogOut: async () => {
            try {
                await  GoogleSignin.signOut()
                set((state) => {
                    return {
                        ...state,
                        isLoggedIn : false,
                    }
                })
            } catch (error) {
                console.error(error)
            }
        },
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