import {Text} from '@react-navigation/elements';
import {Button, Pressable, StyleSheet, View} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faJugDetergent, faPhone } from '@fortawesome/free-solid-svg-icons';

const FallDetectionScreen = () => {
  return (
    <View>
      <View
        style={{backgroundColor: 'tomato', padding: 25, alignItems: 'center'}}>
        <Text style={{color: 'white', fontWeight: 700, fontSize: 24}}>
          낙상감지
        </Text>
      </View>

      {/* 영상 */}
      <View
        style={{
          height: 400,
          backgroundColor: 'gray',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{color: 'white', fontSize: 36}}>영상</Text>
      </View>

      {/* 버튼 */}
      <View
        style={{
          gap: 12,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 30
        }}>
        <Pressable
          style={{...styles.fallButtonWrapper, backgroundColor: '#24d924'}}>
            <FontAwesomeIcon icon={faPhone} color='white' size={26} />
          <Text style={styles.fallButtonText}>전화</Text>
        </Pressable>
        <Pressable style={{...styles.fallButtonWrapper, backgroundColor: '#d50a0a'}}>
        <FontAwesomeIcon icon={faJugDetergent} color='white' size={26} />
          <Text style={styles.fallButtonText}>신고</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default FallDetectionScreen;

const styles = StyleSheet.create({
  fallButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    flex: 1,
    borderRadius: 10,
    aspectRatio: '1/1',
    flexDirection: 'row',
    gap: 6
  },

  fallButtonText:{
    color: 'white',
    fontSize: 32,
  }
});
