import { ApiCall } from "@/api/BackendApi";
import LinkGroups from "@/components/LinkGroups";
import { useEffect, useState, useContext, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useAuthStore } from "@/utils/authStore";
import { useGroupStore } from "@/utils/groupStore";
import IconAction from "@/components/IconAction";
import { useRouter, useFocusEffect } from "expo-router";
import { TimeContext } from "./_layout";


export default function Index() {
  const router = useRouter();
  const { groups, fetchGroups } = useGroupStore();
  const serverTime = useContext(TimeContext);

  const handleCreation = () => {
    router.push({ pathname: '/(tabs)/tempindex/creation' });
  }

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
        keyExtractor={(item) => item.id.toString()}
        renderItem={
          ({ item }) => <LinkGroups id={item.id} label={item.name} ></LinkGroups>
        }
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
