import {IRoom} from "./IRoom"
import {IEvent} from "./IEvent"
import {EventUpdate} from "./EventUpdate"

export interface ICalendarApi {
	getAuthorizationUrl(): string,
	
	authCodeReceived(authCode: string): Promise<any>
	
	getAvailableRooms(): Promise<Array<IRoom>>
	
	getRoom(id: string): Promise<IRoom | undefined>
	
	getEvents(roomId: string, from: Date, to: Date): Promise<Array<IEvent>>
	
	book(roomId: string, from: Date, to: Date, subject: string): Promise<IEvent | undefined>
	
	on(eventName: "error", callback: (roomId: string, error: string | Error) => void): void
	
	on(eventName: "update", callback: (roomId: string, updates: EventUpdate[]) => void): void
}