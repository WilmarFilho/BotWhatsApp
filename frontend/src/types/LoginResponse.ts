import User from "./User";

export default interface LoginResponse {
  token: string;
  user: User;
}