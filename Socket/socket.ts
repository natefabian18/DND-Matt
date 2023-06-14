import WebSocket, { WebSocketServer } from 'ws';

import { MessageTypes } from '../src/Lib/messageTypes';
import type * as MessageFormats from '../src/Lib/messagesFormat';
import type { Msg } from '../src/Lib/messagesFormat';
import type { PinData } from '../src/Lib/Pin';

const port = 10232;
let SocketServer: WebSocketServer;

const PinList: Array<PinData> = [];

const ConnectionList: Array<WebSocket> = [];

export const PluginValue = {
	name: 'WebSocketServer',
	configureServer() {
		let globalPlayerCounter = 1;

		console.log('Setting up the webSocket Server');
		SocketServer = new WebSocketServer({
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

		SocketServer.on('connection', (SocketConnection) => {
			console.log('Connection Opened');

			ConnectionList.push(SocketConnection);

			const helloClientData: MessageFormats.HelloClient = {
				MsgType: MessageTypes.HelloClient,
				playerID: globalPlayerCounter++,
				PinDataList: PinList
			};
			SocketConnection.send(JSON.stringify(helloClientData));

			SocketConnection.on('message', (message) => {
				//@ts-ignore Ignore MSG format it does parse
				const data: MessageFormats.UnknownMsg = JSON.parse(message);

				switch (data.MsgType) {
					case MessageTypes.HelloServer:
						{
							console.log('Client Connected');
						}
						break;
					case MessageTypes.HelloClient:
						{
							console.warn('Server got hello client message?');
						}
						break;
					case MessageTypes.PinMoved: {
						const FindPin = PinList.findIndex((item) => item.ID == data.PinData.ID);

						if (FindPin == -1) {
							PinList.push(data.PinData);
						} else {
							PinList[FindPin] = data.PinData;
						}

						//Pin moved send message to everyone
						ConnectionList.filter((item) => item != SocketConnection).forEach((Connection) => {
							const MsgData: Msg = {
								...data,
								MsgType: MessageTypes.PinMoved
							};

							Connection.send(JSON.stringify(MsgData));
						});
					}
				}
			});

			SocketConnection.on('close', (message) => {
				console.log('Connection to socket closed', message);
			});

			SocketConnection.on('error', (message) => {
				console.warn('Connection to socket errored', message);
			});
		});
	}
};
