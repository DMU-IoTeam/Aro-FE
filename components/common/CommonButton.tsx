import {Pressable, Text} from 'react-native';
import layout from '../../constants/layout';
import COLOR from '../../constants/color';

const CommonButton = ({children, onPress}) => {
  return (
    <Pressable
      style={{
        padding: layout.PADDING_VALUE,
        backgroundColor: COLOR.DEFAULT_COLOR,
        borderRadius: layout.BORDER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}>
      <Text style={{fontSize: layout.FONT_SIZE, color: 'white'}}>
        {children}
      </Text>
    </Pressable>
  );
};

export default CommonButton;
