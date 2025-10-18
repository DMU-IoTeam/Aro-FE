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
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCalendarDays} from '@fortawesome/free-regular-svg-icons';

// YYYY-MM-DD 형식으로 날짜 포맷하는 함수
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// 생년월일(YYYY-MM-DD)에서 만나이 계산
const calcAge = (birth?: string) => {
  if (!birth) return undefined;
  const [y, m, d] = birth.split('-').map(v => parseInt(v, 10));
  if (!y || !m || !d) return undefined;
  const today = new Date();
  let age = today.getFullYear() - y;
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > m ||
    (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
};

// YYYY-MM-DD -> "YYYY년 M월 D일"
const formatKoreanDate = (birth?: string) => {
  if (!birth) return '';
  const [y, m, d] = birth.split('-').map(v => parseInt(v, 10));
  if (!y || !m || !d) return '';
  return `${y}년 ${m}월 ${d}일`;
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
      profileImage: 'default',
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {/* 피보호자 프로필 요약 영역 */}
          <View style={styles.profileCard}>
            <Pressable onPress={selectImageHandler} style={styles.avatarContainer}>
              {displayImageUri ? (
                <Image source={require('../assets/senior-female.jpg')} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Image
                    source={require('../assets/profile-fill.png')}
                    style={{width: 24, height: 24, tintColor: '#64748B'}}
                    resizeMode="contain"
                  />
                </View>
              )}
            </Pressable>

            <View style={{flex: 1}}>
              <Text style={styles.nameText}>
                {formData.name ? formData.name : '이름 미입력'}
              </Text>
              <View style={styles.subRow}>
                <Text style={styles.subText}>
                  {(() => {
                    // 성별 표기 정규화
                    const g = formData.gender;
                    if (g === 'MALE' || g === '남성') return '남성';
                    if (g === 'FEMALE' || g === '여성') return '여성';
                    return '성별 미정';
                  })()}
                </Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.subText}>
                  {typeof calcAge(formData.birthDate) === 'number'
                    ? `${calcAge(formData.birthDate)}세`
                    : '나이 미정'}
                </Text>
              </View>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>관리중</Text>
            </View>
          </View>

          {/* 기본 정보 */}
          <View>
            <Text style={{fontSize: 18, fontWeight: 700, marginBottom: 20}}>
              기본 정보
            </Text>

            <View style={styles.inputLayout}>
              <Text style={styles.label}>이름 *</Text>
              <Input
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChangeText={text => setFormData('name', text)}
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: 'white',
                  height: 50,
                  fontSize: 16,
                }}
              />
            </View>

            {/* 생년월일 DatePicker */}
            <View style={styles.inputLayout}>
              <Text style={styles.label}>생년월일 *</Text>
              <Pressable onPress={() => setShowDatePicker(true)}>
                <View style={[styles.dateInput, styles.dateRow]}>
                  <Text style={styles.dateText}>
                    {formData.birthDate
                      ? formatKoreanDate(formData.birthDate)
                      : '날짜를 선택하세요'}
                  </Text>
                  <FontAwesomeIcon icon={faCalendarDays} color="#94A3B8" size={18} />
                </View>
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={'date'}
                onChange={onDateChange}
              />
            )}

            {/* 성별 라디오 버튼 */}
            <View style={styles.inputLayout}>
              <Text style={styles.label}>성별 *</Text>
              <View style={styles.radioContainer}>
                <Pressable
                  style={[
                    styles.radioButton,
                    formData.gender === 'MALE' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData('gender', 'MALE')}>
                  <View style={styles.radioButtonContent}>
                    <View style={styles.radioDot}>
                      {formData.gender === 'MALE' && (
                        <View style={styles.radioDotInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.radioButtonText,
                        formData.gender === 'MALE' &&
                          styles.radioButtonTextActive,
                      ]}>
                      남성
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  style={[
                    styles.radioButton,
                    formData.gender === 'FEMALE' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData('gender', 'FEMALE')}>
                  <View style={styles.radioButtonContent}>
                    <View style={styles.radioDot}>
                      {formData.gender === 'FEMALE' && (
                        <View style={styles.radioDotInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.radioButtonText,
                        formData.gender === 'FEMALE' &&
                          styles.radioButtonTextActive,
                      ]}>
                      여성
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <View style={styles.inputLayout}>
              <Text style={styles.label}>주소</Text>
              <Input
                placeholder="주소를 입력하세요"
                value={formData.address}
                onChangeText={text => setFormData('address', text)}
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: 'white',
                  height: 50,
                  fontSize: 16,
                }}
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
                numberOfLines={6}
                textAlignVertical="top"
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: 'white',
                  fontSize: 16,
                  minHeight: 120,
                }}
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

        <View style={styles.btnRow}>
          <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => navigation.goBack()}>
            <Text style={[styles.btnText, styles.btnTextCancel]}>취소</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleRegister}>
            <Text style={[styles.btnText, styles.btnTextPrimary]}>저장하기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Container>
  );
};

export default ClientageProfileScreen;

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    gap: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dot: {
    marginHorizontal: 6,
    color: '#9CA3AF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
  },
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#EEF2FF',
    borderColor: '#3B82F6',
  },
  radioButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  radioButtonTextActive: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  radioButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  radioDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
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
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: layout.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnPrimary: {
    backgroundColor: '#3B82F6',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextCancel: {
    color: '#334155',
  },
  btnTextPrimary: {
    color: 'white',
  },
});
