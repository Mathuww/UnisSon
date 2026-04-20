import {Stack} from "expo-router";
import React from "react";

export default function GroupStackLayout() {
    return (
        <React.Fragment>
            <Stack>
                <Stack.Screen name="index" />
                <Stack.Screen name="ajoutTheme"  />
                <Stack.Screen name="ajoutTrack"  />
                <Stack.Screen name="invitation" options={{presentation: 'modal'}} />
                <Stack.Screen name="quizz" />
                <Stack.Screen name="ranking" />
            </Stack>
        </React.Fragment>
    )
}