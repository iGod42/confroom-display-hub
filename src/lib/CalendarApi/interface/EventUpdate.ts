import {IEvent} from "./IEvent"

export type EventUpdate = {
	type: "addedOrUpdated" | "removed",
	id: string,
	event?: IEvent
}