import { GroupData } from "@/shared/types.js";
import {useGroupStore} from "@/utils/groupStore";
import { useState } from "react";
import {View, Text} from "react-native";
import { StyleSheet } from "react-native";

type Props = {
    groupId: number;
}

export default function MembersScore({groupId}: Props) {
    const {groups} = useGroupStore();
    let groupData: GroupData | null = null;         
    const found = groups.find(g => g.id === Number(groupId));
    if (found) groupData = found;
    const users = groupData?.users!;
    const [globalTab, setGlobalTab] = useState<boolean>(false);

    type ScoreRowProps = {
        rank: number;
        name: string;
        score: number;
        maxScore: number;
    };

    const ScoreRow = ({ rank, name, score, maxScore }: ScoreRowProps) => { 
        const prop = (maxScore && maxScore > 0) ? score / maxScore : 0;
        return (
            <View style={styles.container}>
                
                <View style={styles.barBackground}>
                    <View
                        style={[
                            styles.barFill,
                            { width: `${prop * 100}%` }
                        ]}
                    />
                </View>

                <View style={styles.content}>
                    <Text style={styles.rank}>{rank}</Text>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={styles.score}>{score}</Text>
                </View>

            </View>
        );
    }

    type ScoreTabProps = {global?: boolean};
    const ScoreTab = ({global}: ScoreTabProps) => {
        let scores;
        if (global)
            scores = [...users].sort((a, b) => (b.globalScore ?? 0) - (a.globalScore ?? 0));
        else
            scores = [...users].sort((a, b) => (b.weeklyScore ?? 0) - (a.weeklyScore ?? 0));

        return scores.map((user, index) => {
            return (
                <ScoreRow 
                    rank={index + 1} name={user.nickname} 
                    score={(global ? user.globalScore : user.weeklyScore) ?? 0} 
                    maxScore={(global ? users[0]!.globalScore : users[0]!.weeklyScore) ?? 1} 
                />
            );
        });
    }

    return (
        <View>
            <View style={styles.tabs}>
                <Text
                    style={[styles.tab, !globalTab && styles.activeTab]}
                    onPress={() => setGlobalTab(false)}
                >
                    Weekly
                </Text>

                <Text
                    style={[styles.tab, globalTab && styles.activeTab]}
                    onPress={() => setGlobalTab(true)}
                >
                    Global
                </Text>
            </View>
            <ScoreTab global={globalTab} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        justifyContent: "center",
        marginVertical: 4,
    },

    barBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#2a2f35",
        borderRadius: 10,
        overflow: "hidden",
    },

    barFill: {
        height: "100%",
        backgroundColor: "#4da6ff",
    },

    content: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        zIndex: 1,
    },

    rank: {
        width: 30,
        color: "#fff",
        fontWeight: "bold",
    },

    name: {
        flex: 1,
        color: "#fff",
    },

    score: {
        width: 50,
        textAlign: "right",
        color: "#fff",
        fontWeight: "600",
    },

    tabs: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        gap: 20,
    },

    tab: {
        color: '#aaa',
        fontSize: 16,
        paddingBottom: 4,
    },

    activeTab: {
        color: '#fff',
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderBottomColor: '#4da6ff',
    },
});