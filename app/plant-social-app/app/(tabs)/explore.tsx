import { Platform, StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PlantGuide {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

const plantGuides: PlantGuide[] = [
  {
    id: '1',
    title: 'Watering Basics',
    description: 'Learn when and how much to water different types of plants',
    icon: 'drop.fill',
    iconColor: '#0EA5E9',
    iconBg: '#E0F2FE',
  },
  {
    id: '2',
    title: 'Light Requirements',
    description: 'Understanding direct, indirect, and low light needs',
    icon: 'sun.max.fill',
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
  },
  {
    id: '3',
    title: 'Soil & Repotting',
    description: 'Choosing the right soil and when to repot your plants',
    icon: 'leaf.fill',
    iconColor: '#2D6A4F',
    iconBg: '#D8F3DC',
  },
  {
    id: '4',
    title: 'Common Problems',
    description: 'Identify and fix yellowing leaves, pests, and diseases',
    icon: 'exclamationmark.triangle.fill',
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
  },
  {
    id: '5',
    title: 'Indoor Plants',
    description: 'Best practices for keeping houseplants healthy and happy',
    icon: 'house.fill',
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
  },
  {
    id: '6',
    title: 'Propagation',
    description: 'How to grow new plants from cuttings and divisions',
    icon: 'arrow.triangle.branch',
    iconColor: '#059669',
    iconBg: '#D1FAE5',
  },
];

interface QuickTip {
  emoji: string;
  tip: string;
}

const quickTips: QuickTip[] = [
  { emoji: '🪴', tip: 'Most houseplants prefer to dry out slightly between waterings' },
  { emoji: '🌡️', tip: 'Keep plants away from cold drafts and heating vents' },
  { emoji: '🧹', tip: 'Dust leaves regularly to help plants photosynthesize' },
  { emoji: '💧', tip: 'Use room temperature water to avoid shocking roots' },
];

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Plant Care Guides</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Everything you need to keep your plants thriving
        </ThemedText>
      </View>

      {/* Quick Tips Section */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Quick Tips</ThemedText>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tipsScroll}
      >
        {quickTips.map((item, index) => (
          <View 
            key={index}
            style={[styles.tipCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          >
            <ThemedText style={styles.tipEmoji}>{item.emoji}</ThemedText>
            <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
              {item.tip}
            </ThemedText>
          </View>
        ))}
      </ScrollView>

      {/* Guides Section */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Care Guides</ThemedText>
      </View>

      <View style={styles.guidesContainer}>
        {plantGuides.map((guide) => (
          <TouchableOpacity 
            key={guide.id}
            style={[styles.guideCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={[styles.guideIcon, { backgroundColor: guide.iconBg }]}>
              <IconSymbol name={guide.icon as any} size={24} color={guide.iconColor} />
            </View>
            <View style={styles.guideContent}>
              <ThemedText style={styles.guideTitle}>{guide.title}</ThemedText>
              <ThemedText style={[styles.guideDescription, { color: colors.textSecondary }]}>
                {guide.description}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Featured Section */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Featured</ThemedText>
      </View>

      <View style={[styles.featuredCard, { backgroundColor: colors.accent }]}>
        <View style={styles.featuredContent}>
          <ThemedText style={styles.featuredEmoji}>🌿</ThemedText>
          <View style={styles.featuredText}>
            <ThemedText style={styles.featuredTitle}>Plant of the Week</ThemedText>
            <ThemedText style={styles.featuredSubtitle}>
              Pothos - The perfect beginner plant that thrives in low light
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tipsScroll: {
    paddingRight: 20,
    marginBottom: 20,
  },
  tipCard: {
    width: 180,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  guidesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  guideDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  featuredText: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
});
