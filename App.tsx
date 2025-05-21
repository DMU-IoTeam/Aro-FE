/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainScreen from './screen/MainScreen';
import FallDetectionScreen from './screen/FallDetectionScreen';
import MedicineTimeScreen from './screen/MedicineTimeScreen';
import MedicineTimeSettingScreen from './screen/MedicineTimeSettingScreen';
import {RecoilRoot} from 'recoil';
import HealthCheckScreen from './screen/HealthCheckScreen';
import ScheduleScreen from './screen/ScheduleScreen';
import RobotConditionScreen from './screen/RobotConditionScreen';
import ClientageProfileScreen from './screen/ClientageProfileScreen';
import LoginScreen from './screen/LoginScreen';
import SignupScreen from './screen/SignupScreen';
import ScheduleSettingScreen from './screen/ScheduleSettingScreen';

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
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <RecoilRoot>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </RecoilRoot>
  );
}

export default App;
