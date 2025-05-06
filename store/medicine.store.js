import {atom} from 'recoil';

export const medicineTimeState = atom({
  key: 'medicineTimeState', // unique ID (with respect to other atoms/selectors)
  default: [
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
  ], // 자료형 따라 초기값을 다르게 설정해주자
});
