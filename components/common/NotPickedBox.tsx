import {Text, View} from 'react-native';
import COLOR from '../../constants/color';
import layout from '../../constants/layout';

const NotPickedBox = ({children}) => {
  return (
    <View
      style={{
        borderRadius: layout.BORDER_RADIUS,
        borderColor: 'gray',
        borderWidth: 1,
        width: 100,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontSize: layout.FONT_SIZE,
          lineHeight: 50,
        }}>
        {children}
      </Text>
    </View>
  );
};

export default NotPickedBox;
