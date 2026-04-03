import {TextInput, View, StyleSheet} from "react-native";
import {useState} from "react";
import Button from "@/components/Button";
import {useAuthStore} from "@/utils/authStore";
import {GoogleSignin} from "@react-native-google-signin/google-signin";

export default function SignInScreen() {
    const [pseudo, setPseudo] = useState('');
    const {GoogleLogIn} = useAuthStore();

    const handleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();

            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.idToken) {
                GoogleLogIn(userInfo.data.idToken);
            } else throw new Error("no IdToken");
        }
        catch (error) {
            console.error(error);
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