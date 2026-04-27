import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useAuthStore } from "@/utils/authStore";
import {useSocketStore} from "@/utils/socketStore";
import { SplashScreen } from "expo-router";
import { useGroupStore } from "@/utils/groupStore";
import { setAuthToken } from "@/api/BackendApi";

export const useAppInitialization = () => {
    const appState = useRef(AppState.currentState)
    const { isLoggedIn, appToken, _hasHydrated } = useAuthStore();
    const { fetchGroups } = useGroupStore();
    const {connect, disconnect} = useSocketStore();

    const syncApp = async () => {
        if (isLoggedIn && appToken) {
            connect(appToken);
            setAuthToken(appToken);
            await fetchGroups();
        } else {
            disconnect();
        }
    };

    useEffect(() => {
        if (_hasHydrated) {
            SplashScreen.hideAsync();
            syncApp();
        }
    }, [isLoggedIn, _hasHydrated, syncApp]);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (next) => {
            if (appState.current.match(/inactive|background/) && next === "active") {
                syncApp();
            }
            appState.current = next;
        });
        return () => subscription.remove();
    }, [isLoggedIn, appToken, syncApp]);

    return { isReady: _hasHydrated}
}