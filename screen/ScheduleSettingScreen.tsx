import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Input from '../components/common/Input';
import CommonButton from '../components/common/CommonButton';
import layout from '../constants/layout';
import Container from '../layouts/Container';
import {useSeniorStore} from '../store/senior.store';
import {useActivityScheduleStore} from '../store/activitySchedule.store';
import TimeWheelPicker from '../components/common/TimeWheelPicker';

// --- WheelPicker 설정 ---
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
// ----------------------

// 날짜를 YYYY-MM-DD 형식으로 포맷하는 함수
const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ScheduleSettingScreen = () => {
  const navigation = useNavigation();
  const {seniors} = useSeniorStore();
  const {addSchedule} = useActivityScheduleStore();

  // Form State
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(new Date()); // Date 객체로 관리
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Time Picker State
  const [hourIndex, setHourIndex] = useState(0);
  const [minuteIndex, setMinuteIndex] = useState(0);
  const [ampmIndex, setAmPmIndex] = useState(0);

  // --- WheelPicker 핸들러 ---
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
  // ------------------------

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // iOS는 수동으로 닫아야 함
    setDate(currentDate);
  };

  const handleSave = async () => {
    if (seniors.length === 0) {
      Alert.alert('오류', '등록된 피보호자가 없습니다.');
      return;
    }
    if (!title) {
      Alert.alert('오류', '일정 제목은 필수 항목입니다.');
      return;
    }

    const seniorId = seniors[0].id;

    // 시간 계산
    const isAm = baseAmPm[ampmIndex] === '오전';
    let hour = parseInt(repeatedHours[hourIndex], 10);
    if (isAm && hour === 12) hour = 0;
    if (!isAm && hour !== 12) hour += 12;
    const minute = parseInt(repeatedMinutes[minuteIndex], 10);

    // ISO 8601 형식으로 변환
    const startTime = new Date(date);
    startTime.setHours(hour);
    startTime.setMinutes(minute);
    
    const payload = {
      seniorId,
      title,
      memo,
      startTime: startTime.toISOString(),
    };

    try {
      await addSchedule(payload);
      Alert.alert('성공', '일정이 성공적으로 등록되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '일정 등록 중 오류가 발생했습니다.');
    }
  };

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView scrollEnabled={scrollEnabled}>
          <Text style={styles.label}>날짜</Text>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <View style={styles.dateInput}>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={'date'}
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>시간</Text>
          <TimeWheelPicker
            ampmIndex={ampmIndex}
            setAmPmIndex={setAmPmIndex}
            hourIndex={hourIndex}
            setHourIndex={setHourIndex}
            minuteIndex={minuteIndex}
            setMinuteIndex={setMinuteIndex}
            repeatedHours={repeatedHours}
            repeatedMinutes={repeatedMinutes}
            onBeginInteraction={() => setScrollEnabled(false)}
            onEndInteraction={() => setScrollEnabled(true)}
          />

          <Text style={styles.label}>일정 제목</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="일정 제목을 입력하세요"
          />

          <Text style={styles.label}>메모</Text>
          <Input
            value={memo}
            onChangeText={setMemo}
            placeholder="(선택) 메모를 입력하세요"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{height: 100}}
          />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <CommonButton onPress={handleSave}>일정 저장</CommonButton>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: layout.BORDER_RADIUS,
    padding: 12,
    backgroundColor: 'white',
  },
  dateText: {
    fontSize: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    height: 250,
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
  buttonContainer: {
    paddingVertical: 20,
  },
});

export default ScheduleSettingScreen;
