import { StyleSheet, Text, View, FlatList } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import QuizAnswer from "@/components/AnswerQuizz";
import UnissonButton from "@/components/UnissonButton";
import YoutubePlayer from "react-native-youtube-iframe";
import { useCallback, useEffect, useState } from "react";
import { useGroupStore } from "@/utils/groupStore";
import { UserData, QuizTrackData, QuizUserAnswerData } from "@/shared/types";


export default function Discover() {
    const [playing, setPlaying] = useState(false);

    const { id } = useLocalSearchParams();
    const { getGroup, getQuizzData } = useGroupStore();
    const [trackIndex, setTrackIndex] = useState<number>(0);
    const [tracks, setTracks] = useState<QuizTrackData[]>([]);

    useFocusEffect(
        useCallback(() => {
            let active = true;
            setTrackIndex(0);
            const loadGroupData = async () => {
                const group = await getGroup(Number(id));  
                if (!group?.users) {
                    return console.error("cannot find user list");
                } 
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

    const router = useRouter();
    const currentTrack = tracks[trackIndex];
                
    const handleNext = async () => {
        try {
            if (!tracks || tracks.length === 0) return;

            const nextIndex = trackIndex + 1;

            if (nextIndex >= tracks.length) {
                router.replace({ pathname: `/(tabs)/tempindex/group/${id}/ranking` as any });
                return;
            }

            setTrackIndex(nextIndex);
        } catch (error) {
            console.error("On n'arrive pas à continuer. Veuillez réessayer!\n", error);
        }
    }
    
    return (
        <View style={styles.container}>

            <Text style={styles.title}>{currentTrack?.addedBy?.nickname && `${currentTrack.addedBy.nickname} a ajouté :`}</Text>

            {currentTrack?.track?.youtubeLink && <YoutubePlayer
                height={250}
                play={playing}
                videoId={currentTrack.track.youtubeLink}
                forceAndroidAutoplay={true}
                webViewProps={{
                    mediaPlaybackRequiresUserAction: false,
                }}
                onReady={() => setPlaying(true)}
            />}

            <UnissonButton
                label={
                    (tracks && ((trackIndex + 1) === tracks.length)) ?
                        "Prédire le classement de l'élu"
                    :
                        "Morceau suivant"
                }
                colorText="#e76f51"
                OnValidation={handleNext}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#25292e",
        paddingTop: 80,
        paddingBottom: 40,
    },
    title: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    columnAnswer: {
        flex: 1,
        paddingHorizontal: 11,
    },
});