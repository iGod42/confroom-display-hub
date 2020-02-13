import {ICalendarApi} from "../interface"
import {getAuthUrl} from "./api/Commons"

export class Office365 implements ICalendarApi {
	private readonly _clientId: string
	private readonly _clientSecret: string
	private readonly _redirectUrl: string
	
	constructor(clientId: string, clientSecret: string, redirectUrl: string) {
		this._clientId = clientId
		this._clientSecret = clientSecret
		this._redirectUrl = redirectUrl
	}
	
	authTokenReceived(authToken: string): void {
		console.log(authToken)
	}
	
	getAuthorizationUrl(): string {
		return getAuthUrl(this._clientId, this._redirectUrl)
	}
}