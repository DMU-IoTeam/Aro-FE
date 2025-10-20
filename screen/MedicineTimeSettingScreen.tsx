import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import WheelPicker from 'react-native-wheely';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Input from '../components/common/Input';
import CommonButton from '../components/common/CommonButton';
import layout from '../constants/layout';
import Container from '../layouts/Container';
import {useSeniorStore} from '../store/senior.store';
import {
  addMedicationSchedule,
  updateMedicationSchedule,
} from '../api/medication';

const LOOP_COUNT = 50;
const baseHours = Array.from({length: 12}, (_, i) => (i + 1).toString());
const baseMinutes = Array.from({length: 60}, (_, i) =>
  i < 10 ? `0${i}` : `${i}`,
);
const AMPM = ['오전', '오후'] as const;

const repeatedHours = Array(LOOP_COUNT).fill(baseHours).flat();
const repeatedMinutes = Array(LOOP_COUNT).fill(baseMinutes).flat();

const centerHour = Math.floor(repeatedHours.length / 2);
const centerMinute = Math.floor(repeatedMinutes.length / 2);

type MedicineTimeSettingRouteParams = {
  MedicineTimeSettingScreen:
    | {
        mode?: 'edit';
        schedule?: {
          scheduleId: number;
          time: string;
          isAm: boolean;
          items: Array<{name: string; memo: string}>;
          userId: number;
        };
      }
    | undefined;
};

const MedicineTimeSettingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<
    RouteProp<MedicineTimeSettingRouteParams, 'MedicineTimeSettingScreen'>
  >();
  const {seniors} = useSeniorStore();

  const [hourIndex, setHourIndex] = useState(0);
  const [minuteIndex, setMinuteIndex] = useState(0);
  const [ampmIndex, setAmPmIndex] = useState(0);

  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState('1');
  const [method, setMethod] = useState<
    '식전 30분' | '식후 30분' | '식사와 함께' | '시간 관계없이'
  >('식후 30분');
  const [medicineArray, setMedicineArray] = useState<
    Array<{name: string; memo: string}>
  >([]);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const editSchedule = route.params?.mode === 'edit' ? route.params.schedule : null;
  const isEditMode = !!editSchedule;

  const beginWheel = () => setScrollEnabled(false);
  const endWheel = () => setScrollEnabled(true);
  useEffect(() => {
    return () => setScrollEnabled(true);
  }, []);

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

