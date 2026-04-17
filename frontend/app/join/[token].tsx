
import {useLocalSearchParams, useRouter} from "expo-router";
import {Text, StyleSheet, View, FlatList} from "react-native";
import { useEffect, useState } from "react";
import {UserData} from "@/shared/types";
import {ApiCall} from "@/api/BackendApi";

type InviteInfo = {
    groupName: string,
    inviterName: string,
    otherGroupMembers: UserData[]
}

export default function JoinScreen() {
    const { token } = useLocalSearchParams();
    const router = useRouter();
    const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await ApiCall.invites.tokenInfo(token as string);
                const data = res.data.data;
                setInviteInfo({
                    groupName: data.group.name,
                    inviterName: data.user.name,
                    otherGroupMembers: data.group.users
                });
                console.log(inviteInfo);
            } catch (err) {
                console.error("cant retrieve invite info " + err);
            }
        })();
    }, [token]);

    const handleJoin = async () => {
        try {
            const res = await ApiCall.invites.join(token as string);
            const group = res.data.data;
            router.replace({pathname: "/(tabs)/group"});
        } catch (err) {
            console.error("cant join group " + err);
        }
    }

    if (!inviteInfo) {
        return (
            <Text>
            Invitation?
            </Text>
        )
    } 


    return (
        <View>
            <Text>
                {inviteInfo.inviterName} vous a invité dans {inviteInfo.groupName} !!
            </Text>
            <FlatList
                data={inviteInfo.otherGroupMembers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={
                    ({item}) => <Text>{item.nickname}</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
})