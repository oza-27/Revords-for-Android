import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
export default function Index() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background', remoteMessage);
    });
    messaging().getInitialNotification(async remoteMessage => {
        console.log('Message handeled in the background', remoteMessage);
    });
    AppRegistry.registerComponent(appName, () => App);
}