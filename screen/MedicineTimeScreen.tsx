import React, {useEffect} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMedicationScheduleStore} from '../store/medicationSchedule.store';
import {useSeniorStore} from '../store/senior.store';
import COLOR from '../constants/color';
import Container from '../layouts/Container';
import layout from '../constants/layout';
import {MedicationItem} from '../store/medicationSchedule.store';

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

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
      {/* 요일 (현재는 UI 표시용) */}
      <View style={{flexDirection: 'row'}}>
        {days.map((item, index) => (
          <View
            key={index}
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 24}}>{item}</Text>
            <View
              style={[
                styles.dayContainer,
                {backgroundColor: index === 2 ? COLOR.DEFAULT_COLOR : '#eee'},
              ]}>
              <Text style={{fontSize: 24, color: index === 2 ? 'white' : 'black'}}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            </View>
          </View>
        ))}
        <Pressable onPress={()=>{navigation.navigate('CalendarScreen')}}><Text>캘린더</Text></Pressable>
      </View>

      {/* 복약 일정 추가 버튼 */}
      <View style={{marginTop: 8, marginBottom: 14}}>
        <Pressable
          onPress={() => {
            navigation.navigate('MedicineTimeSettingScreen');
          }}
          style={styles.plusButton}>
          <Text style={styles.plusButtonText}>+</Text>
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
            onDelete={handleDelete}
          />
        )}
        keyExtractor={item => item.id.toString()}
      />
    </Container>
  );
};

type MedicineScheduleItemProps = {
  scheduleId: number;
  time: string;
  isAm: boolean;
  medicine: MedicationItem[];
  onDelete: (scheduleId: number) => void;
};

export const MedicineScheduleItem = ({
  scheduleId,
  time,
  isAm,
  medicine,
  onDelete,
}: MedicineScheduleItemProps) => {
  return (
    <View style={styles.itemContainer}>
      {/* 시간 및 삭제 버튼 */}
      <View style={styles.timeHeader}>
        <View style={{flexDirection: 'row', alignItems: 'flex-end', gap: 8}}>
          <Text style={{fontSize: 24, lineHeight: 24}}>{time}</Text>
          <Text style={{fontSize: 16}}>{isAm ? '오전' : '오후'}</Text>
        </View>
        <Pressable onPress={() => onDelete(scheduleId)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </Pressable>
      </View>
      {/* 약 목록 */}
      <View style={{gap: 8, paddingHorizontal: 5, paddingVertical: 8}}>
        {medicine.map(item => (
          <View style={styles.medicineItem} key={item.id}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18, lineHeight: 18}}>{item.name}</Text>
              {item.memo && (
                <Text style={{fontSize: 14, color: 'gray', marginTop: 4}}>
                  {item.memo}
                </Text>
              )}
            </View>
          </View>
        ))}
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
  itemContainer: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
  },
  timeHeader: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    gap: 8,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444', // red-500
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  medicineItem: {
    flexDirection: 'row',
    gap: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    borderRadius: 5,
  },
});

export default MedicineTimeScreen;
