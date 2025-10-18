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
  // 각 사진별 메타데이터
  type PhotoMeta = {caption: string; distractorOptions: string[]};
  const createDefaultMeta = (): PhotoMeta => ({
    caption: '',
    distractorOptions: ['', '', ''],
  });
  const [quizByUri, setQuizByUri] = useState<Record<string, PhotoMeta>>({});
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
                if (a.uri && !next[a.uri]) next[a.uri] = createDefaultMeta();
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
  const updateMeta = (uri: string, updater: (m: PhotoMeta) => PhotoMeta) =>
    setQuizByUri(prev => {
      const current = prev[uri] ?? createDefaultMeta();
      return {
        ...prev,
        [uri]: updater(current),
      };
    });
  const setCaptionFor = (uri: string, text: string) =>
    updateMeta(uri, m => ({...m, caption: text}));
  const setDistractorFor = (uri: string, index: number, text: string) =>
    updateMeta(uri, m => {
      const nextOptions = [...m.distractorOptions];
      nextOptions[index] = text;
      return {...m, distractorOptions: nextOptions};
    });

  const handleUpload = async () => {
    if (photoAssets.length === 0) {
      Alert.alert('알림', '먼저 사진을 추가해주세요.');
      return;
    }
    // 검증: 각 사진별 메타 체크
    for (const asset of photoAssets) {
      const meta = asset.uri ? quizByUri[asset.uri] : undefined;
      if (!asset.uri || !meta) {
        Alert.alert('알림', '일부 사진의 메타데이터가 없습니다.');
        return;
      }
      if (!meta.caption.trim()) {
        Alert.alert('알림', '정답을 입력해주세요.');
        return;
      }
      if (!meta.distractorOptions.every(opt => opt.trim())) {
        Alert.alert('알림', '오답 후보를 모두 입력해주세요.');
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
          caption: meta.caption,
          distractorOptions: meta.distractorOptions
            .map(opt => opt.trim())
            .join(','),
        });
      });
      await Promise.all(uploadPromises);
      Alert.alert('성공', '사진이 업로드되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('오류', '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* 업로드 및 사진 카드 리스트 */}
        <Text style={styles.sectionTitle}>사진 업로드</Text>
        {photoAssets.length === 0 ? (
          <Pressable
            style={[styles.uploadCard, styles.addCard]}
            onPress={handleChoosePhoto}>
            <FontAwesomeIcon icon={faPlus} size={18} color="#64748B" />
            <Text style={styles.addCardText}>새 사진 추가</Text>
          </Pressable>
        ) : (
          <View style={{gap: 16}}>
            {photoAssets.map(asset => {
              const meta = asset.uri
                ? quizByUri[asset.uri] || createDefaultMeta()
                : createDefaultMeta();
              return (
                <View key={asset.uri} style={styles.problemCard}>
                  <Image source={{uri: asset.uri}} style={styles.cardImage} />
                  <Pressable
                    style={styles.cardRemove}
                    onPress={() => handleRemovePhoto(asset.uri!)}>
                    <FontAwesomeIcon icon={faXmark} size={12} color="#FFFFFF" />
                  </Pressable>

                  <Text style={styles.inputLabel}>정답</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="정답을 입력하세요"
                    value={meta.caption}
                    onChangeText={t => asset.uri && setCaptionFor(asset.uri, t)}
                  />
                  {meta.distractorOptions.map((option, index) => (
                    <View key={index} style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        오답 후보 {index + 1}
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="오답 후보를 입력하세요"
                        value={option}
                        onChangeText={text =>
                          asset.uri && setDistractorFor(asset.uri, index, text)
                        }
                      />
                    </View>
                  ))}
                </View>
              );
            })}

            <Pressable
              style={[styles.uploadCard, styles.addCard]}
              onPress={handleChoosePhoto}>
              <FontAwesomeIcon icon={faPlus} size={18} color="#64748B" />
              <Text style={styles.addCardText}>새 사진 추가</Text>
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
              <Text style={{color: 'white', fontWeight: '700'}}>업로드</Text>
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
    height: 250,
    resizeMode: 'cover',
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
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
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
