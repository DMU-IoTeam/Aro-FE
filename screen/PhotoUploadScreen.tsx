import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
  TextInput, // Use TextInput for individual captions
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import Container from '../layouts/Container';
import {uploadPhoto} from '../api/photo';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus, faXmark} from '@fortawesome/free-solid-svg-icons';

const PhotoUploadScreen = () => {
  const navigation = useNavigation();
  const [photoAssets, setPhotoAssets] = useState<Asset[]>([]);
  // 각 사진별 퀴즈 메타데이터
  type QuizMeta = {question: string; answer: string};
  const defaultMeta: QuizMeta = {question: '', answer: ''};
  const [quizByUri, setQuizByUri] = useState<Record<string, QuizMeta>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChoosePhoto = () => {
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.5, selectionLimit: 0},
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('오류', '사진을 선택하는 중 오류가 발생했습니다.');
        } else if (response.assets) {
          setPhotoAssets(prevAssets => {
            const merged = [...prevAssets, ...response.assets];
            // 새 자산에 대한 기본 메타 초기화
            setQuizByUri(prev => {
              const next = {...prev};
              response.assets?.forEach(a => {
                if (a.uri && !next[a.uri]) next[a.uri] = {...defaultMeta};
              });
              return next;
            });
            return merged;
          });
        }
      },
    );
  };

  const handleRemovePhoto = (uriToRemove: string) => {
    setPhotoAssets(prevAssets =>
      prevAssets.filter(asset => asset.uri !== uriToRemove),
    );
    setQuizByUri(prev => {
      const next = {...prev};
      delete next[uriToRemove];
      return next;
    });
  };

  // per-photo meta helpers
  const updateMeta = (uri: string, updater: (m: QuizMeta) => QuizMeta) =>
    setQuizByUri(prev => ({
      ...prev,
      [uri]: updater(prev[uri] || {...defaultMeta}),
    }));
  const setQuestionFor = (uri: string, text: string) =>
    updateMeta(uri, m => ({...m, question: text}));
  const setAnswerFor = (uri: string, text: string) =>
    updateMeta(uri, m => ({...m, answer: text}));

  const handleUpload = async () => {
    if (photoAssets.length === 0) {
      Alert.alert('알림', '먼저 문제 이미지를 추가해주세요.');
      return;
    }
    // 검증: 각 사진별 메타 체크
    for (const asset of photoAssets) {
      const meta = asset.uri ? quizByUri[asset.uri] : undefined;
      if (!asset.uri || !meta) {
        Alert.alert('알림', '일부 사진의 메타데이터가 없습니다.');
        return;
      }
      if (!meta.question?.trim()) {
        Alert.alert('알림', '질문을 입력해주세요.');
        return;
      }
      if (!meta.answer?.trim()) {
        Alert.alert('알림', '정답을 입력해주세요.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const uploadPromises = photoAssets.map(asset => {
        if (!asset.uri || !asset.fileName) {
          throw new Error(`Invalid photo asset: ${asset.uri}`);
        }
        const meta = quizByUri[asset.uri];
        return uploadPhoto({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName,
          caption: JSON.stringify(meta),
        });
      });
      await Promise.all(uploadPromises);
      Alert.alert('성공', '문제가 저장되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('오류', '문제 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* 업로드 및 문제 카드 리스트 */}
        <Text style={styles.sectionTitle}>문제 이미지</Text>
        {photoAssets.length === 0 ? (
          <Pressable
            style={[styles.uploadCard, styles.addCard]}
            onPress={handleChoosePhoto}>
            <FontAwesomeIcon icon={faPlus} size={18} color="#64748B" />
            <Text style={styles.addCardText}>새 질문 추가</Text>
          </Pressable>
        ) : (
          <View style={{gap: 16}}>
            {photoAssets.map(asset => {
              const meta = asset.uri
                ? quizByUri[asset.uri] || defaultMeta
                : defaultMeta;
              return (
                <View key={asset.uri} style={styles.problemCard}>
                  <Image source={{uri: asset.uri}} style={styles.cardImage} />
                  <Pressable
                    style={styles.cardRemove}
                    onPress={() => handleRemovePhoto(asset.uri!)}>
                    <FontAwesomeIcon icon={faXmark} size={12} color="#FFFFFF" />
                  </Pressable>
                  <Text style={styles.sectionTitle}>질문</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="이 사진에 나온 것은 무엇인가요?"
                    value={meta.question}
                    onChangeText={t =>
                      asset.uri && setQuestionFor(asset.uri, t)
                    }
                  />
                  <Text style={styles.sectionTitle}>정답</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="정답을 입력하세요"
                    value={meta.answer}
                    onChangeText={t => asset.uri && setAnswerFor(asset.uri, t)}
                  />
                </View>
              );
            })}

            <Pressable
              style={[styles.uploadCard, styles.addCard]}
              onPress={handleChoosePhoto}>
              <FontAwesomeIcon icon={faPlus} size={18} color="#64748B" />
              <Text style={styles.addCardText}>새 질문 추가</Text>
            </Pressable>
          </View>
        )}
        {/* 하단 버튼 */}
        <View style={{marginTop: 20}}>
          {isLoading ? (
            <View
              style={[
                styles.primaryBtn,
                {alignItems: 'center', justifyContent: 'center'},
              ]}>
              <ActivityIndicator color={'white'} />
            </View>
          ) : (
            <Pressable style={styles.primaryBtn} onPress={handleUpload}>
              <Text style={{color: 'white', fontWeight: '700'}}>문제 저장</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  uploadCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  problemCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  addCard: {
    height: 120,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
  },
  addCardText: {color: '#475569', fontWeight: '700'},
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  cardRemove: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PhotoUploadScreen;
