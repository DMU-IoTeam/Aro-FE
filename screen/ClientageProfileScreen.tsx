import React, {useState} from 'react';
import {StyleSheet, View, Alert, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Container from '../layouts/Container';
import Input from '../components/common/Input';
import CommonButton from '../components/common/CommonButton';
import {registerSenior, RegisterSeniorPayload} from '../api/senior';

const initialFormData: RegisterSeniorPayload = {
  name: '',
  birthDate: '',
  gender: '',
  address: '',
  medicalHistory: '',
  bloodType: '',
};

const ClientageProfileScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] =
    useState<RegisterSeniorPayload>(initialFormData);

  const handleInputChange = (
    field: keyof RegisterSeniorPayload,
    value: string,
  ) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleRegister = async () => {
    // 간단한 유효성 검사
    if (!formData.name || !formData.birthDate) {
      Alert.alert('오류', '이름과 생년월일은 필수 항목입니다.');
      return;
    }

    try {
      formData.profileImage = 'default';
      await registerSenior(formData);
      Alert.alert('성공', '피보호자 등록이 완료되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '등록 중 문제가 발생했습니다.');
    }
  };

  return (
    <Container>
      <ScrollView>
        <View style={{marginTop: 36}}>
          <Input
            placeholder="이름"
            style={styles.inputLayout}
            value={formData.name}
            onChangeText={text => handleInputChange('name', text)}
          />
          <Input
            placeholder="생년월일 (예: 1950-01-01)"
            style={styles.inputLayout}
            value={formData.birthDate}
            onChangeText={text => handleInputChange('birthDate', text)}
          />
          <Input
            placeholder="성별 (예: 남성/여성)"
            style={styles.inputLayout}
            value={formData.gender}
            onChangeText={text => handleInputChange('gender', text)}
          />
          <Input
            placeholder="주소"
            style={styles.inputLayout}
            value={formData.address}
            onChangeText={text => handleInputChange('address', text)}
          />
          <Input
            placeholder="병력"
            style={styles.inputLayout}
            value={formData.medicalHistory}
            onChangeText={text => handleInputChange('medicalHistory', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Input
            placeholder="혈액형 (예: A+)"
            style={styles.inputLayout}
            value={formData.bloodType}
            onChangeText={text => handleInputChange('bloodType', text)}
          />
        </View>

        <View style={{marginTop: 10}}>
          <CommonButton onPress={handleRegister}>피보호자 추가</CommonButton>
        </View>
      </ScrollView>
    </Container>
  );
};

export default ClientageProfileScreen;

const styles = StyleSheet.create({
  inputLayout: {
    marginBottom: 28,
  },
});
