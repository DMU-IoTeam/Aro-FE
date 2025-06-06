import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RecoilRoot} from 'recoil';
import {Alert} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';

// Firebase Modular API import
import {app} from './firebase-config';
import {
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
} from '@react-native-firebase/messaging';

import MainScreen from './screen/MainScreen';
import FallDetectionScreen from './screen/FallDetectionScreen';
import MedicineTimeScreen from './screen/MedicineTimeScreen';
import MedicineTimeSettingScreen from './screen/MedicineTimeSettingScreen';
import HealthCheckScreen from './screen/HealthCheckScreen';
import ScheduleScreen from './screen/ScheduleScreen';
import RobotConditionScreen from './screen/RobotConditionScreen';
import ClientageProfileScreen from './screen/ClientageProfileScreen';
import LoginScreen from './screen/LoginScreen';
import SignupScreen from './screen/SignupScreen';
import ScheduleSettingScreen from './screen/ScheduleSettingScreen';
import CalendarScreen from './screen/CalendarScreen';

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen
        name="FallDetectionScreen"
        component={FallDetectionScreen}
      />
      <Stack.Screen name="MedicineTimeScreen" component={MedicineTimeScreen} />
      <Stack.Screen
        name="MedicineTimeSettingScreen"
        component={MedicineTimeSettingScreen}
      />
      <Stack.Screen name="HealthCheckScreen" component={HealthCheckScreen} />
      <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
      <Stack.Screen
        name="ScheduleSettingScreen"
        component={ScheduleSettingScreen}
      />
      <Stack.Screen
        name="RobotConditionScreen"
        component={RobotConditionScreen}
      />
      <Stack.Screen
        name="ClientageProfileScreen"
        component={ClientageProfileScreen}
      />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  async function createChannel() {
    await notifee.createChannel({
      id: 'default',
      name: '기본 채널',
      importance: AndroidImportance.HIGH,
    });
  }

  useEffect(() => {
    async function setupFCM() {
      try {
        const messaging = getMessaging(app);

        const token = await getToken(messaging);
        console.log('✅ FCM Token:', token);
      } catch (error) {
        console.error('FCM setup error:', error);
      }
    }

    setupFCM();
    createChannel();
  }, []);

  useEffect(() => {
    const messaging = getMessaging(app);

    // 포그라운드에서 메시지 받기
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      console.log('포그라운드 메시지 수신:', remoteMessage);

      await notifee.displayNotification({
        title: remoteMessage.notification?.title ?? '제목 없음',
        body: remoteMessage.notification?.body ?? '내용 없음',
        android: {
          channelId: 'default',
        },
      });
    });

    return unsubscribe;
  }, []);

  return (
    <RecoilRoot>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </RecoilRoot>
  );
}

export default App;
