import qs from "querystring"
import fetch from "node-fetch"
import {ITokenPair} from "../../interface"
import {getFormUrlEncodedBody} from "../../../tools/getFormUrlEncodedBody"

const scope = ["offline_access", "Calendars.ReadWrite"]

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

type ProfileResponse = {
	displayName: string,
	id: string
}

async function getProfileInfo(authToken: string): Promise<ProfileResponse> {
	return fetch("https://graph.microsoft.com/v1.0/me", {
		headers: {
			"Authorization": `Bearer ${authToken}`
		}
	}).then(res => res.json())
		.then(res => res as ProfileResponse)
}

type GetAuthTokenOptions = {
	client_id: string,
	client_secret: string,
	redirect_uri: string,
	authorization_code: string
}

type TokenResponse = {
	token_type: string,
	scope: string,
	expires_in: number,
	ext_expires_in: number,
	access_token: string,
	refresh_token: string
}

export async function getAuthToken(options: GetAuthTokenOptions): Promise<ITokenPair> {
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
		.then(res => res as TokenResponse)
	const profile = await getProfileInfo(tokenResponse.access_token)
	return convertToken(tokenResponse, profile)
}

function convertToken(tokenResponse: TokenResponse, profileResponse: ProfileResponse): ITokenPair {
	const expires = new Date()
	expires.setSeconds(expires.getSeconds() + tokenResponse.expires_in)
	return {
		access_token: tokenResponse.access_token,
		scope: tokenResponse.scope,
		refresh_token: tokenResponse.refresh_token,
		access_token_expiration: expires,
		apiIdentifier: "office365",
		belongsToUserId: profileResponse.id,
		belongsToUserDisplayName: profileResponse.displayName
	}
}