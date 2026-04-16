import {TextInput, View, StyleSheet} from "react-native";
import {useState} from "react";
import UnissonButton from "@/components/UnissonButton";
import {ApiCall} from "@/api/BackendApi";
import {setItemAsync} from "expo-secure-store";
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
            } else {
                throw new Error("Pas de IdToken reçu de Google");
            }
        } catch (error : any) {
            console.error(error.message);
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
            <UnissonButton label={"Se Connecter"} colorText="333" OnValidation={handleSignIn}/>
        </View>
    );
}

const styles = StyleSheet.create({
    textInput: {}
})