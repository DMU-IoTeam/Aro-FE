import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  Text,
  Pressable,
  Image,
  Platform,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Container from '../layouts/Container';
import Input from '../components/common/Input';
import CommonButton from '../components/common/CommonButton';
import {useSeniorStore} from '../store/senior.store';
import COLOR from '../constants/color';
import layout from '../constants/layout';
import {launchImageLibrary} from 'react-native-image-picker';
import {RegisterSeniorPayload} from '../api/senior';

// YYYY-MM-DD 형식으로 날짜 포맷하는 함수
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

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
    updateSenior,
  } = useSeniorStore();

  const isEditing = seniors.length > 0;

  // DatePicker 상태
  const [date, setDate] = useState(new Date(1950, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bloodTypePickerVisible, setBloodTypePickerVisible] = useState(false);

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

      if (seniorToEdit.birthDate) {
        setDate(new Date(seniorToEdit.birthDate));
      }
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

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      setDate(selectedDate);
      setFormData('birthDate', formattedDate);
    }
    // Android에서는 사용자가 닫으면 자동으로 false가 되도록 설정
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.birthDate) {
      Alert.alert('오류', '이름과 생년월일은 필수 항목입니다.');
      return;
    }

    const dataToSend = {...formData};

    // TODO: email 값의 실제 출처를 확인하여 반영해야 합니다。
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
    <Container style={{padding: 0}}>
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

          {/* 기본 정보 */}
          <View style={{borderWidth: 1, borderColor: '#E5E7EB'}}>
            <Text style={{fontSize: 18, fontWeight: 700, marginBottom: 30}}>
              기본 정보
            </Text>

            <View style={styles.inputLayout}>
              <Text style={styles.label}>이름</Text>
              <Input
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChangeText={text => setFormData('name', text)}
              />
            </View>

            {/* 생년월일 DatePicker */}
            <View style={styles.inputLayout}>
              <Text style={styles.label}>생년월일</Text>
              <Pressable onPress={() => setShowDatePicker(true)}>
                <View style={styles.dateInput}>
                  <Text style={styles.dateText}>
                    {formData.birthDate || '날짜를 선택하세요'}
                  </Text>
                </View>
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={'date'}
                display="spinner" // 스피너 형태로 표시
                onChange={onDateChange}
              />
            )}

            {/* 성별 라디오 버튼 */}
            <View style={styles.inputLayout}>
              <Text style={styles.label}>성별</Text>
              <View style={styles.radioContainer}>
                <Pressable
                  style={[
                    styles.radioButton,
                    formData.gender === 'MALE' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData('gender', 'MALE')}>
                  <Text
                    style={[
                      styles.radioButtonText,
                      formData.gender === 'MALE' &&
                        styles.radioButtonTextActive,
                    ]}>
                    남성
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.radioButton,
                    formData.gender === 'FEMALE' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData('gender', 'FEMALE')}>
                  <Text
                    style={[
                      styles.radioButtonText,
                      formData.gender === 'FEMALE' &&
                        styles.radioButtonTextActive,
                    ]}>
                    여성
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.inputLayout}>
              <Text style={styles.label}>주소</Text>
              <Input
                placeholder="주소를 입력하세요"
                value={formData.address}
                onChangeText={text => setFormData('address', text)}
              />
            </View>
          </View>

          {/* 의료 정보 */}
          <View>
            <Text style={{fontSize: 18, fontWeight: 700, marginBottom: 30}}>
              의료 정보
            </Text>
            <View style={styles.inputLayout}>
              <Text style={styles.label}>병력</Text>
              <Input
                placeholder="병력 정보를 입력하세요"
                value={formData.medicalHistory}
                onChangeText={text => setFormData('medicalHistory', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputLayout}>
              <Text style={styles.label}>혈액형</Text>
              <Pressable
                onPress={() => setBloodTypePickerVisible(prev => !prev)}>
                <View style={styles.dateInput}>
                  <Text style={styles.dateText}>
                    {formData.bloodType || '혈액형을 선택하세요'}
                  </Text>
                </View>
              </Pressable>
              {bloodTypePickerVisible && (
                <View style={styles.dropdownContainer}>
                  <FlatList
                    data={['A', 'B', 'O', 'AB']}
                    keyExtractor={item => item}
                    renderItem={({item}) => (
                      <Pressable
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFormData('bloodType', item);
                          setBloodTypePickerVisible(false);
                        }}>
                        <Text>{item}</Text>
                      </Pressable>
                    )}
                  />
                </View>
              )}
            </View>
          </View>
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: layout.BORDER_RADIUS,
    padding: 12,
    backgroundColor: 'white',
    height: 50, // Input과 높이 맞춤
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: layout.BORDER_RADIUS,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  radioButtonActive: {
    backgroundColor: COLOR.DEFAULT_COLOR,
    borderColor: COLOR.DEFAULT_COLOR,
  },
  radioButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  radioButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: layout.BORDER_RADIUS,
    backgroundColor: 'white',
  },
  dropdownContainer: {
    position: 'absolute',
    bottom: 50, // Position above the input
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: layout.BORDER_RADIUS,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});
