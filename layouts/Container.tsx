import layout from '../constants/layout';
import {SafeAreaView} from 'react-native-safe-area-context';

const Container = ({children}) => {
  return (
    <SafeAreaView
      style={{
        paddingHorizontal: layout.HORIZONTAL_VALUE,
        backgroundColor: 'white',
        flex: 1,
      }}>
      {children}
    </SafeAreaView>
  );
};

export default Container;
