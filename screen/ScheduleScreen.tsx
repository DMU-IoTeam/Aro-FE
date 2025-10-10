import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert, // Alert 임포트
} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import type {DateData} from 'react-native-calendars/src/types';
import {useNavigation} from '@react-navigation/native';
import Container from '../layouts/Container';
import {useSeniorStore} from '../store/senior.store';
import {useActivityScheduleStore} from '../store/activitySchedule.store';
import COLOR from '../constants/color';
import layout from '../constants/layout';
import {deleteActivitySchedule} from '../api/activity'; // API 함수 임포트

// react-native-calendars 한글 설정 (이미 다른 곳에 있다면 중복)
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const ScheduleScreen = () => {
  const navigation = useNavigation();
  const {seniors} = useSeniorStore();
  const {markedDates, schedulesByDate, isLoading, error, fetchSchedules} =
    useActivityScheduleStore();

  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(toYMD(new Date()));

  useEffect(() => {
    if (seniors.length > 0) {
      const seniorId = seniors[0].id;
      fetchSchedules(seniorId);
    }
  }, [seniors, fetchSchedules]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleDelete = async (scheduleId: number) => {
    if (seniors.length === 0) return;
    const seniorId = seniors[0].id;

    Alert.alert('일정 삭제', '정말로 이 일정을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteActivitySchedule(scheduleId);
            Alert.alert('성공', '일정이 삭제되었습니다.');
            await fetchSchedules(seniorId); // 목록 새로고침
          } catch (err) {
            console.error('Error deleting schedule:', err);
            Alert.alert('오류', '일정 삭제 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const schedulesForSelectedDate = schedulesByDate[selectedDate] || [];

  if (seniors.length === 0) {
    return (
      <Container style={styles.centerContainer}>
        <Text>피보호자를 먼저 등록해주세요.</Text>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView>
        <Calendar
          onDayPress={onDayPress}
          monthFormat={'yyyy년 MM월'}
          theme={{
            arrowColor: COLOR.DEFAULT_COLOR,
            todayTextColor: COLOR.DEFAULT_COLOR,
          }}
          dayComponent={({date, state}: any) => {
            const ymd = date?.dateString;
            const isSelected = selectedDate === ymd;
            const hasSchedule = !!schedulesByDate[ymd];
            const disabled = state === 'disabled';

            return (
              <Pressable
                onPress={() => onDayPress(date)}
                style={styles.dayCell}>
                {isSelected ? (
                  <View style={styles.selectedBox}>
                    <Text style={styles.selectedText}>{date.day}</Text>
                    {hasSchedule && <View style={styles.whiteDot} />}
                  </View>
                ) : (
                  <>
                    <Text
                      style={[styles.dayText, disabled && {color: '#CBD5E1'}]}>
                      {date.day}
                    </Text>
                    {hasSchedule && <View style={styles.greenDot} />}
                  </>
                )}
              </Pressable>
            );
          }}
        />

        {/* 일정 추가 버튼 */}
        <View style={styles.plusButtonContainer}>
          <Pressable
            onPress={() => {
              navigation.navigate('ScheduleSettingScreen');
            }}
            style={styles.plusButton}>
            <Text style={styles.plusButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.scheduleContainer}>
          {isLoading && <ActivityIndicator color={COLOR.DEFAULT_COLOR} />}
          {error && <Text>일정을 불러오는 데 실패했습니다.</Text>}
          {!isLoading && !error && (
            <>
              {schedulesForSelectedDate.length > 0 ? (
                schedulesForSelectedDate.map(schedule => (
                  <View key={schedule.id} style={styles.scheduleItem}>
                    <View style={{flex: 1}}>
                      <Text style={styles.scheduleTime}>{schedule.time}</Text>
                      <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                      {schedule.memo && (
                        <Text style={styles.scheduleMemo}>{schedule.memo}</Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => handleDelete(schedule.id)}
                      style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>삭제</Text>
                    </Pressable>
                  </View>
                ))
              ) : (
                <Text style={styles.noScheduleText}>
                  {selectedDate
                    ? '선택한 날짜에 일정이 없습니다.'
                    : '날짜를 선택하여 일정을 확인하세요.'}
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonContainer: {
    marginVertical: 15,
    alignItems: 'flex-start',
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: COLOR.DEFAULT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 40,
  },
  scheduleContainer: {
    marginTop: 10,
  },
  // Calendar day styles (match Medicine calendar)
  dayCell: {
    alignItems: 'center',
    height: 48,
    paddingTop: 4,
  },
  selectedBox: {
    width: 34,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 6,
  },
  selectedText: {color: 'white', fontWeight: '700'},
  whiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginTop: 4,
  },
  dayText: {color: '#111827', fontWeight: '600'},
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 4,
  },
  scheduleItem: {
    backgroundColor: 'white',
    borderRadius: layout.BORDER_RADIUS,
    padding: 15,
    marginBottom: 10,
    borderColor: '#eee',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTime: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 4,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scheduleMemo: {
    fontSize: 14,
    color: '#555',
  },
  noScheduleText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
  deleteButton: {
    borderColor: '#EF4444', // red-500
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.BORDER_RADIUS,
  },
  deleteButtonText: {
    fontWeight: '600',
    color: '#EF4444', // red-500
  },
});

export default ScheduleScreen;
