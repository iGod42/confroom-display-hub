import {ITokenPair} from "../../../../interface"
import {API_IDENTIFIER} from "../../../index"
import {ProfileResponse, TokenResponse} from "../interface"

export default function convertFetchedToken(
	tokenResponse: TokenResponse,
	profileResponse: ProfileResponse): ITokenPair {
	const expires = new Date()
	expires.setSeconds(expires.getSeconds() + tokenResponse.expires_in)
	return {
		access_token: tokenResponse.access_token,
		scope: tokenResponse.scope,
		refresh_token: tokenResponse.refresh_token,
		access_token_expiration: expires,
		apiIdentifier: API_IDENTIFIER,
		belongsToUserId: profileResponse.id,
		belongsToUserDisplayName: profileResponse.displayName
	}
}