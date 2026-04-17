import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import {getItem, setItem, deleteItemAsync} from "expo-secure-store";
import {ApiCall, BACKEND_API_URL} from "@/api/BackendApi";
import {ActionResult, GroupData, TrackData} from "@/shared/types";

export enum GroupActionType {
    SUBMIT_THEME = "SUBMIT_THEME",
    SUBMIT_TRACK = "SUBMIT_TRACK",
    FORCE_CHANGE_STATUS = "FORCE_CHANGE_STATUS"
}


type GroupState = {
    groups: GroupData[];
    setGroups: (groups: GroupData[]) => void;
    forceChangeStatus: (groupId: number) => Promise<void>;
    submitTrack: (groupId: number, track: TrackData) => Promise<void>;
    submitTheme: (groupId: number, theme: string) => Promise<void>;
    createInvite: (groupId: number) => Promise<ActionResult<string>>;
    clearAllActions: () => void;
    fetchGroups: (token: string) => Promise<void>;
    fetchCurrentGroup: (id: number) => Promise<void>;
    createGroup: (token: string, name: string, maxUsers: number) => Promise<ActionResult<number>>;
    getGroup: (id: number) => Promise<GroupData | undefined>;
};

export const useGroupStore = create(
    persist<GroupState>(
        (set, get) => ({
            groups: [],

            setGroups: (groups) => set({groups}),

            forceChangeStatus: async (groupId: number) => {
                try {
                    const response = await ApiCall.groups.forceChangeStatus(groupId);
                } catch (error) {
                    console.error(error)
                }
            },


            submitTrack: async (groupId: number, track: TrackData) => {
                try {
                    const response = await ApiCall.groups.addSong(
                        groupId,
                        track
                    );
                } catch (error) {
                    console.error(error)
                  }
            },


            submitTheme: async (groupId: number, theme: string) => {
                try {
                    const response = await ApiCall.groups.setTheme(
                        groupId,
                        theme
                    );
                } catch (error) {
                    console.error(error);
                }
            },

            clearAllActions: () => {
            },

            fetchGroups: async (token: string) => {
                try {
                    const response = await ApiCall.users.getAllGroup();
                    set({groups: response.data.data});
                } catch (error) {
                    console.error(error)
                }
            },

            fetchCurrentGroup: async (id: number) => {
                try {
                    const response = await ApiCall.groups.getGroupData(id);

                    set((state) => ({
                        groups: state.groups.map((g) =>
                            g.id === id ? {...g, ...response.data.data} : g
                        ),
                    }));
                } catch (e) {
                    console.error(e);
                }
            },

            createInvite: async (groupId: number): Promise<ActionResult<string>> => {
                try {
                    const res = await ApiCall.groups.createInvite(groupId);
                    console.log("I JUST RECEIVED SOMETHING !!! ", res.data);
                    const token = res.data.data.token;
                    const inviteLink = `${BACKEND_API_URL}/join/${token}`
                    return {success: true, data: inviteLink};
                } catch (e) {
                    console.error(e);
                    return {success: false, error: e};
                }
            },

            createGroup: async (token: string, name: string, maxUsers: number): Promise<ActionResult<number>> => {
                try {
                    const response = await ApiCall.groups.createGroup(name, maxUsers);
                    await get().fetchGroups(token);
                    return {success: true, data: response.data.data.id};
                } catch (error) {
                    console.error(error);
                    return {success: false, error: error};
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