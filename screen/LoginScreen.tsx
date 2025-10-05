import React, {useState} from 'react';
import {
  Modal,
  Button,
  View,
  Platform,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const AUTH_URL =
  Platform.OS === 'ios'
    ? 'http://localhost:8080/oauth2/authorization/kakao'
    : 'http://10.0.2.2:8080/oauth2/authorization/kakao';

const FINAL_REDIRECT_URI = 'http://localhost:3000/oauth2/redirect';

const LoginScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  // 토큰 추출 및 화면 이동 로직을 공통 함수로 분리
  const processTokenExtraction = async (url: string) => {
    if (url.startsWith(FINAL_REDIRECT_URI)) {
      console.log('최종 URI로 리다이렉트 감지:', url);

      const match = url.match(/[?&]token=([^&]+)/);
      const token = match ? match[1] : null;

      if (token) {
        console.log('추출된 JWT 토큰:', token);
        try {
          await AsyncStorage.setItem('accessToken', token);
          navigation.replace('MainScreen'); // 메인 화면으로 이동
        } catch (e) {
          console.error('토큰 저장 실패', e);
        }
      }
      // 성공적으로 토큰을 처리했거나, 토큰이 없더라도 모달을 닫음
      setIsModalVisible(false);
    }
  };

  const handleNavigationStateChange = async navState => {
    await processTokenExtraction(navState.url);
  };

  // WebView 에러 핸들러
  const handleError = async syntheticEvent => {
    const {nativeEvent} = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    // 연결 거부 오류가 발생했더라도, URL에 토큰이 포함되어 있을 수 있으므로 토큰 추출 시도
    await processTokenExtraction(nativeEvent.url);
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingTop: 100,
        backgroundColor: '#FF936530',
      }}>
      <Image
        source={require('../assets/aro.png')}
        style={{width: 200, height: 300, resizeMode: 'contain'}}
      />
      <Pressable onPress={() => setIsModalVisible(true)}>
        <Image source={require('../assets/kakao-login.png')} />
      </Pressable>
      <Modal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <WebView
          source={{uri: AUTH_URL}}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          incognito={true}
        />
        <Button title="닫기" onPress={() => setIsModalVisible(false)} />
      </Modal>
    </View>
  );
};

export default LoginScreen;
