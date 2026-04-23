import { StyleSheet, Text, View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import QuizAnswer from "@/components/AnswerQuizz";
import UnissonButton from "@/components/UnissonButton";
import YoutubePlayer from "react-native-youtube-iframe";
import { useState } from "react";

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

      <YoutubePlayer
        height={250}
        play={true}
        videoId={link}
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