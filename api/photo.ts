import apiClient from './index';

export interface UploadPhotoPayload {
  uri: string;
  type: string;
  name: string;
  caption: string;
  distractorOptions: string;
}

export const uploadPhoto = async (payload: UploadPhotoPayload): Promise<void> => {
  const formData = new FormData();

  formData.append('caption', payload.caption);
  formData.append('distractorOptions', payload.distractorOptions);
  console.log('Payload URI:', payload);
  // 파일 확장자에 따라 type 지정
  const fileType =
    payload.type ||
    (payload.uri.endsWith('.png') ? 'image/png' : 'image/jpeg');

  formData.append('image', {
    uri: payload.uri,
    name: payload.name, // 예: "photo.jpg"
    type: fileType,
  });

  console.log('Uploading photo with payload:', formData);
    
  try {
    await apiClient.post('/api/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};
