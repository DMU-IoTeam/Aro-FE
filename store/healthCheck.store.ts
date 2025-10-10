import {create} from 'zustand';
import {
  getHealthQuestions,
  postHealthQuestion,
  updateHealthQuestion,
  deleteHealthQuestion,
  HealthQuestionPayload,
} from '../api/health';
import {useSeniorStore} from './senior.store';

export interface HealthQuestion {
  id: string;
  questionText: string;
  optionType: 'default' | 'custom';
  options: string[];
}

export const defaultOptions = ['아주좋음', '좋음', '나쁨', '아주나쁨'];

interface HealthCheckState {
  questions: HealthQuestion[];
  isLoading: boolean;
  fetchQuestions: () => Promise<void>;
  addQuestion: (question: Omit<HealthQuestion, 'id'>) => Promise<void>;
  updateQuestion: (question: HealthQuestion) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
}

export const useHealthCheckStore = create<HealthCheckState>((set, get) => ({
  questions: [],
  isLoading: false,

  fetchQuestions: async () => {
    const {seniors} = useSeniorStore.getState();
    const seniorId = seniors[0]?.id;
    if (!seniorId) return;

    set({isLoading: true});
    try {
      const questions = await getHealthQuestions(seniorId);
      set({questions, isLoading: false});
    } catch (error) {
      console.error('Failed to fetch health questions:', error);
      set({isLoading: false});
    }
  },

  addQuestion: async question => {
    const {seniors} = useSeniorStore.getState();
    const seniorId = seniors[0]?.id;
    if (!seniorId) return;

    const payload: HealthQuestionPayload = {
      questionText: question.text,
      options: question.options.join(','),
    };
    await postHealthQuestion(seniorId, payload);
    await get().fetchQuestions(); // Refresh list
  },

  updateQuestion: async question => {
    const payload: HealthQuestionPayload = {
      questionText: question.text,
      options: question.options.join(','),
    };
    await updateHealthQuestion(question.id, payload);
    await get().fetchQuestions(); // Refresh list
  },

  deleteQuestion: async questionId => {
    await deleteHealthQuestion(questionId);
    await get().fetchQuestions(); // Refresh list
  },
}));
