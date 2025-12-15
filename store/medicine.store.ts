import {create} from 'zustand';

interface Medicine {
  name: string;
  taking: boolean;
}

interface MedicineTime {
  id: number;
  time: string;
  isAm: boolean;
  medicine: Medicine[];
}

interface MedicineTimeState {
  medicineTime: MedicineTime[];
  toggleMedicineTaking: (id: number, medicineName: string) => void;
  removeMedicineTime: (id: number) => void;
}

export const useMedicineTimeStore = create<MedicineTimeState>(set => ({
  medicineTime: [
    {
      id: 1,
      time: '06:00',
      isAm: true,
      medicine: [
        {name: '당뇨약', taking: true},
        {name: '고혈압약', taking: false},
      ],
    },
    {
      id: 2,
      time: '12:00',
      isAm: false,
      medicine: [
        {name: '당뇨약', taking: true},
        {name: '고혈압약', taking: false},
      ],
    },
    {
      id: 3,
      time: '06:00',
      isAm: false,
      medicine: [
        {name: '당뇨약', taking: true},
        {name: '고혈압약', taking: false},
      ],
    },
  ],
  toggleMedicineTaking: (id, medicineName) =>
    set(state => ({
      medicineTime: state.medicineTime.map(item => {
        if (item.id === id) {
          return {
            ...item,
            medicine: item.medicine.map(med => {
              if (med.name === medicineName) {
                return {...med, taking: !med.taking};
              }
              return med;
            }),
          };
        }
        return item;
      }),
    })),
  removeMedicineTime: id =>
    set(state => ({
      medicineTime: state.medicineTime.filter(item => item.id !== id),
    })),
}));