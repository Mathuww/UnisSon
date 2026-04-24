import { useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/utils/authStore";
import { ReactNode, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import UnissonButton from "@/components/UnissonButton";
import IconAction from "@/components/IconAction";
import { GroupData, UserData } from "@/shared/types";
import { useGroupStore } from "@/utils/groupStore";

export default function Group() {

    const params = useLocalSearchParams();
    const id = params.id;

    const router = useRouter();

    const {appToken, userInfo } = useAuthStore();
    const {fetchCurrentGroup, leaveGroup, getGroup, forceChangeStatus} = useGroupStore();

    const [groupData, setGroupData] = useState<GroupData | null>(null);
    
    const [chosenOne, setChosenOne] = useState<UserData | null>(null);
    const [isChosen, setIsChosen] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (userInfo && chosenOne) {
                setIsChosen(chosenOne.id === Number(userInfo.id));
            }
        })();
    }, [userInfo, chosenOne]);

    useEffect(() => {
        (async () => {
            
            console.log("welcome to group page " + id);

            if (!appToken) {
                console.log("no app token");
                return;
            }
            console.log("fetching current group data...")
            await fetchCurrentGroup(Number(id));
            const data = await getGroup(Number(id));
            if (data) {
                if (data?.chosenOne && data.chosenOne.id) {
                    setChosenOne(data.chosenOne);
                }
                setGroupData(data);
            }
        })();
    }, [id, appToken, fetchCurrentGroup, getGroup]);

    const handleChoosenTheme = async () => {
        try {
            router.push(`/(tabs)/tempindex/group/${id}/addTheme`);
        } catch (error) {
            console.error("On ne pas accèder à ta page de sélection de ton thème en tant qu'élu!", error);
        }
    }

    const handleSuggestion = async () => {
        try {
            router.push(`/(tabs)/tempindex/group/${id}/addTrack`);
        } catch (error) {
            console.error("On ne pas accèder à la page de proposition de ta dernière suggestion!", error);
        }
    }

    const handleQuiz = async () => {
        try {
            if(groupData) {
                router.push(`/(tabs)/tempindex/group/${id}/quizz`);
            } else {
                console.error("groupData is null before quizz Page");
            }
        } catch (error) {
            console.error("On ne pas accèder à la page de quiz de la semaine!", error);
        }
    }

    const handleInviteOthersMembers = () => {
        if (groupData) {
            router.push(`/(tabs)/tempindex/group/${id}/invitation`);
        } else {
            console.error("groupData is null before invite Page");
        }
    }

    const handleLeaveGroup = async () => {
        try {
            await leaveGroup(Number(id));
            router.push("/");
        } catch (error) {
            console.error("you can't leave your group");
        }
    }



    const handleNextState = async () => {
        await forceChangeStatus(Number(id));
        await fetchCurrentGroup(Number(id));
        const data = await getGroup(Number(id)) || null;
        if (data?.chosenOne) {
            setChosenOne(data.chosenOne);
        }
        //Ne jamais faire un set avant avoir changé tout les résultats (décallage d'état)
        setGroupData(data);
    }

    const renderUIForOthers = (): ReactNode => {
        if (!groupData)
            return;
        switch (groupData.status) {
            case "SUN_WAITING_THEME":
                return (
                    <Text style={styles.subtitle}>
                        L'élu {chosenOne?.nickname} choisit un thème.
                    </Text>
                )

            case "SUN_DONE_THEME":
                return (
                    <Text style={styles.subtitle}>
                        L'élu {chosenOne?.nickname} a choisi un thème.
                    </Text>
                );

            case "WK_WAITING_SUB":
                return (
                    <>
                        <Text style={styles.subtitle}>
                            Cette semaine, ce ne sera pas vous l'élu. À vous d'épater musicalement {chosenOne?.nickname} :
                        </Text>
                        <UnissonButton
                            label="À vous d'impressionner votre élu avec votre musique !"
                            colorText="#e76f51"
                            //Pour débugger avant l'arrivée du backend
                            OnValidation={handleSuggestion}
                        />
                    </>
                );

            case "WK_DONE_SUB":
                return (
                    <Text style={styles.subtitle}>
                        Vous avez déjà ajouté un son pour cette période.
                    </Text>
                );

            case "SAT_WAITING_QUIZ":
                return (
                    <UnissonButton
                    label={`Qui connaît mieux l'élu ${chosenOne?.nickname}?`}
                    colorText="#e76f51"
                    //Pour débugger avant l'arrivée du backend
                    OnValidation={() => console.log("Sois patient")}
                    />
                );

            case "SAT_DONE_QUIZ":
                return (
                    <Text style={styles.subtitle}>
                        Vous avez déjà répondu au quiz, sorry.
                    </Text>
                );

            default:
                return (<></>)
        }
    }

    const renderUIForChosen = (): ReactNode => {
        if (!groupData)
            return;
        switch (groupData.status) {
            case "SUN_WAITING_THEME":
                return (
                    <>
                        <Text style={styles.subtitle}>
                            Toc Toc, Unisson vous informe que vous allez cartonner cette semaine car vous êtes maintenant élu :)
                        </Text>
                        <UnissonButton
                            label="À vous d'être à la hauteur d'un élu d'Unisson"
                            colorText="#FFEE88"
                            //Pour débugger avant l'arrivée du backend
                            OnValidation={handleChoosenTheme}
                        />
                    </>
                )

            case "SUN_DONE_THEME":
                return (
                    <Text style={styles.subtitle}>
                        Vous avez déjà choisi un thème.
                    </Text>
                )

            case "WK_WAITING_SUB":
                return (
                    <Text style={styles.subtitle}>
                        Attendez tranquillement que vos amis choisissent bien leurs chansons :)
                    </Text>
                )

            case "WK_DONE_SUB":
                return (
                    <Text style={styles.subtitle}>
                        Vos amis ont choisi leur chanson, bientôt l'heure du quiz ^^ :)
                    </Text>
                )

            case "SAT_WAITING_QUIZ":
                return (
                    <UnissonButton
                        label="Qui connaît mieux mon moi-même ?"
                        colorText="#e76f51"
                        //Pour débugger avant l'arrivée du backend
                        OnValidation={() => handleQuiz()}
                    />
                )

            case "SAT_DONE_QUIZ":
                return (
                <Text style={styles.subtitle}>
                    Nostalgique, et uii, je sais que le quizz était bien. C'est moi qui l'a fait =)
                </Text>
            );

            default:
                return (<></>);
        }
    }


    //Refaire proprement l'interface de chargement
    if (!groupData) {
        return (
            <Text>Chargement du groupe...</Text>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>
                    {groupData.name}
                </Text>
                <View style={styles.container}>
                    <FlatList
                        data={groupData.users}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => 
                            <Text style={styles.text}>{item.nickname}</Text>
                        }
                    />
                </View>
                <View style={styles.containerButton}>
                    <View style={styles.containerText}>
                        {isChosen ? renderUIForChosen() : renderUIForOthers()}
                        <UnissonButton
                            label="Passer à l'état suivant"
                            colorText="#2a9d8f"
                            OnValidation={handleNextState}
                        />
                    </View>
                    <View style={styles.containerIcons}>
                        <IconAction
                            img="person-add-alt-1"
                            OnValidation={handleInviteOthersMembers}
                        />
                        <IconAction
                            img="group-off"
                            OnValidation={handleLeaveGroup}
                        />
                    </View>
                </View>
            </View>
        </>
    );
}



const styles = StyleSheet.create({
    container: {
        backgroundColor: "#25292e",
        flex: 1,
        padding:10,
        paddingTop: 100,
    },
    containerButton: {
        paddingBottom: 30,
        gap: 30,
    },
    containerText: {
        gap:11,
    },
    containerIcons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
    },
    title: {
        color: "#fff",
        alignSelf: "center",
        fontSize: 32,
        fontWeight: "bold",
    },
    subtitle: {
        padding: 5,
        color: "#ffe",
        fontSize: 12,
        paddingBottom: 5,
    },
    text: {
        color: "#fff"
    }
})
