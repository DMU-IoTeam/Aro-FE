import {TextInput} from 'react-native';
import COLOR from '../../constants/color';
import layout from '../../constants/layout';

const Input = ({
  placeholder = '',
  value = '',
  onChangeText = () => {},
  style = {},
  ...props // multiline, numberOfLines 등 다른 TextInput props를 받을 수 있도록 추가
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
      // 안드로이드 한글 입력 버그 및 기타 수정을 위한 공통 속성
      underlineColorAndroid="transparent"
      autoCorrect={false}
      allowFontScaling={false}
      {...props} // 전달받은 나머지 props 적용
    />
  );
};

export default Input;
