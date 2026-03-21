import { Request } from "express";

export type User = {
    id: number
};

export enum GroupStatus {
    "WAITING_FOR_THEME",
    "THEME_SET",
    "SUBMISSION",
    "QUIZ_TIME"
};

interface GroupData {
    chosenOne: number | null; 
    members: number[];      
}