import { ApiCall } from "@/api/BackendApi";
import LinkGroups from "@/components/LinkGroups";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

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
  }
})
