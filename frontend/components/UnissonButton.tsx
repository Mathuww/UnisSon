import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
    label: string;
    colorText : string;
    OnValidation: () => void;
}

export default function Button({label, colorText, OnValidation}: Props) {    
    const [loading, setLoading] = useState(false);

    const handleTouch = async () => {
        if (loading) {
            return;
        }
        setLoading(true);
        await OnValidation();
        setLoading(false);
    };
    
    return (
        <Pressable style={styles.button} onPress={handleTouch}>
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