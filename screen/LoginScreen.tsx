import React, { useState } from 'react';
import { Modal, Button, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

// 1. 로그인 프로세스를 '시작'하기 위해 백엔드에 요청하는 주소
const AUTH_URL = Platform.OS === 'ios' 
  ? "http://localhost:8080/oauth2/authorization/kakao"
  : "http://10.0.2.2:8080/oauth2/authorization/kakao";

// 2. 로그인 프로세스를 '종료'하고 성공 여부를 판단하기 위해 감지할 최종 주소
//    application.yml의 oauth.redirect-uri.success 값과 반드시 일치해야 합니다.
const FINAL_REDIRECT_URI = "http://localhost:3000/oauth2/redirect";

const LoginScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    console.log("Navigated to URL:", url);

    // 웹뷰의 주소가 최종 도착지에 도달했는지 확인
    if (url.startsWith(FINAL_REDIRECT_URI)) {
      console.log("로그인 성공! 최종 URI로 리다이렉트 완료.");
      
      // 이제 URL에서 백엔드가 보내준 토큰(JWT)을 추출할 수 있습니다.
      // 예시 URL: http://localhost:3000/oauth2/redirect?token=your_jwt_token
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get("token"); // 백엔드에서 'token'이라는 이름으로 파라미터를 보냈다고 가정
      
      if (token) {
        console.log("추출된 JWT 토큰:", token);
        // 여기서 토큰을 저장하고 메인 화면으로 이동시키는 로직을 구현합니다.
      }
      
      setIsModalVisible(false); // 성공했으니 모달을 닫습니다.
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="카카오 로그인" onPress={() => setIsModalVisible(true)} />
      <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <WebView
          source={{ uri: AUTH_URL }}
          onNavigationStateChange={handleNavigationStateChange}
          incognito={true} // 세션이나 쿠키 문제 방지를 위해 시크릿 모드 사용
        />
        <Button title="닫기" onPress={() => setIsModalVisible(false)} />
      </Modal>
    </View>
  );
};

export default LoginScreen;