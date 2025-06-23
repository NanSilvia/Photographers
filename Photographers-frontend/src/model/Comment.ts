import User from "./User";

export default interface Comment {
  id: number;
  content: string;
  user: User;
  createdAt: string; // ISO date string
}
