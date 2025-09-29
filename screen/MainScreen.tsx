// ---------------------------------------------------
// --- 메인 화면 ---------------------------------------
// ---------------------------------------------------
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

  function calculateAge(birthDateString) {
    // 1. 입력받은 생년월일 문자열과 현재 날짜로 Date 객체를 생성합니다.
    const birthDate = new Date(birthDateString);
    const today = new Date();

    // 2. 현재 연도와 생년의 차이로 기본 나이를 계산합니다.
    let age = today.getFullYear() - birthDate.getFullYear();

    // 3. 월과 일을 비교하여 생일이 지났는지 확인합니다.
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // 생일이 아직 지나지 않은 경우 (월이 더 이르거나, 월은 같지만 일이 더 이른 경우)
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      // 나이에서 1을 뺍니다.
      age--;
    }

    return age;
  }

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
            source={require('../assets/senior-female.jpg')} // 이미지는 일단 그대로 둡니다.
          />
          <View style={{justifyContent: 'space-between'}}>
            <Text style={styles.profileText}>{seniors[0].name}님</Text>
            <Text style={styles.profileText}>
              {calculateAge(seniors[0].birthDate)}세
            </Text>
            {/* 병력 정보는 API에 추가되면 표시할 수 있습니다. */}
            <Text style={styles.profileText}>
              병력: {seniors[0].medicalHistory}
            </Text>
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
      {/* <Pressable style={styles.robotStatusContainer}>
        <Image
          source={require('../assets/plus.png')} // 이미지는 일단 그대로 둡니다.
        />
        <Text style={styles.beforeProfileText}>Aro 등록하기</Text>
      </Pressable> */}

      {/* <CommonButton onPress={() => navigateHandler('CalendarScreen')}>
          캘린더
        </CommonButton> */}
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
    padding: 8,
    backgroundColor: COLOR.DEFAULT_COLOR,
    // borderColor: COLOR.DEFAULT_COLOR,
    // borderWidth: 1,
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    // gap: 8,
  },
});
