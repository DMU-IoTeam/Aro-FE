import apiClient from './index';

// 참고: 서버의 실제 데이터 모델에 맞게 수정이 필요합니다.
export interface Medication {
  id: number;
  name: string;
  time: string; // 예: '09:00', '18:00'
  // 기타 필요한 속성들...
}

/**
 * 특정 노인의 모든 약 복용 스케줄을 조회합니다.
 * @param seniorId - 노인의 ID
 */
export const getMedications = async (seniorId: number): Promise<Medication[]> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요. (예: '/api/v1/seniors/{seniorId}/medications')
    const response = await apiClient.get(`/seniors/${seniorId}/medications`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching medications for senior ${seniorId}:`, error);
    throw error;
  }
};

/**
 * 특정 노인에게 새로운 약 복용 스케줄을 추가합니다.
 * @param seniorId - 노인의 ID
 * @param medicationData - 추가할 약의 정보
 */
export const addMedication = async (seniorId: number, medicationData: Omit<Medication, 'id'>): Promise<Medication> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요.
    const response = await apiClient.post(`/seniors/${seniorId}/medications`, medicationData);
    return response.data;
  } catch (error) {
    console.error(`Error adding medication for senior ${seniorId}:`, error);
    throw error;
  }
};

/**
 * 특정 약 복용 스케줄을 수정합니다.
 * @param medicationId - 수정할 약 스케줄의 ID
 * @param medicationData - 수정할 약의 정보
 */
export const updateMedication = async (medicationId: number, medicationData: Partial<Medication>): Promise<Medication> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요. (예: '/api/v1/medications/{medicationId}')
    const response = await apiClient.put(`/medications/${medicationId}`, medicationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating medication with id ${medicationId}:`, error);
    throw error;
  }
};

/**
 * 특정 약 복용 스케줄을 삭제합니다.
 * @param medicationId - 삭제할 약 스케줄의 ID
 */
export const deleteMedication = async (medicationId: number): Promise<void> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요.
    await apiClient.delete(`/medications/${medicationId}`);
  } catch (error) {
    console.error(`Error deleting medication with id ${medicationId}:`, error);
    throw error;
  }
};
