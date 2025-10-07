import {useEffect} from 'react';
import {getMessaging, getToken, onMessage} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {app} from '../firebase-config';
import {registerFcmToken} from '../api/user';
import {NavigationContainerRef} from '@react-navigation/native';

export const useFCM = (navigationRef: NavigationContainerRef<any> | null) => {
  useEffect(() => {
    async function createChannel() {
      await notifee.createChannel({
        id: 'default',
        name: '기본 채널',
        importance: AndroidImportance.HIGH,
      });
    }

    async function setupFCM() {
      try {
        const messaging = getMessaging(app);
        const token = await getToken(messaging);
        console.log('✅ FCM Token:', token);
        if (token) {
          await registerFcmToken(token);
          console.log('FCM 토큰을 서버에 성공적으로 등록했습니다.');
        }
      } catch (error) {
        console.error('FCM setup error:', error);
      }
    }

    createChannel();
    setupFCM();

    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      console.log('포그라운드 메시지 수신:', remoteMessage);
      await notifee.displayNotification({
        title: remoteMessage.notification?.title ?? '제목 없음',
        body: remoteMessage.notification?.body ?? '내용 없음',
        android: {
          channelId: 'default',
        },
      });
      if (navigationRef && navigationRef.isReady()) {
        navigationRef.navigate('FallDetectionScreen');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigationRef]);
};
