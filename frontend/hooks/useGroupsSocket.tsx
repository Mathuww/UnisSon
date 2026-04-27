import {useEffect} from "react";
import {useSocketStore} from "@/utils/socketStore";
import {useGroupStore} from "@/utils/groupStore";
import {useAuthStore} from "@/utils/authStore";

export const useGroupsSocket = () => {
    const { on, off, emit } = useSocketStore();
    const { userInfo } = useAuthStore()
    const { fetchGroups } = useGroupStore();

    useEffect(() => {
        if (!userInfo) return;

        const id = userInfo.id;

        emit("join:user", {id});

        const handler = () => {
            console.log("Socket Groups");
            fetchGroups();
        };

        on("groups:refresh", handler);

        return () => {
            emit("leave:user", { id });
            off("groups:refresh", handler);
        };
    }, []);
};