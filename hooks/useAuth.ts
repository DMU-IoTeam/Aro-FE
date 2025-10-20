import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMe} from '../api/user';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('LoginScreen');

  useEffect(() => {
    setInitialRoute('MainScreen');
    setIsLoading(false);

    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
         console.log('저장된 토큰:', token);
        if (token) {
          await getMe();
          setInitialRoute('MainScreen');
        } else {
          setInitialRoute('LoginScreen');
        }
      } catch (error) {
        console.error('토큰 검증 실패:', error);
        await AsyncStorage.removeItem('accessToken');
        setInitialRoute('LoginScreen');
      } finally {
        setIsLoading(false);
      }
    };

    // checkAuthStatus();
  }, []);

  return {isLoading, initialRoute};
};
