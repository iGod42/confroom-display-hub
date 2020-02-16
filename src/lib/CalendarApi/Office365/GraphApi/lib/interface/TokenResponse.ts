export type TokenResponse = {
	token_type: string,
	scope: string,
	expires_in: number,
	ext_expires_in: number,
	access_token: string,
	refresh_token: string
}