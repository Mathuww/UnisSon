import {Alert, StyleSheet, Text, View} from "react-native";
import {useState, useCallback} from "react";
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import UnissonTextInput from "@/components/UnissonTextInput";
import UnissonButton from "@/components/UnissonButton";
import {useGroupStore} from "@/utils/groupStore";
import { makeShareable } from "react-native-worklets";
import { errorDialog } from "@/shared/errorDialog";

/**
 * Page d'ajout d'une track pour les non élus
 *
 * Gère la verification des liens fournis
 */
export default function SubmitTracks() {
    const [yourSuggestion, setYourSuggestion] = useState('');
    const {id} = useLocalSearchParams();
    const {submitTrack} = useGroupStore();

    const router = useRouter();

    const resetInput = useCallback(() => {
        setYourSuggestion("");
    }, []);

    useFocusEffect(
        resetInput
    );

    /**
     * Verification de la validité de l'url fourni (que ça soit un lien youtube)
     * @param link : lien en entrée
     */
    const checkVerificationLinkYoutube = (link: string) => {
        const prefixLink = "youtube.com/watch?v=";
        const prefixMobileLink = "youtu.be/";

        if (link.includes(prefixLink)) {
            return link.split("v=")[1].split("&")[0];
        } else if (link.includes(prefixMobileLink)) {
            return link.split("youtu.be/")[1].split("?")[0];
        } else {
            throw new Error("It is not a url Youtube!");
        }
    };

    /**
     * Gère la suggestion d'une nouvelle track et redirige vers le bon path
     */
    const handleSuggestion = async () => {
        console.log(yourSuggestion);
        try {
            const suggestion = checkVerificationLinkYoutube(yourSuggestion);
            await submitTrack(Number(id), {youtubeLink: suggestion});
            router.push({pathname: `/(tabs)/tempindex/group/${id}/` as any });
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                if (status == 403) {
                    errorDialog("Vous ne pouvez pas ajouter de musique à ce groupe.");
                } else if (status == 404) {
                    errorDialog("Le lien de votre vidéo semble invalide");
                } else if (status === 409) {
                    errorDialog("Cette vidéo a déja été ajoutée à ce groupe par le passé.");
                } else {
                    errorDialog("Erreur inconnue");
                }
            }
            console.error("On n'arrive pas à transmettre votre suggestion musicale. Veuillez réessayer!");
        }
    }


    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                À vous de tenir tête à vos camarades en ayant la meilleure suggestion musicale de votre groupe.
            </Text>
            <Text style={styles.subtitle}>
                Par ailleurs, n'oubliez pas que la suggestion doit être personnalisée à l'élu et à son thème :)
            </Text>
            <UnissonTextInput labelDefault="Le lien de votre suggestion musicale" text={yourSuggestion}
                OnWrite={setYourSuggestion}/>
            <UnissonButton 
                label="Confirmer votre propagande de la nouvelle ère" 
                colorText="#e76f51"
                OnValidation={handleSuggestion}>
            </UnissonButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#25292e",
        flex: 1,
        justifyContent: "center",
        paddingTop: 100,
    }, title: {
        padding: 5,
        color: "#fff",
        alignSelf: "center",
        fontSize: 18,
        fontWeight: "bold",
        paddingBottom: 20,
    },
    subtitle: {
        padding: 5,
        color: "#ffe",
        fontSize: 12,
        paddingBottom: 5,
    },
});