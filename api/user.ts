import apiClient from './index';

// 참고: 서버의 실제 User 모델에 맞게 수정이 필요합니다.
export interface User {
  email: string;
  name: string;
  role: 'GUARDIAN' | 'ADMIN';
  // 기타 필요한 속성들...
}

/**
 * 현재 로그인된 사용자의 정보를 조회합니다. (토큰 유효성 검증용)
 */
export const getMe = async (): Promise<User> => {
  // apiClient에 설정된 인터셉터가 자동으로 헤더에 토큰을 추가해줍니다.
  const response = await apiClient.get<User>('/api/users/me');
  console.log(response);
  return response.data;
};
