import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
    label: string;
    colorText : string;
    OnValidation: () => void;
}

export default function Button({label, colorText, OnValidation}: Props) {    
    return (
        <Pressable style={styles.button} onPress={OnValidation}>
            <Text style={[styles.buttonLabel, {color: colorText}]}>{label}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
    },
    buttonLabel: {
        color: '#5df',
        marginTop: 12,
    },
});