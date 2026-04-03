import {Stack} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {useAuthStore} from "@/utils/authStore";
import {GoogleSignin} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId : '643995195692-0nf56p340fn2us9nendjv0t1v3rvp2kj.apps.googleusercontent.com',
    offlineAccess : true,
})

export default function RootLayout() {
    const {isLoggedIn, hasCompletedProfile} = useAuthStore();
    return (
        <React.Fragment>
            <StatusBar style="auto" />
            <Stack>
                <Stack.Protected guard={isLoggedIn && hasCompletedProfile}>
                    <Stack.Screen name="(tabs)" />
                </Stack.Protected>

                <Stack.Protected guard={!isLoggedIn}>
                    <Stack.Screen name="sign-in" />
                </Stack.Protected>

                <Stack.Protected guard={isLoggedIn && !hasCompletedProfile}>
                    <Stack.Screen name="sign-up" />
                </Stack.Protected>
            </Stack>
        </React.Fragment>
    );
}
