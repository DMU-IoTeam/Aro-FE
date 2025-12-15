import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Container from '../layouts/Container';
import layout from '../constants/layout';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {useHealthCheckStore} from '../store/healthCheck.store';
import {faCalendarDays} from '@fortawesome/free-regular-svg-icons';

// Navigation types
type RootStackParamList = {
  HealthCheckQuestion: {questionId?: string};
  HealthCheckCalendarScreen: undefined;
};

type HealthCheckScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'HealthCheckQuestion'
>;

const toneStyles = {
  strongGreen: {bg: '#E7F9ED', text: '#089471'},
  lightBlue: {bg: '#E0F2FE', text: '#0369A1'},
  amber: {bg: '#FFECE2', text: '#B45309'},
  red: {bg: '#FDE7E7', text: '#EF4444'},
  blue: {bg: '#E9F2FF', text: '#2563EB'},
  yellow: {bg: '#FFF6E4', text: '#F59E0B'},
  neutral: {bg: '#EEF1F6', text: '#64748B'},
} as const;

const mapOptionTone = (label: string) => {
  const normalized = label.replace(/\s+/g, '').toLowerCase();
  if (normalized.includes('아주좋')) return toneStyles.strongGreen;
  if (normalized.includes('좋')) return toneStyles.strongGreen;
  if (normalized.includes('전혀') || normalized.includes('없'))
    return toneStyles.blue;
  if (normalized.includes('조금')) return toneStyles.yellow;
  if (normalized.includes('아주나쁨')) return toneStyles.red;
  if (normalized.includes('나쁨')) return toneStyles.amber;
  return toneStyles.neutral;
};

const HealthCheckScreen = () => {
  const navigation = useNavigation<HealthCheckScreenNavigationProp>();
  const {questions, isLoading, fetchQuestions, deleteQuestion} =
    useHealthCheckStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchQuestions();
    }, [fetchQuestions]),
  );

  const chipsByQuestion = useMemo(
    () =>
      questions.map(q =>
        q.options.map(opt => ({label: opt, style: mapOptionTone(opt)})),
      ),
    [questions],
  );

  const confirmDelete = (id: string) => {
    Alert.alert('질문 삭제', '해당 질문을 삭제할까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await deleteQuestion(id);
          } catch (error) {
            console.error('Failed to delete question:', error);
            Alert.alert('삭제 실패', '질문 삭제 중 오류가 발생했습니다.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <Container style={{paddingHorizontal: 0}}>
      <Pressable
        style={styles.calendarButton}
        onPress={() => navigation.navigate('HealthCheckCalendarScreen')}>
        <FontAwesomeIcon icon={faCalendarDays} size={16} color="#4B5563" />
        <Text style={styles.calendarButtonText}>날짜별 건강상태 확인</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoading && questions.length === 0 ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>등록된 질문이 없습니다.</Text>
          </View>
        ) : (
          questions.map((item, idx) => {
            const chips = chipsByQuestion[idx] || [];
            const visibleChips = chips.slice(0, 4);
            const remain = chips.length - visibleChips.length;
            return (
              <View key={item.id} style={styles.questionCard}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.orderBadge,
                      item.optionType === 'custom' && styles.orderBadgeAlt,
                    ]}>
                    <Text style={styles.orderBadgeText}>{idx + 1}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.questionTitle}>
                      {item.questionText}
                    </Text>
                  </View>
                  <View style={styles.cardActionRow}>
                    <Pressable
                      style={[styles.cardActionBtn, styles.cardActionEdit]}
                      onPress={() =>
                        navigation.navigate('HealthCheckQuestion', {
                          questionId: item.id,
                        })
                      }>
                      <Text style={[styles.cardActionText, styles.cardActionEditText]}>
                        수정
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.cardActionBtn, styles.cardActionDelete]}
                      onPress={() => confirmDelete(item.id)}
                      disabled={deletingId === item.id}>
                      {deletingId === item.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <Text
                          style={[
                            styles.cardActionText,
                            styles.cardActionDeleteText,
                          ]}>
                          삭제
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>

                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>응답 옵션</Text>
                  <View style={styles.optionChipRow}>
                    {visibleChips.map(opt => (
                      <View
                        key={opt.label}
                        style={[
                          styles.optionChip,
                          {backgroundColor: opt.style.bg},
                        ]}>
                        <Text
                          style={[
                            styles.optionChipText,
                            {color: opt.style.text},
                          ]}>
                          {opt.label}
                        </Text>
                      </View>
                    ))}
                    {remain > 0 && (
                      <View
                        style={[
                          styles.optionChip,
                          {backgroundColor: toneStyles.neutral.bg},
                        ]}>
                        <Text
                          style={[
                            styles.optionChipText,
                            {color: toneStyles.neutral.text},
                          ]}>
                          +{remain}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}

        <Pressable
          style={styles.addCard}
          onPress={() => navigation.navigate('HealthCheckQuestion')}>
          <FontAwesomeIcon icon={faPlus} size={18} color="#64748B" />
          <Text style={styles.addCardText}>새 질문 추가</Text>
        </Pressable>
      </ScrollView>
    </Container>
  );
};

export default HealthCheckScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: layout.HORIZONTAL_VALUE,
    paddingBottom: 32,
    gap: 16,
  },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeAlt: {
    backgroundColor: '#0EA5E9',
  },
  orderBadgeText: {color: 'white', fontWeight: '700'},
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    color: '#94A3B8',
    fontSize: 12,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActionBtn: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardActionEdit: {
    borderColor: '#3B82F6',
    backgroundColor: 'white',
  },
  cardActionEditText: {
    color: '#3B82F6',
  },
  cardActionDelete: {
    borderColor: '#EF4444',
    backgroundColor: '#FFFFFF',
  },
  cardActionDeleteText: {
    color: '#EF4444',
  },
  optionRow: {
    marginTop: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  optionChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#0F172A',
  },
  addCard: {
    height: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addCardText: {color: '#475569', fontWeight: '700'},
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    padding: 16,
    gap: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsTitle: {fontSize: 16, fontWeight: '700', color: '#111827'},
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {fontSize: 12, color: '#94A3B8'},
  settingValue: {fontSize: 14, fontWeight: '600', color: '#111827'},
  loaderBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },

  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: layout.HORIZONTAL_VALUE,
  },
  calendarButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});
