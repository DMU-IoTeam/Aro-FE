import {Button, Text} from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import {Pressable, StyleSheet, View} from 'react-native';

const MainScreen = () => {
    const navigation = useNavigation()

    const navigateHandler = (screen)=>{
        navigation.navigate(screen)
    }

  return (
    <View style={{flexDirection: 'row', gap: 10}}>
        <Pressable style={styles.button} onPress={()=>{navigateHandler('FallDetectionScreen')}}><Text>낙상 감지</Text></Pressable>
        <Pressable style={styles.button} onPress={()=>{navigateHandler('MedicineTimeScreen')}}><Text>복약 설정</Text></Pressable>
    </View>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'tomato',
        padding: 10,
        borderRadius: 10,
    }
})