import {create} from "zustand"
import {persist, createJSONStorage} from "zustand/middleware"
import {getItem, setItem, deleteItemAsync} from "expo-secure-store"

type UserState = {
    isLoggedIn: boolean;
    shouldCreateAccount: boolean;
    logIn : () => void;
    logOut: () => void;
}

export const useAuthStore = create(
    persist<UserState>(
    (set) => ({
        isLoggedIn : false,
        shouldCreateAccount: false,
        logIn : () => {
            set((state) => {
                return {
                    ...state,
                    isLoggedIn: true,
                };
            });
        },
        logOut: () => {
            set((state) => {
                return {
                    ...state,
                    isLoggedIn: false,
                };
            });
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