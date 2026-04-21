
import {useLocalSearchParams, useRouter} from "expo-router";
import {Text, StyleSheet, View, FlatList} from "react-native";
import { useEffect, useState } from "react";
import {UserData} from "@/shared/types";
import {ApiCall} from "@/api/BackendApi";
import {useAppInitialization} from "@/hooks/useAppInitialization";

import UnissonButton from "@/components/UnissonButton";

type InviteInfo = {
    groupName: string,
    inviterName: string,
    otherGroupMembers: UserData[]
}

export default function JoinScreen() {
    const { isReady } = useAppInitialization();
    const { token } = useLocalSearchParams();
    const router = useRouter();
    const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await ApiCall.invites.tokenInfo(token as string);
                const data = res.data.data;
                console.log(data);
                if (data.isUserInGroup) {
                    console.log("User already in group, redirecting to group homepage.");
                    router.replace({pathname: `/(tabs)/tempindex/group/${data.group.id}/` as any});
                }
                setInviteInfo({
                    groupName: data.group.name,
                    inviterName: data.inviter.nickname,
                    otherGroupMembers: data.group.users
                });
            } catch (err) {
                console.error("cant retrieve invite info ", err);
            }
        })();
    }, [token]);

    const handleJoin = async () => {
        try {
            const res = await ApiCall.invites.join(token as string);
            const group = res.data.data;
            router.replace({pathname: `/(tabs)/tempindex/group/${group.id}/` as any});
        } catch (err) {
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
            <Text>
                {inviteInfo.inviterName} vous a invité dans {inviteInfo.groupName} !!

                Voici la douce liste des membres, qui vous est proposée par le troubadour Gustave de Dupuis :
                🎵
            </Text>
            <FlatList
                data={inviteInfo.otherGroupMembers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={
                    ({item}) => <Text>{item.nickname}</Text>
                }
            />
            <Text>
                🎵
            </Text>
            <UnissonButton label="Rejoindre le doux groupe" colorText="#fff" OnValidation={handleJoin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#25292e",
        flex: 1,
        padding:10,
        paddingTop: 100,
    },
})