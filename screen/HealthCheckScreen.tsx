import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Container from '../layouts/Container';
import CommonButton from '../components/common/CommonButton';
import {useHealthCheckStore} from '../store/healthCheck.store';
import COLOR from '../constants/color';
import layout from '../constants/layout';

// Define navigation param types for type safety
type RootStackParamList = {
  HealthCheckQuestion: {questionId?: string};
  // ... other screens
};

type HealthCheckScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'HealthCheckQuestion'
>;

const HealthCheckScreen = () => {
  const navigation = useNavigation<HealthCheckScreenNavigationProp>();
  const {questions, deleteQuestion} = useHealthCheckStore();

  const handleDelete = (id: string) => {
    Alert.alert('질문 삭제', '정말로 이 질문을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {text: '삭제', style: 'destructive', onPress: () => deleteQuestion(id)},
    ]);
  };

  return (
    <Container>
      <View style={styles.header}>
        <Text style={styles.headerText}>건강 체크 질문 관리</Text>
      </View>

      <View style={styles.addQuestionButtonContainer}>
        <CommonButton onPress={() => navigation.navigate('HealthCheckQuestion')}>
          + 새로운 질문 추가
        </CommonButton>
      </View>

      <FlatList
        data={questions}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Pressable
            style={styles.questionItem}
            onPress={() =>
              navigation.navigate('HealthCheckQuestion', {questionId: item.id})
            }>
            <View style={styles.questionContent}>
              <Text style={styles.questionItemText} numberOfLines={1}>
                {item.text}
              </Text>
              <View style={styles.optionsPreviewContainer}>
                {item.options.map(option => (
                  <View key={option} style={styles.optionPreviewChip}>
                    <Text style={styles.optionPreviewText}>{option}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButtonText}>삭제</Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>질문을 추가해주세요.</Text>
          </View>
        }
      />
    </Container>
  );
};

export default HealthCheckScreen;

const styles = StyleSheet.create({
  header: {
    marginBottom: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addQuestionButtonContainer: {
    marginBottom: 20,
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: layout.BORDER_RADIUS,
  },
  questionContent: {
    flex: 1,
  },
  questionItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionsPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionPreviewChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  optionPreviewText: {
    fontSize: 12,
    color: '#333',
  },
  deleteButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ff3b30',
    borderRadius: 5,
    marginLeft: 15,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: 'grey',
  },
});