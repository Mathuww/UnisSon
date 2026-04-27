import TimeState from "../models/elem/TimeState.model.js";
import { generalPollingTask } from "../tasks/polling.task.js";

export class TimeManager {
    private static offsetHrs = 0;

    static async init() {
        const state = await TimeState.findByPk(1);
        this.offsetHrs = state?.offsetHrs ?? 0;
    }

    static now(): Date {
        return new Date(Date.now() + (this.offsetHrs * 60 * 60 * 1000));
    }

    static async forward(hrs: number) {
        await this.setOffset(this.offsetHrs + hrs);
    }

    static async setOffset(hrs: number) {
        this.offsetHrs = hrs;

        await TimeState.upsert({
            id: 1,
            offsetHrs: hrs
        });

        generalPollingTask();
    }

    static getNextDay(dayNb: number) {
        const d = new Date(TimeManager.now());
        const day = d.getDay();

        const diff = (dayNb - day + 7) % 7 || 7;

        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);

        return d;
    }
}