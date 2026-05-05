import UnissonCompetitionDragnDrop from "@/components/UnissonCompetitionDragnDrop";
import { GroupData, QuizTrackData, UserData } from "@/shared/types";
import { useGroupStore } from "@/utils/groupStore";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import UnissonButton from "@/components/UnissonButton";
import { useAuthStore } from "@/utils/authStore";

/**
 * Page de ranking pour tout les utilisateurs 
 * 
 * L'élu fait son ranking et les non élus prédisent les préférences de l'élu 
 */
export default function Ranking() {
    const { id } = useLocalSearchParams();
    const { userInfo } = useAuthStore();
    const { groups, fetchCurrentGroup, getQuizzData, submitChosenRanking, submitPredRanking } = useGroupStore();
    const [tracks, setTracks] = useState<QuizTrackData[]>([]);

    let groupData: GroupData | null = null;         
    const found = groups.find(g => g.id === Number(id));
    if (found) groupData = found;

    /**
     * Détermine si l'utilisateur est l’élu du groupe
     */
    let isChosen = false;
    if (userInfo && groupData) {
        isChosen = groupData.chosenOne?.id === Number(userInfo.id);
    }

    const router = useRouter();

    /**
     * Load des données des tracks a classer 
     */
    useFocusEffect(
        useCallback(() => {
            let active = true;
            const loadGroupData = async () => {
                await fetchCurrentGroup(Number(id));
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

    /**
     * Rendu d'un item draggable représentant un morceau 
     */
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

    /** 
     * Soumission du ranking final et redirection 
     */
    const handleRanking = async () => {
        const ranking = tracks.map(d => ({trackId: d.track.id!, userId: d.addedBy.id}));
        if (isChosen)
            await submitChosenRanking(Number(id), ranking);
        else 
            await submitPredRanking(Number(id), ranking);
        router.replace({ pathname: `/(tabs)/tempindex/group/${id}/` as any });
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Text style={styles.title}>{isChosen ? "Classez vos titres préférés" : "Quels sont les titres préférés de l'élu ?"}</Text>

                <DraggableFlatList style={styles.flatlist}
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
    }, flatlist: {
        height: 400
    }
});