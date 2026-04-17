import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";
import { ApiCall } from "@/api/BackendApi";
import { ActionResult, GroupData } from "@/shared/types";

export enum GroupActionType {
    ADD_THEME = "ADD_THEME",
    ADD_MUSIC = "ADD_MUSIC",
    FORCE_CHANGE_STATUS = "FORCE_CHANGE_STATUS",
    FORCE_SET_CHOSEN = "FORCE_SET_CHOSEN",
}

export interface GroupAction {
    type: GroupActionType;
    groupId: number;
}

type GroupState = {
    groups: GroupData[];
    setGroups: (groups: GroupData[]) => void;
    updateGroupAction: (action: GroupAction | null) => void;
    clearAllActions: () => void;
    fetchGroups: (token: string) => Promise<void>;
    fetchCurrentGroup: (id: number) => Promise<void>;
    createGroup: (token: string, name: string, maxUsers: number) => Promise<ActionResult>;
    getGroup: (id: number) => Promise<GroupData | undefined>;
};

export const useGroupStore = create(
    persist<GroupState>(
        (set, get) => ({
            groups: [],

            setGroups: (groups) => set({ groups }),

            updateGroupAction: async (action) => {
                if (!action)
                    return;
                switch (action.type) {
                    case "FORCE_CHANGE_STATUS":
                        try {
                            const response = await ApiCall.groups.forceChangeStatus(action.groupId);
                        } catch (error) {
                            console.error(error)
                        }
                        break;
                    default:
                        console.error("unknown group action");
                        break;
                }
            },

            clearAllActions: () => { },

            fetchGroups: async (token: string) => {
                try {
                    const response = await ApiCall.users.getAllGroup();
                    set({ groups: response.data.data });
                } catch (error) {
                    console.error(error)
                }
            },

            fetchCurrentGroup: async (id: number) => {
                try {
                    const response = await ApiCall.groups.getGroupData(id);

                    set((state) => ({
                        groups: state.groups.map((g) =>
                            g.id === id ? { ...g, ...response.data.data } : g
                        ),
                    }));
                } catch (e) {
                    console.error(e);
                }
            },

            createGroup: async (token: string, name: string, maxUsers: number): Promise<ActionResult> => {
                try {
                    const response = await ApiCall.groups.createGroup(name, maxUsers);
                    await get().fetchGroups(token);
                    return { success: true, groupID: response.data.data.id };
                } catch (error) {
                    console.error(error);
                    return { success: false, error: error };
                }
            },

            getGroup: async (id: number) => {
                return get().groups.find((g) => g.id === id);
            },
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