import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
    label: string;
    onPress: () => void;
}

export default function IconButton({label, onPress}: Props) {
    return (
        <Pressable style={styles.button} onPress={onPress}>
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