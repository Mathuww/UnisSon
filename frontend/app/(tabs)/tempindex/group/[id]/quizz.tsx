import { StyleSheet, Text, View, FlatList } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import QuizAnswer from "@/components/AnswerQuizz";
import UnissonButton from "@/components/UnissonButton";
import YoutubePlayer from "react-native-youtube-iframe";
import { useCallback, useEffect, useState } from "react";
import { useGroupStore } from "@/utils/groupStore";
import { UserData, QuizTrackData, QuizUserAnswerData } from "@/shared/types";
import { useAuthStore } from "@/utils/authStore";


export default function Quiz() {
    const [touchID, setTouchID] = useState(-1);
    const [playing, setPlaying] = useState(false);

    const { id } = useLocalSearchParams();
    const {userInfo} = useAuthStore();
    const { getGroup, getQuizzData, submitChosenQuizzAnswers } = useGroupStore();
    const [members, setMembers] = useState<UserData[]>([]);
    const [trackIndex, setTrackIndex] = useState<number>(0);
    const [tracks, setTracks] = useState<QuizTrackData[]>([]);
    const [userAnswers, setUserAnswers] = useState<QuizUserAnswerData>({});

    useFocusEffect(
        useCallback(() => {
            let active = true;
            setTrackIndex(0);
            const loadGroupData = async () => {
                const group = await getGroup(Number(id));  
                if (!group?.users) {
                    return console.error("cannot find user list");
                }         
                setMembers(group.users.filter(u => u.id != userInfo?.id && u.id != group.chosenOne?.id));     
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
    const IDQuizzMemberGoodAnswer = currentTrack?.addedBy?.id;

    
    const handleOneAnswerTouch = (userId: number) => {
        if (touchID < 0) {
            setTouchID(userId);
            const trackId : number = currentTrack.track.id!;
            setUserAnswers(prev => ({
                ...prev,
                [trackId]: userId
            }));
        }
    }  
                
    const handleNext = async () => {
        try {
            if (!tracks || tracks.length === 0) return;

            const nextIndex = trackIndex + 1;

            setTouchID(-1);
            if (nextIndex >= tracks.length) {
                await submitChosenQuizzAnswers(Number(id), userAnswers);
                router.replace({ pathname: `/(tabs)/tempindex/group/${id}/ranking` as any });
                return;
            }

            setTrackIndex(nextIndex);
        } catch (error) {
            console.error("On n'arrive pas de continuer le quizz. Veuillez réessayer!\n", error);
        }
    }
    
    return (
        <View style={styles.container}>

            <Text style={styles.title}>Qui a suggéré ce morceau ?</Text>

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

            <FlatList
                data={members}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ gap: 22 }}
                style={styles.columnAnswer}
                renderItem={({ item }) => (
                    <QuizAnswer
                        id={item.id}
                        label={item.nickname}
                        goodAnswer={item.id === IDQuizzMemberGoodAnswer}
                        touchID={touchID}
                        OnPress={() => handleOneAnswerTouch(item.id)}
                    />
                )}
            />

            <UnissonButton
                label={
                    (tracks && ((trackIndex + 1) === tracks.length)) ?
                        "Terminer votre quizz"
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