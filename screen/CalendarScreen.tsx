import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import type {DateData} from 'react-native-calendars/src/types';
import Container from '../layouts/Container';
import {useSeniorStore} from '../store/senior.store';
import {useCalendarStore} from '../store/calendar.store';
import COLOR from '../constants/color';
import layout from '../constants/layout';

// react-native-calendars 한글 설정
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
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: "오늘",
};
LocaleConfig.defaultLocale = 'ko';

const CalendarScreen = () => {
  const {seniors} = useSeniorStore();
  const {markedDates, logsByDate, isLoading, error, fetchCalendarData} =
    useCalendarStore();

  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (seniors.length > 0) {
      const seniorId = seniors[0].id;
      fetchCalendarData(seniorId);
    }
  }, [seniors, fetchCalendarData]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const logsForSelectedDate = logsByDate[selectedDate] || [];

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

        <View style={styles.logContainer}>
          {isLoading && <ActivityIndicator color={COLOR.DEFAULT_COLOR} />}
          {error && <Text>기록을 불러오는 데 실패했습니다.</Text>}
          {!isLoading && !error && (
            <>
              {logsForSelectedDate.length > 0 ? (
                logsForSelectedDate.map(log => (
                  <View key={log.logId} style={styles.logItem}>
                    <Text style={styles.logTime}>{log.scheduleTime}</Text>
                    {log.medicines.map(med => (
                      <View key={med.id} style={styles.medicineItem}>
                        <Text style={styles.medicineName}>{med.name}</Text>
                        {med.memo && (
                          <Text style={styles.medicineMemo}>{med.memo}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.noLogText}>
                  {selectedDate ? '선택한 날짜에 복약 기록이 없습니다.' : '날짜를 선택하여 복약 기록을 확인하세요.'}
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
  logContainer: {
    marginTop: 20,
    paddingHorizontal: layout.HORIZONTAL_PADDING,
  },
  logItem: {
    backgroundColor: 'white',
    borderRadius: layout.BORDER_RADIUS,
    padding: 15,
    marginBottom: 10,
    borderColor: '#eee',
    borderWidth: 1,
  },
  logTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLOR.DEFAULT_COLOR,
  },
  medicineItem: {
    marginLeft: 10,
    marginBottom: 5,
  },
  medicineName: {
    fontSize: 16,
  },
  medicineMemo: {
    fontSize: 14,
    color: 'gray',
  },
  noLogText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default CalendarScreen;