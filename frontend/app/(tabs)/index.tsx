import { ApiCall } from "@/api/BackendApi";
import LinkGroups from "@/components/LinkGroups";
import { useEffect, useState, useContext, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useAuthStore } from "@/utils/authStore";
import { useGroupStore } from "@/utils/groupStore";
import IconAction from "@/components/IconAction";
import { useRouter, useFocusEffect } from "expo-router";
import { TimeContext } from "./_layout";
import { GroupData } from "@/shared/types";

export default function Index() {
  const router = useRouter();
  const { userInfo } = useAuthStore();
  const { groups, fetchGroups } = useGroupStore();
  const serverTime = useContext(TimeContext);

  const handleCreation = () => {
    router.push({ pathname: '/(tabs)/tempindex/creation' });
  }

  const whatNotif = (group : GroupData) => {
    if (!group || !userInfo) return null;
    const userId = userInfo?.id;
    if (group.status && group.chosenOne && group.canUserAdd !== undefined && group.quizDone !== undefined && group.rankDone !== undefined) {
        if (group.status === "SUN_WAITING_THEME" && group.chosenOne.id === userId){
            return "Choix du thème";
        };
        if (group.status === "SAT_WAITING_QUIZ" && !group.quizDone){
            return "Fait le quizz";
        };
        if (group.status === "SAT_WAITING_QUIZ" && group.quizDone && !group.rankDone) {
            return "Fait le classement"
        };
        if (group.status === "WK_WAITING_SUB" && !(group.chosenOne.id === userId) && group.canUserAdd) {
            return "Ajoute ta musique";
        };
    };
    return null;
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active)
          await fetchGroups();
      })();
      return () => {
        active = false;
      }
    }, [serverTime])
  );

  return (
    <View style={styles.container}>
      
      <FlatList
        data={groups}
        keyExtractor={(item) => {console.log("voici le grand item + " + JSON.stringify(item, null, 2)); return item.id!.toString();}}
        renderItem={({item}) => {
          const notifText = whatNotif(item);
          return (<LinkGroups 
            id={item.id} 
            label={item.name}
            hasNotification={(notifText !== null)}
            notifText={notifText}
          ></LinkGroups>);
        }}
      />
      <IconAction
        img="group-add"
        OnValidation={handleCreation}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    paddingTop: 100,
    justifyContent: "space-between",

  },
  text: {
    color: "#fff"
  }
})
