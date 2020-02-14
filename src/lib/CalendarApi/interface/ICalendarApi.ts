import {IRoom} from "./IRoom"

export interface ICalendarApi {
	getAuthorizationUrl(): string,
	
	authCodeReceived(authCode: string): Promise<any>
	
	getAvailableRooms(): Promise<Array<IRoom>>
	
	getRoom(id: string): Promise<IRoom | undefined>
}