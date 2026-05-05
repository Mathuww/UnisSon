import { StyleSheet, Text, View } from "react-native";
import { useState, useCallback} from "react";
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import UnissonTextInput from "@/components/UnissonTextInput";
import UnissonButton from "@/components/UnissonButton";
import { useGroupStore } from "@/utils/groupStore";
import { errorDialog } from "@/shared/errorDialog";

/**
 * Page d'ajout de thème pour un élu
 */
export default function SubmitTheme() {
    const [groupTheme, setGroupTheme] = useState('');
    const { id } = useLocalSearchParams();
    const {submitTheme} = useGroupStore();

    const router = useRouter();

    const resetInput = useCallback(() => {
        setGroupTheme("");
        }, []);

    useFocusEffect(
        resetInput
    );

    /**
     * Gère l'ajout d'un thème et redirige vers la bonne page
     */
    const handleTheme = async () => {
        console.log(groupTheme);
        try {
            await submitTheme(Number(id), groupTheme);

            router.push({ pathname: `/(tabs)/tempindex/group/${id}/` as any});
        } catch (error) {
            errorDialog("Impossible de transmettre votre thème");
            console.error("On n'arrive pas à transmettre votre thème. Veuillez réessayer!");
        }
   }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>L'élu de cette semaine est vous !!</Text>
            <UnissonTextInput labelDefault="Votre thème musicale" text={groupTheme} OnWrite={setGroupTheme}/>
            <UnissonButton label="Définition d'une nouvelle ère" colorText="#e76f51" OnValidation={handleTheme}></UnissonButton>
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
    padding : 5,
    color: "#fff",
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom : 20,
  },
});