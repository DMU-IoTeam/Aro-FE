import React, {useState} from 'react';
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
import {registerSenior, RegisterSeniorPayload} from '../api/senior';
import COLOR from '../constants/color';
import layout from '../constants/layout';
import {launchImageLibrary, Asset} from 'react-native-image-picker';

const initialFormData: Omit<RegisterSeniorPayload, 'profileImage'> = {
  name: '',
  birthDate: '',
  gender: '',
  address: '',
  medicalHistory: '',
  bloodType: '',
};

const ClientageProfileScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState(initialFormData);
  const [imageSource, setImageSource] = useState<Asset | null>(null);

  const selectImageHandler = () => {
    console.log("clicked")
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setImageSource(response.assets[0]);
      }
    });
  };

  const handleInputChange = (
    field: keyof typeof initialFormData,
    value: string,
  ) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

    const handleRegister = async () => {
    if (!formData.name || !formData.birthDate) {
      Alert.alert('오류', '이름과 생년월일은 필수 항목입니다.');
      return;
    }

    const payload = new FormData();
    const dataToSend = {...formData};

    if (dataToSend.gender === '남성') {
      dataToSend.gender = 'MALE';
    } else if (dataToSend.gender === '여성') {
      dataToSend.gender = 'FEMALE';
    }

    Object.keys(dataToSend).forEach(key => {
      payload.append(key, dataToSend[key as keyof typeof dataToSend]);
    });

    if (imageSource && imageSource.uri) {
      payload.append('profileImage', {
        uri: imageSource.uri,
        name: imageSource.fileName,
        type: imageSource.type,
      });
    } else {
      payload.append('profileImage', 'default');
    }

    try {
      await registerSenior(payload);
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
              {imageSource?.uri ? (
                <Image
                  source={{uri: imageSource.uri}}
                  style={{width: '100%', height: '100%', borderRadius: layout.BORDER_RADIUS}}
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
