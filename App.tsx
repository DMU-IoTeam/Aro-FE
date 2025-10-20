import React from 'react';
import './configs/globalListIndicators'; // global: hide scroll indicators
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, ActivityIndicator} from 'react-native';

// Hooks
import {useAuth} from './hooks/useAuth';
import {useFCM} from './hooks/useFCM';

// Constants
import COLOR from './constants/color';

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
import PhotoUploadScreen from './screen/PhotoUploadScreen';
import HealthCheckQuestionScreen from './screen/HealthCheckQuestionScreen';
import HealthCheckCalendarScreen from './screen/HealthCheckCalendarScreen';

const Stack = createNativeStackNavigator();

import { LogBox } from 'react-native';

// 모든 로그 / 오류 / 경고 숨기기
LogBox.ignoreAllLogs(true);

// 글로벌 에러 핸들러 설정
ErrorUtils.setGlobalHandler(() => {
  // 아무것도 하지 않음 (RedBox 표시 방지)
});

function RootStack({initialRouteName}: {initialRouteName: string}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTintColor: '#1E293B',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
        headerBackTitleVisible: false, // iOS에서 뒤로가기 버튼 옆의 텍스트를 숨깁니다.
      }}>
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}} // 로그인 화면에서는 헤더를 숨깁니다.
      />
      <Stack.Screen
        name="SignupScreen"
        component={SignupScreen}
        options={{title: '회원가입'}}
      />
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
        options={{title: '케어 대시보드'}} // 메인 화면에서는 헤더를 투명하게 처리합니다.
      />
      <Stack.Screen
        name="FallDetectionScreen"
        component={FallDetectionScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MedicineTimeScreen"
        component={MedicineTimeScreen}
        options={{title: '복약 설정'}}
      />
      <Stack.Screen
        name="MedicineTimeSettingScreen"
        component={MedicineTimeSettingScreen}
        options={{title: '복약 시간 설정'}}
      />
      <Stack.Screen
        name="HealthCheckScreen"
        component={HealthCheckScreen}
        options={{title: '건강 체크'}}
      />
      <Stack.Screen
        name="HealthCheckCalendarScreen"
        component={HealthCheckCalendarScreen}
        options={{title: '건강 답변 캘린더'}}
      />
      <Stack.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{title: '외부 일정'}}
      />
      <Stack.Screen
        name="ScheduleSettingScreen"
        component={ScheduleSettingScreen}
        options={{title: '일정 설정'}}
      />
      <Stack.Screen
        name="RobotConditionScreen"
        component={RobotConditionScreen}
        options={{title: '로봇 상태'}}
      />
      <Stack.Screen
        name="ClientageProfileScreen"
        component={ClientageProfileScreen}
        options={{title: '피보호자 정보'}}
      />
      <Stack.Screen
        name="CalendarScreen"
        component={CalendarScreen}
        options={{title: '복약 기록 캘린더'}}
      />
      <Stack.Screen name="PhotoUploadScreen" component={PhotoUploadScreen} 
        options={{title: '게임 사진 업로드'}}/>
      <Stack.Screen
        name="HealthCheckQuestion"
        component={HealthCheckQuestionScreen}
        options={{title: '질문 만들기'}}
      />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  const {isLoading, initialRoute} = useAuth();
  const navigationRef = useNavigationContainerRef<any>();
  useFCM(navigationRef);

  console.log('Initial Route:', initialRoute);
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack initialRouteName={initialRoute} />
    </NavigationContainer>
  );
}

export default App;
