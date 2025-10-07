import {create} from 'zustand';
import {
  getActivitySchedules,
  addActivitySchedule as addActivityScheduleAPI,
  ActivityScheduleResponse,
  AddActivitySchedulePayload,
} from '../api/activity';
import {MarkedDates} from 'react-native-calendars/src/types';

// UI 컴포넌트가 사용할 가공된 데이터 형태
export interface MappedActivitySchedule {
  id: number;
  title: string;
  memo: string;
  time: string; // e.g., '오후 06:00'
}

interface ActivityScheduleState {
  schedules: ActivityScheduleResponse[];
  markedDates: MarkedDates;
  schedulesByDate: {[date: string]: MappedActivitySchedule[]};
  isLoading: boolean;
  error: Error | null;
  fetchSchedules: (seniorId: number) => Promise<void>;
  addSchedule: (payload: AddActivitySchedulePayload) => Promise<void>;
}

// 시간 포맷 변경 함수 (e.g., 18:00 -> 오후 06:00)
const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const isAm = hour24 < 12;
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12; // 0시, 12시는 12로 표시

  const formattedTime = `${isAm ? '오전' : '오후'} ${String(hour12).padStart(
    2,
    '0',
  )}:${String(minute).padStart(2, '0')}`;
  return formattedTime;
};

export const useActivityScheduleStore = create<ActivityScheduleState>((set, get) => ({
  schedules: [],
  markedDates: {},
  schedulesByDate: {},
  isLoading: false,
  error: null,
  fetchSchedules: async (seniorId: number) => {
    try {
      set({isLoading: true, error: null});
      const schedules = await getActivitySchedules(seniorId);

      const newSchedulesByDate: {[date: string]: MappedActivitySchedule[]} = {};
      const newMarkedDates: MarkedDates = {};

      schedules.forEach(schedule => {
        const date = schedule.startTime.split('T')[0]; // YYYY-MM-DD

        if (!newSchedulesByDate[date]) {
          newSchedulesByDate[date] = [];
        }

        newSchedulesByDate[date].push({
          id: schedule.id,
          title: schedule.title,
          memo: schedule.memo,
          time: formatTime(schedule.startTime),
        });

        // 캘린더에 점 표시 (다른 색상 사용)
        newMarkedDates[date] = {marked: true, dotColor: '#34D399'}; // Green color
      });

      set({
        schedules,
        schedulesByDate: newSchedulesByDate,
        markedDates: newMarkedDates,
        isLoading: false,
      });
    } catch (e: any) {
      console.error('Error fetching activity schedules:', e);
      set({error: e, isLoading: false});
    }
  },
  addSchedule: async (payload: AddActivitySchedulePayload) => {
    try {
      await addActivityScheduleAPI(payload);
      // 성공 후, 해당 seniorId로 스케줄을 다시 불러옵니다.
      await get().fetchSchedules(payload.seniorId);
    } catch (error) {
      console.error('Error adding activity schedule:', error);
      throw error;
    }
  },
}));
