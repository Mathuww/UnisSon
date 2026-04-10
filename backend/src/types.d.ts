import { Request } from "express";


export enum GroupStatus {
    "SUN_WAITING_THEME",
    "SUN_DONE_THEME",
    "WK_WAITING_SUB",
    "WK_DONE_SUB",
    "SAT_WAITING_QUIZ",
    "SAT_DONE_QUIZ"
}

/*
interface UserData {
    id: number;
    email: string;
    nickname: string;
    groups: number[];
}

interface GroupData {
    chosenOne: number | null; 
    members: number[];      
}
    */