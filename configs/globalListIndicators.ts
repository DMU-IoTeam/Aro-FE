// Side-effect module to hide scroll indicators app-wide
// Applies to ScrollView, FlatList, and SectionList
import {ScrollView, FlatList, SectionList} from 'react-native';

// For React Native function components, defaultProps is still respected at runtime.
// Use `as any` to avoid TS friction with React 19 types.
const ensureDefaults = (comp: any) => {
  if (!comp.defaultProps) comp.defaultProps = {};
  comp.defaultProps.showsVerticalScrollIndicator = false;
  comp.defaultProps.showsHorizontalScrollIndicator = false;
};

ensureDefaults(ScrollView as any);
ensureDefaults(FlatList as any);
ensureDefaults(SectionList as any);

