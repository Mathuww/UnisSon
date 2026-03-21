import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={tabOptions}
        >
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Home',
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused ? "home-sharp" : "home-outline"} color={color} size={24} />
                    )
                }} 
            />
            <Tabs.Screen 
                name="about" 
                options={{ 
                    title: 'Eheheeh',
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused ? "information-circle": "information-circle-outline"} color={color} size={24} />
                    )
                }} 
            />
            <Tabs.Screen 
                name="groups"
                options={{ 
                    href: null
                }} 
            />
        </Tabs>
    );
}

const tabOptions = {
    tabBarActiveTintColor: '#ffd33d',
    headerStyle: {
        backgroundColor: '#25292e'
    },
    headerShadowVisible: false,
    headerTintColor: '#fff',
    tabBarStyle: {
        backgroundColor: '#25292e'
    }
};