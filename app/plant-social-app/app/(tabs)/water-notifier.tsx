import { StyleSheet, FlatList, Platform, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Configure local notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type PlantItem = {
  id: string;
  name: string;
  location: string;
  daysLeft: number;
  isSensor?: boolean;
  status?: string;
  isConnected?: boolean;
  moisture?: number;
  message?: string;
};

interface SensorPlant {
  id: string;
  moisture: number;
  status: string;
  needs_water: boolean;
  updated_at: string;
}

export default function WaterNotifierScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [sensorData, setSensorData] = useState<SensorPlant[]>([]);
  const [plantTypes, setPlantTypes] = useState<Record<string, string>>({});
  const [aiResults, setAiResults] = useState<Record<string, any>>({});
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantLocation, setNewPlantLocation] = useState('');
  const notificationSentRef = useRef<Set<string>>(new Set());
  const plantTypesRef = useRef<Record<string, string>>({});
  const lastSensorTimestamps = useRef<Record<string, { iso: string, local: number }>>({});
  const aiResultsRef = useRef<Record<string, any>>({});
  const lastAiCall = useRef<Record<string, number>>({});

  useEffect(() => {
    plantTypesRef.current = plantTypes;
  }, [plantTypes]);

  useEffect(() => {
    aiResultsRef.current = aiResults;
  }, [aiResults]);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Poll for sensor data
    const interval = setInterval(fetchSensorStatus, 5000);
    fetchSensorStatus(); // Initial fetch

    return () => clearInterval(interval);
  }, []);

  const fetchSensorStatus = async () => {
    try {
      // Use localhost for simulator/emulator if env var not set
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/sensors/status`);
      if (response.ok) {
        const data: SensorPlant[] = await response.json();
        const now = Date.now();
        data.forEach(s => {
            const last = lastSensorTimestamps.current[s.id];
            if (!last || last.iso !== s.updated_at) {
                lastSensorTimestamps.current[s.id] = { iso: s.updated_at, local: now };
            }
        });
        setSensorData(data);
        checkAndNotify(data);
      }
    } catch (error) {
      console.log('Error fetching sensor status:', error);
    }
  };

  const checkAndNotify = async (data: SensorPlant[]) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
    const currentPlantTypes = plantTypesRef.current;
    const currentAiResults = aiResultsRef.current;
    const now = Date.now();

    for (const plant of data) {
      // If we have a plant type set for this sensor, check with AI
      if (currentPlantTypes[plant.id]) {
        const lastCall = lastAiCall.current[plant.id] || 0;
        if (now - lastCall < 1800000 && currentAiResults[plant.id]) {
          continue;
        }

        try {
          const res = await fetch(`${API_URL}/sensor-ai/analyze`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ plant_type: currentPlantTypes[plant.id], voltage: plant.moisture })
          });
          const aiData = await res.json();
          lastAiCall.current[plant.id] = Date.now();
          console.log(`[AI Decision] Sensor: ${plant.id}, Type: ${currentPlantTypes[plant.id]}, Voltage: ${plant.moisture}, Needs Water: ${aiData.needs_water}`);
          setAiResults(prev => ({...prev, [plant.id]: aiData}));

          if (aiData.needs_water && !notificationSentRef.current.has(plant.id)) {
            await schedulePushNotification(currentPlantTypes[plant.id], aiData.message);
            notificationSentRef.current.add(plant.id);
          } else if (!aiData.needs_water) {
            notificationSentRef.current.delete(plant.id);
          }
        } catch (e) {
          console.log("AI Analysis failed", e);
          // Fallback if AI fails but sensor says thirsty
          if (plant.needs_water && !notificationSentRef.current.has(plant.id)) {
            await schedulePushNotification(currentPlantTypes[plant.id]);
            notificationSentRef.current.add(plant.id);
          }
        }
      } else if (plant.needs_water && !notificationSentRef.current.has(plant.id)) {
        // Fallback to basic logic if no plant type set
        await schedulePushNotification(`Sensor ${plant.id}`);
        notificationSentRef.current.add(plant.id);
      } else if (!plant.needs_water) {
        // Reset notification flag if plant is watered
        notificationSentRef.current.delete(plant.id);
      }
    }
  };

  const handleAddPlant = () => {
    if (!newPlantName.trim()) {
      Alert.alert('Missing Information', 'Please enter a plant name.');
      return;
    }

    const newPlant: PlantItem = {
      id: Date.now().toString(),
      name: newPlantName.trim(),
      location: newPlantLocation.trim() || 'Home',
      daysLeft: 7, // Default to 7 days
    };

    setPlants(prev => [...prev, newPlant]);
    setNewPlantName('');
    setNewPlantLocation('');
  };

  // Merge static and sensor data for display
  const combinedData = [
    ...sensorData.map(s => {
      const aiResult = aiResults[s.id];
      const lastSeen = lastSensorTimestamps.current[s.id];
      const isConnected = lastSeen ? (Date.now() - lastSeen.local < 30000) : false;

      return {
      id: s.id,
      name: plantTypes[s.id] || `Sensor: ${s.id}`,
      location: 'Connected Device',
      daysLeft: (aiResult ? aiResult.needs_water : s.needs_water) ? 0 : 3,
      isSensor: true,
      status: aiResult ? aiResult.status : s.status,
      message: aiResult?.message,
      isConnected,
      moisture: s.moisture,
    };
    }),
    ...plants
  ];
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Water Notifier</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Keep your plants hydrated 💧
        </ThemedText>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="Plant Type (e.g. Fern)"
          placeholderTextColor={colors.textSecondary}
          value={newPlantName}
          onChangeText={setNewPlantName}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="Location (Optional)"
          placeholderTextColor={colors.textSecondary}
          value={newPlantLocation}
          onChangeText={setNewPlantLocation}
        />
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={handleAddPlant}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.addButtonText}>Add Plant</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={combinedData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: (item.isSensor && !item.isConnected) ? '#F3F4F6' : (item.daysLeft === 0 ? '#DBEAFE' : '#F3F4F6') }]}>
               <IconSymbol 
                 name="drop.fill" 
                 size={24} 
                 color={(item.isSensor && !item.isConnected) ? '#FF0000' : (item.daysLeft === 0 ? '#2563EB' : '#9CA3AF')} 
               />
            </View>
            <View style={styles.cardContent}>
              {item.isSensor && !plantTypes[item.id] ? (
                <TextInput 
                  style={styles.inlineInput}
                  placeholder="Name this plant..."
                  placeholderTextColor={colors.textSecondary}
                  onSubmitEditing={(e) => setPlantTypes(prev => ({...prev, [item.id]: e.nativeEvent.text}))}
                />
              ) : (
                <ThemedText style={styles.plantName}>{item.name}</ThemedText>
              )}
              <ThemedText style={[styles.plantLocation, { color: colors.textSecondary }]}>{item.location}</ThemedText>
              {item.isSensor && (
                <ThemedText style={{fontSize: 12, color: colors.textSecondary}}>Signal: {item.moisture}</ThemedText>
              )}
              {item.isSensor && !item.isConnected && (
                <ThemedText style={{fontSize: 12, color: '#EF4444', fontWeight: '600', marginTop: 4}}>
                  ⚠️ Connection Lost
                </ThemedText>
              )}
              {item.isSensor && item.message && <ThemedText style={{fontSize: 12, color: colors.textSecondary, marginTop: 4}}>{item.message}</ThemedText>}
            </View>
            <View style={styles.statusContainer}>
              {item.isSensor ? (
                 !item.isConnected ? (
                  <View style={[styles.badge, { backgroundColor: '#9CA3AF' }]}>
                    <ThemedText style={styles.badgeText}>OFFLINE</ThemedText>
                  </View>
                 ) : (
                 <View style={[styles.badge, { backgroundColor: item.daysLeft === 0 ? colors.accent : item.status === 'overwatered' ? '#EF4444' : '#10B981' }]}>
                  <ThemedText style={styles.badgeText}>{item.status?.toUpperCase()}</ThemedText>
                </View>
                 )
              ) : item.daysLeft === 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <ThemedText style={styles.badgeText}>Water Now</ThemedText>
                </View>
              ) : (
                <ThemedText style={[styles.daysText, { color: colors.textSecondary }]}>In {item.daysLeft} days</ThemedText>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

async function schedulePushNotification(plantName: string, message?: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Plant Thirsty! 🌿",
      body: message || `Your ${plantName} needs water immediately!`,
      data: { plantName },
    },
    trigger: null, // Send immediately
  });
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: 20,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    marginRight: 16,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  plantLocation: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  daysText: {
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  inlineInput: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 150,
  },
});