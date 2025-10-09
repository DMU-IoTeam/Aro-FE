import {create} from 'zustand';

export interface HealthQuestion {
  id: string;
  text: string;
  optionType: 'default' | 'custom';
  options: string[];
}

export const defaultOptions = ['아주좋음', '좋음', '나쁨', '아주나쁨'];

interface HealthCheckState {
  questions: HealthQuestion[];
  addQuestion: (question: Omit<HealthQuestion, 'id'>) => void;
  updateQuestion: (question: HealthQuestion) => void;
  deleteQuestion: (questionId: string) => void;
}

export const useHealthCheckStore = create<HealthCheckState>(set => ({
  questions: [],
  addQuestion: question =>
    set(state => ({
      questions: [
        {...question, id: Date.now().toString()},
        ...state.questions,
      ],
    })),
  updateQuestion: updatedQuestion =>
    set(state => ({
      questions: state.questions.map(q =>
        q.id === updatedQuestion.id ? updatedQuestion : q,
      ),
    })),
  deleteQuestion: questionId =>
    set(state => ({
      questions: state.questions.filter(q => q.id !== questionId),
    })),
}));
