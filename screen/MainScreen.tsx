// ---------------------------------------------------
// --- 메인 화면 ---------------------------------------
// ---------------------------------------------------
import React, {useCallback, useMemo, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCalendarDays} from '@fortawesome/free-regular-svg-icons';
import {
  faPills,
  faHeartPulse,
  faPuzzlePiece,
  faCircleCheck,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import Container from '../layouts/Container';
import COLOR from '../constants/color';
import {useSeniors} from '../hooks/useSeniors';
import {useHealthCheckStore} from '../store/healthCheck.store';
import {HealthAnswer} from '../store/healthAnswer.store';
import {getHealthAnswers} from '../api/health';
import {
  useMedicationScheduleStore,
  MedicationSchedule,
} from '../store/medicationSchedule.store';
import {getMedicationLog, MedicationLogResponse} from '../api/medication';

type OverviewEntry = {
  label: string;
  status: string;
  icon: IconDefinition;
  iconColor: string;
  statusColor?: string;
};

type OverviewCard = {
  key: string;
  title: string;
  icon: IconDefinition;
  iconColor: string;
  iconBg: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  footer: string;
  footerIcon: IconDefinition;
  footerColor: string;
  entries: OverviewEntry[];
};

const POSITIVE_KEYWORDS = ['좋', '정상', '완료', '안정', '양호'];
const NEGATIVE_KEYWORDS = [
  '나쁨',
  '위험',
  '악화',
  '통증',
  '심함',
  '위급',
  '높음',
  '낮음',
];
const PENDING_KEYWORDS = [
  '미응답',
  '미복용',
  '미완',
  '거름',
  '거르',
  '못',
  '예정',
  '필요',
  '안됨',
];

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value: string): string => {
  if (!value) {
    return '오늘';
  }
  const datePart = value.includes('T') ? value.split('T')[0] : value;
  const [yearStr, monthStr, dayStr] = datePart.split('-');
  const month = Number(monthStr ?? 0);
  const day = Number(dayStr ?? 0);
  if (Number.isNaN(month) || Number.isNaN(day) || month === 0 || day === 0) {
    return datePart;
  }
  return `${month}월 ${day}일`;
};

const mapAnswerToStyle = (
  answerText: string,
): {icon: IconDefinition; color: string} => {
  const normalized = (answerText || '').replace(/\s+/g, '').toLowerCase();
  if (
    normalized.length > 0 &&
    POSITIVE_KEYWORDS.some(keyword => normalized.includes(keyword))
  ) {
    return {icon: faCircleCheck, color: '#22C55E'};
  }
  if (
    normalized.length > 0 &&
    NEGATIVE_KEYWORDS.some(keyword => normalized.includes(keyword))
  ) {
    return {icon: faCircleCheck, color: '#EF4444'};
  }
  if (
    normalized.length > 0 &&
    PENDING_KEYWORDS.some(keyword => normalized.includes(keyword))
  ) {
    return {icon: faClock, color: '#F97316'};
  }
  return {icon: faClock, color: '#94A3B8'};
};

const scheduleToDate = (schedule: MedicationSchedule): Date => {
  const [hourStr = '0', minuteStr = '0'] = schedule.time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10) || 0;

  if (schedule.isAm) {
    if (hour === 12) {
      hour = 0;
    }
  } else if (hour !== 12) {
    hour += 12;
  }

  const base = new Date();
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hour,
    minute,
    0,
    0,
  );
};

const formatScheduleTimeLabel = (schedule: MedicationSchedule): string => {
  const [hourStr = '0', minuteStr = '0'] = schedule.time.split(':');
  let hour = parseInt(hourStr, 10);
  if (!Number.isFinite(hour)) {
    hour = 0;
  }
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  const minuteSegment = minuteStr.padStart(2, '0');
  return `${schedule.isAm ? '오전' : '오후'} ${normalizedHour}:${minuteSegment}`;
};

const buildMedicineLabel = (schedule: MedicationSchedule): string => {
  if (!schedule.medicine || schedule.medicine.length === 0) {
    return formatScheduleTimeLabel(schedule);
  }
  const [first, ...rest] = schedule.medicine;
  if (!first?.name) {
    return formatScheduleTimeLabel(schedule);
  }
  return rest.length > 0 ? `${first.name} 외 ${rest.length}` : first.name;
};

