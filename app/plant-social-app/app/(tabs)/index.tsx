import { Platform, StyleSheet, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import PlantCamera from '@/components/PlantCamera';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { uploadImage } from '@/lib/api';

export default function HomeScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handlePhotoTaken = async (uri: string) => {
    try {
      const result = await uploadImage(uri);
      console.log('Upload response:', result);
      Alert.alert(
        'Success!', 
        `Image uploaded!\nID: ${result.id}\nType: ${result.content_type}`
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', `Failed to upload image: ${error}`);
    } finally {
      setShowCamera(false);
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

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.greeting}>Hello, Plant Parent! 🌱</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Let's take care of your green friends
        </ThemedText>
      </View>

      {/* Main Action Card - Camera */}
      <TouchableOpacity 
        style={[styles.mainCard, { backgroundColor: colors.accent }]}
        onPress={() => setShowCamera(true)}
        activeOpacity={0.8}
      >
        <View style={styles.mainCardContent}>
          <View style={styles.mainCardIcon}>
            <IconSymbol name="camera.fill" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.mainCardText}>
            <ThemedText style={styles.mainCardTitle}>Get Plant Tips</ThemedText>
            <ThemedText style={styles.mainCardDescription}>
              Take a photo to get specific care tips for your plant
            </ThemedText>
          </View>
        </View>
        <View style={styles.mainCardArrow}>
          <IconSymbol name="chevron.right" size={24} color="rgba(255,255,255,0.7)" />
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
      </View>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.accentLight }]}>
            <IconSymbol name="drop.fill" size={24} color={colors.accent} />
          </View>
          <ThemedText style={styles.actionTitle}>Water</ThemedText>
          <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Log watering</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
            <IconSymbol name="sun.max.fill" size={24} color="#D97706" />
          </View>
          <ThemedText style={styles.actionTitle}>Light</ThemedText>
          <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Check exposure</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
            <IconSymbol name="leaf.fill" size={24} color="#4F46E5" />
          </View>
          <ThemedText style={styles.actionTitle}>Fertilize</ThemedText>
          <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Add nutrients</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FCE7F3' }]}>
            <IconSymbol name="heart.fill" size={24} color="#DB2777" />
          </View>
          <ThemedText style={styles.actionTitle}>Health</ThemedText>
          <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Check status</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Tips Card */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Today's Tip</ThemedText>
      </View>
      
      <View style={[styles.tipCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.tipContent}>
          <ThemedText style={styles.tipEmoji}>💡</ThemedText>
          <View style={styles.tipTextContainer}>
            <ThemedText style={styles.tipTitle}>Watering Tip</ThemedText>
            <ThemedText style={[styles.tipDescription, { color: colors.textSecondary }]}>
              Water your plants in the morning to give them time to absorb moisture before the heat of the day.
            </ThemedText>
          </View>
        </View>
      </View>
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  mainCard: {
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
  mainCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mainCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mainCardText: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mainCardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  mainCardArrow: {
    marginLeft: 8,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
