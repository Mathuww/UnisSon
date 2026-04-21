import {Stack} from "expo-router";
import React from "react";

export default function GroupStackLayout() {
    return (
        <React.Fragment>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="group/[id]" getId={({ params }) => params?.id} />
                <Stack.Screen name="creation"/>
            </Stack>
        </React.Fragment>
    )
}