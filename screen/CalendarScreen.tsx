import {Pressable, Text, View} from 'react-native';
import Container from '../layouts/Container';
import {useState} from 'react';
import COLOR from '../constants/color';
import layout from '../constants/layout';
import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {medicineData} from '../assets/data/medicineData';

const CalendarScreen = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const [currentDate, setCurrentDate] = useState(new Date());

  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());

  // 현재 달의 첫 날
  const firstDayOfMonth = new Date(year, month, 1);
  // 달력 시작 날짜를 현재 달의 첫 날의 주의 일요일로 설정
  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(1 - firstDayOfMonth.getDay());

  // 현재 달의 마지막 날
  const lastDayOfMonth = new Date(year, month + 1, 0);
  // 달력 끝 날짜를 현재 달의 마지막 날의 주의 토요일로 설정
  const endDay = new Date(lastDayOfMonth);
  endDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

  /** startDay부터 endDay까지의 날짜를 주 단위로 그룹화하는 함수 */
  const groupDatesByWeek = (startDay, endDay) => {
    const weeks = []; // 최종적으로 주 단위로 그룹화된 날짜 배열들을 저장할 배열
    let currentWeek = []; // 현재 처리 중인 주를 나타내는 배열
    let currentDate = new Date(startDay); // 반복 처리를 위한 현재 날짜 변수, 시작 날짜로 초기화

    // 시작 날짜부터 끝 날짜까지 반복
    while (currentDate <= endDay) {
      // 배열로 push 한 건 현재 달과 전 달 다음 달 구분을 위해 넣음
      //   1번 인덱스에 0을 넣어 전 달 구분
      currentWeek.push([new Date(currentDate), 0]); // 현재 날짜를 현재 주에 추가
      // 현재 주가 7일을 모두 채웠거나 현재 날짜가 토요일인 경우
      if (currentWeek.length === 7 || currentDate.getDay() === 6) {
        weeks.push(currentWeek); // 완성된 주를 weeks 배열에 추가
        currentWeek = []; // 새로운 주를 시작하기 위해 currentWeek을 재초기화
      }
      currentDate.setDate(currentDate.getDate() + 1); // 현재 날짜를 다음 날로 변경
    }

    // 첫 주 처리(전 달 보이게)
    // console.log(weeks[0])
    if (weeks[0].length < 7) {
      let tempDate = 0;
      while (weeks[0].length !== 7) {
        // 배열로 push 한 건 현재 달과 전 달 다음 달 구분을 위해 넣음
        weeks[0] = [[new Date(year, month, tempDate), 1], ...weeks[0]];
        tempDate--;
      }
    }

    // 마지막 주 처리 (만약 남아있다면)
    if (currentWeek.length > 0) {
      // 다음 달 날짜까지
      let tempDate = 1;
      while (currentWeek.length !== 7) {
        // 배열로 push 한 건 현재 달과 전 달 다음 달 구분을 위해 넣음
        if (month > 11) {
          currentWeek.push([new Date(year + 1, 0, tempDate), 1]);
        } else {
          currentWeek.push([new Date(year, month + 1, tempDate), 1]);
        }
        tempDate++;
      }
      weeks.push(currentWeek); // 남아 있는 날짜가 있다면 마지막 주로 weeks에 추가
    }

    return weeks; // 주 단위로 그룹화된 날짜 배열들을 반환
  };

  // 이전 달로 이동
  const handlePrevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    setCurrentDate(newDate);
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth());
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    setCurrentDate(newDate);
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth());
  };

  // 년월일 추출 함수
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getYearMonthDate = date => {
    const year = date.getYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${String(month).padStart(2, '0')}-${day}`;
  };

  return (
    <Container>
      {/* 년월~ */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          marginBottom: 12,
        }}>
        <Pressable
          onPress={() => {
            handlePrevMonth();
          }}>
          <FontAwesomeIcon icon={faChevronLeft} size={24} />
        </Pressable>

        <Text style={{fontSize: 28}}>{`${year}.${String(month + 1).padStart(
          2,
          '0',
        )}`}</Text>

        <Pressable
          onPress={() => {
            handleNextMonth();
          }}>
          <FontAwesomeIcon icon={faChevronRight} size={24} />
        </Pressable>
      </View>
      {/* 요일~ */}
      <View style={{flexDirection: 'row', marginBottom: 8}}>
        {days.map((item, index) => {
          return (
            <View
              key={index}
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: 24}}>{item}</Text>
            </View>
          );
        })}
      </View>

      {/* 일~ */}
      {groupDatesByWeek(firstDayOfMonth, lastDayOfMonth).map((weeks, index) => {
        return (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginBottom: 12,
            }}>
            {weeks.map((week, index) => {
              return (
                <Pressable
                  key={index}
                  style={{
                    borderRadius: layout.BORDER_RADIUS,
                    // backgroundColor: '#eee',
                    backgroundColor: isSameDay(week[0], currentDate)
                      ? COLOR.DEFAULT_COLOR
                      : '#eee',
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                    opacity: week[1] == 1 ? 0.2 : 1,
                  }}
                  onPress={() => {
                    const selectedDate = week[0];
                    const selectedMonth = selectedDate.getMonth();
                    const selectedYear = selectedDate.getFullYear();

                    setCurrentDate(selectedDate);

                    // 전 달 날짜 선택 시
                    if (
                      selectedYear < year ||
                      (selectedYear === year && selectedMonth < month)
                    ) {
                      setYear(selectedYear);
                      setMonth(selectedMonth);
                    }

                    // 다음 달 날짜 선택 시
                    if (
                      selectedYear > year ||
                      (selectedYear === year && selectedMonth > month)
                    ) {
                      setYear(selectedYear);
                      setMonth(selectedMonth);
                    }
                  }}>
                  <Text
                    style={{
                      fontSize: 24,
                      color: isSameDay(week[0], currentDate)
                        ? 'white'
                        : 'black',
                    }}>
                    {String(week[0].getDate()).padStart(2, '0')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}
      {/* 
      {medicineData?.getYearMonthDate(currentDate) && (
        <View>
          <Text>hi</Text>
        </View>
      )} */}
    </Container>
  );
};

export default CalendarScreen;
