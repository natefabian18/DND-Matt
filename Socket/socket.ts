import WebSocket, { WebSocketServer } from 'ws';
import * as MessageFormats from '../src/Lib/MessageTypes';
import type { PinData } from '../src/Lib/Pin';

const port = 10232;
let SocketServer: WebSocketServer;

let PinList: Array<PinData> = [];
let ActiveMap = '/map_32x32.png';
const ConnectionList: Array<WebSocket> = [];

function BroadcastMessageToAllPlayers(
	ConnList: Array<WebSocket>,
	Message: MessageFormats.UnknownMsg
) {
	ConnList.forEach((connection) => {
		connection.send(JSON.stringify(Message));
	});
}

function getNextEmptySlot(ConnectionList: Array<any>) {
	let counter = 0;
	let isTaken = ConnectionList.findIndex((item) => item.ID == counter);

	while (isTaken != -1) {
		counter++;
		isTaken = ConnectionList.findIndex((item) => item.ID == counter);
	}
	return counter;
}

export const PluginValue = {
	name: 'WebSocketServer',
	configureServer() {
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

			SocketConnection.ID = getNextEmptySlot(ConnectionList);

			ConnectionList.push(SocketConnection);

			const helloClientData: MessageFormats.HelloClient = {
				MsgType: MessageFormats.MessageTypes.HelloClient,
				playerID: SocketConnection.ID,
				PinDataList: PinList,
				ActiveMap: ActiveMap
			};
			SocketConnection.send(JSON.stringify(helloClientData));

			SocketConnection.on('message', (message) => {
				//@ts-ignore Ignore MSG format it does parse
				const data: MessageFormats.UnknownMsg = JSON.parse(message);

				console.log(`Got Message Enum: ${data.MsgType}`);

				switch (data.MsgType) {
					case MessageFormats.MessageTypes.HelloServer:
						{
							console.log('Client Connected');
						}
						break;
					case MessageFormats.MessageTypes.HelloClient:
						{
							console.warn('Server got hello client message?');
						}
						break;
					case MessageFormats.MessageTypes.PinMoved:
						{
							const FindPin = PinList.findIndex((item) => item.ID == data.PinData.ID);

							console.log(data.PinData);

							if (FindPin == -1) {
								PinList.push(data.PinData);
							} else {
								PinList[FindPin] = data.PinData;
							}

							BroadcastMessageToAllPlayers(
								ConnectionList.filter((connection) => connection != SocketConnection),
								data
							);
						}
						break;
					case MessageFormats.MessageTypes.PinDeleted:
						{
							BroadcastMessageToAllPlayers(
								ConnectionList.filter((connection) => connection != SocketConnection),
								data
							);
						}
						break;

					case MessageFormats.MessageTypes.MapUpdate:
						{
							ActiveMap = data.MapURI;

							BroadcastMessageToAllPlayers(
								ConnectionList.filter((connection) => connection != SocketConnection),
								data
							);
						}
						break;

					case MessageFormats.MessageTypes.PinUpdated:
						{
							const FindPin = PinList.findIndex((item) => item.ID == data.PinData.ID);

							if (FindPin == -1) {
								PinList.push(data.PinData);
							} else {
								PinList[FindPin] = data.PinData;
							}

							BroadcastMessageToAllPlayers(
								ConnectionList.filter((connection) => connection != SocketConnection),
								data
							);
						}
						break;
					case MessageFormats.MessageTypes.Alert:
						{
							data.AlertData.BroadCast = false;

							BroadcastMessageToAllPlayers(
								ConnectionList.filter((connection) => connection != SocketConnection),
								data
							);
						}
						break;
					case MessageFormats.MessageTypes.TapeMeasureMoved:
						{
							BroadcastMessageToAllPlayers(
								ConnectionList.filter((connection) => connection != SocketConnection),
								data
							);
						}
						break;
					case MessageFormats.MessageTypes.ForceWholePinList:
						{
							PinList = data.PinList;
							BroadcastMessageToAllPlayers(
								ConnectionList.filter((connection) => connection != SocketConnection),
								data
							);
						}
						break;
					default:
						console.log('Got Unknown Message', data);
						break;
				}
			});

			SocketConnection.on('close', (message) => {
				console.log('Connection to socket closed', message);

				const ClientID = ConnectionList.findIndex((item) => item == SocketConnection);

				ConnectionList.splice(ClientID, 1);
			});

			SocketConnection.on('error', (message) => {
				console.warn('Connection to socket errored', message);
			});
		});
	}
};
