import {Button, Text} from '@react-navigation/elements';
import {useNavigation} from '@react-navigation/native';
import {Pressable, StyleSheet, View, Image} from 'react-native';
import Container from '../layouts/Container';
import COLOR from '../constants/color';
import layout from '../constants/layout';

const MainScreen = () => {
  const navigation = useNavigation();

  const navigateHandler = screen => {
    navigation.navigate(screen);
  };

  const navigationItem = [
    {
      color: '#309898',
      text: '복약 설정',
    },
    {
      color: '#F4631E',
      text: '외부 설정',
    },
    {
      color: '#FF9F00',
      text: '건강 체크',
    },
    {
      color: '#CB0404',
      text: '위험 감지',
    },
  ];

  return (
    <Container>
      {/* 프로필 */}
      <View
        style={{
          backgroundColor: COLOR.DEFAULT_COLOR,
          padding: 18,
          borderRadius: layout.BORDER_RADIUS,
          flexDirection: 'row',
          gap: 14,
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
      </View>

      {/* 네비게이션 버튼 */}
      <View
        style={{
          flexDirection: 'row',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: 15
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
                navigateHandler();
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
      <View
        style={{
          borderRadius: 10,
          backgroundColor: COLOR.DEFAULT_COLOR,
          padding: 8,
        }}>
        <Text style={{color: 'white', fontWeight: 700}}>로봇 배터리: 88%</Text>
        <Text style={{color: 'white', fontWeight: 700}}>
          시리얼 넘버: q1w2e3r4t5
        </Text>
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
