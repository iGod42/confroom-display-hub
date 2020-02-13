import {ITokenPair} from "./ITokenPair"

export interface ITokenStorage {
	upsertToken(token: ITokenPair): Promise<any>
	
	getToken(apiId: string, belongsToUserId: string): Promise<ITokenPair>
}