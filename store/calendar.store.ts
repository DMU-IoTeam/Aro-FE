import {create} from 'zustand';
import {getMedicationLog, MedicationLogResponse} from '../api/medication';
import {
  useMedicationScheduleStore,
  MedicationSchedule,
  MedicationItem,
} from './medicationSchedule.store';
import {MarkedDates} from 'react-native-calendars/src/types';

// 캘린더에 표시될 가공된 로그 데이터 형태
export interface MappedLog {
  logId: number;
  confirmedAt: string; // 복용 완료 시간
  scheduleTime: string; // 예정 시간 (e.g., '오전 09:00')
  medicines: MedicationItem[];
}

interface CalendarState {
  logs: MedicationLogResponse[];
  markedDates: MarkedDates;
  logsByDate: {[date: string]: MappedLog[]};
  isLoading: boolean;
  error: Error | null;
  fetchCalendarData: (seniorId: number) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  logs: [],
  markedDates: {},
  logsByDate: {},
  isLoading: false,
  error: null,
  fetchCalendarData: async (seniorId: number) => {
    try {
      set({isLoading: true, error: null});

      // 1. 스케줄 정보 가져오기 (다른 스토어에서)
      const schedules = useMedicationScheduleStore.getState().schedules;
      if (schedules.length === 0) {
        // 스케줄이 없으면 로그를 매핑할 수 없으므로 에러 처리 또는 빈 상태로 설정
        console.warn('No schedules found to map logs.');
      }

      // 스케줄 ID로 쉽게 찾기 위한 맵 생성
      const scheduleMap = new Map<number, MedicationSchedule>(
        schedules.map(s => [s.id, s]),
      );

      // 2. 복약 기록 API 호출
      const logs = await getMedicationLog(seniorId);
      console.log('Fetched logs:', logs);
      // 3. 데이터 가공 및 매핑
      const newLogsByDate: {[date: string]: MappedLog[]} = {};
      const newMarkedDates: MarkedDates = {};

      logs.forEach(log => {
        const schedule = scheduleMap.get(log.scheduleId);
        if (!schedule) return; // 해당하는 스케줄이 없으면 건너뛰기

        const date = log.confirmedAt.split('T')[0]; // YYYY-MM-DD

        if (!newLogsByDate[date]) {
          newLogsByDate[date] = [];
        }

        newLogsByDate[date].push({
          logId: log.logId,
          confirmedAt: log.confirmedAt,
          scheduleTime: `${schedule.isAm ? '오전' : '오후'} ${schedule.time}`,
          medicines: schedule.medicine,
        });

        // 캘린더에 점 표시
        newMarkedDates[date] = {marked: true, dotColor: '#FF7E1B'};
      });

      set({
        logs,
        logsByDate: newLogsByDate,
        markedDates: newMarkedDates,
        isLoading: false,
      });
    } catch (e: any) {
      console.error('Error fetching calendar data:', e);
      set({error: e, isLoading: false});
    }
  },
}));
