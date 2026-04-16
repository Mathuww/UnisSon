import {useEffect, useRef} from "react";
import {AppState} from "react-native";
import {useAuthStore} from "@/utils/authStore";
import {useSocketStore} from "@/utils/socketStore";
import {SplashScreen} from "expo-router";

export const useAppInitialization = () => {
    const appState = useRef(AppState.currentState)
    const {isLoggedIn, appToken, _hasHydrated} = useAuthStore();
    const {connect, disconnect} = useSocketStore();

    const syncApp = async () => {
        if (isLoggedIn && appToken) {
            connect(appToken);
        }
    };

    useEffect(() => {
        if (_hasHydrated) {
            SplashScreen.hideAsync();
            syncApp();
        }
    }, [isLoggedIn, _hasHydrated]);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (next) => {
            if (appState.current.match(/inactive|background/) && next === "active") {
                syncApp();
            }
            appState.current = next;
        });
        return () => subscription.remove();
    }, [isLoggedIn, appToken]);

    return { isReady : _hasHydrated}
}