import { StyleSheet, Text, View } from "react-native";
import IconAction from "@/components/UnissonIconAction";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/utils/authStore";
import { useSettingsStore } from "@/utils/settingsStore";
import UnissonOnOff from "@/components/UnissonOnOff";
import { useEffect, useState } from "react";

export default function Profile() {
  const [time, setTime] = useState<boolean>(false);
  const {userInfo} = useAuthStore();
  const {timeDebug, setTimeDebug} = useSettingsStore();
  
  const router = useRouter();
  const {appToken, GoogleLogOut} = useAuthStore();

  const handleLogout = async () => {
    if (!appToken) {
      console.error("Not logged in");
      return;
    }
    
    try {
      await GoogleLogOut();
    } catch (error) {
      console.error("On ne peut pas se déconnecter. Veuillez réessayer! \n" + error);
    }
  }

  const handleInvitation = () => {
    router.push({ pathname: '/(tabs)/joins' /*, params: {id: } */});
  }

  return (
      <View style={styles.container}>
          <Text style={styles.pseudo}>@{userInfo?.nickname}</Text>
          <View style={styles.containerIcons}>
            <IconAction 
              img="notification-add"
              OnValidation={handleInvitation}
            />
            <UnissonOnOff value={timeDebug} OnValidation={(value:boolean) => {setTimeDebug(value)}}/>
            <IconAction 
              img="logout"
              OnValidation={handleLogout}
            />
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 100,
  },
    containerIcons: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 40,
  },
    pseudo: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    alignSelf: "flex-start",
    paddingTop: 30,
    paddingHorizontal: 20,
  }
});