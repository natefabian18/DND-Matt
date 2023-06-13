import WebSocket, { WebSocketServer } from 'ws';

const port = 8080;
let wss: WebSocketServer;

export const PluginValue = {
	name: 'WebSocketServer',
	configureServer() {
		let globalPlayerCounter = 1;

		console.log('Setting up the webSocket Server');
		wss = new WebSocketServer({
			port: port,
			perMessageDeflate: {
				zlibDeflateOptions: {
					// See zlib defaults.
					chunkSize: 1024,
					memLevel: 7,
					level: 3
				},
				zlibInflateOptions: {
					chunkSize: 10 * 1024
				},
				// Other options settable:
				clientNoContextTakeover: true, // Defaults to negotiated value.
				serverNoContextTakeover: true, // Defaults to negotiated value.
				serverMaxWindowBits: 10, // Defaults to negotiated value.
				// Below options specified as default values.
				concurrencyLimit: 10, // Limits zlib concurrency for perf.
				threshold: 1024 // Size (in bytes) below which messages
				// should not be compressed if context takeover is disabled.
			}
		});

		console.log(`Web Socket Server Setup on port ${port}`);

		wss.on('connection', (ws) => {
			console.log('Connection Opened');

			ws.send(JSON.stringify({ playerID: globalPlayerCounter++ }));

			ws.on('message', (message) => {
				const data = JSON.parse(message);
				console.log(data);
				ws.send(
					JSON.stringify({
						message: 'We read you loud and clear!'
					})
				);
			});
		});
	}
};
