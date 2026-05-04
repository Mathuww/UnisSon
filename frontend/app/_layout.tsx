import {router, SplashScreen, Stack} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {useEffect} from "react";
import {useAuthStore} from "@/utils/authStore";
import {GoogleSignin} from '@react-native-google-signin/google-signin';
//import {useSocketStore} from "@/utils/socketStore";
import {useAppInitialization} from "@/hooks/useAppInitialization";
import * as Linking from "expo-linking";
import UnissonButton from "@/components/UnissonButton";
import {View, StyleSheet} from "react-native";

/**
 * Configuration du SDK Google Sign-In
 */
GoogleSignin.configure({
    webClientId : '643995195692-0nf56p340fn2us9nendjv0t1v3rvp2kj.apps.googleusercontent.com',
    iosClientId : "643995195692-aeh67a1heqpat6k3shr17mpm72da6ll3.apps.googleusercontent.com",
    offlineAccess : true,
    forceCodeForRefreshToken: true,
    scopes: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl'
    ],
})

SplashScreen.preventAutoHideAsync();

/**
 * Layout racine de l'application 
 * 
 * Initialise l'app et gère la navigation avec Expo router (force le sign in pour acceder au reste de l'appli)
 */
export default function RootLayout() {
    const { isReady } = useAppInitialization();
    const {isLoggedIn} = useAuthStore();
    const initialUrl = Linking.useURL();

    if (!isReady) {
        return null;
    } 

    return (
        <React.Fragment>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={isLoggedIn}>
                    <Stack.Screen name="(tabs)" />
                </Stack.Protected>
                <Stack.Protected guard={!isLoggedIn}>
                    <Stack.Screen name="sign-in" />
                </Stack.Protected>
                <Stack.Screen name="join/[token]" />
            </Stack>
        </React.Fragment>
    );
}
