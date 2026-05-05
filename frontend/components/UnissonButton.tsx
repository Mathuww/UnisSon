import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text } from "react-native";

type Props = {
    label: string;
    color:string;
    colorText?:string;
    OnValidation: () => void;
}

export default function UnissonButton({ label, color, colorText, OnValidation }: Props) {
    const [loading, setLoading] = useState(false);

    const handleTouch = async () => {
        if (loading) return;
        setLoading(true);
        await OnValidation();
        setLoading(false);
    };

    return (
        <Pressable style={[styles.button, {backgroundColor: color}]} onPress={handleTouch}>
            <Text style={[styles.label, (colorText && {color: colorText})]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({

    button: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        marginTop : 20,
        marginHorizontal : 22,
    },

    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: "center",
    },

});