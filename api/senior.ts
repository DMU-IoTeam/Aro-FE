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
    const response = await apiClient.get('/api/users/seniors');
    console.log(response);
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

export interface RegisterSeniorPayload {
  name: string;
  birthDate: string;
  gender: string;
  address: string;
  medicalHistory: string;
  bloodType: string;
  profileImage: string;
}

/**
 * 새로운 보호 대상자(노인)를 등록합니다.
 */
export const registerSenior = async (
  payload: FormData,
): Promise<Senior> => {
  console.log(payload)
  console.log(process.env.REACT_APP_API_BASE_URL)
  try {
    const response = await apiClient.post<Senior>(
      '/api/users/register-senior',
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error registering senior:', error);
    throw error;
  }
};
