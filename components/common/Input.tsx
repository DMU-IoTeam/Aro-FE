import {TextInput} from 'react-native';
import COLOR from '../../constants/color';
import layout from '../../constants/layout';

const Input = ({
  placeholder = '',
  value = '',
  onChangeText = () => {},
  style = {},
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={{
        borderColor: COLOR.GRAY900,
        borderWidth: 1,
        padding: 14,
        borderRadius: layout.BORDER_RADIUS,
        fontSize: layout.FONT_SIZE,
        ...style,
      }}
    />
  );
};

export default Input;
