import { ApiCall } from "@/api/BackendApi";
import LinkGroups from "@/components/LinkGroups";
import IconLink from "@/components/IconLink";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {useAuthStore} from "@/utils/authStore";


export default function Index() {
  const [test, setTest] = useState<{id: number, name: string}[]>([]);
  useEffect(() => {
    ApiCall.users.getGroups(1)
    .then(reponse => {
      setTest(reponse.data);
    })
    .catch(err => {
      console.error(err);
    });
  }, []);

  return (
    <View style={styles.container}>
      
      <FlatList
        data={test}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => <LinkGroups id={item.id} label={item.name} ></LinkGroups>
        }
      />
      <IconLink 
        img="add" 
        pageRef="/(tabs)/creation"
        OnValidation={() => {}}
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
