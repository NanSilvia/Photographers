// shimurile sunt ca niste headere care supracriu obiecte fara sa le extindem
declare module 'express-session' {
    export interface SessionData {
        userId: number; // Adaugă userId la tipul SessionData
        role: string; // Adaugă role la tipul SessionData
    }
}
export {};
