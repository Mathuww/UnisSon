import {create} from "zustand"
import {persist, createJSONStorage} from "zustand/middleware"
import {getItem, setItem, deleteItemAsync} from "expo-secure-store"
import {GoogleSignin} from '@react-native-google-signin/google-signin'
import {ApiCall, setAuthToken} from "@/api/BackendApi";
import { UserData } from "@/shared/types";

/**
 * Représente les données et les méthodes que propose le store  
 */
type UserState = {
    isLoggedIn: boolean;
    hasCompletedProfile: boolean;
    userInfo : UserData | null;
    appToken : string | null;
    _hasHydrated : boolean;
    GoogleLogIn : (idToken : string, authCode : string | null) => void;
    GoogleLogOut: () => void;
    completeProfile: () => void;
    setHasHydrated: (value: boolean) => void;
}

/**
 * Store de gestion de l'authentification 
 * 
 * S'occupe de stocker l'appToken ainsi que les infos liées à l'utilisateur et les actions liées à ces dernières
 * 
 * Les données sont persistées via secure storage  
 */
export const useAuthStore = create(
    persist<UserState>(
    (set, get) => ({
        isLoggedIn : false,
        hasCompletedProfile: false,
        userInfo : null,
        appToken : null,
        _hasHydrated : false,

        /**
         * Setter pour l'hydratation du store 
         * 
         * @param value : boolean pour la valeur de _hasHydrated
         */
        setHasHydrated: (value: boolean) => {
            set((state) => {
                return {
                    ...state,
                    _hasHydrated: value,
                };
            });
        },

        /**
         * Permet la transmission du token et du authCode au backend qui rend les infos utilisateur ainsi que l'app token qu'on stocke
         *
         * @param idToken : token pour Google
         * @param authCode : code pour récuperer l'acces et le refresh token de Google
         */
        GoogleLogIn : async (idToken : string, authCode : string | null) => {
            try {
                const response = await ApiCall.auth.GGLogIn(idToken, authCode)
                const data = response.data.data;

                set({
                    isLoggedIn : true,
                    hasCompletedProfile: true, //change to data.hasCompletedProfile at some point
                    userInfo : data.user,
                    appToken : data.token,
                })
                setAuthToken(data.token);
            } catch (error) {
                console.error(error)
            }
        },

        /**
         * Permet de logout de google
         */
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

        /**
         * Change le statut pour se mettre en mode complété (pour une future version) 
         */
        completeProfile : () => {
            set((state) => ({
                ...state,
                hasCompletedProfile : true,
            }))
        },
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