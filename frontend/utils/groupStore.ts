import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";
import {ApiCall} from "@/api/BackendApi";
import { ActionResult } from "@/shared/types";

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
    createGroup: (token: string, name: string, maxUsers: number) => Promise<ActionResult>;
};

export const useGroupStore = create(
    persist<GroupState>(
        (set, get) => ({
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
            },

            createGroup: async (token: string, name: string, maxUsers: number): Promise<ActionResult> => {
                try {
                    const response = await ApiCall.groups.createGroup(token, name, maxUsers);
                    await get().fetchGroups(token);
                    return {success: true, groupID: response.data.data.id};
                } catch (error) {
                    console.error(error);
                    return {success: false, error: error};
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