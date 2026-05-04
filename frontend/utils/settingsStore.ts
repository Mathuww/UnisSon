import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getItem, setItem, deleteItemAsync } from "expo-secure-store"

/**
 * Représente les données et les méthodes que propose le store  
 */
type SettingsState = {
    timeDebug: boolean;
    setTimeDebug: (value: boolean) => void;
}

/**
 * Store pour permettre le passage en mode "TimeDebug"
 */
export const useSettingsStore = create(
    persist<SettingsState>(
        (set) => ({
            timeDebug: false,
            /**
             * Permet le passage en mode débug pour le temps
             * 
             * @param value : boolean
             */
            setTimeDebug: (value: boolean) => set({ timeDebug: value }),
        }),
        {
            name: "settings-store",
            storage: createJSONStorage(() => ({
                setItem,
                getItem,
                removeItem: deleteItemAsync,
            })),
        }
    )
);