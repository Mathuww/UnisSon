import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";
import {ApiCall} from "@/api/BackendApi";
import { State } from "react-native-gesture-handler";

interface GroupAction {
    type: 'ADD_THEME' | 'ADD_MUSIC';
    groupId: string;
}

interface Group {
    id: number;
    name: string;
}

type GroupState = {
    groups: Group[];
    setGroups: (groups: Group[]) => void;
    updateGroupAction: (groupId: string, action: GroupAction | null) => void;
    clearAllActions: () => void;
    fetchGroups: (token:string) => Promise<void>;
};

export const useGroupStore = create(
    persist<GroupState>(
        (set) => ({
            groups: [],

            setGroups: (groups) => set({ groups }),

            updateGroupAction: (groupId, action) => {},

            clearAllActions: () => {},

            fetchGroups : async (token : string) => {
                try {
                    const response = await ApiCall.users.getAllGroup(token);
                    set({groups: response.data.data});
                } catch (error) {
                    console.error(error)
                }
            }
        }),
        {
            name: "group-store",
            storage: createJSONStorage(() => ({
                setItem,
                getItem,
                removeItem: deleteItemAsync,
            })),
        }
    )
);