import { writable } from 'svelte/store';
import type { PinData } from './Pin';

const PinList: Array<PinData> = [];

const defaultMap = '/map_32x32.png';

const TapeMeasurePositions = {
	StartX: 100,
	StartY: 100,
	EndX: 100,
	EndY: 100
};

export const Global = {
	DMTools: writable(false),
	DevTools: writable(false),
	WebSocketConnection: writable(WebSocket.prototype),
	PinCounter: writable(0),
	PinList: writable(PinList),
	MapURI: writable(defaultMap),
	TapeMeasureValues: writable(TapeMeasurePositions)
};
