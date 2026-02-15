import { Platform, StyleSheet, TouchableOpacity, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import PlantCamera from '@/components/PlantCamera';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { uploadImage, PlantTip } from '@/lib/api';

// ── Quick Action advice data ──────────────────────────────────────
const QUICK_ADVICE: Record<string, { emoji: string; items: string[] }> = {
  water: {
    emoji: '💧',
    items: [
      'Water in the morning so leaves dry before evening, reducing fungal risk.',
      'Stick your finger 1-2 inches into the soil — if it\'s dry, it\'s time to water.',
      'Use room-temperature water; cold water can shock tropical roots.',
      'Water deeply until it drains from the bottom, then empty the saucer.',
      'Reduce watering by ~50% in winter when most plants go semi-dormant.',
      'Bottom-watering is great for African violets and plants that hate wet leaves.',
      'If soil pulls away from the pot edges, soak the whole pot in water for 20 minutes.',
    ],
  },
  light: {
    emoji: '☀️',
    items: [
      'Most houseplants thrive in bright, indirect light — think sheer-curtain filtered sun.',
      'Rotate your pots a quarter turn weekly so all sides get even light.',
      'North-facing windows give consistent low light; south-facing gives the most.',
      'If your plant is getting leggy (long gaps between leaves), it needs more light.',
      'White or bleached patches on leaves mean sunburn — move the plant back from the window.',
      'LED grow lights running 12-14 hrs/day can replace a sunny window in dark rooms.',
      'Variegated plants need brighter light than their solid-green cousins.',
    ],
  },
  fertilize: {
    emoji: '🌾',
    items: [
      'Feed monthly during spring and summer with a balanced liquid fertilizer at half strength.',
      'Stop fertilizing in fall and winter — plants aren\'t actively growing.',
      'Always water before fertilizing to prevent root burn on dry soil.',
      'Yellow lower leaves on an otherwise healthy plant can signal nitrogen deficiency.',
      'A white crust on soil is salt buildup from fertilizer — flush with plain water.',
      'Flowering plants benefit from phosphorus-rich fertilizer during blooming season.',
      'Slow-release granules are lower maintenance — one application lasts 3-4 months.',
    ],
  },
  health: {
    emoji: '🩺',
    items: [
      'Brown crispy leaf tips usually mean low humidity or inconsistent watering.',
      'Mushy, translucent stems are a sign of root rot — repot in fresh dry soil immediately.',
      'Sticky residue on leaves can indicate aphids, scale, or mealybugs.',
      'Fine webbing between leaves signals spider mites — increase humidity and treat with neem oil.',
      'Sudden leaf drop often means a temperature shock, draft, or recent move.',
      'Wipe large leaves with a damp cloth monthly to remove dust and improve photosynthesis.',
      'Isolate any plant showing signs of pests before they spread to neighbors.',
    ],
  },
};

// ── Rotating daily tips ───────────────────────────────────────────
const DAILY_TIPS = [
  { emoji: '💡', title: 'Watering Tip', text: 'Water your plants in the morning to give them time to absorb moisture before the heat of the day.' },
  { emoji: '🌤️', title: 'Light Check', text: 'Rotate your pots a quarter turn each week so every side of the plant gets even sunlight exposure.' },
  { emoji: '🧪', title: 'Fertilizer Reminder', text: 'During the growing season (spring/summer), feed your plants every 2-4 weeks with diluted liquid fertilizer.' },
  { emoji: '🪴', title: 'Repotting Sign', text: 'If roots are growing out of the drainage holes, it\'s time to go up one pot size with fresh soil.' },
  { emoji: '🐛', title: 'Pest Patrol', text: 'Check the undersides of leaves weekly for tiny pests. Catching them early makes treatment much easier.' },
  { emoji: '💨', title: 'Humidity Hack', text: 'Group your tropical plants together — they create a humid microclimate that benefits them all.' },
  { emoji: '✂️', title: 'Pruning Tip', text: 'Trim leggy stems back to a leaf node to encourage bushier, fuller growth on most houseplants.' },
  { emoji: '🧊', title: 'Cold Draft Alert', text: 'Keep plants away from cold windowsills and exterior doors in winter. Most tropicals suffer below 55°F.' },
  { emoji: '🍂', title: 'Leaf Care', text: 'Wipe dusty leaves with a damp cloth once a month so they can photosynthesize efficiently.' },
  { emoji: '🌱', title: 'Propagation Idea', text: 'Spring is the best time to take stem cuttings. Snip below a node, pop in water, and watch roots grow!' },
  { emoji: '🪨', title: 'Drainage Matters', text: 'Always use pots with drainage holes. Sitting water is the #1 killer of houseplants.' },
  { emoji: '🌿', title: 'Air Quality', text: 'Good air circulation reduces fungal problems. A small fan on low near your plants works wonders.' },
  { emoji: '🧂', title: 'Flush the Soil', text: 'Once a month, run plain water through pots to flush out mineral and fertilizer salt buildup.' },
  { emoji: '🌡️', title: 'Temperature', text: 'Most houseplants prefer 65-75°F during the day and slightly cooler at night. Avoid sudden swings.' },
];

export default function HomeScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<PlantTip[]>([]);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  // Pick today's tip based on day-of-year
  const todayTip = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
  }, []);

  const handlePhotoTaken = async (uri: string) => {
    setShowCamera(false);
    setLoading(true);
    try {
      const result = await uploadImage(uri);
      console.log('Upload response:', result);
      setTips(result.tips);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', `Failed to get plant tips: ${error}`);
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

      {/* Care Library Card - Pinecone/CLIP */}
      <TouchableOpacity 
        style={[styles.mainCard, { backgroundColor: colors.accent }]}
        onPress={() => setShowCamera(true)}
        activeOpacity={0.8}
      >
        <View style={styles.mainCardContent}>
          <View style={styles.mainCardIcon}>
            <IconSymbol name="book.fill" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.mainCardText}>
            <ThemedText style={styles.mainCardTitle}>Learn Care Basics</ThemedText>
            <ThemedText style={styles.mainCardDescription}>
              Snap a photo to get general care guides for watering, light, pests & soil
            </ThemedText>
          </View>
        </View>
        <View style={styles.mainCardArrow}>
          <IconSymbol name="chevron.right" size={24} color="rgba(255,255,255,0.7)" />
        </View>
      </TouchableOpacity>

      {/* Plant Doctor Card - Gemini AI */}
      <TouchableOpacity 
        style={[styles.doctorCard, { backgroundColor: '#7C3AED' }]}
        onPress={() => router.push('/plant-doctor' as any)}
        activeOpacity={0.8}
      >
        <View style={styles.mainCardContent}>
          <View style={styles.mainCardIcon}>
            <IconSymbol name="cross.case.fill" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.mainCardText}>
            <ThemedText style={styles.mainCardTitle}>AI Plant Doctor</ThemedText>
            <ThemedText style={styles.mainCardDescription}>
              Upload a photo & describe conditions for a custom diagnosis and care plan
            </ThemedText>
          </View>
        </View>
        <View style={styles.mainCardArrow}>
          <IconSymbol name="chevron.right" size={24} color="rgba(255,255,255,0.7)" />
        </View>
      </TouchableOpacity>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Analyzing your plant...
          </ThemedText>
        </View>
      )}

      {/* Plant Tips Results */}
      {tips.length > 0 && !loading && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.tipsHeaderRow}>
              <ThemedText style={styles.sectionTitle}>📚 General Care Guides</ThemedText>
              <TouchableOpacity onPress={() => setTips([])}>
                <ThemedText style={[styles.clearButton, { color: colors.accent }]}>Clear</ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Evergreen advice from our plant care library
            </ThemedText>
          </View>
          {tips.map((tip, index) => (
            <View
              key={tip.id}
              style={[styles.tipResultCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            >
              <View style={styles.tipResultHeader}>
                <View style={[styles.tipResultBadge, { backgroundColor: colors.accentLight }]}>
                  <ThemedText style={[styles.tipResultRank, { color: colors.accent }]}>
                    #{index + 1}
                  </ThemedText>
                </View>
                <View style={styles.tipResultTitleContainer}>
                  <ThemedText style={styles.tipResultTitle}>{tip.title}</ThemedText>
                  <ThemedText style={[styles.tipResultCategory, { color: colors.textSecondary }]}>
                    {tip.category} • {Math.round(tip.score * 100)}% match
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.tipResultText, { color: colors.textSecondary }]}>
                {tip.text}
              </ThemedText>
            </View>
          ))}
        </>
      )}

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Tap a topic for instant advice
        </ThemedText>
      </View>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={[
            styles.actionCard,
            { backgroundColor: colors.cardBackground, borderColor: activeQuickAction === 'water' ? colors.accent : colors.border },
            activeQuickAction === 'water' && { borderWidth: 2 },
          ]}
          activeOpacity={0.7}
          onPress={() => setActiveQuickAction(activeQuickAction === 'water' ? null : 'water')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.accentLight }]}>
            <IconSymbol name="drop.fill" size={24} color={colors.accent} />
          </View>
          <ThemedText style={styles.actionTitle}>Water</ThemedText>
          <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Watering tips</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.actionCard,
            { backgroundColor: colors.cardBackground, borderColor: activeQuickAction === 'light' ? '#D97706' : colors.border },
            activeQuickAction === 'light' && { borderWidth: 2 },
          ]}
          activeOpacity={0.7}
          onPress={() => setActiveQuickAction(activeQuickAction === 'light' ? null : 'light')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
            <IconSymbol name="sun.max.fill" size={24} color="#D97706" />
          </View>
          <ThemedText style={styles.actionTitle}>Light</ThemedText>
          <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Light guidance</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.actionCard,
            { backgroundColor: colors.cardBackground, borderColor: activeQuickAction === 'fertilize' ? '#4F46E5' : colors.border },
            activeQuickAction === 'fertilize' && { borderWidth: 2 },
          ]}
          activeOpacity={0.7}
          onPress={() => setActiveQuickAction(activeQuickAction === 'fertilize' ? null : 'fertilize')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
            <IconSymbol name="leaf.fill" size={24} color="#4F46E5" />
          </View>
          <ThemedText style={styles.actionTitle}>Fertilize</ThemedText>
          <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Nutrients</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.actionCard,
            { backgroundColor: colors.cardBackground, borderColor: activeQuickAction === 'health' ? '#DB2777' : colors.border },
            activeQuickAction === 'health' && { borderWidth: 2 },
          ]}
          activeOpacity={0.7}
          onPress={() => setActiveQuickAction(activeQuickAction === 'health' ? null : 'health')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FCE7F3' }]}>
            <IconSymbol name="heart.fill" size={24} color="#DB2777" />
          </View>
          <ThemedText style={styles.actionTitle}>Health</ThemedText>
          <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Diagnose issues</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Quick Action Advice Panel */}
      {activeQuickAction && QUICK_ADVICE[activeQuickAction] && (
        <View style={[styles.advicePanel, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.advicePanelHeader}>
            <ThemedText style={styles.advicePanelEmoji}>
              {QUICK_ADVICE[activeQuickAction].emoji}
            </ThemedText>
            <ThemedText style={styles.advicePanelTitle}>
              {activeQuickAction.charAt(0).toUpperCase() + activeQuickAction.slice(1)} Tips
            </ThemedText>
            <TouchableOpacity onPress={() => setActiveQuickAction(null)}>
              <ThemedText style={[styles.advicePanelClose, { color: colors.textSecondary }]}>✕</ThemedText>
            </TouchableOpacity>
          </View>
          {QUICK_ADVICE[activeQuickAction].items.map((item, index) => (
            <View key={index} style={[styles.adviceItem, { borderColor: colors.border }]}>
              <ThemedText style={[styles.adviceBullet, { color: colors.accent }]}>•</ThemedText>
              <ThemedText style={[styles.adviceText, { color: colors.text }]}>{item}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Today's Tip */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Today's Tip</ThemedText>
      </View>
      
      <View style={[styles.tipCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.tipContent}>
          <ThemedText style={styles.tipEmoji}>{todayTip.emoji}</ThemedText>
          <View style={styles.tipTextContainer}>
            <ThemedText style={styles.tipTitle}>{todayTip.title}</ThemedText>
            <ThemedText style={[styles.tipDescription, { color: colors.textSecondary }]}>
              {todayTip.text}
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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  doctorCard: {
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
  sectionSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipResultCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipResultBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipResultRank: {
    fontSize: 16,
    fontWeight: '700',
  },
  tipResultTitleContainer: {
    flex: 1,
  },
  tipResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  tipResultCategory: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  tipResultText: {
    fontSize: 14,
    lineHeight: 21,
  },
  advicePanel: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  advicePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  advicePanelEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  advicePanelTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  advicePanelClose: {
    fontSize: 18,
    padding: 4,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  adviceBullet: {
    fontSize: 18,
    marginRight: 10,
    marginTop: -1,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
