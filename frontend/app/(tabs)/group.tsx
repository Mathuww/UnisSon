import { ApiCall } from "@/api/BackendApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/utils/authStore";
import { ReactNode, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import UnissonButton from "@/components/UnissonButton";
import IconAction from "@/components/IconAction";
import { GroupData, GroupStatus } from "@/shared/types";
import { GroupActionType, useGroupStore } from "@/utils/groupStore";

type Local = {
    id: string;
};

//Pour débugger avant l'arrivée du backend


export default function Group() {

    const { id } = useLocalSearchParams<Local>();

    const router = useRouter();

    const { appToken, userInfo } = useAuthStore();
    const {updateGroupAction, fetchCurrentGroup, getGroup} = useGroupStore();

    const [groupData, setGroupData] = useState<GroupData | null>(null);

    useEffect(async () => {
        if (!appToken) {
            console.log("no app token");
            return;
        }
        console.log("after apptokencheck");

        /*ApiCall.groups.getGroupData(parseInt(id, 10))
            .then(reponse => {
                console.log("received group data");
                console.log(reponse.data);
                setGroupData(reponse.data.data);
            })
            .catch(err => {
                console.error(err);
            });*/
        await fetchCurrentGroup(Number(id));
        setGroupData(await getGroup(Number(id)) || null);
    }, [id]);


    const handleChoosenTheme = async () => {
        try {
            router.push({ pathname: '/(tabs)/choosenTheme'/*, params: { id: .id }*/ });
        } catch (error) {
            console.error("On ne pas accèder à ta page de sélection de ton thème en tant qu'élu!");
        }
    }

    const handleSuggestion = async () => {
        try {
            router.push({ pathname: '/(tabs)/suggestion'/*, params: { id: .id }*/ });
        } catch (error) {
            console.error("On ne pas accèder à la page de proposition de ta dernière suggestion!");
        }
    }

    const handleQuiz = async (isChosen: boolean) => {
        try {
            router.push({ pathname: '/(tabs)/quiz', params: { choosenState: String(isChosen) } });
        } catch (error) {
            console.error("On ne pas accèder à la page de quiz de la semaine!");
        }
    }

    const handleInviteOthersMembers = () => {
        if (groupData) {
            router.push({ pathname: '/(tabs)/invite', params: { id: id, groupName: groupData.name, users: JSON.stringify(groupData?.users ?? []) } });
        } else {
            console.error("groupData is null before invite Page");
        }
    }

    const handleGroupDelete = () => {
        router.push({ pathname: '/' /*, params: {id: } */ });
    }

    const handleNextState = async () => {
        await updateGroupAction({groupId: Number(id), type: GroupActionType.FORCE_CHANGE_STATUS});
        await fetchCurrentGroup(Number(id));
        setGroupData(await getGroup(Number(id)) || null);
    }

    const renderUIForOthers = (): ReactNode => {
        if (!groupData)
            return;
        switch (groupData.status) {
            case "WK_WAITING_SUB":
                return (
                    <>
                        <Text style={styles.subtitle}>
                            Cette semaine, ce ne sera pas vous l'élu. À vous d'épater musicalement  (inserer nom élu) :
                        </Text>
                        <UnissonButton
                            label="À vous d'impressionner votre élu avec votre musique !"
                            colorText="#e76f51"
                            //Pour débugger avant l'arrivée du backend
                            OnValidation={handleSuggestion}
                        />
                    </>
                );
                break;

            case "WK_DONE_SUB":
                return (
                    <Text>
                        Vous avez déjà ajouté un son pour cette période.
                    </Text>
                )
                break;

            case "SAT_WAITING_QUIZ":
                return (<UnissonButton
                    label="Qui connaît mieux l'élu ?"
                    colorText="#e76f51"
                    //Pour débugger avant l'arrivée du backend
                    OnValidation={() => console.log("Sois patient")}
                />)
                break;

            case "SAT_DONE_QUIZ":
                return (
                    <Text>
                        Vous avez déjà répondu au quiz, sorry.
                    </Text>
                )
                break;

            case "SUN_WAITING_THEME":
                return (
                    <Text>
                        L'élu choisit un thème.
                    </Text>
                )
                break;

            case "SUN_DONE_THEME":
                return (
                    <Text>
                        L'élu a choisi un thème.
                    </Text>
                )
                break;

            default:
                return (<></>)
                break;
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
                break;

            case "SUN_DONE_THEME":
                return (
                    <Text>
                        Vous avez déjà choisi un thème.
                    </Text>
                )
                break;

            case "WK_WAITING_SUB":
                return (
                    <Text style={styles.subtitle}>
                        Attendez tranquillement que vos amis choississent bien leurs chansons :)
                    </Text>
                )
                break;

            case "WK_DONE_SUB":
                return (
                    <Text style={styles.subtitle}>
                        Vos amis ont choisi leur chanson, bientôt l'heure du quiz mon salopard :)
                    </Text>
                )
                break;

            case "SAT_WAITING_QUIZ":
                return (<UnissonButton
                    label="Qui connaît mieux mon moi-même ?"
                    colorText="#e76f51"
                    //Pour débugger avant l'arrivée du backend
                    OnValidation={() => handleQuiz(true)}
                />)
                break;

            case "SAT_DONE_QUIZ":
                break;

            default:
                return (<></>)
                break;
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
                            //Pour débugger avant l'arrivée du backend
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
