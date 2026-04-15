import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
    label: string;
    OnValidation: () => void;
}

export default function Button({label, OnValidation}: Props) {
    return (
        <Pressable style={styles.button} onPress={OnValidation}>
            <Text style={styles.buttonLabel}>{label}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLabel: {
        color: '#5df',
        marginTop: 12,
    },
});