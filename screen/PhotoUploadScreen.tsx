import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import {useFocusEffect} from '@react-navigation/native';
import {useSeniorStore} from '../store/senior.store';
import {uploadPhoto, getSeniorPhotos, SeniorPhoto} from '../api/photo';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPlus,
  faXmark,
  faArrowRotateRight,
} from '@fortawesome/free-solid-svg-icons';

type TabKey = 'upload' | 'gallery';

const PhotoUploadScreen = () => {
  const {seniors} = useSeniorStore();
  const seniorId = seniors[0]?.id;

  const [activeTab, setActiveTab] = useState<TabKey>('upload');
  const [photoAssets, setPhotoAssets] = useState<Asset[]>([]);

  type PhotoMeta = {caption: string; distractorOptions: string[]};
  const createDefaultMeta = (): PhotoMeta => ({
    caption: '',
    distractorOptions: ['', '', ''],
  });

  const [quizByUri, setQuizByUri] = useState<Record<string, PhotoMeta>>({});
  const [isUploading, setIsUploading] = useState(false);

  const [uploadedPhotos, setUploadedPhotos] = useState<SeniorPhoto[]>([]);
  const [isFetchingPhotos, setIsFetchingPhotos] = useState(false);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  const fetchUploadedPhotos = useCallback(async () => {
    if (!seniorId) {
      return;
    }
    try {
      setIsFetchingPhotos(true);
      setFetchError(null);
      const photos = await getSeniorPhotos(seniorId);
      setUploadedPhotos(photos);
    } catch (error) {
      console.error('Failed to fetch uploaded photos:', error);
      setFetchError(error as Error);
    } finally {
      setIsFetchingPhotos(false);
    }
  }, [seniorId]);

  useEffect(() => {
    if (activeTab === 'gallery') {
      fetchUploadedPhotos();
    }
  }, [activeTab, fetchUploadedPhotos]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'gallery') {
        fetchUploadedPhotos();
      }
    }, [activeTab, fetchUploadedPhotos]),
  );

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
            setQuizByUri(prev => {
              const next = {...prev};
              response.assets?.forEach(a => {
                if (a.uri && !next[a.uri]) {
                  next[a.uri] = createDefaultMeta();
                }
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

    setIsUploading(true);
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
      setPhotoAssets([]);
      setQuizByUri({});
      setActiveTab('gallery');
      await fetchUploadedPhotos();
      Alert.alert('성공', '사진이 업로드되었습니다.');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('오류', '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderUploadTab = () => (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
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
                  onPress={() => asset.uri && handleRemovePhoto(asset.uri)}>
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
                    <Text style={styles.inputLabel}>오답 후보 {index + 1}</Text>
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
      <View style={{marginTop: 20}}>
        {isUploading ? (
          <View style={[styles.primaryBtn, styles.primaryBtnLoading]}>
            <ActivityIndicator color={'white'} />
          </View>
        ) : (
          <Pressable style={styles.primaryBtn} onPress={handleUpload}>
            <Text style={{color: 'white', fontWeight: '700'}}>업로드</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );

  const renderGalleryTab = () => (
    <ScrollView
      contentContainerStyle={styles.galleryContainer}
      showsVerticalScrollIndicator={false}>
      {!seniorId ? (
        <View style={styles.galleryEmpty}>
          <Text style={styles.emptyText}>피보호자를 먼저 등록해주세요.</Text>
        </View>
      ) : isFetchingPhotos ? (
        <View style={styles.galleryEmpty}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : fetchError ? (
        <View style={styles.galleryEmpty}>
          <Text style={styles.emptyText}>사진을 불러오지 못했습니다.</Text>
          <Pressable style={styles.retryBtn} onPress={fetchUploadedPhotos}>
            <FontAwesomeIcon
              icon={faArrowRotateRight}
              size={14}
              color="#3B82F6"
            />
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : uploadedPhotos.length === 0 ? (
        <View style={styles.galleryEmpty}>
          <Text style={styles.emptyText}>업로드된 사진이 없습니다.</Text>
        </View>
      ) : (
        <View style={{gap: 16}}>
          {uploadedPhotos.map(photo => (
            <View key={photo.id} style={styles.galleryCard}>
              <Image source={{uri: photo.imageUrl}} style={styles.galleryImage} />
              <View style={styles.galleryFieldSection}>
                <View>
                  <Text style={styles.inputLabel}>정답</Text>
                  <View style={styles.galleryFieldBox}>
                    <Text style={styles.galleryFieldText}>
                      {photo.caption || '정답이 등록되지 않았습니다.'}
                    </Text>
                  </View>
                </View>

                <View style={{gap: 12}}>
                  {photo.distractorOptions.length > 0 ? (
                    photo.distractorOptions.map((option, index) => (
                      <View key={`${photo.id}-distractor-${index}`}>
                        <Text style={styles.inputLabel}>오답 후보 {index + 1}</Text>
                        <View style={styles.galleryFieldBox}>
                          <Text style={styles.galleryFieldText}>{option}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View>
                      <Text style={styles.inputLabel}>오답 후보</Text>
                      <View style={styles.galleryFieldBox}>
                        <Text style={styles.galleryFieldText}>
                          등록된 오답 후보가 없습니다.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 90}>
      <View style={styles.wrapper}>
        <View style={styles.tabBar}>
          <Pressable
            style={[
              styles.tabButton,
              activeTab === 'upload' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('upload')}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'upload' && styles.tabButtonTextActive,
              ]}>
              사진 업로드
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tabButton,
              activeTab === 'gallery' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('gallery')}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'gallery' && styles.tabButtonTextActive,
              ]}>
              업로드된 사진
            </Text>
          </Pressable>
        </View>

        {activeTab === 'upload' ? renderUploadTab() : renderGalleryTab()}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  tabButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  tabButtonTextActive: {
    color: 'white',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  galleryContainer: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
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
    height: 300,
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
  addCardText: {
    color: '#475569',
    fontWeight: '700',
  },
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
  primaryBtnLoading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryEmpty: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  retryText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  galleryCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  galleryImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  galleryFieldSection: {
    marginTop: 16,
    gap: 16,
  },
  galleryFieldBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  galleryFieldText: {
    fontSize: 14,
    color: '#1F2937',
  },
});

export default PhotoUploadScreen;
