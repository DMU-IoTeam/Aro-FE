import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import Container from '../layouts/Container';
import CommonButton from '../components/common/CommonButton';
import Input from '../components/common/Input';
import {uploadPhoto} from '../api/photo';
import COLOR from '../constants/color';
import layout from '../constants/layout';

const PhotoUploadScreen = () => {
  const navigation = useNavigation();
  const [caption, setCaption] = useState('');
  const [photoAsset, setPhotoAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChoosePhoto = () => {
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.5},
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('오류', '사진을 선택하는 중 오류가 발생했습니다.');
        } else if (response.assets && response.assets[0]) {
          setPhotoAsset(response.assets[0]);
        } else {
          Alert.alert('오류', '사진을 처리할 수 없습니다.');
        }
      },
    );
  };

  const handleUpload = async () => {
    if (!photoAsset || !photoAsset.uri || !photoAsset.type || !photoAsset.fileName) {
      Alert.alert('알림', '먼저 사진을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await uploadPhoto({
        uri: photoAsset.uri,
        type: photoAsset.type,
        name: photoAsset.fileName,
        caption: caption,
      });
      Alert.alert('성공', '사진이 성공적으로 업로드되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      Alert.alert('오류', '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>사진 업로드</Text>

        <CommonButton onPress={handleChoosePhoto}>사진 선택</CommonButton>

        {photoAsset?.uri && (
          <Image source={{uri: photoAsset.uri}} style={styles.imagePreview} />
        )}

        <Input
          value={caption}
          onChangeText={setCaption}
          placeholder="사진에 대한 설명을 입력하세요..."
          style={styles.input}
          multiline
        />

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={COLOR.DEFAULT_COLOR} />
          ) : (
            <CommonButton onPress={handleUpload}>업로드</CommonButton>
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
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: layout.BORDER_RADIUS,
    marginTop: 20,
    backgroundColor: '#eee',
  },
  input: {
    marginTop: 20,
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 30,
  },
});

export default PhotoUploadScreen;
