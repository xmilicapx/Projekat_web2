import type { ResultDto } from "../../models/result";

export interface IResultApi {
  addResult(result: ResultDto, token: string): Promise<boolean>;
  getAllResults(token: string): Promise<ResultDto[] | null>;
  getAllUserResultsByUsername(username: string, token: string): Promise<ResultDto[] | null>;
}