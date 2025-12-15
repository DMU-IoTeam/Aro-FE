import React, {useEffect, useState} from 'react';
import {Text} from '@react-navigation/elements';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Video from 'react-native-video';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faJugDetergent, faPhone} from '@fortawesome/free-solid-svg-icons';
import {CareEventClip, fetchCareEventClips} from '../api/careEvent';
import Container from '../layouts/Container';

type FallDetectionRouteProp = RouteProp<
  {
    FallDetectionScreen: {
      careEventId?: string;
    };
  },
  'FallDetectionScreen'
>;

const FallDetectionScreen = () => {
  const route = useRoute<FallDetectionRouteProp>();
  const careEventId = route.params?.careEventId;
  const [clip, setClip] = useState<CareEventClip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!careEventId) {
      setClip(null);
      setErrorMessage('감지된 영상 정보를 불러오지 못했습니다.');
      setIsLoading(false);
      return;
    }

    const loadClip = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const clips = await fetchCareEventClips(careEventId);
        if (!isMounted) {
          return;
        }

        const firstClip = clips?.[0];
        console.log('Fetched care event clips:', clips);
        if (firstClip) {
          setClip(firstClip);
        } else {
          setClip(null);
          setErrorMessage('재생할 수 있는 영상이 없습니다.');
        }
      } catch (error) {
        console.error('Failed to fetch care event clip:', error);
        if (isMounted) {
          setClip(null);
          setErrorMessage('영상을 불러오는 중 문제가 발생했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadClip();

    return () => {
      isMounted = false;
    };
  }, [careEventId]);

  return (
    <View>
      <View
        style={{backgroundColor: '#DC2626', paddingTop: 55, padding: 25, alignItems: 'center'}}>
        <Text style={{color: 'white', fontWeight: '700', fontSize: 24}}>
          낙상감지
        </Text>
      </View>

      {/* 영상 */}
      <View
        style={styles.videoContainer}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="large" />
        ) : clip ? (
          <Video
            source={{uri: clip.videoUrl}}
            style={styles.video}
            resizeMode="contain"
            controls={false}
            paused={false}
          />
        ) : (
          <Text style={styles.videoPlaceholderText}>
            {errorMessage ?? '영상이 준비되지 않았습니다.'}
          </Text>
        )}
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
          style={{...styles.fallButtonWrapper, backgroundColor: '#10B981'}}>
                      <Image source={require('../assets/call.png')} />
          <Text style={styles.fallButtonText}>전화</Text>
        </Pressable>
        <Pressable style={{...styles.fallButtonWrapper, backgroundColor: '#DC2626'}}>
          <Image source={require('../assets/warning.png')} />
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
    paddingVertical: 30,
    flex: 1,
    borderRadius: 10,
    gap: 6
  },

  fallButtonText: {
    color: 'white',
    fontSize: 32,
  },
  videoContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111827',
  },
  videoPlaceholderText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 24,
  },
});
