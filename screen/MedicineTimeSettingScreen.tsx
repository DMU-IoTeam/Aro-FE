import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TextInput, Pressable} from 'react-native';
import WheelPicker from 'react-native-wheely';

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
    setMedicineArray([...medicineArray, medicineName]);
    setMedicineName('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerRow}>
        <WheelPicker
          options={baseAmPm}
          selectedIndex={ampmIndex}
          onChange={setAmPmIndex}
          itemHeight={40}
          itemStyle={{}}
          itemTextStyle={styles.itemTextStyle}
          selectedIndicatorStyle={styles.selectedIndicatorStyle}
        />
        <WheelPicker
          options={repeatedHours}
          selectedIndex={hourIndex}
          onChange={handleHourChange}
          itemHeight={40}
          itemStyle={{}}
          itemTextStyle={styles.itemTextStyle}
          selectedIndicatorStyle={styles.selectedIndicatorStyle}
        />
        <WheelPicker
          options={repeatedMinutes}
          selectedIndex={minuteIndex}
          onChange={handleMinuteChange}
          itemHeight={40}
          itemStyle={{}}
          itemTextStyle={styles.itemTextStyle}
          selectedIndicatorStyle={styles.selectedIndicatorStyle}
        />
      </View>

      {/* <Text style={styles.selectedText}>
        선택된 시간: {baseAmPm[ampmIndex]} {repeatedHours[hourIndex]}:
        {repeatedMinutes[minuteIndex]}
      </Text> */}
      <View
        style={{flexDirection: 'row', paddingHorizontal: 30, marginTop: 40}}>
        <TextInput
          value={medicineName}
          onChangeText={setMedicineName}
          placeholder="복용할 약을 입력해주세요"
          style={styles.inputStyle}
        />
        <Pressable onPress={medicineAddHandler}>
          <Text>추가</Text>
        </Pressable>
      </View>

      {medicineArray.map((item, index) => {
        return (
          <View key={index}>
            <Text>{item}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 20,
  },
  selectedText: {
    marginTop: 40,
    fontSize: 20,
  },
  itemStyle: {},
  itemTextStyle: {
    fontSize: 22,
  },
  selectedIndicatorStyle: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: 'gray',
    borderBottomColor: 'gray',
  },
  inputStyle: {
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
  },
});

export default MedicineTimeSettingScreen;
