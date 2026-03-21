import Button from "@/components/Button";
import { useEffect, useRef, useState } from "react";
import {StyleSheet, Text, TextInput, View } from "react-native";
import {ApiCall} from "@/api/BackendApi";

const PlaceHolderImage = require('@/assets/images/palm-beach.jpg');

export default function Index() {
  const [textInput, setTextInput] = useState<string>("");
  const [text, setText] = useState<string>("");

  const sendRequest = () => {
    if (textInput)
      ApiCall.postText(textInput)
      .then((response) => {
        setText(response.data);
      })
      .catch((error) => {
        console.error(error);
        setText("Can't join the backend :(");
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Envoie un message à Gustave Eiffel : </Text>
      <TextInput
        style={styles.text}
        placeholder="Gustave, je ..."
        value={textInput}
        onChangeText={setTextInput}
      />
      <Button label="Pigeon" onPress={sendRequest} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
    flex: 1,
    alignItems: "center"
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  text: {
    color: '#fff'
  }
})
