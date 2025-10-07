import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import WheelPicker from 'react-native-wheely';
import {useNavigation} from '@react-navigation/native';
import Input from '../components/common/Input';
import CommonButton from '../components/common/CommonButton';
import layout from '../constants/layout';
import Container from '../layouts/Container';
import {useSeniorStore} from '../store/senior.store';
import {addMedicationSchedule} from '../api/medication';

const LOOP_COUNT = 50;
const baseHours = Array.from({length: 12}, (_, i) => (i + 1).toString());
const baseMinutes = Array.from({length: 60}, (_, i) =>
  i < 10 ? `0${i}` : `${i}`,
);
const baseAmPm = ['오전', '오후'];

const repeatedHours = Array(LOOP_COUNT).fill(baseHours).flat();
const repeatedMinutes = Array(LOOP_COUNT).fill(baseMinutes).flat();

const centerHour = Math.floor(repeatedHours.length / 2);
const centerMinute = Math.floor(repeatedMinutes.length / 2);

const MedicineTimeSettingScreen = () => {
  const navigation = useNavigation();
  const {seniors} = useSeniorStore();

  const [hourIndex, setHourIndex] = useState(0);
  const [minuteIndex, setMinuteIndex] = useState(0);
  const [ampmIndex, setAmPmIndex] = useState(0);

  const [medicineName, setMedicineName] = useState('');
  const [memo, setMemo] = useState('');
  const [medicineArray, setMedicineArray] = useState<Array<{name: string; memo: string}>>([]);

  const handleHourChange = (index: number) => {
    setHourIndex(index);
    if (index < 12 || index > repeatedHours.length - 12) {
      setTimeout(() => setHourIndex(centerHour), 10);
    }
  };

  const handleMinuteChange = (index: number) => {
    setMinuteIndex(index);
    if (index < 60 || index > repeatedMinutes.length - 60) {
      setTimeout(() => setMinuteIndex(centerMinute), 10);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setHourIndex(centerHour);
      setMinuteIndex(centerMinute);
    }, 10);
  }, []);

  const medicineAddHandler = () => {
    if (medicineName.length === 0) {
      Alert.alert('오류', '약 이름을 입력해주세요.');
      return;
    }
    setMedicineArray([...medicineArray, {name: medicineName, memo}]);
    setMedicineName('');
    setMemo('');
  };

  const handleSave = async () => {
    if (seniors.length === 0) {
      Alert.alert('오류', '등록된 피보호자가 없습니다.');
      return;
    }
    if (medicineArray.length === 0) {
      Alert.alert('오류', '최소 하나 이상의 약을 추가해주세요.');
      return;
    }

    const userId = seniors[0].id;
    const isAm = baseAmPm[ampmIndex] === '오전';
    let hour = parseInt(repeatedHours[hourIndex], 10);

    if (isAm && hour === 12) {
      hour = 0; // 오전 12시는 00시
    } else if (!isAm && hour !== 12) {
      hour += 12; // 오후 1시~11시는 13~23시
    }

    const minute = parseInt(repeatedMinutes[minuteIndex], 10);
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

    const payload = {
      userId,
      time,
      items: medicineArray,
    };

    try {
      await addMedicationSchedule(payload);
      Alert.alert('성공', '복약 일정이 성공적으로 등록되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '일정 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <Container style={{position: 'relative'}}>
      <ScrollView>
        {/* 시간 선택 */}
        <View style={styles.pickerRow}>
          <WheelPicker
            options={baseAmPm}
            selectedIndex={ampmIndex}
            onChange={setAmPmIndex}
            itemHeight={60}
            itemTextStyle={styles.itemTextStyle}
            selectedIndicatorStyle={styles.selectedIndicatorStyle}
            visibleRest={1}
            containerStyle={styles.containerStyle}
          />
          <WheelPicker
            options={repeatedHours}
            selectedIndex={hourIndex}
            onChange={handleHourChange}
            itemHeight={60}
            itemTextStyle={styles.itemTextStyle}
            selectedIndicatorStyle={styles.selectedIndicatorStyle}
            visibleRest={1}
            containerStyle={styles.containerStyle}
          />
          <WheelPicker
            options={repeatedMinutes}
            selectedIndex={minuteIndex}
            onChange={handleMinuteChange}
            itemHeight={60}
            itemTextStyle={styles.itemTextStyle}
            selectedIndicatorStyle={styles.selectedIndicatorStyle}
            visibleRest={1}
            containerStyle={styles.containerStyle}
          />
        </View>

        {/* 약 추가 인풋 */}
        <View style={{marginTop: 40}}>
          <Input
            value={medicineName}
            onChangeText={setMedicineName}
            placeholder="복용할 약 이름을 입력해주세요"
            style={styles.inputStyle}
          />
          <Input
            value={memo}
            onChangeText={setMemo}
            placeholder="메모 (예: 식후 30분)"
            style={styles.inputStyle}
          />
          <CommonButton onPress={medicineAddHandler}>약 추가</CommonButton>
        </View>

        {/* 추가된 약 리스트 */}
        <View style={{marginTop: 8}}>
          {medicineArray.map((item, index) => {
            return (
              <View
                key={index}
                style={{
                  borderRadius: layout.BORDER_RADIUS,
                  borderWidth: 1,
                  borderColor: 'gray',
                  width: '100%',
                  padding: 10,
                  marginVertical: 8,
                }}>
                <Text style={{fontSize: layout.FONT_SIZE, fontWeight: 'bold'}}>
                  {item.name}
                </Text>
                {item.memo ? (
                  <Text style={{fontSize: layout.FONT_SIZE, color: 'gray'}}>
                    {item.memo}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 50,
          width: '100%',
          left: layout.HORIZONTAL_VALUE,
        }}>
        <CommonButton onPress={handleSave}>일정 저장</CommonButton>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  pickerRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  itemTextStyle: {
    fontSize: 32,
  },
  containerStyle: {
    flex: 1,
  },
  selectedIndicatorStyle: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: 'gray',
    borderBottomColor: 'gray',
    backgroundColor: 'white',
  },
  inputStyle: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8, // 인풋 간 간격
  },
});

export default MedicineTimeSettingScreen;