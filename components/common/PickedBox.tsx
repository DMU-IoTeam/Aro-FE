import {Text, View} from 'react-native';
import layout from '../../constants/layout';
import COLOR from '../../constants/color';

const PickedBox = ({children}) => {
  return (
    <View
      style={{
        backgroundColor: COLOR.DEFAULT_COLOR,
        borderRadius: layout.BORDER_RADIUS,
        width: 100,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontSize: layout.FONT_SIZE,
          color: 'white',
          lineHeight: 50,
        }}>
        {children}
      </Text>
    </View>
  );
};

export default PickedBox;
