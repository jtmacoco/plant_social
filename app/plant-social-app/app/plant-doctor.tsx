import { Platform, StyleSheet, TouchableOpacity, View, ScrollView, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import PlantCamera from '@/components/PlantCamera';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { diagnosePlant, PlantDoctorResponse } from '@/lib/api';

const STATUS_CONFIG = {
  healthy: { emoji: '✅', label: 'Healthy', color: '#16A34A', bg: '#DCFCE7' },
  needs_attention: { emoji: '⚠️', label: 'Needs Attention', color: '#D97706', bg: '#FEF3C7' },
  unhealthy: { emoji: '🚨', label: 'Unhealthy', color: '#DC2626', bg: '#FEE2E2' },
};

export default function PlantDoctorScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<PlantDoctorResponse | null>(null);
  const [userContext, setUserContext] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handlePhotoTaken = async (uri: string) => {
    setShowCamera(false);
    setLoading(true);
    try {
      const result = await diagnosePlant(uri, userContext);
      setDiagnosis(result);
    } catch (error) {
      console.error('Diagnosis error:', error);
      Alert.alert('Error', `Failed to diagnose plant: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) {
    return (
      <PlantCamera
        onPhotoTaken={handlePhotoTaken}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  const status = diagnosis ? STATUS_CONFIG[diagnosis.health_status] || STATUS_CONFIG.needs_attention : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <ThemedText style={styles.title}>Plant Doctor 🩺</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            AI-powered plant health diagnosis
          </ThemedText>
        </View>
      </View>

      {/* Context Input */}
      <View style={[styles.contextCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.contextHeader}>
          <IconSymbol name="info.circle.fill" size={20} color="#7C3AED" />
          <ThemedText style={styles.contextLabel}>Your Plant's Environment</ThemedText>
        </View>
        <TextInput
          style={[styles.contextInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholderTextColor={colors.textSecondary}
          placeholder="e.g. I live in Phoenix AZ, indoor plant, south-facing window, watered twice a week..."
          value={userContext}
          onChangeText={setUserContext}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <ThemedText style={[styles.contextHint, { color: colors.textSecondary }]}>
          Optional — helps the AI give location & climate-specific advice
        </ThemedText>
      </View>

      {/* Camera Action */}
      <TouchableOpacity
        style={[styles.cameraCard, { backgroundColor: '#7C3AED' }]}
        onPress={() => setShowCamera(true)}
        activeOpacity={0.8}
      >
        <View style={styles.cameraCardContent}>
          <View style={styles.cameraCardIcon}>
            <IconSymbol name="camera.fill" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.cameraCardText}>
            <ThemedText style={styles.cameraCardTitle}>
              {diagnosis ? 'Scan Another Plant' : 'Scan Your Plant'}
            </ThemedText>
            <ThemedText style={styles.cameraCardDescription}>
              Take a photo for an AI health checkup
            </ThemedText>
          </View>
        </View>
        <View style={styles.cameraCardArrow}>
          <IconSymbol name="chevron.right" size={24} color="rgba(255,255,255,0.7)" />
        </View>
      </TouchableOpacity>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Gemini is analyzing your plant...
          </ThemedText>
        </View>
      )}

      {/* Diagnosis Results */}
      {diagnosis && !loading && (
        <>
          {/* Plant Name & Status */}
          <View style={[styles.statusCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.statusHeader}>
              <ThemedText style={styles.plantName}>{diagnosis.plant_name}</ThemedText>
              {status && (
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <ThemedText style={[styles.statusText, { color: status.color }]}>
                    {status.emoji} {status.label}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={[styles.summary, { color: colors.textSecondary }]}>
              {diagnosis.summary}
            </ThemedText>
          </View>

          {/* Issues */}
          {diagnosis.issues.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>⚠️ Issues Detected</ThemedText>
              </View>
              {diagnosis.issues.map((issue, index) => (
                <View
                  key={index}
                  style={[styles.issueCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
                >
                  <View style={styles.issueIcon}>
                    <ThemedText style={styles.issueEmoji}>•</ThemedText>
                  </View>
                  <ThemedText style={[styles.issueText, { color: '#991B1B' }]}>
                    {issue}
                  </ThemedText>
                </View>
              ))}
            </>
          )}

          {/* Tips */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>💡 Care Tips</ThemedText>
          </View>
          {diagnosis.tips.map((tip, index) => (
            <View
              key={index}
              style={[styles.tipCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            >
              <View style={[styles.tipNumber, { backgroundColor: '#EDE9FE' }]}>
                <ThemedText style={[styles.tipNumberText, { color: '#7C3AED' }]}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={[styles.tipText, { color: colors.text }]}>
                {tip}
              </ThemedText>
            </View>
          ))}

          {/* Clear Button */}
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.border }]}
            onPress={() => setDiagnosis(null)}
          >
            <ThemedText style={[styles.clearButtonText, { color: colors.textSecondary }]}>
              Clear Results
            </ThemedText>
          </TouchableOpacity>
        </>
      )}

      {/* Empty state */}
      {!diagnosis && !loading && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyEmoji}>🌿</ThemedText>
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
            Ready to diagnose
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Take a photo of your plant and Gemini AI will identify it, check its health, and give you personalized care tips.
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  cameraCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cameraCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cameraCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cameraCardText: {
    flex: 1,
  },
  cameraCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cameraCardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  cameraCardArrow: {
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  plantName: {
    fontSize: 22,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  issueCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  issueIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  issueEmoji: {
    fontSize: 18,
    color: '#DC2626',
  },
  issueText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  contextCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  contextLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  contextInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
  },
  contextHint: {
    fontSize: 12,
    marginTop: 8,
  },
});
