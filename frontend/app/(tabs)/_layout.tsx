import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        
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
                name="joins"
                options={{ 
                    href: null
                }} 
            />
            <Tabs.Screen 
                name="tempindex"
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
    headerShown: false,
    headerShadowVisible: false,
    headerTintColor: '#fff',
    tabBarStyle: {
        backgroundColor: '#25292e'
    }
};