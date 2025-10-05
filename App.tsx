import React from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, ActivityIndicator} from 'react-native';

// Hooks
import {useAuth} from './hooks/useAuth';
import {useFCM} from './hooks/useFCM';

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

function RootStack({initialRouteName}: {initialRouteName: string}) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
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
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  const {isLoading, initialRoute} = useAuth();
  const navigationRef = useNavigationContainerRef<any>();
  useFCM(navigationRef);

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
