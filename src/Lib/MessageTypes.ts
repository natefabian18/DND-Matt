import type { PinData } from './Pin';
import type { IAlert } from '../Lib/Alert';

export enum MessageTypes {
	HelloServer = 1,
	HelloClient = 2,
	PinMoved = 3,
	MapUpdate = 4,
	PinDeleted = 5,
	PinUpdated = 6,
	Alert = 7,
	TapeMeasureMoved = 8
}

export interface Msg {
	MsgType: MessageTypes;
}

export interface HelloServer extends Msg {
	MsgType: MessageTypes.HelloServer;
}

export interface HelloClient extends Msg {
	MsgType: MessageTypes.HelloClient;
	playerID: number;
	PinDataList: Array<PinData>;
	ActiveMap: string;
}

export interface PinMoved extends Msg {
	//It may be more performant to only send the pin movements here and use pinUpdate for anything else but the data structure isnt very large yet so its fine
	MsgType: MessageTypes.PinMoved;
	PinData: PinData;
	Changer: string;
}

export interface MapUpdated extends Msg {
	MsgType: MessageTypes.MapUpdate;
	MapURI: string;
}

export interface PinDeleted extends Msg {
	MsgType: MessageTypes.PinDeleted;
	PinID: number;
}
export interface UpdatePinData extends Msg {
	MsgType: MessageTypes.PinUpdated;
	PinData: PinData;
}

export interface AlertBroadCast extends Msg {
	MsgType: MessageTypes.Alert;
	AlertData: IAlert;
}

export interface TapeMeasureMoved extends Msg {
	MsgType: MessageTypes.TapeMeasureMoved;
	TapeMeasurePositions: {
		StartX: number;
		StartY: number;
		EndX: number;
		EndY: number;
	};
}

export interface BadMessage {
	MsgType: undefined;
}

export type UnknownMsg =
	| MapUpdated
	| PinDeleted
	| HelloServer
	| HelloClient
	| PinMoved
	| BadMessage
	| UpdatePinData
	| AlertBroadCast
	| TapeMeasureMoved;
