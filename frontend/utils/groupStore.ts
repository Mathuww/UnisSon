import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import {getItem, setItem, deleteItemAsync} from "expo-secure-store";
import {ApiCall, BACKEND_API_URL} from "@/api/BackendApi";
import {ActionResult, GroupData, TrackData, QuizTrackData, QuizUserAnswerData} from "@/shared/types";

type GroupState = {
    groups: GroupData[];
    setGroups: (groups: GroupData[]) => void;
    forceChangeStatus: (groupId: number) => Promise<void>;
    submitTrack: (groupId: number, track: TrackData) => Promise<void>;
    submitTheme: (groupId: number, theme: string) => Promise<void>;
    createInvite: (groupId: number) => Promise<ActionResult<string>>;
    leaveGroup: (groupId: number) => Promise<void>;
    clearAllActions: () => void;
    fetchGroups: () => Promise<void>;
    fetchCurrentGroup: (id: number) => Promise<void>;
    getQuizzData: (id: number) => Promise<ActionResult<QuizTrackData[]>>;
    submitChosenQuizzAnswers: (id: number, answers: QuizUserAnswerData) => Promise<void>;
    submitChosenRanking: (id: number, ranking: {userId: number, trackId: number}[]) => Promise<void>;
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

            fetchGroups: async () => {
                try {
                    const response = await ApiCall.users.getAllGroup();
                    if (!response.data.data) {
                        return console.error("missing groups in fetchgroups");
                    }
                    set((state) => ({
                        groups: response.data.data.map((receivedGroup: GroupData) => {
                            const currentGroup = state.groups.find(g => g.id === receivedGroup.id);
                            return {
                                ...currentGroup,
                                ...receivedGroup
                            };
                        })
                    }));
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

            getQuizzData: async (groupId: number): Promise<ActionResult<QuizTrackData[]>> => {
                try {
                    const res = await ApiCall.groups.getSongs(groupId);
                    const data = res.data.data;
                    console.log(data);
                    return {success: true, data};
                } catch (e) {
                    console.error(e);
                    return {success: false, error: e};
                }
            },

            submitChosenQuizzAnswers: async (groupId: number, answers: QuizUserAnswerData) => {
                try {
                    const res = await ApiCall.groups.submitChosenQuizAnswers(groupId, answers);
                } catch (e) {
                    console.error(e);
                }
            },

            submitChosenRanking: async (groupId: number, ranking: {userId: number, trackId: number}[]) => {
                try {
                    const res = await ApiCall.groups.submitChosenRank(groupId, ranking);
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
                    await get().fetchGroups();
                    return {success: true, data: response.data.data.id};
                } catch (error) {
                    console.error(error);
                    return {success: false, error: error};
                }
            },

            leaveGroup: async (id: number) => {
                try {
                    const response = await ApiCall.groups.leaveGroup(id);
                    await get().fetchGroups();
                } catch (error) {
                    console.error(error);
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