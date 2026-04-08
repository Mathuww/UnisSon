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
            console.log("Vérification Play Services...");
            await GoogleSignin.hasPlayServices();

            console.log("Lancement de la modale Google...");
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.idToken) {
                console.log("Token reçu, envoi au backend...");
                GoogleLogIn(userInfo.data.idToken);
            } else {
                throw new Error("Pas de IdToken reçu de Google");
            }
        } catch (error : any) {
            console.error("Erreur détaillée Google Sign-In :", error.message());
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