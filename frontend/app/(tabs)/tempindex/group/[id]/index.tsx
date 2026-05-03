import { useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/utils/authStore";
import { ReactNode, useEffect, useState, useCallback, useContext } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import UnissonButton from "@/components/UnissonButton";
import IconAction from "@/components/IconAction";
import { GroupData, UserData } from "@/shared/types";
import { useGroupStore } from "@/utils/groupStore";
import { useFocusEffect } from "expo-router";
import { TimeContext } from "@/app/(tabs)/_layout";
import {useSocketStore} from "@/utils/socketStore";
import {useGroupSocket} from "@/hooks/useGroupSocket";

export default function Group() {

    const params = useLocalSearchParams();
    const id = params.id;
    const serverTime = useContext(TimeContext);

    const router = useRouter();

    const { appToken, userInfo } = useAuthStore();
    const { fetchCurrentGroup, leaveGroup, groups } = useGroupStore();
    let groupData: GroupData | null = null;         
    const found = groups.find(g => g.id === Number(id));
    if (found) groupData = found;

    let chosenOne: UserData | null = null;
    if (groupData && groupData.chosenOne) {
        chosenOne = groupData.chosenOne;
    }

    let isChosen = false;
    if (userInfo && chosenOne) {
        isChosen = chosenOne.id === Number(userInfo.id);
    }

    useGroupSocket(Number(id));

    const updateGroup = async () => {
        if (!appToken) {
            console.log("no app token");
            return;
        }
        console.log("fetching current group data...")
        await fetchCurrentGroup(Number(id));
    }

    useFocusEffect(
        useCallback(() => {
            let active = true;
            (async () => {
                if (active)
                    await updateGroup();
            })();
            return () => {
                active = false;
            }
        }, [serverTime])
    );

    useFocusEffect(
        useCallback(() => {
            let active = true;
            console.log("updating page");
            (async () => {
                console.log("welcome to group page " + id);
                if (active)
                    await updateGroup();
            })();
            return () => {
                active = false;
            }
        }, [id, appToken, fetchCurrentGroup, serverTime])
    );

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
            if (groupData) {
                router.push(`/(tabs)/tempindex/group/${id}/quizz`);
            } else {
                console.error("groupData is null before quizz Page");
            }
        } catch (error) {
            console.error("On ne pas accèder à la page de quiz de la semaine!", error);
        }
    }

    const handleRank = async () => {
        try {
            if (groupData) {
                router.push(`/(tabs)/tempindex/group/${id}/ranking`);
            } else {
                console.error("groupData is null before ranking Page");
            }
        } catch (error) {
            console.error("On ne pas accèder à la page de ranking de la semaine!", error);
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
                        L'élu {chosenOne?.nickname} a choisi un thème{groupData.theme && `, et c'est : ${groupData.theme}`}.
                    </Text>
                );

            case "WK_WAITING_SUB":
                if (groupData.canUserAdd) {
                    return (
                        <>
                            <Text style={styles.subtitle}>
                                Cette semaine, ce ne sera pas vous l'élu. À vous d'épater musicalement {chosenOne?.nickname}{groupData.theme && `, avec son thème ${groupData.theme}`} :
                            </Text>
                            <UnissonButton
                                label="À vous d'impressionner votre élu avec votre musique !"
                                colorText="#e76f51"
                                OnValidation={handleSuggestion}
                            />
                        </>
                    );
                } else {
                    console.log(JSON.stringify(groupData, null, 2));
                    return (
                        <>
                            <Text style={styles.subtitle}>
                                Cette semaine, ce ne sera pas vous l'élu. Vous avez déjà ajouté une musique pour cette période.
                            </Text>
                        </>
                    );
                }


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
                        OnValidation={() => console.log("Sois patient pour la v1")}
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
                if (groupData.quizDone && groupData.rankDone) {
                    return (
                        <Text style={styles.subtitle}>
                            Vous avez déjà rempli votre quiz pour cette semaine.
                        </Text>
                    )
                } else if (groupData.quizDone) {
                    <UnissonButton
                        label="Faire mon classement"
                        colorText="#e76f51"
                        OnValidation={() => handleRank()}
                    />
                }
                return (
                    <UnissonButton
                        label="Qui connaît mieux mon moi-même ?"
                        colorText="#e76f51"
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
                <View style={styles.container}>
                    <Text style={styles.text}>{
                        `Votre score de la semaine : ${groupData.weeklyScore ?? "ERREUR"}
                        Votre score total : ${groupData.globalScore ?? "ERREUR"}`
                    }</Text>
                </View>
                <View style={styles.containerButton}>
                    <View style={styles.containerText}>
                        {isChosen ? renderUIForChosen() : renderUIForOthers()}
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
        padding: 10,
        paddingTop: 100,
    },
    containerButton: {
        paddingBottom: 30,
        gap: 30,
    },
    containerText: {
        gap: 11,
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
