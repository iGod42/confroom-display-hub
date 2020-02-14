import {ITokenPair, ITokenStorage} from "../../interface"
import {API_IDENTIFIER, Office365TokenResponse} from "./TokenAdapter"
import fetch from "node-fetch"
import {getFormUrlEncodedBody} from "../../../tools/getFormUrlEncodedBody"
import convertFetchedToken from "./TokenAdapter"

type TokenProviderOptions = {
	storage: ITokenStorage,
	client_id: string,
	client_secret: string,
	redirect_uri: string
}

export class TokenProvider {
	private _userId: string
	private _options: TokenProviderOptions
	
	constructor(usertId: string, options: TokenProviderOptions) {
		this._userId = usertId
		this._options = options
	}
	
	async getAccessToken(): Promise<string> {
		const storedToken = await this.getStoredToken()
		if (!storedToken) return ""
		
		// if more than 5 min are left on the access token return it
		if (((new Date()).getTime() - storedToken.access_token_expiration.getTime()) / 60000 >= 5)
			return storedToken.access_token
		
		const refreshedToken = await this.refreshAccessToken(storedToken)
		return refreshedToken.access_token
	}
	
	private async refreshAccessToken(storedToken: ITokenPair): Promise<ITokenPair> {
		const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token",
			{
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded"},
				body: getFormUrlEncodedBody({
					client_id: this._options.client_id,
					scope: "",
					refresh_token: storedToken.refresh_token,
					redirect_uri: this._options.redirect_uri,
					grant_type: "refresh_token",
					client_secret: this._options.client_secret
				})
			}).then(res => res.json())
			.then(res => res as Office365TokenResponse)
		
		const token = convertFetchedToken(response, {
			displayName: storedToken.belongsToUserDisplayName,
			id: storedToken.belongsToUserId
		})
		await this._options.storage.upsertToken(token)
		return token
	}
	
	private async getStoredToken(): Promise<ITokenPair> {
		return this._options.storage.getToken(API_IDENTIFIER, this._userId)
	}
}