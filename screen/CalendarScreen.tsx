import React, {useEffect, useMemo, useState} from 'react';
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
import Container from '../layouts/Container';
import {useSeniorStore} from '../store/senior.store';
import {useCalendarStore} from '../store/calendar.store';
import COLOR from '../constants/color';
import layout from '../constants/layout';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPills, faCheck} from '@fortawesome/free-solid-svg-icons';

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
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatKoreanMD = (ymd: string) => {
  if (!ymd) return '';
  const [, m, d] = ymd.split('-');
  return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
};

const CalendarScreen = () => {
  const {seniors} = useSeniorStore();
  const {markedDates, logsByDate, isLoading, error, fetchCalendarData} =
    useCalendarStore();

  const [selectedDate, setSelectedDate] = useState(toYMD(new Date()));

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
  const flatMeds = useMemo(
    () =>
      logsForSelectedDate.flatMap(l =>
        l.medicines.map(m => ({id: m.id, name: m.name, memo: m.memo})),
      ),
    [logsForSelectedDate],
  );

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
            const hasLog = !!logsByDate[ymd];
            const disabled = state === 'disabled';

            return (
              <Pressable onPress={() => onDayPress(date)} style={styles.dayCell}>
                {isSelected ? (
                  <View style={styles.selectedBox}>
                    <Text style={styles.selectedText}>{date.day}</Text>
                    {hasLog && <View style={styles.whiteDot} />}
                  </View>
                ) : (
                  <>
                    <Text
                      style={[
                        styles.dayText,
                        disabled && {color: '#CBD5E1'},
                      ]}>
                      {date.day}
                    </Text>
                    {hasLog && <View style={styles.greenDot} />}
                  </>
                )}
              </Pressable>
            );
          }}
        />

        <View style={styles.logContainer}>
          {isLoading && <ActivityIndicator color={COLOR.DEFAULT_COLOR} />}
          {error && <Text>기록을 불러오는 데 실패했습니다.</Text>}
          {!isLoading && !error && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {formatKoreanMD(selectedDate)} 복약 내역
                </Text>
                {flatMeds.length > 0 && (
                  <View style={styles.doneBadge}>
                    <Text style={styles.doneBadgeText}>복약 완료</Text>
                  </View>
                )}
              </View>

              {flatMeds.length > 0 ? (
                flatMeds.map((item, index) => (
                  <View key={`${index}`} style={styles.medicineCard}>
                    <View style={styles.medIconCircle}>
                      <FontAwesomeIcon icon={faPills} size={18} color="#FFFFFF" />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.medName}>{item.name}</Text>
                      <Text style={styles.medMemo}>{item.memo || '메모 없음'}</Text>
                    </View>
                    <View style={styles.checkCircle}>
                      <FontAwesomeIcon icon={faCheck} size={12} color="#FFFFFF" />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noLogText}>선택한 날짜에 복약 기록이 없습니다.</Text>
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
  logContainer: {marginTop: 16},
  dayCell: {
    alignItems: 'center',
    height: 48,
  },
  selectedBox: {
    width: 34,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  selectedText: {
    color: 'white',
    fontWeight: '700',
  },
  whiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginTop: 4,
  },
  dayText: {
    color: '#111827',
    fontWeight: '600',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  doneBadge: {
    backgroundColor: '#E9FCEB',
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadgeText: {color: '#16A34A', fontWeight: '700', fontSize: 12},
  medicineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 10,
  },
  medIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {fontSize: 16, fontWeight: '700', color: '#111827'},
  medMemo: {fontSize: 12, color: '#6B7280', marginTop: 2},
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noLogText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default CalendarScreen;
