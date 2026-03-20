import apiClient, {API_BASE_URL} from './index';

export interface UploadPhotoPayload {
  uri: string;
  type: string;
  name: string;
  caption: string;
  distractorOptions: string;
}

export interface SeniorPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  distractorOptions: string[];
  createdAt?: string;
}

const normalizeImageUrl = (value: string): string => {
  if (!value) {
    return value;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const base = API_BASE_URL ?? apiClient.defaults.baseURL ?? '';
  if (!base) {
    return value;
  }
  const trimmedBase = base.replace(/\/$/, '');
  const normalizedPath = value.replace(/^\//, '');
  return `${trimmedBase}/${normalizedPath}`;
};

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

export const getSeniorPhotos = async (seniorId: number): Promise<SeniorPhoto[]> => {
  try {
    const response = await apiClient.get(`/api/seniors/${seniorId}/photos`);
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((item: any) => ({
      id: String(item.id ?? ''),
      imageUrl: normalizeImageUrl(item.imageUrl ?? item.url ?? ''),
      caption: item.caption ?? '',
      distractorOptions: typeof item.distractorOptions === 'string'
        ? item.distractorOptions
            .split(',')
            .map((opt: string) => opt.trim())
            .filter((opt: string) => opt.length > 0)
        : Array.isArray(item.distractorOptions)
        ? item.distractorOptions
            .map((opt: any) => String(opt ?? '').trim())
            .filter((opt: string) => opt.length > 0)
        : [],
      createdAt: item.createdAt,
    }));
  } catch (error) {
    console.error(`Error fetching photos for senior ${seniorId}:`, error);
    throw error;
  }
};
