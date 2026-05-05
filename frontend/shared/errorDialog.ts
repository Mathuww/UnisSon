import { Alert } from "react-native";

export const errorDialog = (msg: string, canRetry?: boolean) => {
    Alert.alert(
        "Erreur de l'ajout",
        msg,
        [
            { text: "OK" }
        ]
    )
}