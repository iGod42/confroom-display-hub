import {IRoom} from "./IRoom"
import {IEvent} from "./IEvent"

export interface ICalendarApi {
	getAuthorizationUrl(): string,
	
	authCodeReceived(authCode: string): Promise<any>
	
	getAvailableRooms(): Promise<Array<IRoom>>
	
	getRoom(id: string): Promise<IRoom | undefined>
	
	getEvents(roomId: string, from: Date, to: Date): Promise<Array<IEvent>>
	
	book(roomId: string, from: Date, to: Date, subject: string): Promise<IEvent | undefined>
}