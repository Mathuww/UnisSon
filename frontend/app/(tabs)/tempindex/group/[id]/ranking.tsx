import UnissonCompetitionDragnDrop from "@/components/UnissonCompetitionDragnDrop";
import { QuizTrackData, UserData } from "@/shared/types";
import { useGroupStore } from "@/utils/groupStore";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import UnissonButton from "@/components/UnissonButton";


/* 
1: track x1, user y1
2: x2, y2
3: x3, y3

stocker : [{trackId: x1, userId: y1}, {trackId: x2, userId: y2}]
*/

export default function Ranking() {
    const { id } = useLocalSearchParams();
    const { getGroup, getQuizzData, submitChosenRanking } = useGroupStore();
    const [members, setMembers] = useState<UserData[]>([]);
    const [tracks, setTracks] = useState<QuizTrackData[]>([]);
    const [ranking, setRanking] = useState<{userId: number, trackId: number}[]>([]);

    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            let active = true;
            const loadGroupData = async () => {
                const group = await getGroup(Number(id));  
                if (!group?.users) {
                    return console.error("cannot find user list");
                }         
                setMembers(group.users);     
                const result = await getQuizzData(Number(id));
                if (result.success && result.data) {
                    setTracks(result.data);
                }
            };
            if (active) {
                loadGroupData();
            }
            return () => {active = false;}
        }, [id])
    );

    const renderItem = ({ item, drag, isActive }: RenderItemParams<QuizTrackData>) => (
        <ScaleDecorator>
            <UnissonCompetitionDragnDrop
                id={item.track.id!}
                label={item.track.title + " proposé par " + item.addedBy.nickname}
                OnPressDragnDrop={drag}
                Activate={isActive}
            />
        </ScaleDecorator>
    );

    const handleRanking = async () => {
        const ranking = tracks.map(d => ({trackId: d.track.id!, userId: d.addedBy.id}));
        await submitChosenRanking(Number(id), ranking);
        router.replace({ pathname: `/(tabs)/tempindex/group/${id}/` as any });
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Text style={styles.title}>Votre classement</Text>

                <DraggableFlatList
                    data={tracks}
                    onDragEnd={({ data }) => {
                        setTracks(data);
                    }}
                    keyExtractor={(item) => item.track.id!.toString()}
                    renderItem={renderItem}
                />
                <UnissonButton
                    label={
                        "Récompenser le peuple!"
                    }
                    colorText="#e76f51"
                    OnValidation={handleRanking}
                />
                
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#25292e",
        flex: 1,
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