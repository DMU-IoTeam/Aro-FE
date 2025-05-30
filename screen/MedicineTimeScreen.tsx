import {Text} from '@react-navigation/elements';
import {StyleSheet, View, FlatList, Pressable} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSquare, faSquareCheck} from '@fortawesome/free-regular-svg-icons';
import {useNavigation} from '@react-navigation/native';
import {useRecoilState} from 'recoil';
import {medicineTimeState} from '../store/medicine.store';
import COLOR from '../constants/color';
import Container from '../layouts/Container';
import layout from '../constants/layout';

const MedicineTimeScreen = () => {
  //   const [medicineTime, setMedicineTime] = useRecoilState(medicineTimeState);
  const medicineTime = [
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

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const navigation = useNavigation();
  //   console.log(medicineTime);
  return (
    <Container>
      {/* 요일 */}
      <View style={{flexDirection: 'row'}}>
        {days.map((item, index) => {
          // console.log(item);
          return (
            <View
              key={index}
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              {/* 요일 */}
              <Text style={{fontSize: 24}}>{item}</Text>

              {/* 일자 */}
              <View
                style={{
                  borderRadius: layout.BORDER_RADIUS,
                  backgroundColor: index === 2 ? COLOR.DEFAULT_COLOR : '#eee',
                  paddingVertical: 2,
                  paddingHorizontal: 6,
                }}>
                <Text style={{fontSize: 24, color: index === 2 && 'white'}}>
                  {String(index).padStart(2, '0')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{marginTop: 8, marginBottom: 14}}>
        <Pressable
          onPress={() => {
            navigation.navigate('MedicineTimeSettingScreen');
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            backgroundColor: COLOR.DEFAULT_COLOR,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: 'white',
              fontWeight: 700,
              fontSize: 24,
              lineHeight: 40,
            }}>
            +
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={medicineTime}
        renderItem={({item}) => (
          <MedicineScheduleItem
            time={item.time}
            isAm={item.isAm}
            medicine={item.medicine}
          />
        )}
        keyExtractor={(item, index) => index}></FlatList>
    </Container>
  );
};

type MedicineScheduleItemProps = {
  time: string;
  isAm: boolean;
  medicine: object[]; // 타입 명확하면 object 대신 구체적으로!
};

export const MedicineScheduleItem = ({
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
        marginBottom: 8,
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
                <FontAwesomeIcon
                  icon={faSquareCheck}
                  color={'green'}
                  size={18}
                />
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
