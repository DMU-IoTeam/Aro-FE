import {Pressable, StyleSheet, Text, View} from 'react-native';
import layout from '../constants/layout';
import COLOR from '../constants/color';
import Container from '../layouts/Container';
import Input from '../components/common/Input';
import CommonButton from '../components/common/CommonButton';

const ClientageProfileScreen = () => {
  return (
    <Container>
      {/* 이미지 인풋 */}
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}>
        <Text style={{fontSize: 20}}>피보호자 사진</Text>
        <Pressable
          style={{
            borderRadius: layout.BORDER_RADIUS,
            borderWidth: 1,
            borderColor: COLOR.DEFAULT_COLOR,
            width: 150,
            height: 150,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 24, color: COLOR.DEFAULT_COLOR}}>+</Text>
        </Pressable>
      </View>

      {/* 기본 정보 인풋 */}
      <View style={{marginTop: 36}}>
        <Input placeholder={'이름'} style={styles.inputLayout} />
        <Input placeholder={'나이'} style={styles.inputLayout} />
        <Input placeholder={'병력'} style={styles.inputLayout} />
      </View>

      <View>
        <CommonButton>피보호자 추가</CommonButton>
      </View>
    </Container>
  );
};

export default ClientageProfileScreen;

const styles = StyleSheet.create({
  inputLayout: {
    marginBottom: 28,
  },
});
