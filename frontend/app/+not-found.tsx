import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen/>
            <View style={styles.container}>
                <Text style={styles.sousText}>
                    Une Erreur 404 n'est pas si unie de votre part.
                </Text>
                <Link href="/" style={styles.button}>
                    Viens s'unir avec nous !
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },

    sousText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 6
    },

    button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#fff'
    },
});