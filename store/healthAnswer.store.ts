import {create} from 'zustand';
import {getHealthAnswers} from '../api/health';
import {MarkedDates} from 'react-native-calendars/src/types';
import {useSeniorStore} from './senior.store';

export interface HealthAnswer {
  questionId: number;
  questionText: string;
  answerText: string;
  checkDate: string;
}

interface HealthAnswerState {
  answersByDate: {[date: string]: HealthAnswer[]};
  markedDates: MarkedDates;
  isLoading: boolean;
  fetchAnswers: (startDate: string, endDate: string) => Promise<void>;
}

export const useHealthAnswerStore = create<HealthAnswerState>((set, get) => ({
  answersByDate: {},
  markedDates: {},
  isLoading: false,
  fetchAnswers: async (startDate, endDate) => {
    const {seniors} = useSeniorStore.getState();
    const seniorId = seniors[0]?.id;
    if (!seniorId) return;

    set({isLoading: true});
    try {
      const answers: HealthAnswer[] = await getHealthAnswers(
        seniorId,
        startDate,
        endDate,
      );

      const newAnswersByDate: {[date: string]: HealthAnswer[]} = {};
      const newMarkedDates: MarkedDates = {};

      answers.forEach(answer => {
        const date = answer.checkDate;
        if (!newAnswersByDate[date]) {
          newAnswersByDate[date] = [];
        }
        newAnswersByDate[date].push(answer);
        // Use a blue dot for health answers
        newMarkedDates[date] = {marked: true, dotColor: '#007BFF'};
      });

      set({
        answersByDate: newAnswersByDate,
        markedDates: newMarkedDates,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch health answers:', error);
      set({isLoading: false});
    }
  },
}));
