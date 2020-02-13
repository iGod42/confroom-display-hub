export interface ITokenPair {
	access_token: string,
	scope?: string,
	refresh_token: string,
	access_token_expiration: Date,
	apiIdentifier: string,
	belongsToUserId: string,
	belongsToUserDisplayName: string
}