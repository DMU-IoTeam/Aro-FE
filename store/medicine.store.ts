import {create} from 'zustand';

interface Medicine {
  name: string;
  taking: boolean;
}

interface MedicineTime {
  time: string;
  isAm: boolean;
  medicine: Medicine[];
}

interface MedicineTimeState {
  medicineTime: MedicineTime[];
  toggleMedicineTaking: (time: string, medicineName: string) => void;
}

export const useMedicineTimeStore = create<MedicineTimeState>(set => ({
  medicineTime: [
    {
      time: '06:00',
      isAm: true,
      medicine: [
        {name: '당뇨약', taking: true},
        {name: '고혈압약', taking: false},
      ],
    },
    {
      time: '12:00',
      isAm: false,
      medicine: [
        {name: '당뇨약', taking: true},
        {name: '고혈압약', taking: false},
      ],
    },
    {
      time: '06:00',
      isAm: false,
      medicine: [
        {name: '당뇨약', taking: true},
        {name: '고혈압약', taking: false},
      ],
    },
  ],
  toggleMedicineTaking: (time, medicineName) =>
    set(state => ({
      medicineTime: state.medicineTime.map(item => {
        if (item.time === time) {
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
}));
