import {useCallback, useEffect} from "react";
import {useSocketStore} from "@/utils/socketStore";
import {useGroupStore} from "@/utils/groupStore";
import {useAuthStore} from "@/utils/authStore";
import { useFocusEffect } from "expo-router";

export const useTimeSocket = (onTimeChange: () => Promise<void>) => {
    const { on, off } = useSocketStore();

    useFocusEffect(
        useCallback(() => {
            const handler = async () => {
                console.log("Socket Time");
                await onTimeChange();
            };

            on("simulation:timeChange", handler);

            return () => {
                off("simulation:timeChange", handler);
            };
        }, [])
    );
};