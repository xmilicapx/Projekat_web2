import type { LoginDto } from "../../models/login";
import type { UserDto } from "../../models/user";

export interface IUserApi {
  authenticateUser(data: LoginDto): Promise<string | null>;
  registerUser(data: UserDto): Promise<string | null>;
}