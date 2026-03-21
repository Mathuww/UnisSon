import {TextInput, View, StyleSheet} from "react-native";
import {useState} from "react";
import Button from "@/components/Button";
import {ApiCall} from "@/api/BackendApi";
import {setItemAsync} from "expo-secure-store";
import {useAuthStore} from "@/utils/authStore";

export default function SignInScreen() {
    const [pseudo, setPseudo] = useState('');
    const {logIn} = useAuthStore();

    const handleSignIn = async () => {
        ApiCall.signIn(pseudo)
            .then((response) => {
                if (response.status === 200) {
                    setItemAsync(response.data.id, pseudo)
                    console.log("heyo");
                    logIn();
                } else {
                    console.error(response.data.error);
                }
        })
            .catch((error) => {
                console.error(error);
            })
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