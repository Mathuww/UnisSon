import { ApiCall } from "@/api/BackendApi";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";


type LocalParams = {
  id: string;
};

export default function Groups() {
  const {id} = useLocalSearchParams<LocalParams>();

  const [test, setTest] = useState<{id: number, nickname: string}[]>([]);
  useEffect(() => {
    ApiCall.groups.getGroupData(1, parseInt(id, 10))
    .then(reponse => {
      setTest(reponse.data);
    })
    .catch(err => {
      console.error(err);
    });
  }, [id]);



  return (
    <View style={styles.container}>
      <FlatList
              data={test}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({item}) => <Text style={styles.text}>{item.nickname}</Text>
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
