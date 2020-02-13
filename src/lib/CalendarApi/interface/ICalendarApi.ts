export interface ICalendarApi {
	getAuthorizationUrl(): string,
	
	authTokenReceived(authToken: string): void
}