import {useGroupStore} from "@/utils/groupStore";
import {useSocketStore} from "@/utils/socketStore";
import { useFocusEffect } from "expo-router";
import {useCallback, useEffect} from "react";

/**
 * Hook s'occupant des sockets pour le group actif 
 */
export const useGroupSocket = (groupId: number | null) => {
    const { on, off, emit } = useSocketStore();
    const { fetchCurrentGroup, setEventsGroupId } = useGroupStore();

    useFocusEffect(
        useCallback(() => {
            if (!groupId) return;

            setEventsGroupId(groupId);

            emit("join:group", { groupId });

            const handler = async () => {
                console.log("Socket Group");
                await fetchCurrentGroup(groupId);
            };

            on(`group:${groupId}:refresh`, handler);

            return () => {
                emit("leave:group", { groupId });
                off(`group:${groupId}:refresh`, handler);
            };
        }, [groupId])
    );
};