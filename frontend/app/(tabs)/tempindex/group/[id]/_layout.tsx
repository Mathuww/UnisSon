import {Stack, Tabs} from "expo-router";
import React from "react";

/**
 * Layout simple des pages intra-groupes
 */
export default function GroupStackLayout() {
    return (
        <React.Fragment>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="addTheme"  />
                <Stack.Screen name="addTrack"  />
                <Stack.Screen name="invitation" options={{presentation: 'modal'}} />
                <Stack.Screen name="quizz" />
                <Stack.Screen name="ranking" />
            </Stack>
        </React.Fragment>
    )
}