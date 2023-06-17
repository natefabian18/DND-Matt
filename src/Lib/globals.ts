import { writable } from 'svelte/store';

export const Global = writable({
	DMTools: false,
	DevTools: false,
	WebSocketConnection: WebSocket.prototype
});
