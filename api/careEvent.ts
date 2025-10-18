import apiClient, {API_BASE_URL} from './index';

export interface CareEventClip {
  id: number;
  videoUrl: string;
  duration: number;
  recordedAt: string;
}

export const fetchCareEventClips = async (
  careEventId: string,
): Promise<CareEventClip[]> => {
  const response = await apiClient.get<CareEventClip[]>(
    `/api/care-events/${careEventId}/clips`,
  );
  const clips = response.data ?? [];
  const normalizeUrl = (url: string) => {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    const rawBase = API_BASE_URL ?? apiClient.defaults.baseURL ?? '';
    if (!rawBase) {
      return url;
    }
    const trimmedBase = rawBase.replace(/\/$/, '');
    const normalizedPath = url.replace(/^\//, '');
    return `${trimmedBase}/${normalizedPath}`;
  };

  return clips.map(clip => ({
    ...clip,
    videoUrl: normalizeUrl(clip.videoUrl),
  }));
};
