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
import CommonButton from '../components/common/CommonButton';
import {uploadPhoto} from '../api/photo';
import COLOR from '../constants/color';
import layout from '../constants/layout';

const PhotoUploadScreen = () => {
  const navigation = useNavigation();
  const [photoAssets, setPhotoAssets] = useState<Asset[]>([]);
  const [captions, setCaptions] = useState<{[uri: string]: string}>({});
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
          setPhotoAssets(prevAssets => [...prevAssets, ...response.assets]);
        }
      },
    );
  };

  const handleRemovePhoto = (uriToRemove: string) => {
    setPhotoAssets(prevAssets =>
      prevAssets.filter(asset => asset.uri !== uriToRemove),
    );
    setCaptions(prevCaptions => {
      const newCaptions = {...prevCaptions};
      delete newCaptions[uriToRemove];
      return newCaptions;
    });
  };

  const handleCaptionChange = (uri: string, text: string) => {
    setCaptions(prev => ({...prev, [uri]: text}));
  };

  const handleUpload = async () => {
    if (photoAssets.length === 0) {
      Alert.alert('알림', '먼저 사진을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const uploadPromises = photoAssets.map(asset => {
        if (!asset.uri || !asset.type || !asset.fileName) {
          throw new Error(`Invalid photo asset: ${asset.uri}`);
        }
        return uploadPhoto({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
          caption: captions[asset.uri] || '',
        });
      });

      await Promise.all(uploadPromises);

      Alert.alert(
        '성공',
        `${photoAssets.length}장의 사진이 성공적으로 업로드되었습니다.`,
        [{text: '확인', onPress: () => navigation.goBack()}],
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('오류', '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>사진 업로드</Text>

        <CommonButton onPress={handleChoosePhoto}>사진 추가</CommonButton>

        {photoAssets.length > 0 && (
          <View style={styles.listContainer}>
            {photoAssets.map(asset => (
              <View key={asset.uri} style={styles.imageContainer}>
                <Image source={{uri: asset.uri}} style={styles.imagePreview} />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemovePhoto(asset.uri!)}>
                  <Text style={styles.removeButtonText}>X</Text>
                </Pressable>
                <TextInput
                  style={styles.captionInput}
                  placeholder="설명 입력..."
                  placeholderTextColor="#999"
                  value={captions[asset.uri!] || ''}
                  onChangeText={text => handleCaptionChange(asset.uri!, text)}
                />
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={COLOR.DEFAULT_COLOR} />
          ) : (
            <CommonButton onPress={handleUpload}>
              {`${photoAssets.length}장 업로드`}
            </CommonButton>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    marginTop: 20,
    gap: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: layout.BORDER_RADIUS,
    backgroundColor: '#eee',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: layout.BORDER_RADIUS,
    padding: 10,
    marginTop: 8,
    fontSize: 14,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginTop: 30,
  },
});

export default PhotoUploadScreen;
