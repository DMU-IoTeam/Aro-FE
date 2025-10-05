import {create} from 'zustand';
import {
  getMySeniors,
  registerSenior as registerSeniorAPI,
  Senior,
  RegisterSeniorPayload,
} from '../api/senior';
import {Asset} from 'react-native-image-picker';

const dummySeniors: Senior[] = [
  {
    id: 1,
    name: '김춘자 (더미)',
    birthDate: '1945-05-20',
    medicalHistory: '고혈압, 당뇨',
    gender: '여성',
    address: '서울시 강남구',
    bloodType: 'A+',
    profileImage: 'https://example.com/dummy-image.jpg', // 예시 이미지 URL
  },
];

const initialFormData: Omit<RegisterSeniorPayload, 'profileImage'> = {
  name: '',
  birthDate: '',
  gender: '',
  address: '',
  medicalHistory: '',
  bloodType: '',
};

type FormField = keyof typeof initialFormData;
type FormData = Omit<RegisterSeniorPayload, 'profileImage'>;

interface SeniorState {
  seniors: Senior[];
  isLoading: boolean;
  error: Error | null;
  formData: FormData;
  imageSource: Asset | null; // 새로 선택된 이미지 파일 정보
  displayImageUri: string | null; // 화면에 표시될 이미지 URI
  fetchSeniors: () => Promise<void>;
  registerSenior: (payload: FormData) => Promise<void>;
  setFormData: (field: FormField, value: string) => void;
  setFullFormData: (data: FormData) => void;
  setImageSource: (image: Asset | null) => void;
  setDisplayImageUri: (uri: string | null) => void;
  clearForm: () => void;
}

export const useSeniorStore = create<SeniorState>((set, get) => ({
  seniors: [],
  isLoading: true,
  error: null,
  formData: initialFormData,
  imageSource: null,
  displayImageUri: null,
  fetchSeniors: async () => {
    try {
      set({isLoading: true, error: null});
      const fetchedSeniors = await getMySeniors();
      set({seniors: fetchedSeniors, isLoading: false});
    } catch (e: any) {
      console.error('Error fetching seniors, loading dummy data:', e);
      set({seniors: dummySeniors, isLoading: false, error: e});
    }
  },
  registerSenior: async (payload: globalThis.FormData) => {
    try {
      await registerSeniorAPI(payload);
      await get().fetchSeniors(); // Re-fetch after registration
    } catch (error) {
      console.error('Error registering senior in store:', error);
      throw error; // Re-throw to be caught in the component
    }
  },
  setFormData: (field, value) =>
    set(state => ({
      formData: {...state.formData, [field]: value},
    })),
  setFullFormData: data => set({formData: data}),
  setImageSource: image =>
    set({imageSource: image, displayImageUri: image?.uri || null}),
  setDisplayImageUri: uri => set({displayImageUri: uri}),
  clearForm: () =>
    set({formData: initialFormData, imageSource: null, displayImageUri: null}),
}));
