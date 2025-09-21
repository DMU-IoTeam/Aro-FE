import React, {useState, useEffect} from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Container from '../layouts/Container';
import COLOR from '../constants/color';
import layout from '../constants/layout';
import CommonButton from '../components/common/CommonButton';
import {getMySeniors, Senior} from '../api/senior';

const MainScreen = () => {
  const navigation = useNavigation();
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMySeniors = async () => {
      try {
        setIsLoading(true);
        const fetchedSeniors = await getMySeniors();
        setSeniors(fetchedSeniors);
      } catch (e: any) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMySeniors();
  }, []);

  const navigateHandler = screen => {
    navigation.navigate(screen);
  };

  const navigationItem = [
    {color: '#309898', text: '복약 설정', screenName: 'MedicineTimeScreen'},
    {color: '#F4631E', text: '외부 일정', screenName: 'ScheduleScreen'},
    {color: '#FF9F00', text: '건강 체크', screenName: 'HealthCheckScreen'},
    {color: '#CB0404', text: '위험 감지', screenName: 'FallDetectionScreen'},
  ];

  if (isLoading) {
    return (
      <Container>
        <ActivityIndicator size="large" color={COLOR.DEFAULT_COLOR} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Text>데이터를 불러오는 데 실패했습니다: {error.message}</Text>
      </Container>
    );
  }

  return (
    <Container>
      {/* 프로필 - 첫 번째 노인 정보 표시 */}
      {seniors.length > 0 ? (
        <Pressable
          style={styles.profileContainer}
          onPress={() => {
            navigateHandler('ClientageProfileScreen');
          }}>
          <Image
            style={styles.profileImage}
            source={require('../assets/senior.png')} // 이미지는 일단 그대로 둡니다.
          />
          <View style={{justifyContent: 'space-between'}}>
            <Text style={styles.profileText}>{seniors[0].name}님</Text>
            <Text style={styles.profileText}>{seniors[0].age}세</Text>
            {/* 병력 정보는 API에 추가되면 표시할 수 있습니다. */}
            {/* <Text style={styles.profileText}>병력: {seniors[0].disease}</Text> */}
          </View>
        </Pressable>
      ) : (
        <Pressable
          style={styles.beforeProfileContainer}
          onPress={() => {
            navigateHandler('ClientageProfileScreen');
          }}>
          <Image
            style={styles.profileImage}
            source={require('../assets/profile.png')} // 이미지는 일단 그대로 둡니다.
          />
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Image
              source={require('../assets/plus.png')} // 이미지는 일단 그대로 둡니다.
            />
            <Text style={styles.beforeProfileText}>피보호자 등록하기</Text>
          </View>
        </Pressable>
      )}

      {/* 네비게이션 버튼 */}
      <View style={styles.navContainer}>
        {navigationItem.map((value, index) => (
          <Pressable
            style={[styles.navButton, {borderColor: value.color}]}
            onPress={() => navigateHandler(value.screenName)}
            key={index}>
            <Text style={[styles.navText, {color: value.color}]}>
              {value.text}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 로봇 상태 */}
      <Pressable
        style={styles.robotStatusContainer}
        onPress={() => navigateHandler('RobotConditionScreen')}>
        <Text style={{color: 'white', fontWeight: '700'}}>
          로봇 배터리: 88%
        </Text>
        <Text style={{color: 'white', fontWeight: '700'}}>
          시리얼 넘버: q1w2e3r4t5
        </Text>
      </Pressable>

      {/* 임시~ */}
      <View style={{flexDirection: 'row', gap: 24, marginTop: 24}}>
        <CommonButton onPress={() => navigateHandler('LoginScreen')}>
          로그인
        </CommonButton>
        <CommonButton onPress={() => navigateHandler('SignupScreen')}>
          회원가입
        </CommonButton>
        <CommonButton onPress={() => navigateHandler('CalendarScreen')}>
          캘린더
        </CommonButton>
      </View>
    </Container>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  profileContainer: {
    backgroundColor: COLOR.DEFAULT_COLOR,
    padding: 18,
    borderRadius: layout.BORDER_RADIUS,
    flexDirection: 'row',
    gap: 14,
  },
  beforeProfileContainer: {
    borderColor: COLOR.DEFAULT_COLOR,
    borderWidth: 1,
    padding: 18,
    borderRadius: layout.BORDER_RADIUS,
    flexDirection: 'row',
    gap: 14,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 9999,
  },
  profileText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  beforeProfileText: {
    color: COLOR.DEFAULT_COLOR,
    fontSize: 18,
    fontWeight: '700',
  },
  navContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  navButton: {
    borderRadius: 10,
    borderWidth: 1,
    width: '48%',
    marginBottom: 15,
    height: 100,
    aspectRatio: '1/1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontWeight: '700',
    fontSize: 18,
  },
  robotStatusContainer: {
    borderRadius: 10,
    backgroundColor: COLOR.DEFAULT_COLOR,
    padding: 8,
  },
});
