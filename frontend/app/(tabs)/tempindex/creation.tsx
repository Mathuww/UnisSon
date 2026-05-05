import { useRouter, useFocusEffect } from 'expo-router';
import {useCallback, useState } from "react";
import {StyleSheet, View, Text, TextInput, Alert} from "react-native";
import UnissonTextInput from "@/components/UnissonTextInput";
import UnissonSlider from "@/components/UnissonSlider";
import UnissonButton from "@/components/UnissonButton";
import { useGroupStore } from "@/utils/groupStore";
import { ActionResult } from "@/shared/types";
import { useAuthStore } from "@/utils/authStore";
import { errorDialog } from '@/shared/errorDialog';

/**
 * Page de création de groupe
 */
export default function Creation() {
    const [groupName, setGroupName] = useState('');
    const [groupMaxUser, setGroupMaxUser] = useState(4);

    const router = useRouter();

    const {appToken} = useAuthStore();

    const createGroup = useGroupStore((state) => state.createGroup);

    const resetInput = useCallback(() => {
        setGroupName("");
        setGroupMaxUser(4);
    }, []);

    useFocusEffect(
        resetInput
    );

    /**
     * Gère la création de groupe et redirige vers la bonne page
     */
    const handleCreateGroup = async () => {
        if (!appToken) {
            console.error("Not logged in");
            return;
        }
        //console.log(groupName, groupMaxUser);
        try {
            if(groupName == "") {
                return errorDialog("Le nom du groupe est vide");
            }

            const result: ActionResult<number> = await createGroup(groupName, groupMaxUser);

            if (result.success) {
                router.push({ pathname: `/(tabs)/tempindex/group/${result.data}` as any});
            } else {
                throw new Error(String(result.error));
            }
        } catch (error) {
            errorDialog("Erreur de création du groupe");
            console.error("On ne peut pas créer ce groupe. Veuillez réessayer! \n" + error);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Heyy, à toi de créer ton propre univers avec tes musiciens, compositeurs, producteurs, podcasteurs :</Text>
            <Text style={styles.subtitle}>Mais avant tout, je te demandes quelques tatonnements :</Text>
            <UnissonTextInput labelDefault="Nom du groupe" text={groupName} OnWrite={setGroupName}/>
            <UnissonSlider numberDefault={4} min={3} max={11} numberActual={groupMaxUser} OnSlice={setGroupMaxUser}/>
            <UnissonButton label="Explosion d'un nouveau univers" color="#e76f51" OnValidation={handleCreateGroup}/>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        backgroundColor: '#25292e',
        flex: 1,
        paddingTop: 100,
    },
    title: {
        padding : 5,
        color: "#fff",
        alignSelf: "center",
        fontSize: 18,
        fontWeight: "bold",
        paddingBottom : 20,
    },
    subtitle: {
        padding : 5,
        color: "#ffe",
        fontSize : 12,
        paddingBottom : 5,
    },
})
