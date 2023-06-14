import type { MessageTypes } from './messageTypes';
import type { PinData } from './Pin';

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
}

export interface PinMoved extends Msg {
	MsgType: MessageTypes.PinMoved;
	PinData: PinData;
	Changer: string;
}

export interface MapUpdated extends Msg {
	MsgType: MessageTypes.MapUpdate;
	MapURI: string;
	MapX: number;
	MapY: number;
}

export interface BadMessage {
	MsgType: undefined;
}

export type UnknownMsg = HelloServer | HelloClient | PinMoved | BadMessage;
