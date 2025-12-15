import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import WheelPicker from 'react-native-wheely';

type Props = {
  ampmIndex: number;
  setAmPmIndex: (idx: number) => void;
  hourIndex: number;
  setHourIndex: (idx: number) => void;
  minuteIndex: number;
  setMinuteIndex: (idx: number) => void;
  repeatedHours: string[];
  repeatedMinutes: string[];
  ampmLabels?: readonly ['오전', '오후'];
  onBeginInteraction?: () => void;
  onEndInteraction?: () => void;
};

const TimeWheelPicker: React.FC<Props> = ({
  ampmIndex,
  setAmPmIndex,
  hourIndex,
  setHourIndex,
  minuteIndex,
  setMinuteIndex,
  repeatedHours,
  repeatedMinutes,
  ampmLabels = ['오전', '오후'],
  onBeginInteraction,
  onEndInteraction,
}) => {
  const begin = () => onBeginInteraction?.();
  const end = () => onEndInteraction?.();

  return (
    <View>
      <View style={styles.segmentWrap}>
        {ampmLabels.map((label, idx) => (
          <Pressable
            key={label}
            onPress={() => setAmPmIndex(idx)}
            style={[styles.segment, ampmIndex === idx && styles.segmentActive]}>
            <Text
              style={[styles.segmentText, ampmIndex === idx && styles.segmentTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.timePickerCard}>
        <View style={styles.pickerRow}>
          <View style={styles.wheelWrap} onTouchStart={begin} onTouchEnd={end} onTouchCancel={end}>
            <WheelPicker
              options={repeatedHours}
              selectedIndex={hourIndex}
              onChange={setHourIndex}
              itemHeight={60}
              itemTextStyle={styles.itemTextStyle}
              selectedIndicatorStyle={styles.selectedIndicatorStyle}
              visibleRest={1}
              containerStyle={styles.containerStyle}
            />
          </View>
          <View style={styles.wheelWrap} onTouchStart={begin} onTouchEnd={end} onTouchCancel={end}>
            <WheelPicker
              options={repeatedMinutes}
              selectedIndex={minuteIndex}
              onChange={setMinuteIndex}
              itemHeight={60}
              itemTextStyle={styles.itemTextStyle}
              selectedIndicatorStyle={styles.selectedIndicatorStyle}
              visibleRest={1}
              containerStyle={styles.containerStyle}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#3B82F6',
  },
  segmentText: {color: '#334155', fontWeight: '600'},
  segmentTextActive: {color: 'white'},
  timePickerCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 190,
  },
  wheelWrap: {flex: 1},
  itemTextStyle: {
    fontSize: 32,
  },
  containerStyle: {
    flex: 1,
  },
  selectedIndicatorStyle: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: 'gray',
    borderBottomColor: 'gray',
    backgroundColor: 'white',
  },
});

export default TimeWheelPicker;
