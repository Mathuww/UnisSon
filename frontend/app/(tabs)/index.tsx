import { ApiCall } from "@/api/BackendApi";
import LinkGroups from "@/components/LinkGroups";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {useAuthStore} from "@/utils/authStore";
import { useGroupStore } from "@/utils/groupStore";
import IconAction from "@/components/IconAction";
import { useRouter } from "expo-router";


export default function Index() {
  const router = useRouter();
  const {groups} = useGroupStore();

  const handleCreation = () => {
    console.log("log test");
    router.push({ pathname: '/(tabs)/creation' /*, params: {id: } */});
  }

  return (
    <View style={styles.container}>
      
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => <LinkGroups id={item.id} label={item.name} ></LinkGroups>
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
    paddingTop: 20,
    justifyContent : "space-between",

  },
  text: {
    color: "#fff"
  }
})
