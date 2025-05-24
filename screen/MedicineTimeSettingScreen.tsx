import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TextInput, Pressable} from 'react-native';
import WheelPicker from 'react-native-wheely';
import Input from '../components/common/Input';
import CommonButton from '../components/common/CommonButton';
import layout from '../constants/layout';
import Container from '../layouts/Container';

const LOOP_COUNT = 50;
const baseHours = Array.from({length: 12}, (_, i) => (i + 1).toString());
const baseMinutes = Array.from({length: 60}, (_, i) =>
  i < 10 ? `0${i}` : `${i}`,
);
const baseAmPm = ['오전', '오후'];

// 무한 스크롤을 위해 데이터 반복
const repeatedHours = Array(LOOP_COUNT).fill(baseHours).flat();
const repeatedMinutes = Array(LOOP_COUNT).fill(baseMinutes).flat();

// 중앙 인덱스 설정
const centerHour = Math.floor(repeatedHours.length / 2);
const centerMinute = Math.floor(repeatedMinutes.length / 2);

const MedicineTimeSettingScreen = () => {
  const [hourIndex, setHourIndex] = useState(0);
  const [minuteIndex, setMinuteIndex] = useState(0);
  const [ampmIndex, setAmPmIndex] = useState(0);

  const [medicineName, setMedicineName] = useState('');
  const [medicineArray, setMedicineArray] = useState([]);
console.log(repeatedHours)

  // 끝에 다다르면 중앙으로 다시 보내는 무한 스크롤 트릭
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

  // 렌더 후 center로 이동 (딱 한 번만)
  useEffect(() => {
    setTimeout(() => {
      setHourIndex(centerHour);
      setMinuteIndex(centerMinute);
    }, 10); // 다음 tick에 실행 (렌더 후)
  }, []);

  const medicineAddHandler = () => {
    if (medicineName.length === 0) return;
    setMedicineArray([...medicineArray, medicineName]);
    setMedicineName('');
  };

  return (
    <Container style={{position: 'relative'}}>
      {/* 시간 선택 */}
      <View style={styles.pickerRow}>
        <WheelPicker
          options={baseAmPm}
          selectedIndex={ampmIndex}
          onChange={setAmPmIndex}
          itemHeight={60}
          itemStyle={{}}
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
          itemStyle={{}}
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
          itemStyle={{}}
          itemTextStyle={styles.itemTextStyle}
          selectedIndicatorStyle={styles.selectedIndicatorStyle}
          visibleRest={1}
          containerStyle={styles.containerStyle}
        />
      </View>

      {/* 약 추가 인풋 */}
      <View style={{flexDirection: 'row', marginTop: 40}}>
        <Input
          value={medicineName}
          onChangeText={setMedicineName}
          placeholder="복용할 약을 입력해주세요"
          style={styles.inputStyle}
        />
        <CommonButton onPress={medicineAddHandler}>추가</CommonButton>
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
              <Text style={{fontSize: layout.FONT_SIZE}}>{item}</Text>
            </View>
          );
        })}
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 50,
          width: '100%',
          left: layout.HORIZONTAL_VALUE,
        }}>
        <CommonButton onPress={() => {}}>확인</CommonButton>
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
  selectedText: {
    marginTop: 40,
    fontSize: 20,
  },
  itemStyle: {},
  itemTextStyle: {
    fontSize: 32,
  },
  containerStyle:{
    flex: 1
  },
  selectedIndicatorStyle: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: 'gray',
    borderBottomColor: 'gray',
    backgroundColor: "white",
  },
  inputStyle: {
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
  },
});

export default MedicineTimeSettingScreen;
