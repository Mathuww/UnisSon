import {SplashScreen, Stack} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {useEffect} from "react";
import {useAuthStore} from "@/utils/authStore";
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useSocketStore} from "@/utils/socketStore";
import {useAppInitialization} from "@/hooks/useAppInitialization";

GoogleSignin.configure({
    webClientId : '643995195692-0nf56p340fn2us9nendjv0t1v3rvp2kj.apps.googleusercontent.com',
    offlineAccess : true,
})

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { isReady } = useAppInitialization();
    const {isLoggedIn} = useAuthStore();

    return (
        <React.Fragment>
            <StatusBar style="auto" />
            <Stack>
                <Stack.Protected guard={isLoggedIn}>
                    <Stack.Screen name="(tabs)" />
                </Stack.Protected>
                <Stack.Protected guard={!isLoggedIn}>
                    <Stack.Screen name="sign-in" />
                </Stack.Protected>
            </Stack>
        </React.Fragment>
    );
}
