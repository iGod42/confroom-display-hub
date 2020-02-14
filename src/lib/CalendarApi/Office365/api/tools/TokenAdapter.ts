import {ITokenPair} from "../../../interface"

export type Office365TokenResponse = {
	token_type: string,
	scope: string,
	expires_in: number,
	ext_expires_in: number,
	access_token: string,
	refresh_token: string
}

export type Office365ProfileResponse = {
	displayName: string,
	id: string
}

export default function convertFetchedToken(
	tokenResponse: Office365TokenResponse,
	profileResponse: Office365ProfileResponse,
	apiIdentifier: string): ITokenPair {
	const expires = new Date()
	expires.setSeconds(expires.getSeconds() + tokenResponse.expires_in)
	return {
		access_token: tokenResponse.access_token,
		scope: tokenResponse.scope,
		refresh_token: tokenResponse.refresh_token,
		access_token_expiration: expires,
		apiIdentifier: apiIdentifier,
		belongsToUserId: profileResponse.id,
		belongsToUserDisplayName: profileResponse.displayName
	}
}