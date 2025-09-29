import {Text} from '@react-navigation/elements';
import {StyleSheet, View, FlatList, Pressable} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSquare, faSquareCheck} from '@fortawesome/free-regular-svg-icons';
import {useNavigation} from '@react-navigation/native';
import {useMedicineTimeStore} from '../store/medicine.store';
import COLOR from '../constants/color';
import Container from '../layouts/Container';
import layout from '../constants/layout';

const MedicineTimeScreen = () => {
  const {medicineTime, toggleMedicineTaking} = useMedicineTimeStore();

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const navigation = useNavigation();

  return (
    <Container>
      {/* 요일 */}
      <View style={{flexDirection: 'row'}}>
        {days.map((item, index) => {
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
              fontWeight: '700',
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
            toggleMedicineTaking={toggleMedicineTaking}
          />
        )}
        keyExtractor={(item, index) => index.toString()}></FlatList>
    </Container>
  );
};

interface Medicine {
  name: string;
  taking: boolean;
}

type MedicineScheduleItemProps = {
  time: string;
  isAm: boolean;
  medicine: Medicine[];
  toggleMedicineTaking: (time: string, medicineName: string) => void;
};

export const MedicineScheduleItem = ({
  time,
  isAm,
  medicine,
  toggleMedicineTaking,
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
          borderBottomColor: 'gray',
          borderBottomWidth: 1,
          gap: 8,
          padding: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'flex-end', gap: 8}}>
          <Text style={{fontSize: 24, lineHeight: 24}}>{time}</Text>
          <Text style={{fontSize: 16}}>{isAm ? '오전' : '오후'}</Text>
        </View>

        <Pressable
          style={{
            backgroundColor: COLOR.DEFAULT_COLOR,
            borderRadius: 9999,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
          }}>
          <Text style={{fontSize: 28, color: 'white', fontWeight: 700, lineHeight: 28}}>-</Text>
        </Pressable>
      </View>
      {/* 약 */}
      <View style={{gap: 8, paddingHorizontal: 5, paddingVertical: 8}}>
        {medicine.map((item, index) => {
          return (
            <Pressable
              onPress={() => toggleMedicineTaking(time, item.name)}
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
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default MedicineTimeScreen;
