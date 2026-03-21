import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {useAuthStore} from "@/utils/authStore";

export default function RootLayout() {
    const {isLoggedIn, shouldCreateAccount} = useAuthStore();

  return (
    <React.Fragment>
        <StatusBar style="auto"/>
        <Stack>
            <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen name="(tabs)"/>
            </Stack.Protected>
            <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="sign-in"/>
                <Stack.Protected guard={shouldCreateAccount}>
                    <Stack.Screen name="sign-up"/>
                </Stack.Protected>
            </Stack.Protected>
        </Stack>
    </React.Fragment>
  );
}
