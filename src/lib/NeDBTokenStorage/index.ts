// @ts-ignore
import datastore from "nedb-promise"
import {ITokenStorage, ITokenPair, IRoom} from "../CalendarApi"

export class NeDBTokenStorage implements ITokenStorage {
	private _db: any
	
	constructor(fileName: string) {
		this._db = datastore({
			filename: fileName,
			autoload: true
		})
	}
	
	async getToken(apiId: string, belongsToUserId: string): Promise<ITokenPair> {
		return this._db.findOne({
			apiIdentifier: apiId,
			belongsToUserId: belongsToUserId
		})
	}
	
	async upsertToken(token: ITokenPair): Promise<any> {
		return this._db.update({
			apiIdentifier: token.apiIdentifier,
			belongsToUserId: token.belongsToUserId
		}, token, {upsert: true})
	}
	
	async getListOfStoredRooms(apiId: string): Promise<Array<IRoom>> {
		const data: Array<ITokenPair> = await this._db.find({
			apiIdentifier: apiId
		})
		
		return data.map(entry => ({displayName: entry.belongsToUserDisplayName, id: entry.belongsToUserId}))
	}
}