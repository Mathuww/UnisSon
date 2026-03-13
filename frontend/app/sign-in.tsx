import {TextInput, View, StyleSheet} from "react-native";
import {useState} from "react";
import Button from "@/components/Button";
import {ApiCall} from "@/api/BackendApi";

export default function SignInScreen() {
    const [pseudo, setPseudo] = useState('');

    const handleSignIn = async () => {
        try {
            const response = await ApiCall.signIn(pseudo)
            if (response.status === 200) {

            } else {
                console.error(response.statusText);
            }
        } catch {
            console.error("Could not access db")
        }
    }

    return (
        <View>
            <TextInput
                style={styles.textInput}
                placeholder={"Enter Username"}
                value={pseudo}
                onChangeText={setPseudo}
            />
            <Button label={"Se Connecter"} onPress={handleSignIn}/>
        </View>
    );
}

const styles = StyleSheet.create({
    textInput: {}
})