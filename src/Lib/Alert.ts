import { writable } from 'svelte/store';

export interface IAlert {
	Color?: string;
	TextColor?: string;
	Message: string;
	duration: number;
	BroadCast: boolean;
}

const welcomeAlert: IAlert = {
	duration: 1,
	Message: '',
	BroadCast: false
};

export const Alert = writable(welcomeAlert);
