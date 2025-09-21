import apiClient from './index';

// 참고: 서버의 실제 데이터 모델에 맞게 수정이 필요합니다.
export interface Senior {
  id: number;
  name: string;
  age: number;
  // 기타 필요한 속성들...
}

/**
 * (관리자용) 모든 노인 목록을 조회합니다.
 */
export const getSeniors = async (): Promise<Senior[]> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요. (예: '/api/v1/seniors')
    const response = await apiClient.get('/seniors');
    return response.data;
  } catch (error) {
    console.error('Error fetching seniors:', error);
    throw error;
  }
};

/**
 * 현재 로그인한 사용자의 노인 목록을 조회합니다.
 */
export const getMySeniors = async (): Promise<Senior[]> => {
  try {
    const response = await apiClient.get<Senior[]>('/api/users/seniors');
    return response.data;
  } catch (error) {
    console.error('Error fetching my seniors:', error);
    throw error;
  }
};

/**
 * 특정 ID의 노인 정보를 조회합니다.
 * @param seniorId - 조회할 노인의 ID
 */
export const getSeniorById = async (seniorId: number): Promise<Senior> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요.
    const response = await apiClient.get(`/seniors/${seniorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching senior with id ${seniorId}:`, error);
    throw error;
  }
};

/**
 * 새로운 노인 정보를 추가합니다.
 * @param seniorData - 추가할 노인의 정보
 */
export const addSenior = async (seniorData: Omit<Senior, 'id'>): Promise<Senior> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요.
    const response = await apiClient.post('/seniors', seniorData);
    return response.data;
  } catch (error) {
    console.error('Error adding senior:', error);
    throw error;
  }
};

/**
 * 기존 노인 정보를 수정합니다.
 * @param seniorId - 수정할 노인의 ID
 * @param seniorData - 수정할 노인의 정보
 */
export const updateSenior = async (seniorId: number, seniorData: Partial<Senior>): Promise<Senior> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요.
    const response = await apiClient.put(`/seniors/${seniorId}`, seniorData);
    return response.data;
  } catch (error) {
    console.error(`Error updating senior with id ${seniorId}:`, error);
    throw error;
  }
};

/**
 * 특정 ID의 노인 정보를 삭제합니다.
 * @param seniorId - 삭제할 노인의 ID
 */
export const deleteSenior = async (seniorId: number): Promise<void> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요.
    await apiClient.delete(`/seniors/${seniorId}`);
  } catch (error) {
    console.error(`Error deleting senior with id ${seniorId}:`, error);
    throw error;
  }
};
