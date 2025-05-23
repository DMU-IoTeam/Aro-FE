import {View} from 'react-native';
import layout from '../constants/layout';
import {SafeAreaView} from 'react-native-safe-area-context';

const Container = ({children, style = {}}) => {
  return (
    <View
      style={{
        paddingHorizontal: layout.HORIZONTAL_VALUE,
        paddingVertical: layout.VERTICAL_VALUE,
        backgroundColor: 'white',
        flex: 1,
        ...style,
      }}>
      {children}
    </View>
  );
};

export default Container;
