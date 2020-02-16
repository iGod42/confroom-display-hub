import {ICalendarApi} from "../interface"
import {storeTokenFromAuthCode, getAuthUrl} from "./GraphApi/lib/authorization/initialAuthorization"
import ApiPool from "./ApiPool"
import {GraphApiOptions} from "./GraphApi"
import {IRoom, IEvent} from "../interface"

export const API_IDENTIFIER = "office365"

export class Office365 implements ICalendarApi {
	private readonly _options: GraphApiOptions
	private readonly _apiPool: ApiPool
	
	constructor(options: GraphApiOptions) {
		this._options = options
		this._apiPool = new ApiPool(this._options)
	}
	
	async authCodeReceived(authorizationCode: string): Promise<any> {
		return await storeTokenFromAuthCode({
			client_secret: this._options.clientSecret,
			client_id: this._options.clientId,
			authorization_code: authorizationCode,
			redirect_uri: this._options.redirectUrl
		}, this._options.tokenStorage)
	}
	
	getAuthorizationUrl(): string {
		return getAuthUrl(this._options.clientId, this._options.redirectUrl)
	}
	
	async getAvailableRooms(): Promise<Array<IRoom>> {
		return this._options.tokenStorage.getListOfStoredRooms(API_IDENTIFIER)
	}
	
	async getRoom(id: string): Promise<IRoom | undefined> {
		const storedToken = await this._options.tokenStorage.getToken(API_IDENTIFIER, id)
		return !storedToken ? undefined : {
			id: storedToken.belongsToUserId,
			displayName: storedToken.belongsToUserDisplayName
		}
	}
	
	async getEvents(roomId: string, from: Date, to: Date): Promise<Array<IEvent>> {
		return this._apiPool.getApi(roomId).getEvents(from, to)
	}
	
	async book(roomId: string, from: Date, to: Date, subject: string): Promise<IEvent> {
		return this._apiPool.getApi(roomId).book(from, to, subject)
	}
}