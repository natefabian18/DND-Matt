import { writable } from 'svelte/store';

export interface IAlert {
	Color?: string;
	Message: string;
	duration: number;
	BroadCast: boolean;
}

const welcomeAlert: IAlert = {
	duration: 2000,
	Message: 'Welcome to Matt',
	BroadCast: false
};

export const Alert = writable(welcomeAlert);
