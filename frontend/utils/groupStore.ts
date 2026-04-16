import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";
import {ApiCall} from "@/api/BackendApi";

interface GroupAction {
    type: 'ADD_THEME' | 'ADD_MUSIC';
    groupId: string;
}

interface Group {
    id: string;
    name: string;
}

type GroupState = {
    groups: Group[];
    setGroups: (groups: Group[]) => void;
    updateGroupAction: (groupId: string, action: GroupAction | null) => void;
    clearAllActions: () => void;
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
                    const response = await ApiCall.users.getAll(token)
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