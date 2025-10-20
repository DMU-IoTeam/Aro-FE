import {create} from 'zustand';
import {
  getActivitySchedules,
  addActivitySchedule as addActivityScheduleAPI,
  ActivityScheduleResponse,
  AddActivitySchedulePayload,
  UpdateActivitySchedulePayload,
  updateActivitySchedule as updateActivityScheduleAPI,
} from '../api/activity';
import {MarkedDates} from 'react-native-calendars/src/types';

// UI 컴포넌트가 사용할 가공된 데이터 형태
export interface MappedActivitySchedule {
  id: number;
  title: string;
  memo: string;
  time: string; // e.g., '오후 06:00'
  startTimeISO: string;
}

interface ActivityScheduleState {
  schedules: ActivityScheduleResponse[];
  markedDates: MarkedDates;
  schedulesByDate: {[date: string]: MappedActivitySchedule[]};
  isLoading: boolean;
  error: Error | null;
  fetchSchedules: (seniorId: number) => Promise<void>;
  addSchedule: (payload: AddActivitySchedulePayload) => Promise<void>;
  updateSchedule: (
    scheduleId: number,
    payload: UpdateActivitySchedulePayload,
  ) => Promise<void>;
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

const buildScheduleMaps = (
  schedules: ActivityScheduleResponse[],
): {
  schedulesByDate: {[date: string]: MappedActivitySchedule[]};
  markedDates: MarkedDates;
} => {
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
      memo: schedule.memo ?? '',
      time: formatTime(schedule.startTime),
      startTimeISO: schedule.startTime,
    });

    newMarkedDates[date] = {marked: true, dotColor: '#34D399'};
  });

  return {schedulesByDate: newSchedulesByDate, markedDates: newMarkedDates};
};

const createFallbackSchedules = (
  seniorId: number,
): ActivityScheduleResponse[] => {
  const createIso = (offsetDays: number, hours: number, minutes: number) => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + offsetDays);
    base.setHours(hours, minutes, 0, 0);
    return base.toISOString();
  };

  return [
    {
      id: -1,
      seniorId,
      title: '병원 진료',
      memo: '10시까지 도착',
      startTime: createIso(0, 10, 0),
    },
    {
      id: -2,
      seniorId,
      title: '가족 방문',
      memo: '집에서 점심 식사',
      startTime: createIso(1, 12, 30),
    },
    {
      id: -3,
      seniorId,
      title: '산책',
      memo: '저녁 식사 후 30분',
      startTime: createIso(2, 18, 0),
    },
  ];
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
      const {schedulesByDate, markedDates} = buildScheduleMaps(schedules);

      set({
        schedules,
        schedulesByDate,
        markedDates,
        isLoading: false,
      });
    } catch (e: any) {
      console.error('Error fetching activity schedules:', e);
      const fallbackSchedules = createFallbackSchedules(seniorId);
      const {schedulesByDate, markedDates} = buildScheduleMaps(fallbackSchedules);

      set({
        schedules: fallbackSchedules,
        schedulesByDate,
        markedDates,
        isLoading: false,
        error: null,
      });
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
  updateSchedule: async (
    scheduleId: number,
    payload: UpdateActivitySchedulePayload,
  ) => {
    try {
      await updateActivityScheduleAPI(scheduleId, payload);
      await get().fetchSchedules(payload.seniorId);
    } catch (error) {
      console.error('Error updating activity schedule:', error);
      throw error;
    }
  },
}));
