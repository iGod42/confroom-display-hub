import {ICalendarApi} from "../interface"
import {storeTokenFromAuthCode, getAuthUrl} from "./api/initialAuthorization"
import {ClientPool} from "./api/ClientPool"
import {IOffice365Options} from "./api/IOffice365Options"
import {IRoom, IEvent} from "../interface"
import CalendarApi from "./api/CalendarApi"

export const API_IDENTIFIER = "office365"

export class Office365 implements ICalendarApi {
	private readonly _options: IOffice365Options
	private readonly _clientPool: ClientPool
	
	constructor(options: IOffice365Options) {
		this._options = options
		this._clientPool = new ClientPool(this._options)
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
		if (!storedToken) return
		
		return {
			id: storedToken.belongsToUserId,
			displayName: storedToken.belongsToUserDisplayName
		}
	}
	
	async getEvents(roomId: string, from: Date, to: Date): Promise<Array<IEvent>> {
		return CalendarApi.getEvents(this._clientPool.getClient(roomId), from, to)
	}
}