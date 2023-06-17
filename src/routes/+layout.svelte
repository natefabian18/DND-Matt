<script lang="ts">
	import '@picocss/pico';
	import MessageManager from '../Lib/MessageManager';
	import { Global } from '../Lib/globals';
	import AlertManager from '../Lib/AlertManager.svelte';

	//#region Initialize websocket
	const webSocketURL = `ws://${window.location.hostname}:10232`;
	if (typeof ws == 'undefined') {
		const ws = new WebSocket(webSocketURL);
		ws.onmessage = MessageManager;
		Global.WebSocketConnection.set(ws);
	}
	//#endregion
</script>

<main>
	<div class="AlertManager">
		<AlertManager />
	</div>
	<slot>Something has gone really wrong</slot>
</main>

<style>
	.AlertManager {
		top: 2em;
		right: 2em;
		bottom: 2em;
		position: absolute;
		z-index: 10000;
	}
</style>
