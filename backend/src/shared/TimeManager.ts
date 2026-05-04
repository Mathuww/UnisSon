import TimeState from "../models/elem/TimeState.model.js";
import { generalPollingTask } from "../tasks/polling.task.js";
import { getIO } from "./socket.js";

/**
 * Classe qui gère le temps injecté dans les tâches logiques,
 * afin de permettre le debug et le test des fonctionnalités de l'application
 * qui sont time-dependent et étalées sur 7 jours
 */
export class TimeManager {
    private static offsetHrs = 0;

    // Récupère le dernier offset de temps serveur dans la DB
    static async init() {
        const state = await TimeState.findByPk(1);
        this.offsetHrs = state?.offsetHrs ?? 0;
    }

    // Heure utilisée dans les tâches : heure réelle + offset
    static now(): Date {
        return new Date(Date.now() + (this.offsetHrs * 60 * 60 * 1000));
    }

    // Avancer l'offset
    static async forward(hrs: number) {
        await this.setOffset(this.offsetHrs + hrs);
    }

    static async setOffset(hrs: number) {
        this.offsetHrs = hrs;

        await TimeState.upsert({
            id: 1,
            offsetHrs: hrs
        });

        getIO().emit(`simulation:timeChange`);

        await generalPollingTask();
    }

    // Utile pour le calcul des périodes
    static getNextDay(dayNb: number) {
        const d = new Date(TimeManager.now());
        const day = d.getDay();

        const diff = (dayNb - day + 7) % 7 || 7;

        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);

        return d;
    }
}