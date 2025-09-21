import axios from 'axios';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage에서 accessToken을 가져오는 함수
const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch (e) {
    console.error('Failed to fetch the token from storage', e);
    return null;
  }
};

// 플랫폼에 따라 다른 localhost 주소를 사용
const baseURL =
  Platform.OS === 'ios' ? 'http://localhost:8080' : 'http://10.0.2.2:8080';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios 요청 인터셉터 설정
apiClient.interceptors.request.use(
  async config => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default apiClient;
