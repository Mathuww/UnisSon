import {TextInput, Text, View, StyleSheet} from "react-native";
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


            if (userInfo.data?.serverAuthCode && userInfo.data.idToken) {
                GoogleLogIn(userInfo.data.idToken, userInfo.data.serverAuthCode);
            }
            else if (userInfo.data?.idToken) {
                GoogleLogIn(userInfo.data.idToken, null);
            } else {
                throw new Error("Pas de IdToken reçu de Google");
            }
        } catch (error : any) {
            console.error(error.message);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Connectez-vous avec votre compte Google :</Text>
            <TextInput
                style={styles.textInput}
                placeholder={"Enter Username"}
                value={pseudo}
                onChangeText={setPseudo}
            />
            <UnissonButton label={"Se Connecter"} colorText="#e76f51" OnValidation={handleSignIn}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    backgroundColor: "#25292e",
    flex: 1,
    padding: 10,
    paddingTop: 100,

    },
    text: {
        color: "#fff"
    },
    textInput: {
        color: "#fff"
    },
})