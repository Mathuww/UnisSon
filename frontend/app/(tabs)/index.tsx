import UnissonLinkGroups, { NotifType, PochetteType } from "@/components/UnissonLinkGroups";
import UnissonIconAction from "@/components/UnissonIconAction";
import { useContext, useCallback, useRef } from "react";
import { Dimensions, ScrollView, StyleSheet } from "react-native";
import { useAuthStore } from "@/utils/authStore";
import { useGroupStore } from "@/utils/groupStore";
import { useRouter, useFocusEffect } from "expo-router";
import { TimeContext } from "./_layout";
import { GroupData } from "@/shared/types";
import { useSettingsStore } from "@/utils/settingsStore";

const width = Dimensions.get("window").width;

const pochettePossibility: PochetteType[] = ["brown", "purple", "pink", "orange"];

const getPochette = (i: number): PochetteType => pochettePossibility[i % pochettePossibility.length];

/**
   * Determine quelle notif afficher si il le faut et la renvoie
   * 
   * @param group : un groupe en particulier 
   * @returns {notifText : string}
   */
const getNotif = (group: GroupData, userId?: number): { text: string; type: NotifType } => {
    if (!group || !userId) return { text: "", type: null };
    const { status, chosenOne, canUserAdd, canUserAnswerQuizz } = group as any;

    if (status === "SUN_WAITING_THEME" && chosenOne?.id === userId) {
        return { text: "Choix du thème", type: "theme" };
    }

    if (status === "SAT_WAITING_QUIZ" && canUserAnswerQuizz && chosenOne?.id === userId) {
        return { text: "Fait le quiz", type: "quizz" };
    }

    if (status === "WK_WAITING_SUB" && chosenOne?.id !== userId && canUserAdd) {
        return { text: "Ajoute ta musique", type: "track" };
    }

    return { text: "", type: null };
};

/**
 * Home page
 * 
 * Affiche la liste des groupes l'user et propose la création de groupe 
 * 
 * Affiche dynamiquement si l'user doit effectuer des actions dans certains groupes
 */
export default function Index() {
    const router = useRouter();
    const { userInfo } = useAuthStore();
    const { groups, fetchGroups } = useGroupStore();
    const serverTime = useContext(TimeContext);
    const scrollRef = useRef<ScrollView>(null);
    const { timeDebug } = useSettingsStore();

    /**
     * Renvoie vers la page de création de groupe
     */
    const handleCreation = () => {
        router.push({ pathname: '/(tabs)/tempindex/creation' });
    }

    useFocusEffect(useCallback(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        let active = true;
        (async () => { if (active) await fetchGroups(); })();
        return () => { active = false; };
    }, [serverTime]));

    return (
        <ScrollView
            //Eviter de montrer les parties cachées hors scroll comme les disques
            bounces={false}
            overScrollMode="never"

            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[styles.content, !timeDebug && ({marginTop: 50})]}
            showsVerticalScrollIndicator={false}
        >
            <UnissonIconAction
                img="group-add"
                OnValidation={handleCreation}
            />

            {groups.map((item, i) => {
                const { text, type } = getNotif(item, userInfo?.id);
                return (
                    <UnissonLinkGroups
                        key={item.id}
                        id={item.id}
                        label={item.name}
                        notifText={text}
                        notifType={type}
                        pochette={getPochette(i)}
                        style={[styles.linkGroup, { zIndex: i + 1 }]}
                    />
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({

    scroll: {
        flex: 1,
        backgroundColor: "#25292e",
    },

    content: {
        flexGrow: 1,
        justifyContent: "flex-end",
    },

    iconImg: {
        width: "100%",
        height: "100%",
    },

    linkGroup: {
        width: width * 0.82,
        height: width * 0.36,
        alignSelf: "center",
    },

});