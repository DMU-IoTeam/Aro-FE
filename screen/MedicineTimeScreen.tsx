import {Text} from '@react-navigation/elements';
import {StyleSheet, View, FlatList} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSquare, faSquareCheck} from '@fortawesome/free-regular-svg-icons';

const MedicineTimeScreen = () => {
  const temp = [
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
  ];

  return (
    <View style={{padding: 10, gap: 10}}>
      <FlatList
        data={temp}
        renderItem={({item}) => (
          <MedicineScheduleItem
            time={item.time}
            isAm={item.isAm}
            medicine={item.medicine}
          />
        )}
        keyExtractor={(item, index) => index}></FlatList>
    </View>
  );
};

type MedicineScheduleItemProps = {
  time: string;
  isAm: boolean;
  medicine: object[]; // 타입 명확하면 object 대신 구체적으로!
};

const MedicineScheduleItem = ({
  time,
  isAm,
  medicine,
}: MedicineScheduleItemProps) => {
  return (
    <View
      style={{
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 8
      }}>
      {/* 시간 */}
      <View
        style={{
          flexDirection: 'row',
          borderBottomColor: 'gray',
          borderBottomWidth: 1,
          alignItems: 'flex-end',
          gap: 8,
          padding: 5,
        }}>
        <Text style={{fontSize: 24, lineHeight: 24}}>{time}</Text>
        <Text style={{fontSize: 16}}>{isAm ? '오전' : '오후'}</Text>
      </View>

      {/* 약 */}
      <View style={{gap: 8, paddingHorizontal: 5, paddingVertical: 8}}>
        {medicine.map((item, index) => {
          return (
            <View
              style={{
                flexDirection: 'row',
                gap: 4,
                padding: 10,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 5,
              }}
              key={index}>
              {item.taking ? (
                <FontAwesomeIcon icon={faSquareCheck} size={18} />
              ) : (
                <FontAwesomeIcon icon={faSquare} size={18} />
              )}
              <Text style={{fontSize: 18, lineHeight: 18}}>{item.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default MedicineTimeScreen;
