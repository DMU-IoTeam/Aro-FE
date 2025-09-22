import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RecoilRoot} from 'recoil';
import {Alert, View, ActivityIndicator} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API
import {getMe, registerFcmToken} from './api/user';

// Firebase Modular API import
import {app} from './firebase-config';
import {
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
} from '@react-native-firebase/messaging';

// Screens
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
import { getSeniors } from './api/senior';

const Stack = createNativeStackNavigator();

// 내비게이션 스택을 별도 컴포넌트로 분리
function RootStack({initialRouteName}: {initialRouteName: string}) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      {/* 인증이 필요 없는 화면들 */}
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />

      {/* 인증이 필요한 화면들 */}
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
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('LoginScreen');

  // --- FCM 및 채널 설정 useEffect (기존 코드) ---
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
        if (token) {
          await registerFcmToken(token);
          console.log('FCM 토큰을 서버에 성공적으로 등록했습니다.');
        }
      } catch (error) {
        console.error('FCM setup error:', error);
      }
    }
    setupFCM();
    createChannel();
  }, []);

  useEffect(() => {
    const messaging = getMessaging(app);
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
  // --- 여기까지 FCM 관련 코드 ---

  // --- 인증 상태 확인 useEffect (새로 추가된 코드) ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        console.log('--- App.tsx: 앱 시작 시 AsyncStorage에서 토큰 확인 ---', token);
        if (token) {
          // 토큰이 있으면, 유효성 검증 API 호출
          await getMe();
          // API 호출이 성공하면 (에러가 발생하지 않으면) 메인 화면으로 설정
          setInitialRoute('MainScreen');
        } else {
          // 토큰이 없으면 로그인 화면으로 설정
          setInitialRoute('LoginScreen');
        }
      } catch (error) {
        // getMe API 호출 실패 시 (토큰 만료 등)
        console.error('토큰 검증 실패:', error);
        // 기존의 유효하지 않은 토큰 삭제
        await AsyncStorage.removeItem('accessToken');
        setInitialRoute('LoginScreen');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    // 로딩 중일 때 보여줄 화면
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RecoilRoot>
      <NavigationContainer>
        <RootStack initialRouteName={initialRoute} />
      </NavigationContainer>
    </RecoilRoot>
  );
}

export default App;
