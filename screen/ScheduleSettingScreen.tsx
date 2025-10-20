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
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
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

type ScheduleSettingRouteParams = {
  ScheduleSettingScreen:
    | {
        mode?: 'edit';
        schedule?: {
          scheduleId: number;
          seniorId: number;
          title: string;
          memo: string;
          startTime: string;
        };
      }
    | undefined;
};

const alignIndex = (base: string[], center: number, value: string) => {
  const baseIndex = base.findIndex(item => item === value);
  if (baseIndex === -1) {
    return center;
  }
  const cycle = Math.floor(center / base.length);
  return cycle * base.length + baseIndex;
};

const ScheduleSettingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<
    RouteProp<ScheduleSettingRouteParams, 'ScheduleSettingScreen'>
  >();
  const {seniors} = useSeniorStore();
  const {addSchedule, updateSchedule} = useActivityScheduleStore();
  const editSchedule =
    route.params?.mode === 'edit' ? route.params.schedule : null;
  const isEditMode = !!editSchedule;

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
    if (editSchedule) {
      setTitle(editSchedule.title);
      setMemo(editSchedule.memo ?? '');

      const start = new Date(editSchedule.startTime);
      setDate(start);

      const hour24 = start.getHours();
      const minute = start.getMinutes();
      const isAm = hour24 < 12;
      let hour12 = hour24 % 12;
      if (hour12 === 0) hour12 = 12;

      setAmPmIndex(isAm ? 0 : 1);
      const nextHourIndex = alignIndex(baseHours, centerHour, String(hour12));
      const nextMinuteIndex = alignIndex(
        baseMinutes,
        centerMinute,
        String(minute).padStart(2, '0'),
      );
      setTimeout(() => {
        setHourIndex(nextHourIndex);
        setMinuteIndex(nextMinuteIndex);
      }, 10);
    } else {
      setTitle('');
      setMemo('');
      setDate(new Date());
      setAmPmIndex(0);
      setTimeout(() => {
        setHourIndex(centerHour);
        setMinuteIndex(centerMinute);
      }, 10);
    }
  }, [editSchedule]);
  // ------------------------

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // iOS는 수동으로 닫아야 함
    setDate(currentDate);
  };

  const handleSave = async () => {
    if (!title) {
      Alert.alert('오류', '일정 제목은 필수 항목입니다.');
      return;
    }

    const seniorId = editSchedule?.seniorId ?? seniors[0]?.id;

    if (!seniorId) {
      Alert.alert('오류', '등록된 피보호자가 없습니다.');
      return;
    }

    // 시간 계산
    const isAm = baseAmPm[ampmIndex] === '오전';
    let hour = parseInt(repeatedHours[hourIndex], 10);
    if (isAm && hour === 12) hour = 0;
    if (!isAm && hour !== 12) hour += 12;
    const minute = parseInt(repeatedMinutes[minuteIndex], 10);

    // ISO 8601 형식으로 변환
    const startTimeUtc = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        minute,
        0,
      ),
    );

    const payload = {
      seniorId,
      title,
      memo,
      startTime: startTimeUtc.toISOString(),
    };

    try {
      if (isEditMode && editSchedule) {
        await updateSchedule(editSchedule.scheduleId, payload);
        Alert.alert('성공', '일정이 수정되었습니다.', [
          {text: '확인', onPress: () => navigation.goBack()},
        ]);
      } else {
        await addSchedule(payload);
        Alert.alert('성공', '일정이 성공적으로 등록되었습니다.', [
          {text: '확인', onPress: () => navigation.goBack()},
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '일정 저장 중 오류가 발생했습니다.');
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
          <CommonButton onPress={handleSave}>
            {isEditMode ? '일정 수정' : '일정 저장'}
          </CommonButton>
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
