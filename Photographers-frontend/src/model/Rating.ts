import User from "./User";

export default interface Rating {
  id: number;

  user: User;

  rating: number;
}
