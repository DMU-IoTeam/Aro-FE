import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useMedicationScheduleStore} from '../store/medicationSchedule.store';
import {useSeniorStore} from '../store/senior.store';
import COLOR from '../constants/color';
import Container from '../layouts/Container';
import layout from '../constants/layout';
import {MedicationItem} from '../store/medicationSchedule.store';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPills, faPlus} from '@fortawesome/free-solid-svg-icons';
import {faCalendarDays} from '@fortawesome/free-regular-svg-icons';

const MedicineTimeScreen = () => {
  const navigation = useNavigation();
  const {seniors} = useSeniorStore();
  const {schedules, isLoading, error, fetchSchedule, deleteSchedule} =
    useMedicationScheduleStore();

  useEffect(() => {
    if (seniors.length > 0) {
      const seniorId = seniors[0].id;
      fetchSchedule(seniorId);
    }
  }, [seniors, fetchSchedule]);

  // 화면에 다시 포커스될 때마다 서버 데이터 재요청
  useFocusEffect(
    React.useCallback(() => {
      if (seniors.length > 0) {
        const seniorId = seniors[0].id;
        fetchSchedule(seniorId);
      }
    }, [seniors, fetchSchedule]),
  );

  const handleDelete = (scheduleId: number) => {
    Alert.alert('삭제 확인', '이 일정을 정말 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: async () => {
          try {
            await deleteSchedule(scheduleId);
            Alert.alert('성공', '일정이 삭제되었습니다.');
          } catch (e) {
            Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  // 주간 요일/날짜
  const [selectedDate, setSelectedDate] = useState(new Date());

  const week = useMemo(() => {
    const today = selectedDate;
    const day = today.getDay(); // 0(Sun)~6(Sat)
    const mondayOffset = (day + 6) % 7; // Monday as start
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    const labels = ['월', '화', '수', '목', '금', '토', '일'];
    const arr = Array.from({length: 7}, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        key: i,
        label: labels[i],
        date: d.getDate(),
        full: d,
      };
    });
    return arr;
  }, [selectedDate]);

  if (seniors.length === 0) {
    return (
      <Container style={styles.centerContainer}>
        <Text>피보호자를 먼저 등록해주세요.</Text>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLOR.DEFAULT_COLOR} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={styles.centerContainer}>
        <Text>복약 기록을 불러오는 데 실패했습니다: {error.message}</Text>
      </Container>
    );
  }

  return (
    <Container>
      {/* 상단 주간 바 + 메뉴 */}
      <View style={styles.weekHeader}>
        <View style={styles.weekRow}>
          {week.map(({key, label, date, full}) => {
            const isToday = new Date().toDateString() === full.toDateString();
            const isSelected =
              selectedDate.toDateString() === full.toDateString();
            return (
              <Pressable
                key={key}
                style={styles.weekCell}
                onPress={() => setSelectedDate(full)}>
                <Text
                  style={[styles.weekLabel, isSelected && {color: '#111827'}]}>
                  {label}
                </Text>
                <View
                  style={[
                    styles.dateChip,
                    isSelected && styles.dateChipSelected,
                    !isSelected && isToday && styles.dateChipToday,
                  ]}>
                  <Text
                    style={[
                      styles.dateChipText,
                      isSelected && styles.dateChipTextSelected,
                    ]}>
                    {date}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => navigation.navigate('CalendarScreen')}
          style={styles.calendarBtn}
          hitSlop={10}>
          <FontAwesomeIcon icon={faCalendarDays} size={18} color="#64748B" />
        </Pressable>
      </View>

      {/* 오늘의 복약 일정 헤더 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>오늘의 복약 일정</Text>
        <Pressable
          onPress={() => navigation.navigate('MedicineTimeSettingScreen')}
          style={styles.addFab}>
          <FontAwesomeIcon icon={faPlus} size={16} color="white" />
        </Pressable>
      </View>

      {/* 복약 기록 리스트 */}
      <FlatList
        data={schedules}
        renderItem={({item}) => (
          <MedicineScheduleItem
            scheduleId={item.id}
            time={item.time}
            isAm={item.isAm}
            medicine={item.medicine}
            userId={item.userId}
            onDelete={handleDelete}
          />
        )}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>복약 일정이 존재하지 않습니다.</Text>
          </View>
        }
      />
    </Container>
  );
};

type MedicineScheduleItemProps = {
  scheduleId: number;
  time: string;
  isAm: boolean;
  medicine: MedicationItem[];
  userId: number;
  onDelete: (scheduleId: number) => void;
};

export const MedicineScheduleItem = ({
  scheduleId,
  time,
  isAm,
  medicine,
  userId,
  onDelete,
}: MedicineScheduleItemProps) => {
  const navigation = useNavigation();
  const handleEdit = () => {
    navigation.navigate('MedicineTimeSettingScreen', {
      mode: 'edit',
      schedule: {
        scheduleId,
        time,
        isAm,
        items: medicine.map(med => ({name: med.name, memo: med.memo})),
        userId,
      },
    });
  };
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeaderRow}>
        <Text style={styles.timeLabel}>
          {isAm ? '오전' : '오후'} ({time})
        </Text>
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnEdit]}
            onPress={handleEdit}>
            <Text style={[styles.actionText, styles.actionTextEdit]}>수정</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnDelete]}
            onPress={() => onDelete(scheduleId)}>
            <Text style={[styles.actionText, styles.actionTextDelete]}>
              삭제
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 약 목록 */}
      <View style={{gap: 10}}>
        {medicine.map(item => {
          return (
            <View style={styles.medicineCard} key={item.id}>
              <View style={styles.medIconCircle}>
                <FontAwesomeIcon icon={faPills} size={18} color="#FFFFFF" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medMeta}>{item.memo || '메모 없음'}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContainer: {
    borderRadius: layout.BORDER_RADIUS,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginRight: 12,
  },
  medIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  weekCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    gap: 6,
  },
  weekLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  dateChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChipSelected: {
    backgroundColor: '#EF4444',
  },
  dateChipToday: {
    backgroundColor: '#DBEAFE',
  },
  dateChipText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  dateChipTextSelected: {
    color: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  addFab: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLOR.DEFAULT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  medicineCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  medIcon: {
    width: 40,
    height: 40,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  medMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionBtnEdit: {
    borderColor: '#3B82F6',
    backgroundColor: 'white',
  },
  actionBtnDelete: {
    borderColor: '#EF4444',
    backgroundColor: 'white',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionTextEdit: {
    color: '#3B82F6',
  },
  actionTextDelete: {
    color: '#EF4444',
  },
  emptyBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default MedicineTimeScreen;
