import {View} from 'react-native';
import Container from '../layouts/Container';
import Input from '../components/common/Input';
import CommonButton from '../components/common/CommonButton';
import {useState} from 'react';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <Container style={{gap: 16}}>
      <View style={{flexDirection: 'row', gap: 4}}>
        <Input placeholder={'이메일'} style={{flex: 1}} />
        <CommonButton>중복 확인</CommonButton>
      </View>

      <Input placeholder="비밀번호"></Input>

      <Input placeholder="비밀번호 확인"></Input>

      <View style={{flexDirection: 'row', gap: 4}}>
        <Input placeholder={'핸드폰 번호'} style={{flex: 1}} />
        <CommonButton>인증</CommonButton>
      </View>

      <CommonButton>회원가입</CommonButton>
    </Container>
  );
};

export default SignupScreen;
