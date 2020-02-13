// @ts-ignore
import datastore from "nedb-promise"
import {ITokenStorage, ITokenPair} from "../CalendarApi"

export class NeDBTokenStorage implements ITokenStorage {
	private _db: any
	
	constructor(fileName: string) {
		this._db = datastore({
			filename: fileName,
			autoload: true
		})
	}
	
	async getToken(apiId: string, belongsToUserId: string): Promise<ITokenPair> {
		return this._db.find({
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
	
}