export type ActionResult = {
    success: boolean;
    groupID?: number;
    error?: unknown;
}

export enum GroupStatus {
    SUN_WAITING_THEME = "SUN_WAITING_THEME",
    SUN_DONE_THEME = "SUN_DONE_THEME",
    WK_WAITING_SUB = "WK_WAITING_SUB",
    WK_DONE_SUB = "WK_DONE_SUB",
    SAT_WAITING_QUIZ = "SAT_WAITING_QUIZ",
    SAT_DONE_QUIZ = "SAT_DONE_QUIZ",
}

export type AuthProvider = "spotify" | "google";

export type UserData = {
  id: number;
  nickname: string;
  email: string;
  profileDescription?: string;
  profilePicture?: string | null;
  provider: AuthProvider;
  premiumAccount?: boolean;
  providerLoginID: string;
};

export type GroupData = {
  id: number;
  name: string;
  maxUsers: number;
  notifNB?: number;
  groupPicture?: string | null;
  chosenOneUserID: number;
  status: GroupStatus;
  theme: string;
  users?: UserData[];
};

export type TrackData = {
  id: number;
  title: string;
  artist?: string;
  ISRC?: string;
  youtubeLink: string;
};