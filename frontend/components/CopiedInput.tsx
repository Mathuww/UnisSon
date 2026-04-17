import { useRef, useState } from "react";
import {Share, StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
    url:string;
}

export default function CopiedInput({url}: Props) {
    const [shared, setShared] = useState(false);

    const handleCopied = async () => {
        const result = await Share.share({
            message: url,
        });

        // Si l'utilisateur a bien partagé (pas annulé)
        if (result.action === Share.sharedAction) {
            setShared(true);
        }
    };
    return (
        <TouchableOpacity style={styles.button} onPress={handleCopied}>
            <Text style={styles.link} numberOfLines={1}>
                {url}
            </Text>
            <Text style={styles.action}>
                Partager
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 11,
        padding : 11,
        margin: 11,
        gap: 11,
    },
    link: {
        flex: 1,
        color: "#ccc",
        fontSize: 12,
    },
    action: {
        fontSize: 12,
        color: "#e76f51",
    },
});