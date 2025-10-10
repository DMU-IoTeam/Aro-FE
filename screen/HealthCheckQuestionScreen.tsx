import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Container from '../layouts/Container';
import Input from '../components/common/Input';
import {
  useHealthCheckStore,
  defaultOptions,
} from '../store/healthCheck.store';
import layout from '../constants/layout';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCircleCheck,
  faCirclePlus,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';

// Define navigation param types
type RootStackParamList = {
  HealthCheckQuestion: {questionId?: string};
  HealthCheckCalendarScreen: undefined;
};

type HealthCheckQuestionRouteProp = RouteProp<
  RootStackParamList,
  'HealthCheckQuestion'
>;

type HealthCheckQuestionScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

const baseChips = [
  {label: '아주 좋음', bg: '#E7F8EF', text: '#047857'},
  {label: '좋음', bg: '#E0F2FE', text: '#0369A1'},
  {label: '나쁨', bg: '#FFE9D7', text: '#B45309'},
  {label: '아주 나쁨', bg: '#FDE2E1', text: '#B91C1C'},
];

const HealthCheckQuestionScreen = () => {
  const navigation = useNavigation<HealthCheckQuestionScreenNavigationProp>();
  const route = useRoute<HealthCheckQuestionRouteProp>();
  const questionId = route.params?.questionId;

  const {questions, addQuestion, updateQuestion} = useHealthCheckStore();

  const [text, setText] = useState('');
  const [optionType, setOptionType] = useState<'default' | 'custom'>('default');
  const [options, setOptions] = useState<string[]>([...defaultOptions]);
  const [customOptionInput, setCustomOptionInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (questionId) {
      const existingQuestion = questions.find(q => q.id === questionId);
      if (existingQuestion) {
        setText(existingQuestion.questionText);
        setOptionType(existingQuestion.optionType);
        setOptions(existingQuestion.options);
      }
    }
  }, [questionId, questions]);

  const handleSave = async () => {
    if (text.trim() === '') {
      alert('질문 내용을 입력해주세요.');
      return;
    }
    setIsSaving(true);
    try {
      const questionData = {text, optionType, options};
      if (questionId) {
        await updateQuestion({id: questionId, ...questionData});
      } else {
        await addQuestion(questionData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetOptionType = (type: 'default' | 'custom') => {
    setOptionType(type);
    if (type === 'default') {
      setOptions([...defaultOptions]);
    } else if (!questionId) {
      setOptions([]);
    }
  };

  const addCustomOption = () => {
    const trimmed = customOptionInput.trim();
    if (!trimmed || options.includes(trimmed)) return;
    setOptions(prev => [...prev, trimmed]);
    setCustomOptionInput('');
  };

  const deleteOption = (optionToDelete: string) => {
    setOptions(prev => prev.filter(opt => opt !== optionToDelete));
  };

  return (
    <Container style={{paddingHorizontal: 0}}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>질문 내용</Text>
            <Text style={styles.requiredBadge}>필수</Text>
          </View>
          <Input
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="질문을 입력하세요..."
            value={text}
            onChangeText={setText}
            style={styles.textarea}
          />
          <Text style={styles.helperText}>
            예시: 오늘 기분은 어땠나요? / 수면의 질은 어땠나요?
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>답변 선택</Text>

          <Pressable
            style={[
              styles.typeOption,
              optionType === 'default' && styles.typeOptionActive,
            ]}
            onPress={() => handleSetOptionType('default')}>
            <View style={styles.typeRow}>
              <View
                style={[
                  styles.radioOuter,
                  optionType === 'default' && styles.radioOuterActive,
                ]}>
                {optionType === 'default' && <View style={styles.radioInner} />}
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.typeTitle}>기본</Text>
                <Text style={styles.typeSubtitle}>
                  아주 좋음 / 좋음 / 나쁨 / 아주 나쁨
                </Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.typeOption,
              optionType === 'custom' && styles.typeOptionActive,
            ]}
            onPress={() => handleSetOptionType('custom')}>
            <View style={styles.typeRow}>
              <View
                style={[
                  styles.radioOuter,
                  optionType === 'custom' && styles.radioOuterActive,
                ]}>
                {optionType === 'custom' && <View style={styles.radioInner} />}
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.typeTitle}>커스텀</Text>
                <Text style={styles.typeSubtitle}>
                  직접 답변을 만들어보세요
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {optionType === 'default' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>기본 옵션 미리보기</Text>
            <View style={styles.previewBox}>
              {baseChips.map(chip => (
                <View
                  key={chip.label}
                  style={[styles.previewChip, {backgroundColor: chip.bg}]}>
                  <Text style={[styles.previewChipText, {color: chip.text}]}>
                    {chip.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {optionType === 'custom' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>커스텀 응답</Text>
            <View style={styles.customBox}>
              <Input
                placeholder="답변을 입력하세요"
                value={customOptionInput}
                onChangeText={setCustomOptionInput}
                style={{flex: 1}}
              />
              <Pressable style={styles.addChipBtn} onPress={addCustomOption}>
                <FontAwesomeIcon
                  icon={faCirclePlus}
                  size={16}
                  color="#2563EB"
                />
              </Pressable>
            </View>
            <View style={styles.customChipRow}>
              {options.map(option => (
                <View key={option} style={styles.customChip}>
                  <Text style={styles.customChipText}>{option}</Text>
                  <Pressable onPress={() => deleteOption(option)}>
                    <Text style={styles.customChipRemove}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.saveBox}>
          {isSaving ? (
            <ActivityIndicator size="large" />
          ) : (
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>문제 저장</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

export default HealthCheckQuestionScreen;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    gap: 16,
  },
  sectionCard: {
    marginHorizontal: layout.HORIZONTAL_VALUE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  requiredBadge: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '700',
  },
  textarea: {
    height: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  typeOption: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: 14,
  },
  typeOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EEF2FF',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  typeSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  previewBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  previewChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addChipBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customChipText: {color: '#0369A1', fontWeight: '600'},
  customChipRemove: {color: '#0369A1', fontWeight: '700', fontSize: 12},
  saveBox: {
    marginHorizontal: layout.HORIZONTAL_VALUE,
    marginTop: 8,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});

export default HealthCheckQuestionScreen;
