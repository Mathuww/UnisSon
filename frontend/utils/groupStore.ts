import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import {getItem, setItem, deleteItemAsync} from "expo-secure-store";
import {ApiCall, BACKEND_API_URL} from "@/api/BackendApi";
import {ActionResult, GroupData, TrackData, QuizTrackData, QuizUserAnswerData, UserData} from "@/shared/types";

/**
 * Représente les données et les méthodes que propose le store  
 */
type GroupState = {
    groups: GroupData[];
    eventsGroupId: number | null;
    loading: boolean;
    setIsLoading: (loading: boolean) => void;
    setEventsGroupId: (id: number | null) => void;
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
    submitPredRanking: (id: number, ranking: {userId: number, trackId: number}[]) => Promise<void>;
    createGroup: (name: string, maxUsers: number) => Promise<ActionResult<number>>;
    getGroup: (id: number) => Promise<GroupData | undefined>;
    getMembersOrderedByWeeklyScore: (id: number) => Promise<UserData[] | undefined>;
    getMembersOrderedByGlobalScore: (id: number) => Promise<UserData[] | undefined>;
};

/**
 * Store global de gestion des groupes 
 * 
 * S'occupe de stocker la liste des groupes de l'user et de toutes les actions liées aux groupes 
 * 
 * Les données sont persistées via secure storage 
 */
export const useGroupStore = create(
    persist<GroupState>(
        (set, get) => ({
            groups: [],
            eventsGroupId: null,
            loading: false,

            /**
             * Permet d'empêcher d'effetuer certaines actions,
             * le temps qu'un groupe charge.
             */
            setIsLoading: (loading: boolean) => {
                set({loading});
            },

            /**
             * Permet d'assigner l'ID du groupe que le socket store
             * utilisera pour rejoindre la room group:{id} en cas 
             * de coupure et reconnexion du socket
             * @param id 
             */
            setEventsGroupId: (id: number | null) => {
                set({eventsGroupId: id});
            },

            /**
             * Permet d'ajouter une track via BackendAPI 
             * 
             * @param groupId : id du group 
             * @param track : données de la track à ajouter
             */
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

            /**
             * Permet d'ajouter un theme via BackendAPI 
             * 
             * @param groupId : id du group 
             * @param theme : le thème à transmettre 
             */
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

            /**
             * Récupère l'essemble des groupes via BackendAPI et stocke
             */
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

            /**
             * Récupère un groupe en particulier 
             * 
             * @param id : id du group 
             */
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

            /**
             * Récupère les données pour le quizz via BackendAPI 
             * 
             * @param groupId : id du groupe concerné par le quizz 
             * @returns {success : boolean, data? : QuizTrackData[]}
             */
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

            /**
             * Envoie les réponses au quizz via BackendAPI 
             * 
             * @param groupId : id du group 
             * @param answers : liste de paire de trackId et userId
             */
            submitChosenQuizzAnswers: async (groupId: number, answers: QuizUserAnswerData) => {
                try {
                    const res = await ApiCall.groups.submitChosenQuizAnswers(groupId, answers);
                } catch (e) {
                    console.error(e);
                }
            },

            /**
             * Envoie le classement de l'élu via BackendAPI 
             * 
             * @param groupId : id du group 
             * @param ranking : liste de paire de userId et trackId 
             */
            submitChosenRanking: async (groupId: number, ranking: {userId: number, trackId: number}[]) => {
                try {
                    const res = await ApiCall.groups.submitChosenRank(groupId, ranking);
                } catch (e) {
                    console.error(e);
                }
            },

            /**
             * Envoie la prédiction de l'utilisateur sur le classement via BackendAPI 
             * 
             * @param groupId : id du groupe
             * @param ranking : liste de paire de userId et trackId
             */           
            submitPredRanking: async (groupId: number, ranking: {userId: number, trackId: number}[]) => {
                try {
                    const res = await ApiCall.groups.submitPredRank(groupId, ranking);
                } catch (e) {
                    console.error(e);
                }
            },

            /**
             * Génère un lien d'invitation via BackendAPI et renvoie le lien 
             * 
             * @param groupId : id du group 
             * @returns {success : boolean, data? : string } 
             */
            createInvite: async (groupId: number): Promise<ActionResult<string>> => {
                try {
                    const res = await ApiCall.groups.createInvite(groupId);
                    const token = res.data.data.token;
                    const inviteLink = `${BACKEND_API_URL}/join/${token}`
                    return {success: true, data: inviteLink};
                } catch (e) {
                    console.error(e);
                    return {success: false, error: e};
                }
            },

            /**
             * Génère un groupe via BackendAPI et renvoie l'id du groupe 
             * 
             * @param name : nom du groupe
             * @param maxUsers : nombre max d'user dans le grp
             * @returns {success : boolean, data? : number}
             */
            createGroup: async (name: string, maxUsers: number): Promise<ActionResult<number>> => {
                try {
                    const response = await ApiCall.groups.createGroup(name, maxUsers);
                    await get().fetchGroups();
                    return {success: true, data: response.data.data.id};
                } catch (error) {
                    console.error(error);
                    return {success: false, error: error};
                }
            },

            /**
             * Quitte un groupe et notifie le backend via BackendAPI 
             * 
             * @param id : id du groupe 
             */
            leaveGroup: async (id: number) => {
                try {
                    const response = await ApiCall.groups.leaveGroup(id);
                    await get().fetchGroups();
                } catch (error) {
                    console.error(error);
                }
            },

            /**
             * Renvoie la data d'un groupe en particulier 
             * 
             * @param id : id du groupe
             * @returns {data? : GroupData}
             */
            getGroup: async (id: number) => {
                return get().groups.find((g) => g.id === id);
            },

            /**
             * Renvoie les users d'un group triés par weeklyScore décroissant
             */
            getMembersOrderedByWeeklyScore: async (id: number) => {
                // Le backend trie déjà par weeklyScore décroissant
                return get().groups.find((g) => g.id === id)?.users!;
            },

            /**
             * Renvoie les users d'un group triés par globalScore décroissant
             */
            getMembersOrderedByGlobalScore: async (id: number) => {
                // Le backend trie déjà par globalScore décroissant
                return get().groups.find((g) => g.id === id)?.users?.sort((a,b) => (b.globalScore ?? 0) - (a.globalScore ?? 0));
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