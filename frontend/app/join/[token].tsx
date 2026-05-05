
import {useLocalSearchParams, useRouter} from "expo-router";
import {Text, StyleSheet, View, FlatList} from "react-native";
import { useEffect, useState } from "react";
import {UserData} from "@/shared/types";
import {ApiCall} from "@/api/BackendApi";
import {useAppInitialization} from "@/hooks/useAppInitialization";

import UnissonButton from "@/components/UnissonButton";
import { useGroupStore } from "@/utils/groupStore";
import { errorDialog } from "@/shared/errorDialog";

type InviteInfo = {
    groupName: string,
    inviterName: string,
    otherGroupMembers: UserData[]
}

/**
 * Ecran d'invitation à rejoindre un groupe via un lien 
 * 
 * Redirige si l'utilisateur est déjà membre
 */
export default function JoinScreen() {
    const { isReady } = useAppInitialization();
    const { token } = useLocalSearchParams();
    const router = useRouter();
    const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
    const {fetchGroups} = useGroupStore();

    /**
     * Récupère les infos de l'invitation à partir du token du lien 
     * 
     * Redirige si l'user est deja dans le groupe
     */
    useEffect(() => {
        (async () => {
            try {
                const res = await ApiCall.invites.tokenInfo(token as string);
                const data = res.data.data;
                //console.log(data);
                if (data.isUserInGroup) {
                    //console.log("User already in group, redirecting to group homepage.");
                    router.replace({pathname: `/(tabs)/tempindex/group/${data.group.id}/` as any});
                }
                setInviteInfo({
                    groupName: data.group.name,
                    inviterName: data.inviter.nickname,
                    otherGroupMembers: data.group.users
                });
            } catch (err) {
                errorDialog("Impossible de récupérer les infos de l'invitation.");
                console.error("cant retrieve invite info ", err);
            }
        })();
    }, [token]);

    /**
     * Permet au user de rejoindre le groupe via BackendAPI et met à jour les groupes
     */
    const handleJoin = async () => {
        try {
            const res = await ApiCall.invites.join(token as string);
            const group = res.data.data;
            await fetchGroups();
            router.replace({pathname: `/(tabs)/tempindex/group/${group.id}/` as any});
        } catch (err) {
            errorDialog("Impossible de rejoindre le groupe.");
            console.error("cant join group " + err);
        }
    }

    if (!inviteInfo) {
        return (
            <Text>Vous êtes entrain d'arriver dans votre future banger communauté :</Text>
        )
    } 


    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {inviteInfo.inviterName} vous a invité dans {inviteInfo.groupName} !!
            </Text>
            <Text style={styles.subtitle}>
                Pour mieux vous informer de votre future communauté, voici les membres actuels :
            </Text>
            <FlatList
                data={inviteInfo.otherGroupMembers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={
                    ({item}) => <Text style={styles.text}>{item.nickname}</Text>
                }
            />
            <UnissonButton label="Rejoindre votre future communauté" colorText="#fff" OnValidation={handleJoin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#25292e",
        flex: 1,
        padding:10,
        paddingTop: 100,
        paddingBottom:30,
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
        padding: 5,
        color: "#ffe",
        fontSize: 12,
        paddingBottom: 5,
    },
    text: {
        color: "#fff"
    }
})