import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getItem, setItem, deleteItemAsync } from "expo-secure-store"

type SettingsState = {
    timeDebug: boolean;
    setTimeDebug: (value: boolean) => void;
}

export const useSettingsStore = create(
    persist<SettingsState>(
        (set) => ({
            timeDebug: false,
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