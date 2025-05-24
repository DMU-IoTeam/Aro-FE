import {Button, Text} from '@react-navigation/elements';
import {useNavigation} from '@react-navigation/native';
import {Pressable, StyleSheet, View, Image} from 'react-native';
import Container from '../layouts/Container';
import COLOR from '../constants/color';
import layout from '../constants/layout';
import CommonButton from '../components/common/CommonButton';

const MainScreen = () => {
  const navigation = useNavigation();

  const navigateHandler = screen => {
    navigation.navigate(screen);
  };

  const navigationItem = [
    {
      color: '#309898',
      text: '복약 설정',
      screenName: 'MedicineTimeScreen',
    },
    {
      color: '#F4631E',
      text: '외부 일정',
      screenName: 'ScheduleScreen',
    },
    {
      color: '#FF9F00',
      text: '건강 체크',
      screenName: 'HealthCheckScreen',
    },
    {
      color: '#CB0404',
      text: '위험 감지',
      screenName: 'FallDetectionScreen',
    },
  ];

  return (
    <Container>
      {/* 프로필 */}
      <Pressable
        style={{
          backgroundColor: COLOR.DEFAULT_COLOR,
          padding: 18,
          borderRadius: layout.BORDER_RADIUS,
          flexDirection: 'row',
          gap: 14,
        }}
        onPress={() => {
          navigateHandler('ClientageProfileScreen');
        }}>
        <Image
          style={styles.profileImage}
          source={require('../assets/profile.png')}
        />
        <View style={{justifyContent: 'space-between'}}>
          <Text style={styles.profileText}>홍길동님</Text>
          <Text style={styles.profileText}>77세</Text>
          <Text style={styles.profileText}>병력: 당뇨, 고혈압</Text>
        </View>
      </Pressable>

      {/* 네비게이션 버튼 */}
      <View
        style={{
          flexDirection: 'row',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: 15,
        }}>
        {navigationItem.map((value, index) => {
          return (
            <Pressable
              style={{
                borderColor: value.color,
                borderRadius: 10,
                borderWidth: 1,
                width: '48%',
                marginBottom: 15,
                height: 100,
                aspectRatio: '1/1',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                navigateHandler(value.screenName);
              }}
              key={index}>
              <Text style={{color: value.color, fontWeight: 700, fontSize: 18}}>
                {value.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 로봇 상태 */}
      <Pressable
        style={{
          borderRadius: 10,
          backgroundColor: COLOR.DEFAULT_COLOR,
          padding: 8,
        }}
        onPress={() => {
          navigateHandler('RobotConditionScreen');
        }}>
        <Text style={{color: 'white', fontWeight: 700}}>로봇 배터리: 88%</Text>
        <Text style={{color: 'white', fontWeight: 700}}>
          시리얼 넘버: q1w2e3r4t5
        </Text>
      </Pressable>

      {/* 임시~ */}
      <View style={{flexDirection: 'row', gap: 24, marginTop: 24}}>
        <CommonButton
          onPress={() => {
            navigateHandler('LoginScreen');
          }}>
          로그인
        </CommonButton>
        <CommonButton
          onPress={() => {
            navigateHandler('SignupScreen');
          }}>
          회원가입
        </CommonButton>
        <CommonButton
          onPress={() => {
            navigateHandler('CalendarScreen');
          }}>
          캘린더
        </CommonButton>
      </View>
    </Container>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 10,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 9999,
  },

  profileText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 700,
  },
});
