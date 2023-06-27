import * as MessageFormats from './MessageTypes';
import type { PinData } from './Pin';
import { Store } from './StoreCollection';

let PinList: Array<PinData>;

Store.Global.PinList.subscribe((List) => {
	PinList = List;
});

function FindMaxPinID(PinList: Array<PinData>) {
	return (
		PinList.reduce((previous, PinData) => {
			if (PinData.ID > previous) {
				return PinData.ID;
			} else {
				return previous;
			}
		}, -1) + 1
	);
}

export default function HandleMessage(msg: MessageEvent<any>) {
	const data: MessageFormats.UnknownMsg = JSON.parse(msg.data);

	switch (data.MsgType) {
		case MessageFormats.MessageTypes.HelloServer:
			{
				console.warn('Client got hello server message? Panic');
			}
			break;
		case MessageFormats.MessageTypes.HelloClient:
			{
				console.log('Client Got Hello', data);
				Store.playerIDStore.set(data.playerID);
				Store.Global.PinList.set(data.PinDataList);
				Store.Global.PinCounter.set(FindMaxPinID(data.PinDataList));
				Store.Alert.set({
					BroadCast: true,
					duration: 1000,
					Message: `New Client Connected ${data.playerID}, Welcome to Matt`,
					Color: 'hsl(135, 61%, 37%)',
					TextColor: '#000000'
				});
				Store.Global.MapURI.set(data.ActiveMap);
			}
			break;
		case MessageFormats.MessageTypes.PinMoved:
			{
				const ChangedPin = PinList.findIndex((item) => item.ID == data.PinData.ID);

				console.log('Pin Moved');
				if (ChangedPin == -1) {
					console.log('Pin added');
					PinList.push(data.PinData);
					Store.Global.PinCounter.set(FindMaxPinID(PinList));
				} else {
					PinList[ChangedPin] = data.PinData;
				}

				Store.Global.PinList.set(PinList);
			}
			break;
		case MessageFormats.MessageTypes.PinDeleted:
			{
				const deletedPin = PinList.findIndex((item) => item.ID == data.PinID);

				if (deletedPin == -1) {
					return;
				}

				PinList.splice(deletedPin, 1);
				Store.Global.PinList.set(PinList);
				Store.Global.PinCounter.set(FindMaxPinID(PinList));
			}
			break;
		case MessageFormats.MessageTypes.PinUpdated:
			{
				const ChangedPin = PinList.findIndex((item) => item.ID == data.PinData.ID);

				if (ChangedPin == -1) {
					return;
				}

				PinList[ChangedPin] = data.PinData;
				Store.Global.PinList.set(PinList);
				Store.Global.PinCounter.set(FindMaxPinID(PinList));
			}
			break;
		case MessageFormats.MessageTypes.MapUpdate:
			{
				Store.Global.MapURI.set(data.MapURI);
			}
			break;
		case MessageFormats.MessageTypes.Alert:
			{
				Store.Alert.set(data.AlertData);
			}
			break;
		case MessageFormats.MessageTypes.TapeMeasureMoved:
			{
				Store.Global.TapeMeasureValues.set(data.TapeMeasurePositions);
			}
			break;

		case MessageFormats.MessageTypes.ForceWholePinList:
			{
				Store.Global.PinList.set(data.PinList);
			}
			break;
		default:
			console.warn('Unknown Message received', data);
			break;
	}
}
