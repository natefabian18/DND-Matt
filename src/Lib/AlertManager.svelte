<script lang="ts">
	import type { IAlert } from './Alert';
	import { Alert } from './Alert';
	import { fade, scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { Global } from '../Lib/globals';
	import * as MessageTypes from '../Lib/MessageTypes';

	let AlertList: Array<IAlert> = [];

	let WebSocket: WebSocket;

	Global.WebSocketConnection.subscribe((Connection) => {
		WebSocket = Connection;
	});

	Alert.subscribe((NewAlert: IAlert) => {
		AlertList.unshift(NewAlert);
		AlertList = AlertList;

		if (NewAlert.BroadCast) {
			let msg: MessageTypes.AlertBroadCast = {
				AlertData: NewAlert,
				MsgType: MessageTypes.MessageTypes.Alert
			};
			WebSocket.send(JSON.stringify(msg));
		}
		setTimeout(() => {
			let ItemIndex = AlertList.findIndex((item) => item == NewAlert);

			AlertList.splice(ItemIndex, 1);
			AlertList = AlertList;
		}, NewAlert.duration);
	});
</script>

<section aria-label="Alerts">
	{#each AlertList as element, i (element)}
		<div
			animate:flip={{ duration: 300 }}
			out:scale={{ duration: 250 }}
			in:scale={{ duration: 250 }}
			class="element"
			style="background-color: {element.Color};"
		>
			<span class="Text" style="color: {element.TextColor};">
				{element.Message}
			</span>
		</div>
	{/each}
</section>

<style>
	.element {
		padding: 0.5em;
		border-radius: 0.5em;
		margin: 0.25em;
	}
</style>
