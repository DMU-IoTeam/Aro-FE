import {StyleSheet, Text, View} from 'react-native';
import Container from '../layouts/Container';
import PickedBox from '../components/common/PickedBox';
import NotPickedBox from '../components/common/NotPickedBox';
import layout from '../constants/layout';

const HealthCheckScreen = () => {
  const healthData = [
    {title: '오늘의 건강', isGood: true},
    {title: '오늘의 기분', isGood: false},
  ];

  return (
    <Container>
      <View style={{marginBottom: 12}}>
        <Text style={{textAlign: 'center', fontSize: 28}}>
          홍길동님의 건강 상태
        </Text>
      </View>

      {healthData.map((item, index) => {
        return (
          <View key={index}>
            <Text style={{fontSize: layout.FONT_SIZE}}>{item.title}</Text>
            {/* 버튼 */}
            {item.isGood ? (
              <View style={styles.boxWrapper}>
                <PickedBox>좋음</PickedBox>
                <NotPickedBox>좋지 않음</NotPickedBox>
              </View>
            ) : (
              <View style={styles.boxWrapper}>
                <NotPickedBox>좋음</NotPickedBox>
                <PickedBox>좋지 않음</PickedBox>
              </View>
            )}
          </View>
        );
      })}
    </Container>
  );
};

export default HealthCheckScreen;

const styles = StyleSheet.create({
  boxWrapper:{
    flexDirection: 'row',
    gap: 24,
    marginTop: 10,
    marginBottom: 14
  }
})