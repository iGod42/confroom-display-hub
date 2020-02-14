import qs from "querystring"
import fetch from "node-fetch"
import {ITokenPair, ITokenStorage} from "../../interface"
import {getFormUrlEncodedBody} from "../../../tools/getFormUrlEncodedBody"
import convertFetchedToken, {Office365ProfileResponse, Office365TokenResponse} from "./TokenAdapter"

const scope = ["offline_access", "User.Read", "Calendars.ReadWrite"]

export function getAuthUrl(client_Id: string, redirect_uri: string) {
	return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${
		qs.stringify({
			client_Id,
			response_type: "code",
			redirect_uri,
			scope: scope.join(" ")
		})
	}`
}

type StoreAuthTokenOptions = {
	client_id: string,
	client_secret: string,
	redirect_uri: string,
	authorization_code: string
}

export async function storeTokenFromAuthCode(options: StoreAuthTokenOptions, tokenStorage: ITokenStorage): Promise<ITokenPair> {
	const tokenResponse = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
		method: "POST"
		,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: getFormUrlEncodedBody({
			client_id: options.client_id,
			grant_type: "authorization_code",
			scope: scope.join(" "),
			code: options.authorization_code,
			redirect_uri: options.redirect_uri,
			client_secret: options.client_secret
		})
	}).then(res => res.json())
		.then(res => res as Office365TokenResponse)
	const profile = await getProfileInfo(tokenResponse.access_token)
	const token = convertFetchedToken(tokenResponse, profile)
	await tokenStorage.upsertToken(token)
	return token
}

export async function getProfileInfo(authToken: string): Promise<Office365ProfileResponse> {
	return fetch("https://graph.microsoft.com/v1.0/me", {
		headers: {
			"Authorization": `Bearer ${authToken}`
		}
	}).then(res => res.json())
		.then(res => res as Office365ProfileResponse)
}