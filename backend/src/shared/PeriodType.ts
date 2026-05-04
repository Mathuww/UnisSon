// Différents types de "périodes"
// (qui correspondent aux tâches à effectuer à un moment donné du cycle de vie du groupe)

export enum PeriodType {
    NEW_CYCLE = "NEW_CYCLE", // Nouveau cycle : nouvel élu, calcul de scores, ajout aux playlists ...
    QUIZ_TIME = "QUIZ_TIME", // Mode quiz
    WK_PERIOD = "WK_PERIOD", // Autoriser l'ajout de musique
}