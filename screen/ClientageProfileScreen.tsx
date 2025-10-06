import React, {useEffect} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  Text,
  Pressable,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Container from '../layouts/Container';
import Input from '../components/common/Input';
import CommonButton from '../components/common/CommonButton';
import {useSeniorStore} from '../store/senior.store';
import COLOR from '../constants/color';
import layout from '../constants/layout';
import {launchImageLibrary} from 'react-native-image-picker';
import {RegisterSeniorPayload} from '../api/senior';

const ClientageProfileScreen = () => {
  const navigation = useNavigation();
  const {
    seniors,
    formData,
    imageSource,
    displayImageUri,
    setFormData,
    setFullFormData,
    setImageSource,
    setDisplayImageUri,
    clearForm,
    registerSenior,
    updateSenior, // 스토어에서 updateSenior 액션 가져오기
  } = useSeniorStore();

  const isEditing = seniors.length > 0;

  useEffect(() => {
    if (isEditing) {
      const seniorToEdit = seniors[0];
      const formValues = {
        name: seniorToEdit.name,
        email: 'admin@example.com', // TODO: 이메일 값 출처 확인 필요
        birthDate: seniorToEdit.birthDate,
        gender: seniorToEdit.gender || '',
        address: seniorToEdit.address || '',
        medicalHistory: seniorToEdit.medicalHistory,
        bloodType: seniorToEdit.bloodType || '',
      };
      setFullFormData(formValues);

      if (seniorToEdit.profileImage) {
        setDisplayImageUri(seniorToEdit.profileImage);
      }
    }

    return () => {
      clearForm();
    };
  }, [isEditing, seniors, setFullFormData, setDisplayImageUri, clearForm]);

  const selectImageHandler = () => {
    launchImageLibrary({mediaType: 'photo', includeBase64: true}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setImageSource(response.assets[0]);
      }
    });
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.birthDate) {
      Alert.alert('오류', '이름과 생년월일은 필수 항목입니다.');
      return;
    }

    const dataToSend = {...formData};

    if (dataToSend.gender === '남성') {
      dataToSend.gender = 'MALE';
    } else if (dataToSend.gender === '여성') {
      dataToSend.gender = 'FEMALE';
    }

    // TODO: email 값의 실제 출처를 확인하여 반영해야 합니다.
    if (!dataToSend.email) {
      dataToSend.email = 'admin@example.com';
    }

    const payload: RegisterSeniorPayload = {
      ...dataToSend,
      profileImage: imageSource?.base64 || 'default',
    };

    try {
      if (isEditing) {
        const seniorId = seniors[0].id;
        await updateSenior(seniorId, payload); // 수정 액션 호출
      } else {
        await registerSenior(payload); // 등록 액션 호출
      }

      Alert.alert('성공', '피보호자 정보가 저장되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    }
  };

  return (
    <Container>
      <ScrollView>
        <View style={{marginTop: 36}}>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}>
            <Text style={{fontSize: 20}}>피보호자 사진</Text>
            <Pressable
              onPress={selectImageHandler}
              style={{
                borderRadius: layout.BORDER_RADIUS,
                borderWidth: 1,
                borderColor: COLOR.DEFAULT_COLOR,
                width: 150,
                height: 150,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 32,
              }}>
              {displayImageUri ? (
                <Image
                  source={{uri: displayImageUri}}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: layout.BORDER_RADIUS,
                  }}
                />
              ) : (
                <Text style={{fontSize: 24, color: COLOR.DEFAULT_COLOR}}>
                  +
                </Text>
              )}
            </Pressable>
          </View>

          <Input
            placeholder="이름"
            style={styles.inputLayout}
            value={formData.name}
            onChangeText={text => setFormData('name', text)}
          />
          <Input
            placeholder="생년월일 (예: 1950-01-01)"
            style={styles.inputLayout}
            value={formData.birthDate}
            onChangeText={text => setFormData('birthDate', text)}
          />
          <Input
            placeholder="성별 (예: 남성/여성)"
            style={styles.inputLayout}
            value={formData.gender}
            onChangeText={text => setFormData('gender', text)}
          />
          <Input
            placeholder="주소"
            style={styles.inputLayout}
            value={formData.address}
            onChangeText={text => setFormData('address', text)}
          />
          <Input
            placeholder="병력"
            style={styles.inputLayout}
            value={formData.medicalHistory}
            onChangeText={text => setFormData('medicalHistory', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Input
            placeholder="혈액형 (예: A+)"
            style={styles.inputLayout}
            value={formData.bloodType}
            onChangeText={text => setFormData('bloodType', text)}
          />
        </View>

        <View style={{marginTop: 10}}>
          <CommonButton onPress={handleRegister}>
            {isEditing ? '피보호자 정보 수정' : '피보호자 추가'}
          </CommonButton>
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