import {create} from 'zustand';
import {
  getMedicationSchedule,
  deleteMedicationSchedule as deleteMedicationScheduleAPI,
  MedicationScheduleResponse,
} from '../api/medication';

// UI 컴포넌트가 사용할 데이터 형태
export interface MedicationItem {
  id: number;
  name: string;
  memo: string;
}

export interface MedicationSchedule {
  id: number; // scheduleId
  time: string; // 12시간제 (e.g., '01:00')
  isAm: boolean;
  userId: number;
  medicine: MedicationItem[];
}

interface MedicationScheduleState {
  schedules: MedicationSchedule[];
  isLoading: boolean;
  error: Error | null;
  fetchSchedule: (seniorId: number) => Promise<void>;
  deleteSchedule: (scheduleId: number) => Promise<void>;
}

// 서버에서 받은 데이터를 UI 형태로 매핑하는 함수
const mapResponseToSchedule = (
  response: MedicationScheduleResponse[],
): MedicationSchedule[] => {
  return response.map(item => {
    const [hourStr, minuteStr] = item.time.split(':');
    let hour = parseInt(hourStr, 10);
    const isAm = hour < 12;

    if (hour === 0) {
      hour = 12; // 00시는 오전 12시
    } else if (hour > 12) {
      hour -= 12; // 13-23시는 오후 1-11시
    }

    const formattedTime = `${String(hour).padStart(2, '0')}:${minuteStr}`;

    return {
      id: item.scheduleId,
      time: formattedTime,
      isAm,
      userId: item.userId,
      medicine: item.items.map(med => ({...med})),
    };
  });
};

export const useMedicationScheduleStore = create<MedicationScheduleState>(
  (set, get) => ({
    schedules: [],
    isLoading: false,
    error: null,
    fetchSchedule: async (seniorId: number) => {
      try {
        set({isLoading: true, error: null});
        const scheduleResponse = await getMedicationSchedule(seniorId);
        const mappedSchedules = mapResponseToSchedule(scheduleResponse);
        set({schedules: mappedSchedules, isLoading: false});
      } catch (e: any) {
        console.error('Error fetching medication schedule:', e);
        set({error: e, isLoading: false});
      }
    },
    deleteSchedule: async (scheduleId: number) => {
      try {
        await deleteMedicationScheduleAPI(scheduleId);
        set(state => ({
          schedules: state.schedules.filter(s => s.id !== scheduleId),
        }));
      } catch (error) {
        console.error(`Error deleting schedule with id ${scheduleId}:`, error);
        // Optionally, re-throw or handle the error in the UI
        throw error;
      }
    },
  }),
);
