import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  addExamQuestion,
  createExam,
  deleteExamQuestion,
  getEducatorExams,
  getExamForEducator,
  getErrorMessage,
  toggleExamPublish,
  updateExamQuestion,
} from '../../src/services/api';
import { colors, radius, typography } from '../../src/constants/theme';
import Button from '../../src/components/Button';
import ErrorState from '../../src/components/ErrorState';

export default function ManageExamScreen() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [savingExam, setSavingExam] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [timeLimit, setTimeLimit] = useState('30');
  const [maxAttempts, setMaxAttempts] = useState('3');

  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('0');
  const [marks, setMarks] = useState('1');

  const clearQuestionForm = useCallback(() => {
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('0');
    setMarks('1');
    setEditingQuestionId(null);
  }, []);

  const load = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const exams = await getEducatorExams();
      const existingExam = exams.find(
        (item) => item.courseId?._id?.toString() === courseId?.toString() || item.courseId?.toString() === courseId?.toString()
      );

      if (!existingExam) {
        setExam(null);
        setQuestions([]);
      } else {
        const data = await getExamForEducator(existingExam._id);
        setExam(data.exam);
        setQuestions(data.questions || []);
        setTitle(data.exam?.title || '');
        setDescription(data.exam?.description || '');
        setPassingScore(String(data.exam?.passingScore ?? 70));
        setTimeLimit(String(data.exam?.timeLimit ?? 30));
        setMaxAttempts(String(data.exam?.maxAttempts ?? 3));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const onCreateExam = async () => {
    if (!title.trim()) return Alert.alert('Validation', 'Enter exam title');
    setSavingExam(true);
    try {
      const newExam = await createExam({
        courseId,
        title: title.trim(),
        description: description.trim(),
        passingScore: Number(passingScore),
        timeLimit: Number(timeLimit),
        maxAttempts: Number(maxAttempts),
      });
      setExam(newExam);
      Alert.alert('Success', 'Exam created successfully');
      await load();
    } catch (err) {
      Alert.alert('Unable to create exam', getErrorMessage(err));
    } finally {
      setSavingExam(false);
    }
  };

  const onAddQuestion = async () => {
    if (!exam?._id) return Alert.alert('Create exam first', 'You need an exam before adding questions.');
    if (!questionText.trim()) return Alert.alert('Validation', 'Enter the question text');
    const options = [optionA, optionB, optionC, optionD].map((x) => x.trim());
    if (options.some((x) => !x)) return Alert.alert('Validation', 'Fill all four options');
    setAddingQuestion(true);
    try {
      await addExamQuestion({
        examId: exam._id,
        questionText: questionText.trim(),
        options,
        correctAnswer: Number(correctAnswer),
        marks: Number(marks),
        order: questions.length + 1,
      });
      clearQuestionForm();
      await load();
    } catch (err) {
      Alert.alert('Unable to add question', getErrorMessage(err));
    } finally {
      setAddingQuestion(false);
    }
  };

  const onEditQuestion = (question) => {
    setEditingQuestionId(question._id);
    setQuestionText(question.questionText || '');
    setOptionA(question.options?.[0] || '');
    setOptionB(question.options?.[1] || '');
    setOptionC(question.options?.[2] || '');
    setOptionD(question.options?.[3] || '');
    setCorrectAnswer(String(question.correctAnswer ?? 0));
    setMarks(String(question.marks ?? 1));
  };

  const onUpdateQuestion = async () => {
    if (!editingQuestionId) return;
    if (!questionText.trim()) return Alert.alert('Validation', 'Enter the question text');
    const options = [optionA, optionB, optionC, optionD].map((x) => x.trim());
    if (options.some((x) => !x)) return Alert.alert('Validation', 'Fill all four options');
    setAddingQuestion(true);
    try {
      await updateExamQuestion(editingQuestionId, {
        questionText: questionText.trim(),
        options,
        correctAnswer: Number(correctAnswer),
        marks: Number(marks),
      });
      clearQuestionForm();
      await load();
    } catch (err) {
      Alert.alert('Unable to update question', getErrorMessage(err));
    } finally {
      setAddingQuestion(false);
    }
  };

  const onDeleteQuestion = async (questionId) => {
    Alert.alert('Delete question', 'Are you sure you want to delete this question?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExamQuestion(questionId);
            await load();
          } catch (err) {
            Alert.alert('Unable to delete question', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  const onTogglePublish = async () => {
    if (!exam?._id) return;
    setPublishing(true);
    try {
      await toggleExamPublish(exam._id);
      await load();
    } catch (err) {
      Alert.alert('Unable to update publish status', getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}><Text style={typography.h2}>Manage Exam</Text></View>
        <Text style={styles.loading}>Loading exam data…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
          <Text style={typography.h2}>Manage Exam</Text>
        </View>

        {error ? <ErrorState message={error} onRetry={load} /> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{exam ? 'Exam Details' : 'Create Exam'}</Text>
          <Field label="Title" value={title} onChangeText={setTitle} />
          <Field label="Description" value={description} onChangeText={setDescription} multiline />
          <Field label="Passing Score" value={passingScore} onChangeText={setPassingScore} keyboardType="numeric" />
          <Field label="Time Limit (minutes)" value={timeLimit} onChangeText={setTimeLimit} keyboardType="numeric" />
          <Field label="Max Attempts" value={maxAttempts} onChangeText={setMaxAttempts} keyboardType="numeric" />
          {!exam ? (
            <Button title="Create Exam" loading={savingExam} onPress={onCreateExam} />
          ) : (
            <Button
              title={exam.isPublished ? 'Unpublish Exam' : 'Publish Exam'}
              variant={exam.isPublished ? 'outline' : 'primary'}
              loading={publishing}
              onPress={onTogglePublish}
            />
          )}
        </View>

        {exam ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{editingQuestionId ? 'Edit Question' : 'Add Question'}</Text>
            <Field label="Question" value={questionText} onChangeText={setQuestionText} multiline />
            <Field label="Option A" value={optionA} onChangeText={setOptionA} />
            <Field label="Option B" value={optionB} onChangeText={setOptionB} />
            <Field label="Option C" value={optionC} onChangeText={setOptionC} />
            <Field label="Option D" value={optionD} onChangeText={setOptionD} />
            <Field label="Correct Answer Index (0-3)" value={correctAnswer} onChangeText={setCorrectAnswer} keyboardType="numeric" />
            <Field label="Marks" value={marks} onChangeText={setMarks} keyboardType="numeric" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button title={editingQuestionId ? 'Update Question' : 'Add Question'} loading={addingQuestion} onPress={editingQuestionId ? onUpdateQuestion : onAddQuestion} style={{ flex: 1 }} />
              {editingQuestionId ? <Button title="Cancel" variant="outline" onPress={clearQuestionForm} style={{ flex: 1 }} /> : null}
            </View>
          </View>
        ) : null}

        {exam ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Questions ({questions.length})</Text>
            {questions.length === 0 ? (
              <Text style={styles.empty}>No questions added yet.</Text>
            ) : (
              questions.map((question, index) => (
                <View key={question._id} style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionIndex}>Question {index + 1}</Text>
                    <View style={{ flexDirection: 'row', gap: 14 }}>
                      <Pressable onPress={() => onEditQuestion(question)}>
                        <Ionicons name="create-outline" size={18} color={colors.primaryDark} />
                      </Pressable>
                      <Pressable onPress={() => onDeleteQuestion(question._id)}>
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.questionText}>{question.questionText}</Text>
                  {(question.options || []).map((option, optionIndex) => (
                    <Text key={`${question._id}-${optionIndex}`} style={styles.optionText}>
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </Text>
                  ))}
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, multiline, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, multiline && styles.inputMultiline]}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 28 },
  header: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  loading: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 46,
    color: colors.text,
  },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top', paddingVertical: 12 },
  empty: { color: colors.textSecondary, fontSize: 14 },
  questionCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
  },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  questionIndex: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  questionText: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  optionText: { fontSize: 13, color: colors.textSecondary, marginBottom: 3 },
});