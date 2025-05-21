import {useState} from 'react';
import Input from '../components/common/Input';
import Container from '../layouts/Container';
import CommonButton from '../components/common/CommonButton';
import {Pressable, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import COLOR from '../constants/color';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const authNavigationData = [
    {text: '회원가입', screenName: 'SignupScreen'},
    {text: '아이디 찾기', screenName: 'SignupScreen'},
    {text: '비밀번호 찾기', screenName: 'SignupScreen'},
  ];

  const navigation = useNavigation();

  return (
    <Container style={{gap: 24}}>
      {/* 아이디 비번 입력 */}
      <Input placeholder="이메일" value={email} onChangeText={setEmail} />
      <Input
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
      />
      <CommonButton onPress={() => {}}>로그인</CommonButton>

      {/* 회원가입, 아이디 찾기 네비게이션 */}
      <View style={{flexDirection: 'row'}}>
        {authNavigationData.map((value, index) => {
          return (
            <Pressable
              onPress={() => {
                navigation.navigate(value.screenName);
              }}
              style={{
                flex: 1,
                borderRightWidth: index !== 2 ? 1 : 0,
                borderColor: COLOR.GRAY900,
              }}
              key={index}>
              <Text style={{textAlign: 'center', fontSize: 18}}>{value.text}</Text>
            </Pressable>
          );
        })}
      </View>
    </Container>
  );
};

export default LoginScreen;
