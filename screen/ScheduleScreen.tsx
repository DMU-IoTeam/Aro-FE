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

const ScheduleScreen = () => {
  //   const [medicineTime, setMedicineTime] = useRecoilState(medicineTimeState);
  const workTime = [
    {
      time: '06:00',
      isAm: true,
      work: '요양원 가기',
    },
    {
      time: '12:00',
      isAm: false,
      work: '산책하기',
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
          console.log(item);
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
            navigation.navigate('ScheduleSettingScreen');
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
        data={workTime}
        renderItem={({item}) => (
          <MedicineScheduleItem
            time={item.time}
            isAm={item.isAm}
            work={item.work}
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

const MedicineScheduleItem = ({
  time,
  isAm,
  work,
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
        <View
          style={{
            flexDirection: 'row',
            gap: 4,
            padding: 10,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 5,
          }}>
          <Text style={{fontSize: 18, lineHeight: 18}}>{work}</Text>
        </View>
      </View>
    </View>
  );
};

export default ScheduleScreen;
