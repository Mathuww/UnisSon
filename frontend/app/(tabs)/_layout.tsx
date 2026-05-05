import { Tabs } from "expo-router";
import { View, StyleSheet, Image, Text, Dimensions } from 'react-native';
import UnissonButton from "@/components/UnissonButton";
import IconAction from '@/components/UnissonIconAction';
import { useState, useEffect, createContext } from 'react';
import { ApiCall } from '@/api/BackendApi';
import { useGroupStore } from '@/utils/groupStore';
import { useSettingsStore } from '@/utils/settingsStore';
import { useTimeSocket } from '@/hooks/useTimeSocket';

export const TimeContext = createContext<string>("...");

const { width, height } = Dimensions.get('window');

export default function TabsLayout() {
    const [serverTime, setServerTime] = useState<string>("...");
    const { timeDebug } = useSettingsStore();

    const updateTime = async () => {
        try {
            const res = await ApiCall.admin.getServerTime();
            const { serverTime: time } = res.data.data;
            setServerTime(new Date(time).toLocaleString());
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        (async () => await updateTime())();
    }, []);

    useTimeSocket(updateTime);

    const handleTimeForward = async () => {
        const HOURS_TO_FORWARD = 24;
        try {
            const res = await ApiCall.admin.forwardTime(HOURS_TO_FORWARD);
            const { simulationTime } = res.data.meta;
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <TimeContext.Provider value={serverTime}>
            {timeDebug && (
                <View style={styles.containerTest}>
                    <IconAction img="more-time" OnValidation={() => handleTimeForward()} />
                    <Text style={styles.textTimeTest}>{serverTime}</Text>
                </View>
            )}

            <Tabs screenOptions={tabOptions}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: '',
                        tabBarIcon: ({ focused }) => (
                            <Image
                                source={focused
                                    ? require('@/assets/images/iconHome_Hovered.png')
                                    : require('@/assets/images/iconHome.png')}
                                style={styles.tabIcon}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: '',
                        tabBarIcon: ({ focused }) => (
                            <Image
                                source={focused
                                    ? require('@/assets/images/iconProfile_Hovered.png')
                                    : require('@/assets/images/iconProfile.png')}
                                style={styles.tabIcon}
                                resizeMode="contain"
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="joins"
                    options={{ href: null }}
                />
                <Tabs.Screen
                    name="tempindex"
                    options={{ href: null }}
                />
            </Tabs>
        </TimeContext.Provider>
    );
}

const tabOptions = {
    headerShown: false,
    tabBarShowLabel: false,
    tabBarStyle: {
        backgroundColor: '#1C0B03',
        height: height * 0.12,
        paddingTop: height * 0.02,
        paddingBottom: 0,
        borderTopWidth: 0,
        borderColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
    },
};
 
const styles = StyleSheet.create({
    tabIcon: {
        width: width * 0.133,
        height: width * 0.133,
    },
    containerTest: {
        backgroundColor: '#25292e',
        paddingTop: '2%',
        paddingLeft: '3%',
        alignItems: 'center',
        flexDirection: 'row',
    },
    textTimeTest: {
        color: '#fff',
    },
});
