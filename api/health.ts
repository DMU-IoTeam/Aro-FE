import apiClient from './index';
import {HealthQuestion} from '../store/healthCheck.store';

// Type for the POST/PUT request payload
export interface HealthQuestionPayload {
  questionText: string;
  options: string; // Slash-separated string
}

// API to get all health questions for a senior
export const getHealthQuestions = async (
  seniorId: number,
): Promise<HealthQuestion[]> => {
  const response = await apiClient.get(
    `/api/seniors/${seniorId}/health-questions`,
  );
  // The server sends options as a string, so we need to parse it.
  // Also, the ID from the server might be a number.
  return response.data.map((q: any) => ({
    ...q,
    id: q.id.toString(), // Ensure ID is a string for consistency
    options: (q.options || '')
      .split(',')
      .map((opt: string) => opt.trim())
      .filter((opt: string) => opt.length > 0),
  }));
};

// API to get health answers for a date range
export const getHealthAnswers = async (
  seniorId: number,
  startDate: string,
  endDate: string,
) => {
  console.log(`Fetching health answers for seniorId=${seniorId}, startDate=${startDate}, endDate=${endDate}`);
  const response = await apiClient.get(
    `/api/seniors/${seniorId}/health-answers?startDate=${startDate}&endDate=${endDate}`,
  );
  return response.data;
};

// API to post a new health question
export const postHealthQuestion = async (
  seniorId: number,
  payload: HealthQuestionPayload,
) => {
  console.log('Posting health question with payload:', payload);
  const response = await apiClient.post(
    `/api/health-questions`,
    payload,
  );
  return response.data;
};

// API to update a health question
export const updateHealthQuestion = async (
  questionId: string,
  payload: HealthQuestionPayload,
) => {
  const response = await apiClient.put(
    `/api/health-questions/${questionId}`,
    payload,
  );
  return response.data;
};

// API to delete a health question
export const deleteHealthQuestion = async (questionId: string) => {
  const response = await apiClient.delete(`/api/health-questions/${questionId}`);
  return response.data;
};
