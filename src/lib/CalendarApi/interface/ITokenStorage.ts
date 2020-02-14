import {ITokenPair} from "./ITokenPair"
import {IRoom} from "./IRoom"

export interface ITokenStorage {
	upsertToken(token: ITokenPair): Promise<any>
	
	getToken(apiId: string, belongsToUserId: string): Promise<ITokenPair>
	
	getListOfStoredRooms(apiId: string): Promise<Array<IRoom>>
}