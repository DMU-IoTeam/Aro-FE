import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Calendar,
  LocaleConfig,
  CalendarUtils,
  DateData,
} from 'react-native-calendars';
import Container from '../layouts/Container';
import {useSeniorStore} from '../store/senior.store';
import {useHealthAnswerStore} from '../store/healthAnswer.store';
import COLOR from '../constants/color';
import layout from '../constants/layout';

// react-native-calendars 한글 설정 (중복되지만, 독립적인 화면을 위해 포함)
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
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const getMonthDateRange = (dateString: string) => {
  const date = new Date(dateString);
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    startDate: CalendarUtils.getCalendarDateString(startDate),
    endDate: CalendarUtils.getCalendarDateString(endDate),
  };
};

const HealthCheckCalendarScreen = () => {
  const {seniors} = useSeniorStore();
  const {
    markedDates,
    answersByDate,
    isLoading,
    fetchAnswers,
  } = useHealthAnswerStore();

  const [selectedDate, setSelectedDate] = useState(
    CalendarUtils.getCalendarDateString(new Date()),
  );

  const fetchAllData = (date: string) => {
    if (seniors.length > 0) {
      const seniorId = seniors[0].id;
      const {startDate, endDate} = getMonthDateRange(date);
      fetchAnswers(seniorId, startDate, endDate);
    }
  };

  useEffect(() => {
    fetchAllData(selectedDate);
  }, [seniors]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const onMonthChange = (month: DateData) => {
    fetchAllData(month.dateString);
  };

  const healthAnswers = answersByDate[selectedDate] || [];

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
          onMonthChange={onMonthChange}
          monthFormat={'yyyy년 MM월'}
          theme={{
            arrowColor: COLOR.DEFAULT_COLOR,
            todayTextColor: COLOR.DEFAULT_COLOR,
          }}
        />

        <View style={styles.logContainer}>
          {isLoading && <ActivityIndicator color={COLOR.DEFAULT_COLOR} />}

          {!isLoading && healthAnswers.length === 0 && (
            <Text style={styles.noLogText}>
              선택한 날짜에 건강 답변 기록이 없습니다.
            </Text>
          )}

          {healthAnswers.length > 0 && (
            <View style={styles.logSection}>
              <Text style={styles.sectionTitle}>건강 답변 기록</Text>
              {healthAnswers.map((answer, index) => (
                <View key={`health-${index}`} style={styles.logItem}>
                  <Text style={styles.questionText}>
                    Q: {answer.questionText}
                  </Text>
                  <Text style={styles.answerText}>A: {answer.answerText}</Text>
                </View>
              ))}
            </View>
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
  logSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logItem: {
    backgroundColor: 'white',
    borderRadius: layout.BORDER_RADIUS,
    padding: 15,
    marginBottom: 10,
    borderColor: '#eee',
    borderWidth: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  answerText: {
    fontSize: 16,
    color: COLOR.DEFAULT_COLOR,
    fontWeight: 'bold',
  },
  noLogText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default HealthCheckCalendarScreen;
