// ---------------------------------------------------
// --- 메인 화면 ---------------------------------------
// ---------------------------------------------------
import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Container from '../layouts/Container';
import COLOR from '../constants/color';
import {useSeniors} from '../hooks/useSeniors';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCalendarDays,
} from '@fortawesome/free-regular-svg-icons';
import {faPills, faHeartPulse, faPuzzlePiece} from '@fortawesome/free-solid-svg-icons';

const MainScreen = () => {
  const navigation = useNavigation();
  const {seniors, isLoading, error, calculateAge} = useSeniors();
  console.log('Seniors data:', seniors);

  const navigateHandler = (screen: string) => {
    navigation.navigate(screen);
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

  if (isLoading) {
    return (
      <Container>
        <ActivityIndicator size="large" color={COLOR.DEFAULT_COLOR} />
      </Container>
    );
  }

  // if (error) {
  //   return (
  //     <Container>
  //       <Text>데이터를 불러오는 데 실패했습니다: {error.message}</Text>
  //     </Container>
  //   );
  // }

  const hasSenior = seniors.length > 0;
  const primarySenior = hasSenior ? seniors[0] : null;
  const profileImageSource =
    hasSenior && primarySenior?.profileImage
      ? require('../assets/senior-female.jpg')
      : require('../assets/profile-fill2.png');
  const showStatus = hasSenior;

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
            resizeMode={hasSenior && primarySenior?.profileImage ? 'cover' : 'contain'}
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
              <Text style={styles.summaryMeta}>마지막 확인: 2시간 전</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                <View style={styles.greenDot} />
                <Text style={styles.summarySafe}>안전</Text>
              </View>
            </>
          )}
        </View>
      </Pressable>

      {/* 주요 기능 */}
      <Text style={styles.sectionTitle}>주요 기능</Text>
      <View style={styles.cardGrid}>
        {featureCards.map(card => (
          <Pressable
            key={card.key}
            style={styles.featureCard}
            onPress={() => navigateHandler(card.screen)}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <View style={[styles.iconWrap, {backgroundColor: card.bg}]}> 
                <FontAwesomeIcon icon={card.icon} size={22} color={card.accent} />
              </View>
            </View>
            <Text style={styles.featureTitle}>{card.title}</Text>
            <Text style={styles.featureSubtitle}>{card.subtitle}</Text>
          </Pressable>
        ))}
      </View>
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
    marginBottom: 20,
  },
  featureCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    justifyContent: 'center',
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statChip: {
    width: '32%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  statSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
