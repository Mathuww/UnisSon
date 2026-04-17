import {Stack} from "expo-router";
import React from "react";

export default function HomeStackLayout() {
    return (
        <React.Fragment>
            <Stack>
                <Stack.Screen name="index" />
                <Stack.Screen name="group/[id]" />
                <Stack.Screen name="invite" />
                <Stack.Screen name="creation" />
            </Stack>
        </React.Fragment>
    )
}