const centerAlignedIndex = (base: string[], center: number, value: string) => {
  const baseIndex = base.findIndex(item => item === value);
  if (baseIndex === -1) {
    return center;
  }
  const cycle = Math.floor(center / base.length);
    return cycle * base.length + baseIndex;
  };

  useEffect(() => {
    if (!editSchedule) {
      return;
    }
    const [hourPart, minutePart] = editSchedule.time.split(':');
    const normalizedHour = String(Number(hourPart) === 0 ? 12 : Number(hourPart));
    const normalizedMinute = minutePart.padStart(2, '0');

    setAmPmIndex(editSchedule.isAm ? 0 : 1);
    setHourIndex(
      centerAlignedIndex(baseHours, centerHour, normalizedHour),
    );
    setMinuteIndex(
      centerAlignedIndex(baseMinutes, centerMinute, normalizedMinute),
    );
    setMedicineArray(
      editSchedule.items.map(item => ({name: item.name, memo: item.memo})),
    );
  }, [editSchedule]);

  const medicineAddHandler = () => {
    if (medicineName.length === 0) {
      Alert.alert('오류', '약 이름을 입력해주세요.');
      return;
    }
    const memoText = `${method}${dose ? ` · ${dose}정` : ''}`;
    setMedicineArray([...medicineArray, {name: medicineName, memo: memoText}]);
    setMedicineName('');
    setDose('1');
  };

  const removeMedicineItem = (index: number) => {
    setMedicineArray(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    // 항목이 없으면 현재 입력으로 1개 구성
    const items =
      medicineArray.length > 0
        ? medicineArray
        : medicineName
        ? [{name: medicineName, memo: `${method}${dose ? ` · ${dose}정` : ''}`}]
        : [];

    if (items.length === 0) {
      Alert.alert('오류', '약물명을 입력해주세요.');
      return;
    }

    const resolvedUserId =
      editSchedule?.userId ?? seniors[0]?.id ?? null;

    if (!resolvedUserId) {
      Alert.alert('오류', '등록된 피보호자가 없습니다.');
      return;
    }

    const isAm = AMPM[ampmIndex] === '오전';
    let hour = parseInt(repeatedHours[hourIndex], 10);

    if (isAm && hour === 12) {
      hour = 0; // 오전 12시는 00시
    } else if (!isAm && hour !== 12) {
      hour += 12; // 오후 1시~11시는 13~23시
    }

    const minute = parseInt(repeatedMinutes[minuteIndex], 10);
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

    const payload = {
      userId: resolvedUserId,
      time,
      items,
    };

    try {
      if (isEditMode && editSchedule) {
        await updateMedicationSchedule(editSchedule.scheduleId, payload);
        Alert.alert('성공', '복약 일정이 수정되었습니다.', [
          {text: '확인', onPress: () => navigation.goBack()},
        ]);
      } else {
        await addMedicationSchedule(payload);
        Alert.alert('성공', '복약 일정이 성공적으로 등록되었습니다.', [
          {text: '확인', onPress: () => navigation.goBack()},
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '일정 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <Container style={{position: 'relative', paddingTop: 12}}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* 약물명 */}
        <Text style={styles.label}>약물명</Text>
        <Input
          value={medicineName}
          onChangeText={setMedicineName}
          placeholder="약물명을 입력하세요"
          style={[
            styles.inputStyle,
            {backgroundColor: 'white', borderColor: '#E5E7EB'},
          ]}
        />

        {/* 복용량 */}
        <Text style={[styles.label, {marginTop: 16}]}>복용량</Text>
        <View style={styles.doseRow}>
          <Input
            value={dose}
            onChangeText={setDose}
            placeholder="1"
            keyboardType="number-pad"
            style={[styles.inputStyle, {width: 80, textAlign: 'center'}]}
          />
          <Text style={{marginLeft: 8, color: '#475569'}}>정</Text>
        </View>

        {/* 복용 시간 */}
        <Text style={[styles.label, {marginTop: 16}]}>복용 시간</Text>
        <View style={styles.segmentWrap}>
          {AMPM.map((t, idx) => (
            <Pressable
              key={t}
              onPress={() => setAmPmIndex(idx)}
              style={[
                styles.segment,
                ampmIndex === idx && styles.segmentActive,
              ]}>
              <Text
                style={[
                  styles.segmentText,
                  ampmIndex === idx && styles.segmentTextActive,
                ]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.timePickerCard}>
          <View style={styles.pickerRow}>
            <View
              style={styles.wheelWrap}
              onTouchStart={beginWheel}
              onTouchEnd={endWheel}
              onTouchCancel={endWheel}>
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
            </View>
            <View
              style={styles.wheelWrap}
              onTouchStart={beginWheel}
              onTouchEnd={endWheel}
              onTouchCancel={endWheel}>
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
          </View>
        </View>

        {/* 복용 방법 */}
        <Text style={[styles.label, {marginTop: 16}]}>복용 방법</Text>
        <View style={{gap: 10}}>
          {(
            ['식전 30분', '식후 30분', '식사와 함께', '시간 관계없이'] as const
          ).map(opt => {
            const active = method === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setMethod(opt)}
                style={[styles.methodItem, active && styles.methodItemActive]}>
                <View
                  style={[styles.radio, active && styles.radioActiveBorder]}>
                  {active && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.methodText,
                    active && styles.methodTextActive,
                  ]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 추가된 약 리스트 */}
        {medicineArray.length > 0 && (
          <View style={{marginTop: 16}}>
            {medicineArray.map((item, index) => (
              <View key={index} style={styles.previewCard}>
                <Text style={{fontWeight: '700'}}>{item.name}</Text>
                <Text style={{color: '#64748B', marginTop: 2}}>
                  {item.memo}
                </Text>
                <Pressable
                  style={styles.previewRemove}
                  onPress={() => removeMedicineItem(index)}>
                  <Text style={styles.previewRemoveText}>삭제</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={{marginVertical: 16}}>
          <CommonButton onPress={handleSave}>
            {isEditMode ? '복약 일정 수정하기' : '복약 일정 추가하기'}
          </CommonButton>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
    fontWeight: '700',
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#3B82F6',
  },
  segmentText: {color: '#334155', fontWeight: '600'},
  segmentTextActive: {color: 'white'},
  timePickerCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 190,
  },
  wheelWrap: {
    flex: 1,
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
  methodItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  methodItemActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EEF2FF',
  },
  methodText: {color: '#334155', fontSize: 14},
  methodTextActive: {color: '#1D4ED8', fontWeight: '700'},
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: 'white',
  },
  radioActiveBorder: {
    borderColor: '#3B82F6',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    alignSelf: 'center',
    marginTop: 3,
  },
  previewCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  previewRemove: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  previewRemoveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 50,
    left: layout.HORIZONTAL_VALUE,
    width: '100%',
    right: layout.HORIZONTAL_VALUE,
  },
});

export default MedicineTimeSettingScreen;
