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
