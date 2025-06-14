// shimurile sunt ca niste headere care supracriu obiecte fara sa le extindem
declare global {
    namespace Express {
        export interface User {
            _id: number; // Adaugă userId la tipul SessionData
            username: string; // Adaugă role la tipul SessionData
            role: string;
        }
    }
}
export {};
