// Différents états possible pour un rgoupe
export enum GroupStatus {
    SUN_WAITING_THEME = "SUN_WAITING_THEME",
    SUN_DONE_THEME = "SUN_DONE_THEME",
    WK_WAITING_SUB = "WK_WAITING_SUB",
    WK_DONE_SUB = "WK_DONE_SUB",
    SAT_WAITING_QUIZ = "SAT_WAITING_QUIZ",
    SAT_DONE_QUIZ = "SAT_DONE_QUIZ",
}

// ordre FIXE pour l'énumération, 
// pour pouvoir déduire un état suivant d'un état actuel
const groupStatusOrder: GroupStatus[] = [
    GroupStatus.SUN_WAITING_THEME,
    GroupStatus.SUN_DONE_THEME,
    GroupStatus.WK_WAITING_SUB,
    GroupStatus.WK_DONE_SUB,
    GroupStatus.SAT_WAITING_QUIZ,
    GroupStatus.SAT_DONE_QUIZ,
];

// Renvoie l'état suivant à partir de l'état actueel
export function getNextGroupStatus(status: GroupStatus): GroupStatus {
    const index = groupStatusOrder.indexOf(status);

    if (index === -1 ) 
        return status;

    return groupStatusOrder[(index + 1) % groupStatusOrder.length];
}