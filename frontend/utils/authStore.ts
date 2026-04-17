import {create} from "zustand"
import {persist, createJSONStorage} from "zustand/middleware"
import {getItem, setItem, deleteItemAsync} from "expo-secure-store"
import {GoogleSignin} from '@react-native-google-signin/google-signin'
import {ApiCall, setAuthToken} from "@/api/BackendApi";

type UserState = {
    isLoggedIn: boolean;
    hasCompletedProfile: boolean;
    userInfo : {
        id : number;
    } | null;
    appToken : string | null;
    _hasHydrated : boolean;
    GoogleLogIn : (idToken : string) => void;
    GoogleLogOut: () => void;
    completeProfile: () => void;
    setHasHydrated: (value: boolean) => void;
    refreshSession: () => Promise<void>;
}

export const useAuthStore = create(
    persist<UserState>(
    (set, get) => ({
        isLoggedIn : false,
        hasCompletedProfile: false,
        userInfo : null,
        appToken : null,
        _hasHydrated : false,
        setHasHydrated: (value: boolean) => {
            set((state) => {
                return {
                    ...state,
                    _hasHydrated: value,
                };
            });
        },
        GoogleLogIn : async (idToken : string) => {
            try {
                const response = await ApiCall.auth.GGLogIn(idToken)
                const data = response.data.data;

                set({
                    isLoggedIn : true,
                    hasCompletedProfile: true, //change to data.hasCompletedProfile at some point
                    userInfo : {
                        id : data.user.id
                    },
                    appToken : data.token,
                })
                setAuthToken(data.token);
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
                setAuthToken(null);
            } catch (error) {
                throw error;
            }
        },
        completeProfile : () => {
            set((state) => ({
                ...state,
                hasCompletedProfile : true,
            }))
        },
        refreshSession: async () => {
            const currentToken = get().appToken;

            if (!currentToken) return;

            try {
                const response = await ApiCall.users.getProfile();
                const freshData = response.data;

                set((state) => ({
                    ...state,
                    hasCompletedProfile: freshData.hasCompletedProfile,
                    userInfo: {
                        ...state.userInfo,
                        ...freshData.userInfo
                    }
                }));
            } catch (error) {
                console.error(error);
            }
        }
    }),
        {
            name : "auth-store",
            storage : createJSONStorage(() => ({
                setItem,
                getItem,
                removeItem : deleteItemAsync,
            })),
            onRehydrateStorage: (state) => {
                return () => state.setHasHydrated(true);
            },
        }
    ));