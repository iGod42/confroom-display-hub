import {ITokenPair} from "../../interface"
import {API_IDENTIFIER, Office365TokenResponse} from "./TokenAdapter"
import fetch from "node-fetch"
import {getFormUrlEncodedBody} from "../../../tools/getFormUrlEncodedBody"
import convertFetchedToken from "./TokenAdapter"
import {AuthenticationProvider} from "@microsoft/microsoft-graph-client"
import {IOffice365Options} from "./IOffice365Options"

export class TokenProvider implements AuthenticationProvider {
	private readonly _userId: string
	private readonly _options: IOffice365Options
	
	constructor(userId: string, options: IOffice365Options) {
		this._userId = userId
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
					client_id: this._options.clientId,
					scope: "",
					refresh_token: storedToken.refresh_token,
					redirect_uri: this._options.redirectUrl,
					grant_type: "refresh_token",
					client_secret: this._options.clientSecret
				})
			}).then(res => res.json())
			.then(res => res as Office365TokenResponse)
		
		const token = convertFetchedToken(response, {
			displayName: storedToken.belongsToUserDisplayName,
			id: storedToken.belongsToUserId
		})
		await this._options.tokenStorage.upsertToken(token)
		return token
	}
	
	private async getStoredToken(): Promise<ITokenPair> {
		return this._options.tokenStorage.getToken(API_IDENTIFIER, this._userId)
	}
}