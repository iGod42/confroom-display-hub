export interface ICalendarApi {
	getAuthorizationUrl(): string,
	
	authCodeReceived(authCode: string): Promise<any>
}