import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useAuthStore } from "@/utils/authStore";
import {useSocketStore} from "@/utils/socketStore";
import { SplashScreen } from "expo-router";
import { useGroupStore } from "@/utils/groupStore";
import { setAuthToken } from "@/api/BackendApi";

/**
 * Hook s'occupant de l'initialization et de la sync de l'app à l'ouverture / retour sur l'app 
 * 
 * @return isReady - indique si l'app est prête (store hydraté)
 */
export const useAppInitialization = () => {
    const appState = useRef(AppState.currentState)
    const { isLoggedIn, appToken, _hasHydrated } = useAuthStore();
    const { fetchGroups } = useGroupStore();
    const {connect, disconnect} = useSocketStore();

    /**
     * Resync l'app en général (appToken, groupes et sockets)
     */
    const syncApp = useCallback(async () => {
        if (isLoggedIn && appToken) {
            setAuthToken(appToken);
            connect(appToken);
            try {
                await fetchGroups();
            } catch (error) {
                console.error("Erreur lors du fetchGroups au démarrage:", error);
            }
        } else {
            disconnect();
        }
    }, [isLoggedIn, appToken, fetchGroups, connect, disconnect]);

    useEffect(() => {
        const prepareApp = async () => {
            if (_hasHydrated) {
                await syncApp();
                await SplashScreen.hideAsync();
            }
        };
        prepareApp();
    }, [_hasHydrated, syncApp]);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) && 
                nextAppState === "active"
            ) {
                syncApp();
            }
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, [syncApp]);

    return { isReady: _hasHydrated}
}