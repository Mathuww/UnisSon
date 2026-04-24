import { StyleSheet, Text, View, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import QuizAnswer from "@/components/AnswerQuizz";
import UnissonButton from "@/components/UnissonButton";
import YoutubePlayer from "react-native-youtube-iframe";
import { useEffect, useState } from "react";
import { useGroupStore } from "@/utils/groupStore";
import { QuizzMember } from "@/shared/types";

const link = "Jvv3cC6CamE";
const MEMBERS = [
  { id: 1, nickname: "Pablo",  isCorrect: false },
  { id: 2, nickname: "Gaïa",   isCorrect: true  },
  { id: 3, nickname: "Mathéo", isCorrect: false },
  { id: 4, nickname: "Ezqui-elle",    isCorrect: false },
  { id: 5, nickname: "Métatron",  isCorrect: false },
  { id: 6, nickname: "Chronos", isCorrect: false },
  { id: 7, nickname: "Tom",   isCorrect: false },
  { id: 8, nickname: "Asyna",   isCorrect: false },
];

export default function Quiz() {
  const [touchID, setTouchID] = useState(-1);
  const [playing, setPlaying] = useState(false);
  
  const {id} = useLocalSearchParams();
  const {getGroup} = useGroupStore();
  const[IDQuizzMemberGoodAnswer, setIDQuizzMemberGoodAnswer] = useState<Number>(1);
  const [members, setMembers] = useState<QuizzMember[]>([]);

  useEffect(() => {
    const loadGroupData = async () => {
      const group = await getGroup(Number(id));
      setMembers(
          group?.users?.map((user) => ({
            id: user.id,
            nickname: user.nickname,
            isCorrect: false,
          })) ?? []
        );
    };
    loadGroupData();
  }, [id]);
  

  const router = useRouter();

  const handleOneAnswerTouch = (id : number) => {
    if(touchID < 0) {
      setTouchID(id);
    }
  }

  const handleNext = async () => {
    try {
      console.log("Next Question");
      setTouchID(-1);
    } catch (error) {
      console.error("On n'arrive pas à continuer le quizz. Veuillez réessayer!");
    }
  }
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Qui a suggéré ce morceau ?</Text>

      {/*Chequer pourquoi l'autoplay ne fonctionne pas*/}
      <YoutubePlayer
        height={250}
        play={playing}
        videoId={link}
        forceAndroidAutoplay={true}
        webViewProps={{
            mediaPlaybackRequiresUserAction: false,
        }}
        onReady={() => setPlaying(true)}
      />

      <FlatList
        data={MEMBERS}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ gap: 22 }}
        style={styles.columnAnswer}
        renderItem={({ item }) => (
          <QuizAnswer
            id={item.id}
            label={item.nickname}
            goodAnswer={item.isCorrect}
            touchID={touchID}
            OnPress={() => handleOneAnswerTouch(item.id)}
          />
        )}
      />

      <UnissonButton
        label="Continuer"
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