import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Container from '../layouts/Container';
import CommonButton from '../components/common/CommonButton';
import Input from '../components/common/Input';
import {
  useHealthCheckStore,
  defaultOptions,
} from '../store/healthCheck.store';
import COLOR from '../constants/color';
import layout from '../constants/layout';

// Define navigation param types
type ParamList = {
  HealthCheckQuestion: {questionId?: string};
};

type HealthCheckQuestionRouteProp = RouteProp<
  ParamList,
  'HealthCheckQuestion'
>;

const HealthCheckQuestionScreen = () => {
  const navigation = useNavigation();
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
        setText(existingQuestion.text);
        setOptionType(existingQuestion.optionType);
        setOptions(existingQuestion.options);
      }
    }
  }, [questionId, questions]);

  const handleSave = async () => {
    if (text.trim() === '') {
      Alert.alert('오류', '질문 내용을 입력해주세요.');
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
      Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetOptionType = (type: 'default' | 'custom') => {
    setOptionType(type);
    if (type === 'default') {
      setOptions([...defaultOptions]);
    } else {
      // If switching to custom from a pre-existing question, keep options
      if (questionId) {
        const existingQuestion = questions.find(q => q.id === questionId);
        if (existingQuestion && existingQuestion.optionType === 'custom') {
          setOptions(existingQuestion.options);
        } else {
          setOptions([]);
        }
      } else {
        setOptions([]);
      }
    }
  };

  const addCustomOption = () => {
    if (
      customOptionInput.trim() === '' ||
      options.includes(customOptionInput.trim())
    ) {
      return;
    }
    setOptions(prev => [...prev, customOptionInput.trim()]);
    setCustomOptionInput('');
  };

  const deleteOption = (optionToDelete: string) => {
    setOptions(prev => prev.filter(opt => opt !== optionToDelete));
  };

  return (
    <Container>
      <ScrollView>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>질문</Text>
          <Input
            placeholder="질문 내용을 입력하세요"
            value={text}
            onChangeText={setText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>답변 유형</Text>
          <View style={styles.radioContainer}>
            <Pressable
              style={[
                styles.radioButton,
                optionType === 'default' && styles.radioButtonActive,
              ]}
              onPress={() => handleSetOptionType('default')}>
              <Text
                style={[
                  styles.radioButtonText,
                  optionType === 'default' && styles.radioButtonTextActive,
                ]}>
                기본 옵션
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.radioButton,
                optionType === 'custom' && styles.radioButtonActive,
              ]}
              onPress={() => handleSetOptionType('custom')}>
              <Text
                style={[
                  styles.radioButtonText,
                  optionType === 'custom' && styles.radioButtonTextActive,
                ]}>
                커스텀 옵션
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>답변 미리보기</Text>
          <View style={styles.optionsContainer}>
            {options.map(option => (
              <View key={option} style={styles.optionWrapper}>
                <Pressable style={styles.optionButton}>
                  <Text style={styles.optionButtonText}>{option}</Text>
                </Pressable>
                {optionType === 'custom' && (
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteOption(option)}>
                    <Text style={styles.deleteButtonText}>X</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>

        {optionType === 'custom' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>커스텀 답변 추가</Text>
            <View style={styles.customOptionContainer}>
              <Input
                style={{flex: 1}}
                placeholder="추가할 답변 입력"
                value={customOptionInput}
                onChangeText={setCustomOptionInput}
              />
              <CommonButton onPress={addCustomOption}>추가</CommonButton>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        {isSaving ? (
          <ActivityIndicator size="large" />
        ) : (
          <CommonButton onPress={handleSave}>저장</CommonButton>
        )}
      </View>
    </Container>
  );
};

export default HealthCheckQuestionScreen;

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: layout.BORDER_RADIUS,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  radioButtonActive: {
    backgroundColor: COLOR.DEFAULT_COLOR,
    borderColor: COLOR.DEFAULT_COLOR,
  },
  radioButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  radioButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    minHeight: 40, // Ensure container has height even when empty
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: layout.BORDER_RADIUS,
    backgroundColor: '#f9f9f9',
  },
  optionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLOR.DEFAULT_COLOR,
    borderRadius: layout.BORDER_RADIUS,
    overflow: 'hidden',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionButtonText: {
    color: COLOR.DEFAULT_COLOR,
  },
  deleteButton: {
    paddingHorizontal: 8,
    borderLeftWidth: 1,
    borderLeftColor: COLOR.DEFAULT_COLOR,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: COLOR.DEFAULT_COLOR,
    fontWeight: 'bold',
  },
  customOptionContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  saveButtonContainer: {
    paddingVertical: 10,
  },
});