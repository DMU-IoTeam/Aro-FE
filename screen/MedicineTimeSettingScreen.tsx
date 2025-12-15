import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, Alert, ScrollView} from 'react-native';
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
import TimeWheelPicker from '../components/common/TimeWheelPicker';

const METHOD_OPTIONS = ['식전 30분', '식후 30분', '식사와 함께', '시간 관계없이'] as const;
type MethodOption = (typeof METHOD_OPTIONS)[number];
const DEFAULT_METHOD: MethodOption = '식후 30분';
const DEFAULT_DOSE = '1';

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
          items: Array<{id?: number; name: string; memo: string}>;
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
  const [dose, setDose] = useState(DEFAULT_DOSE);
  const [method, setMethod] = useState<MethodOption>(DEFAULT_METHOD);
  const [medicineItemId, setMedicineItemId] = useState<number | null>(null);
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
    const alignIndex = (base: string[], value: string, center: number) => {
      const baseIndex = base.findIndex(v => v === value);
      if (baseIndex === -1) {
        return center;
      }
      const loop = Math.floor(center / base.length);
      return loop * base.length + baseIndex;
    };

    if (!editSchedule) {
      setMedicineName('');
      setDose(DEFAULT_DOSE);
      setMethod(DEFAULT_METHOD);
      setMedicineItemId(null);
      setAmPmIndex(0);
      setTimeout(() => {
        setHourIndex(centerHour);
        setMinuteIndex(centerMinute);
      }, 10);
      return;
    }

    const [hourPart, minutePart] = editSchedule.time.split(':');
    const normalizedHour = String(Number(hourPart) === 0 ? 12 : Number(hourPart));
    const normalizedMinute = minutePart.padStart(2, '0');

    setAmPmIndex(editSchedule.isAm ? 0 : 1);
    const nextHourIndex = alignIndex(baseHours, normalizedHour, centerHour);
    const nextMinuteIndex = alignIndex(baseMinutes, normalizedMinute, centerMinute);
    // react-native-wheely sometimes needs the initial index to be set after mount
    setTimeout(() => {
      setHourIndex(nextHourIndex);
      setMinuteIndex(nextMinuteIndex);
    }, 10);
    const firstItem = editSchedule.items?.[0];
    if (firstItem) {
      setMedicineItemId(firstItem.id ?? null);
      setMedicineName(firstItem.name ?? '');
      const {memoMethod, memoDose} = (() => {
        const memo = firstItem.memo ?? '';
        const [methodPartRaw = '', dosePartRaw = ''] = memo.split('·').map(part => part.trim());
        const matchedMethod = METHOD_OPTIONS.find(opt => methodPartRaw.includes(opt));
        const extractedDose = dosePartRaw.replace(/[^0-9]/g, '');
        return {
          memoMethod: (matchedMethod ?? DEFAULT_METHOD) as MethodOption,
          memoDose: extractedDose.length > 0 ? extractedDose : DEFAULT_DOSE,
        };
      })();
      setMethod(memoMethod);
      setDose(memoDose);
    } else {
      setMedicineName('');
      setDose(DEFAULT_DOSE);
      setMethod(DEFAULT_METHOD);
      setMedicineItemId(null);
    }
  }, [editSchedule]);

  const handleSave = async () => {
    const trimmedName = medicineName.trim();
    if (trimmedName.length === 0) {
      Alert.alert('오류', '약물명을 입력해주세요.');
      return;
    }

    const items = [
      {
        id: medicineItemId ?? undefined,
        name: trimmedName,
        memo: `${method}${dose ? ` · ${dose}정` : ''}`,
      },
    ];

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
        <TimeWheelPicker
          ampmIndex={ampmIndex}
          setAmPmIndex={setAmPmIndex}
          hourIndex={hourIndex}
          setHourIndex={handleHourChange}
          minuteIndex={minuteIndex}
          setMinuteIndex={handleMinuteChange}
          repeatedHours={repeatedHours}
          repeatedMinutes={repeatedMinutes}
          onBeginInteraction={beginWheel}
          onEndInteraction={endWheel}
        />

        {/* 복용 방법 */}
        <Text style={[styles.label, {marginTop: 16}]}>복용 방법</Text>
        <View style={{gap: 10}}>
          {METHOD_OPTIONS.map(opt => {
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
  bottomAction: {
    position: 'absolute',
    bottom: 50,
    left: layout.HORIZONTAL_VALUE,
    width: '100%',
    right: layout.HORIZONTAL_VALUE,
  },
});

export default MedicineTimeSettingScreen;
