import { ApiCall } from "@/api/BackendApi";
import LinkGroups from "@/components/LinkGroups";
import { useAuthStore } from "@/utils/authStore";
import { useGroupStore } from "@/utils/groupStore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Pressable, Text } from "react-native";

export default function Index() {
  const {groups} = useGroupStore();
  const {GoogleLogOut} = useAuthStore();

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => <LinkGroups id={item.id} label={item.name} ></LinkGroups>
        }
      />
      <Pressable onPress={GoogleLogOut} style={styles.btn}>
        <Text style={styles.text}>ok</Text>
      </Pressable>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
    flex: 1,
    paddingTop: 20,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  text: {
    color: '#fff'
  },
  btn: {
    backgroundColor: '#f00',
    height:50,
  }
})
