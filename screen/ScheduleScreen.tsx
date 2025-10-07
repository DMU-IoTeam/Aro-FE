import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import type {DateData} from 'react-native-calendars/src/types';
import {useNavigation} from '@react-navigation/native';
import Container from '../layouts/Container';
import {useSeniorStore} from '../store/senior.store';
import {useActivityScheduleStore} from '../store/activitySchedule.store';
import COLOR from '../constants/color';
import layout from '../constants/layout';

// react-native-calendars 한글 설정 (이미 다른 곳에 있다면 중복)
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  monthNamesShort: [
    '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const ScheduleScreen = () => {
  const navigation = useNavigation();
  const {seniors} = useSeniorStore();
  const {
    markedDates,
    schedulesByDate,
    isLoading,
    error,
    fetchSchedules,
  } = useActivityScheduleStore();

  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (seniors.length > 0) {
      const seniorId = seniors[0].id;
      fetchSchedules(seniorId);
    }
  }, [seniors, fetchSchedules]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
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
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: COLOR.DEFAULT_COLOR,
            },
          }}
          onDayPress={onDayPress}
          monthFormat={'yyyy년 MM월'}
          theme={{
            arrowColor: COLOR.DEFAULT_COLOR,
            todayTextColor: COLOR.DEFAULT_COLOR,
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
                    <Text style={styles.scheduleTime}>{schedule.time}</Text>
                    <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                    {schedule.memo && (
                      <Text style={styles.scheduleMemo}>{schedule.memo}</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noScheduleText}>
                  {selectedDate ? '선택한 날짜에 일정이 없습니다.' : '날짜를 선택하여 일정을 확인하세요.'}
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
  scheduleItem: {
    backgroundColor: 'white',
    borderRadius: layout.BORDER_RADIUS,
    padding: 15,
    marginBottom: 10,
    borderColor: '#eee',
    borderWidth: 1,
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
});

export default ScheduleScreen;
