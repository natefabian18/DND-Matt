<script lang="ts">
	import type { IAlert } from './Alert';
	import { Alert } from './Alert';

	import { fade, scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	import { Global } from '../Lib/globals';
	import type { AlertBroadCast } from '../Lib/messagesFormat';
	import { MessageTypes } from './messageTypes';

	let AlertList: Array<IAlert> = [];

	let LocalGlobal = $Global;
	Global.subscribe((value) => {
		LocalGlobal = value;
	});

	Alert.subscribe((NewAlert: IAlert) => {
		AlertList.unshift(NewAlert);
		AlertList = AlertList;

		if (NewAlert.BroadCast) {
			debugger;
			let WebSocket = LocalGlobal.WebSocketConnection;
			let msg: AlertBroadCast = {
				AlertData: NewAlert,
				MsgType: MessageTypes.Alert
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
		>
			{element.Message}
		</div>
	{/each}
</section>

<style>
	.element {
		color: #fff;
		filter: invert(100%);
	}
</style>
