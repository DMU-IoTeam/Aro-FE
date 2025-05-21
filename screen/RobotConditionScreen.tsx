import {Text, View} from 'react-native';
import Container from '../layouts/Container';
import layout from '../constants/layout';
import COLOR from '../constants/color';

const RobotConditionScreen = () => {
  const robotConditionData = [
    {
      key: '배터리',
      value: `${88}%`,
    },
    {
      key: '시리얼넘버',
      value: 'q1w2e3r4t5',
    },
  ];

  return (
    <Container>
      <View
        style={{
          borderRadius: layout.BORDER_RADIUS,
          borderWidth: 1,
          borderColor: COLOR.GRAY900,
          padding: layout.PADDING_VALUE,
        }}>
        {robotConditionData.map((item, index) => {
          return (
            <View
              key={index}
              style={{
                paddingBottom: index !== robotConditionData.length - 1 && 6,
                paddingTop: index === robotConditionData.length - 1 && 6,
                borderBottomWidth: index !== robotConditionData.length - 1 && 1,
                borderColor: COLOR.GRAY700,
              }}>
              <Text style={{fontWeight: 700}}>{item.key}</Text>
              <Text style={{fontWeight: 700}}>{item.value}</Text>
            </View>
          );
        })}
      </View>
    </Container>
  );
};

export default RobotConditionScreen;
