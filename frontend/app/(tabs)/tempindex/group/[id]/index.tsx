import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/utils/authStore";
import { ReactNode, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import UnissonButton from "@/components/UnissonButton";
import IconAction from "@/components/IconAction";
import { GroupData } from "@/shared/types";
import { useGroupStore } from "@/utils/groupStore";

export default function Group() {

    const { id } = useLocalSearchParams();

    const router = useRouter();

    const {appToken, userInfo } = useAuthStore();
    const {fetchCurrentGroup, getGroup, forceChangeStatus} = useGroupStore();

    const [groupData, setGroupData] = useState<GroupData | null>(null);

    useEffect(() => {
        (async () => {
            if (!appToken) {
                console.log("no app token");
                return;
            }
            console.log("after apptokencheck");

            await fetchCurrentGroup(Number(id));
            setGroupData(await getGroup(Number(id)) || null);
        })();
    }, [id, appToken, fetchCurrentGroup, getGroup]);

    const handleChoosenTheme = async () => {
        try {
            router.push(`/(tabs)/tempindex/group/${id}/ajoutTheme`);
        } catch (error) {
            console.error("On ne pas accèder à ta page de sélection de ton thème en tant qu'élu!", error);
        }
    }

    const handleSuggestion = async () => {
        try {
            router.push(`/(tabs)/tempindex/group/${id}/ajoutTrack`);
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

    const handleGroupDelete = () => {
        //router.push({ pathname: '/', params: {id: }  });
    }



    const handleNextState = async () => {
        await forceChangeStatus(Number(id));
        await fetchCurrentGroup(Number(id));
        const data = await getGroup(Number(id)) || null;
        setGroupData(data);
    }

    const renderUIForOthers = (): ReactNode => {
        if (!groupData)
            return;
        switch (groupData.status) {
            case "WK_WAITING_SUB":
                return (
                    <>
                        <Text style={styles.subtitle}>
                            Cette semaine, ce ne sera pas vous l&#39;élu. À vous d&#39;épater musicalement  (inserer nom élu) :
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
                    <Text>
                        Vous avez déjà ajouté un son pour cette période.
                    </Text>
                )

            case "SAT_WAITING_QUIZ":
                return (<UnissonButton
                    label="Qui connaît mieux l'élu ?"
                    colorText="#e76f51"
                    //Pour débugger avant l'arrivée du backend
                    OnValidation={() => console.log("Sois patient")}
                />)

            case "SAT_DONE_QUIZ":
                return (
                    <Text>
                        Vous avez déjà répondu au quiz, sorry.
                    </Text>
                )

            case "SUN_WAITING_THEME":
                return (
                    <Text>
                        L&#39;élu choisit un thème.
                    </Text>
                )

            case "SUN_DONE_THEME":
                return (
                    <Text>
                        L&#39;élu a choisi un thème.
                    </Text>
                )

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
                    <View>
                        <Text style={styles.subtitle}>
                            Toc Toc, Unisson vous informe que vous allez cartonner cette semaine car vous êtes maintenant élu :)
                        </Text>
                        <UnissonButton
                            label="À vous d'être à la hauteur d'un élu d'Unisson"
                            colorText="#e76f51"
                            //Pour débugger avant l'arrivée du backend
                            OnValidation={handleChoosenTheme}
                        />
                    </View>
                )

            case "SUN_DONE_THEME":
                return (
                    <Text>
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
                        Vos amis ont choisi leur chanson, bientôt l&#39;heure du quiz ^^ :)
                    </Text>
                )

            case "SAT_WAITING_QUIZ":
                return (<UnissonButton
                    label="Qui connaît mieux mon moi-même ?"
                    colorText="#e76f51"
                    //Pour débugger avant l'arrivée du backend
                    OnValidation={() => handleQuiz()}
                />)

            case "SAT_DONE_QUIZ":
                return (<Text>sat-done-quiz</Text>);

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
                        renderItem={({ item }) => <Text style={styles.text}>{item.nickname}</Text>
                        }
                    />
                </View>
                <View style={styles.containerButton}>
                    {(userInfo?.id === groupData.chosenOneUserID) ? renderUIForChosen() : renderUIForOthers()}
                    <View style={styles.containerTest}>
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
                            img="delete-forever"
                            OnValidation={handleGroupDelete}
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
        paddingTop: 20,
    },
    containerButton: {
        paddingBottom: 30,
        gap: 72,
    },
    containerIcons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
    },
    containerTest: {
        gap: 20,
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
