import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import { View,StyleSheet} from 'react-native';
import UnissonButton from "@/components/UnissonButton";
import IconAction from '@/components/IconAction';
import { useState, useEffect, createContext } from 'react';
import { Text } from 'react-native';
import { ApiCall } from '@/api/BackendApi';
import { useGroupStore } from '@/utils/groupStore';
import { useSettingsStore } from '@/utils/settingsStore';
import { useTimeSocket } from '@/hooks/useTimeSocket';

/**
 * Context global fournissant l'heure serveur (dans le cas du test)
 */
export const TimeContext = createContext<string>("...");

/**
 * Layout de (tabs)
 * 
 * Syncronise l'heure avec le backend
 *
 * Gère le mode debug pour "avancer" dans le temps 
 */
export default function TabsLayout() {
    const [serverTime, setServerTime] = useState<string>("...");
    const {fetchGroups} = useGroupStore();
    const {timeDebug} = useSettingsStore();

    /**
     * Récupère l'heure actuelle du server depuis le backend et met à jour
     */
    const updateTime = async () => {
        try {
            const res = await ApiCall.admin.getServerTime();
            const { serverTime: time } = res.data.data;
            setServerTime(new Date(time).toLocaleString());
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        (async () => await updateTime())();
    }, []);

    useTimeSocket(updateTime);

    /**
     * Avance artificielement le temps coté server 
     */
    const handleTimeForward = async () => {
        const HOURS_TO_FORWARD = 24;
        try {
            const res = await ApiCall.admin.forwardTime(HOURS_TO_FORWARD);
            const { simulationTime } = res.data.meta;
            setServerTime(new Date(simulationTime).toLocaleString());
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <TimeContext.Provider value={serverTime}>
            {(timeDebug &&
                <View style={styles.containerTest}>
                    <IconAction img="more-time" OnValidation={() => handleTimeForward()} />
                    <Text style={styles.textTimeTest}>{serverTime}</Text>
            </View>
            )}
            <Tabs screenOptions={tabOptions }>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Accueil',
                        tabBarIcon: ({color, focused}) => (
                            <Ionicons name={focused ? "home-sharp" : "home-outline"} color={color} size={24} />
                        )
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profil',
                        tabBarIcon: ({color, focused}) => (
                            <Ionicons name={focused ? "information-circle": "information-circle-outline"} color={color} size={24} />
                        )
                    }}
                />
                <Tabs.Screen 
                    name="tempindex"
                    options={{ 
                        href: null
                    }} 
                />

            </Tabs>
        </TimeContext.Provider>
    );
}

const tabOptions = {
    tabBarActiveTintColor: '#ffd33d',
    headerStyle: {
        backgroundColor: '#25292e'
    },
    headerShown: false,
    headerShadowVisible: false,
    headerTintColor: '#fff',
    tabBarStyle: {
        backgroundColor: '#25292e'
    }
};

const styles = StyleSheet.create({
    containerTest: {
        backgroundColor: "#25292e",
        paddingTop:20,
        paddingLeft: 11,
        alignItems:"center",
        flexDirection: "row",
    }, textTimeTest: {
        color: "#fff"
    }
});