const MainScreen = () => {
  const navigation = useNavigation();
  const {seniors, isLoading, calculateAge} = useSeniors();

  const {
    questions,
    isLoading: questionsLoading,
    fetchQuestions,
  } = useHealthCheckStore();

  const {
    schedules,
    isLoading: scheduleLoading,
    error: scheduleError,
    fetchSchedule,
  } = useMedicationScheduleStore();

  const [answers, setAnswers] = useState<HealthAnswer[]>([]);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [answersError, setAnswersError] = useState<Error | null>(null);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLogResponse[]>([]);
  const [medicationLogsLoading, setMedicationLogsLoading] = useState(false);
  const [medicationLogsError, setMedicationLogsError] = useState<Error | null>(null);

  const seniorId = seniors[0]?.id;

  const reloadHealth = useCallback(() => {
    if (!seniorId) {
      setAnswers([]);
      return () => {};
    }

    fetchQuestions();

    let cancelled = false;
    const todayKey = formatDateKey(new Date());

    setAnswersLoading(true);
    setAnswersError(null);
    getHealthAnswers(seniorId, todayKey, todayKey)
      .then(data => {
        if (!cancelled) {
          setAnswers(Array.isArray(data) ? data : []);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setAnswers([]);
          setAnswersError(err as Error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAnswersLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [seniorId, fetchQuestions]);

  useFocusEffect(
    useCallback(() => {
      return reloadHealth();
    }, [reloadHealth]),
  );

  const reloadMedication = useCallback(() => {
    if (!seniorId) {
      setMedicationLogs([]);
      return () => {};
    }

    fetchSchedule(seniorId);

    let cancelled = false;
    setMedicationLogsLoading(true);
    setMedicationLogsError(null);

    getMedicationLog(seniorId)
      .then(data => {
        if (!cancelled) {
          setMedicationLogs(Array.isArray(data) ? data : []);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setMedicationLogs([]);
          setMedicationLogsError(err as Error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMedicationLogsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [seniorId, fetchSchedule]);

  useFocusEffect(
    useCallback(() => {
      return reloadMedication();
    }, [reloadMedication]),
  );

  const answerIndex = useMemo(() => {
    const map = new Map<string, HealthAnswer>();
    answers.forEach(answer => {
      if (answer.questionId !== undefined && answer.questionId !== null) {
        map.set(`id:${String(answer.questionId)}`, answer);
      }
      if (answer.questionText) {
        const normalized = answer.questionText.trim().toLowerCase();
        if (normalized.length > 0) {
          map.set(`text:${normalized}`, answer);
        }
      }
    });
    return map;
  }, [answers]);

  const totalQuestions = questions.length;

  const answeredCount = useMemo(() => {
    if (totalQuestions === 0) {
      return 0;
    }
    return questions.reduce((count, question) => {
      const normalized = question.questionText
        ? question.questionText.trim().toLowerCase()
        : '';
      const answer =
        answerIndex.get(`id:${String(question.id)}`) ||
        (normalized ? answerIndex.get(`text:${normalized}`) : undefined);
      if (answer && answer.answerText && answer.answerText.trim().length > 0) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [questions, answerIndex, totalQuestions]);

  const latestAnswer = useMemo(() => {
    if (answers.length === 0) {
      return null;
    }
    return answers.reduce<HealthAnswer | null>((latest, current) => {
      if (!current.checkDate) {
        return latest;
      }
      const currentTime = new Date(current.checkDate).getTime();
      if (Number.isNaN(currentTime)) {
        return latest;
      }
      if (!latest) {
        return current;
      }
      const latestTime = new Date(latest.checkDate).getTime();
      if (Number.isNaN(latestTime) || currentTime > latestTime) {
        return current;
      }
      return latest;
    }, null);
  }, [answers]);

  const todayKey = formatDateKey(new Date());

  const sortedSchedules = useMemo(
    () =>
      [...schedules].sort(
        (a, b) => scheduleToDate(a).getTime() - scheduleToDate(b).getTime(),
      ),
    [schedules],
  );

  const todayMedicationLogIds = useMemo(() => {
    const set = new Set<number>();
    medicationLogs.forEach(log => {
      const datePart = (log.confirmedAt ?? '').split('T')[0];
      if (datePart === todayKey) {
        set.add(log.scheduleId);
      }
    });
    return set;
  }, [medicationLogs, todayKey]);

  const completedMedicationCount = useMemo(
    () =>
      sortedSchedules.reduce(
        (count, schedule) => count + (todayMedicationLogIds.has(schedule.id) ? 1 : 0),
        0,
      ),
    [sortedSchedules, todayMedicationLogIds],
  );

  const upcomingMedicationSchedule = useMemo(() => {
    const now = new Date().getTime();
    let candidate: {schedule: MedicationSchedule; time: number} | null = null;
    sortedSchedules.forEach(schedule => {
      const scheduleTime = scheduleToDate(schedule).getTime();
      if (todayMedicationLogIds.has(schedule.id) || scheduleTime <= now) {
        return;
      }
      if (!candidate || scheduleTime < candidate.time) {
        candidate = {schedule, time: scheduleTime};
      }
    });
    return candidate?.schedule ?? null;
  }, [sortedSchedules, todayMedicationLogIds]);

  const hasOverdueMedication = useMemo(() => {
    const now = new Date().getTime();
    return sortedSchedules.some(schedule => {
      if (todayMedicationLogIds.has(schedule.id)) {
        return false;
      }
      const scheduleTime = scheduleToDate(schedule).getTime();
      return scheduleTime <= now;
    });
  }, [sortedSchedules, todayMedicationLogIds]);

  const healthEntries = useMemo<OverviewEntry[]>(() => {
    if (questionsLoading || answersLoading) {
      return [
        {
          label: '건강 상태',
          status: '건강 데이터를 불러오는 중입니다.',
          icon: faClock,
          iconColor: '#94A3B8',
          statusColor: '#94A3B8',
        },
      ];
    }

    if (answersError) {
      return [
        {
          label: '건강 상태',
          status: '건강 정보를 불러오지 못했습니다.',
          icon: faClock,
          iconColor: '#EF4444',
          statusColor: '#EF4444',
        },
      ];
    }

    if (totalQuestions === 0) {
      return [
        {
          label: '건강 질문',
          status: '등록된 건강 질문이 없습니다.',
          icon: faClock,
          iconColor: '#94A3B8',
          statusColor: '#94A3B8',
        },
      ];
    }

    return questions.slice(0, 4).map(question => {
      const normalized = question.questionText
        ? question.questionText.trim().toLowerCase()
        : '';
      const answer =
        answerIndex.get(`id:${String(question.id)}`) ||
        (normalized ? answerIndex.get(`text:${normalized}`) : undefined);

      if (answer && answer.answerText && answer.answerText.trim().length > 0) {
        const {icon, color} = mapAnswerToStyle(answer.answerText);
        return {
          label: question.questionText,
          status: answer.answerText,
          icon,
          iconColor: color,
          statusColor: color,
        };
      }

      return {
        label: question.questionText,
        status: '답변안됨',
        icon: faClock,
        iconColor: '#F97316',
        statusColor: '#F97316',
      };
    });
  }, [
    questions,
    totalQuestions,
    answerIndex,
    questionsLoading,
    answersLoading,
    answersError,
  ]);

  const healthCard = useMemo<OverviewCard>(() => {
    let badgeText = '질문 없음';
    let badgeBg = '#E2E8F0';
    let badgeColor = '#475569';
    let footer = '건강 질문을 등록해보세요.';
    let footerColor = '#94A3B8';

    if (questionsLoading || answersLoading) {
      badgeText = '불러오는 중';
      footer = '건강 데이터를 불러오는 중입니다.';
    } else if (answersError) {
      badgeText = '오류';
      badgeBg = '#FEE2E2';
      badgeColor = '#EF4444';
      footer = '건강 정보를 불러오지 못했습니다.';
      footerColor = '#EF4444';
    } else if (totalQuestions > 0) {
      badgeText = `${answeredCount}/${totalQuestions}`;
      badgeBg = '#FEF3C7';
      badgeColor = '#F59E0B';
      const remaining = Math.max(totalQuestions - answeredCount, 0);
      footer = remaining === 0 ? '오늘 답변 완료' : `미답변 ${remaining}개`;
      footerColor = remaining === 0 ? '#16A34A' : '#F97316';

      if (remaining === 0 && latestAnswer?.checkDate) {
        footer = `마지막 답변: ${formatDisplayDate(latestAnswer.checkDate)}`;
      }
      if (remaining === 0) {
        badgeBg = '#DCFCE7';
        badgeColor = '#16A34A';
      }
    }

    return {
      key: 'health-status',
      title: '건강 확인',
      icon: faHeartPulse,
      iconColor: '#EF4444',
      iconBg: '#FEE2E2',
      badgeText,
      badgeBg,
      badgeColor,
      footer,
      footerIcon: faCalendarDays,
      footerColor,
      entries: healthEntries,
    };
  }, [
    questionsLoading,
    answersLoading,
    answersError,
    totalQuestions,
    answeredCount,
    latestAnswer,
    healthEntries,
  ]);

  const medicineEntries = useMemo<OverviewEntry[]>(() => {
    if (scheduleLoading || medicationLogsLoading) {
      return [
        {
          label: '복약 일정',
          status: '복약 정보를 불러오는 중입니다.',
          icon: faClock,
          iconColor: '#94A3B8',
          statusColor: '#94A3B8',
        },
      ];
    }

    if (scheduleError || medicationLogsError) {
      return [
        {
          label: '복약 일정',
          status: '복약 정보를 불러오지 못했습니다.',
          icon: faClock,
          iconColor: '#EF4444',
          statusColor: '#EF4444',
        },
      ];
    }

    if (sortedSchedules.length === 0) {
      return [
        {
          label: '복약 일정',
          status: '등록된 복약 일정이 없습니다.',
          icon: faClock,
          iconColor: '#94A3B8',
          statusColor: '#94A3B8',
        },
      ];
    }

    return sortedSchedules.slice(0, 4).map(schedule => {
      const isCompleted = todayMedicationLogIds.has(schedule.id);
      const color = isCompleted ? '#22C55E' : '#F97316';
      return {
        label: buildMedicineLabel(schedule),
        status: isCompleted
          ? '완료'
          : `${formatScheduleTimeLabel(schedule)} 예정`,
        icon: isCompleted ? faCircleCheck : faClock,
        iconColor: color,
        statusColor: color,
      };
    });
  }, [
    scheduleLoading,
    medicationLogsLoading,
    scheduleError,
    medicationLogsError,
    sortedSchedules,
    todayMedicationLogIds,
  ]);

  const medicineCard = useMemo<OverviewCard>(() => {
    let badgeText = '일정 없음';
    let badgeBg = '#E2E8F0';
    let badgeColor = '#475569';
    let footer = '복약 일정을 확인하세요.';
    let footerColor = '#94A3B8';

    if (scheduleLoading || medicationLogsLoading) {
      badgeText = '불러오는 중';
    } else if (scheduleError || medicationLogsError) {
      badgeText = '오류';
      badgeBg = '#FEE2E2';
      badgeColor = '#EF4444';
      footer = '복약 정보를 불러오지 못했습니다.';
      footerColor = '#EF4444';
    } else if (sortedSchedules.length > 0) {
      const totalSchedules = sortedSchedules.length;
      const completed = Math.min(completedMedicationCount, totalSchedules);
      badgeText = `${completed}/${totalSchedules}`;
      if (completed >= totalSchedules) {
        badgeBg = '#DCFCE7';
        badgeColor = '#16A34A';
        footer = '오늘 복약 일정 완료';
        footerColor = '#16A34A';
      } else {
        badgeBg = '#FEF3C7';
        badgeColor = '#F59E0B';
        if (upcomingMedicationSchedule) {
          footer = `다음 복약: ${formatScheduleTimeLabel(upcomingMedicationSchedule)}`;
        } else if (hasOverdueMedication) {
          footer = '지나간 복약 일정 확인이 필요합니다.';
          footerColor = '#F97316';
        }
      }
    }

    return {
      key: 'medicine-status',
      title: '복약 현황',
      icon: faPills,
      iconColor: '#2563EB',
      iconBg: '#DBEAFE',
      badgeText,
      badgeBg,
      badgeColor,
      footer,
      footerIcon: faCalendarDays,
      footerColor,
      entries: medicineEntries,
    };
  }, [
    scheduleLoading,
    medicationLogsLoading,
    scheduleError,
    medicationLogsError,
    sortedSchedules,
    completedMedicationCount,
    upcomingMedicationSchedule,
    hasOverdueMedication,
    medicineEntries,
  ]);

  const todayOverview = useMemo(
    () => [healthCard, medicineCard],
    [healthCard, medicineCard],
  );

  if (isLoading) {
    return (
      <Container>
        <ActivityIndicator size="large" color={COLOR.DEFAULT_COLOR} />
      </Container>
    );
  }

  const hasSenior = seniors.length > 0;
  const primarySenior = hasSenior ? seniors[0] : null;
  const profileImageSource =
    hasSenior && primarySenior?.profileImage
      ? require('../assets/senior-female.jpg')
      : require('../assets/profile-fill2.png');
  const showStatus = hasSenior;

  const navigateHandler = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const featureCards = [
    {
      key: 'medicine',
      title: '복약 확인 · 설정',
      subtitle: '복약 확인 및 시간 설정',
      screen: 'MedicineTimeScreen',
      icon: faPills,
      accent: '#EF4444',
      bg: '#FEE2E2',
    },
    {
      key: 'schedule',
      title: '외부 일정 설정',
      subtitle: '병원·모임 등 일정 관리',
      screen: 'ScheduleScreen',
      icon: faCalendarDays,
      accent: '#3B82F6',
      bg: '#DBEAFE',
    },
    {
      key: 'health',
      title: '건강 체크',
      subtitle: '질문 작성 및 답변 확인',
      screen: 'HealthCheckScreen',
      icon: faHeartPulse,
      accent: '#F59E0B',
      bg: '#FEF3C7',
    },
    {
      key: 'game',
      title: '게임 사진 업로드',
      subtitle: '피보호자 게임 사진 등록',
      screen: 'PhotoUploadScreen',
      icon: faPuzzlePiece,
      accent: '#6366F1',
      bg: '#E0E7FF',
    },
  ] as const;

  return (
    <Container>
      {/* 보호자 요약 카드 */}
      <Pressable
        style={styles.summaryCard}
        onPress={() => navigateHandler('ClientageProfileScreen')}>
        <View style={styles.summaryAvatar}>
          <Image
            source={profileImageSource}
            style={styles.summaryImage}
            resizeMode={
              hasSenior && primarySenior?.profileImage ? 'cover' : 'contain'
            }
          />
        </View>
        <View style={{flex: 1, gap: 8}}>
          <Text style={styles.summaryName}>
            {hasSenior && primarySenior
              ? `${primarySenior.name}${
                  primarySenior.birthDate
                    ? ` (${calculateAge(primarySenior.birthDate)}세)`
                    : ''
                }`
              : '피보호자를 등록하세요'}
          </Text>
          {showStatus && (
            <>
              <Text>병력: {primarySenior?.medicalHistory}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4,
                }}>
                <View style={styles.greenDot} />
                <Text style={styles.summarySafe}>안전</Text>
              </View>
            </>
          )}
        </View>
      </Pressable>

      {/* 주요 기능 */}
      <View style={styles.cardGrid}>
        {featureCards.map(card => (
          <Pressable
            key={card.key}
            style={styles.featureCard}
            onPress={() => navigateHandler(card.screen)}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View style={[styles.iconWrap, {backgroundColor: card.bg}]}>
                <FontAwesomeIcon
                  icon={card.icon}
                  size={22}
                  color={card.accent}
                />
              </View>
            </View>
            <Text style={styles.featureTitle}>{card.title}</Text>
            <Text style={styles.featureSubtitle}>{card.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>오늘의 현황</Text>
      <ScrollView
        style={styles.statusColumn}
        showsVerticalScrollIndicator={false}>
        {todayOverview.map(card => (
          <Pressable
            key={card.key}
            style={styles.statusCard}
            onPress={() => {
              if (card.key === 'health-status') {
                navigateHandler('HealthCheckCalendarScreen');
              } else if (card.key === 'medicine-status') {
                navigateHandler('CalendarScreen');
              }
            }}>
            <View style={styles.statusHeader}>
              <View style={styles.statusTitleRow}>
                <View
                  style={[
                    styles.statusIconWrap,
                    {backgroundColor: card.iconBg},
                  ]}>
                  <FontAwesomeIcon
                    icon={card.icon}
                    size={18}
                    color={card.iconColor}
                  />
                </View>
                <Text style={styles.statusTitle}>{card.title}</Text>
              </View>
              <View
                style={[styles.statusBadge, {backgroundColor: card.badgeBg}]}>
                <Text
                  style={[styles.statusBadgeText, {color: card.badgeColor}]}>
                  {card.badgeText}
                </Text>
              </View>
            </View>

            <View style={styles.statusBody}>
              {card.entries.map(entry => (
                <View
                  key={`${card.key}-${entry.label}`}
                  style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{entry.label}</Text>
                  <View style={styles.statusValueWrap}>
                    <FontAwesomeIcon
                      icon={entry.icon}
                      size={12}
                      color={entry.iconColor}
                      style={{marginRight: 4}}
                    />
                    <Text
                      style={[
                        styles.statusValue,
                        entry.statusColor ? {color: entry.statusColor} : null,
                      ]}>
                      {entry.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.statusFooter}>
              <FontAwesomeIcon
                icon={card.footerIcon}
                size={12}
                color={card.footerColor}
              />
              <Text
                style={[styles.statusFooterText, {color: card.footerColor}]}>
                {card.footer}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Container>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  summaryAvatar: {
    width: 60,
    height: 60,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  summaryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  summarySafe: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    gap: 4,
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },
  statusColumn: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBody: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    marginRight: 12,
  },
  statusValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusFooterText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
