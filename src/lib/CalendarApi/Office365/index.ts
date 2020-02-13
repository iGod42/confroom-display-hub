import {ICalendarApi, ITokenStorage} from "../interface"
import {getAuthToken, getAuthUrl} from "./api/authorization"

export interface IOffice365Options {
	clientId: string,
	clientSecret: string,
	redirectUrl: string,
	tokenStorage: ITokenStorage
}

export class Office365 implements ICalendarApi {
	private readonly _clientId: string
	private readonly _clientSecret: string
	private readonly _redirectUrl: string
	private readonly _tokenStorage: ITokenStorage
	
	constructor(options: IOffice365Options) {
		this._clientId = options.clientId
		this._clientSecret = options.clientSecret
		this._redirectUrl = options.redirectUrl
		this._tokenStorage = options.tokenStorage
	}
	
	async authCodeReceived(authorizationCode: string): Promise<any> {
		const token = await getAuthToken({
			client_secret: this._clientSecret,
			client_id: this._clientId,
			authorization_code: authorizationCode,
			redirect_uri: this._redirectUrl
		})
		return this._tokenStorage.upsertToken(token)
	}
	
	getAuthorizationUrl(): string {
		return getAuthUrl(this._clientId, this._redirectUrl)
	}
}