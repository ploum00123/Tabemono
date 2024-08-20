import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_URL = 'https://tabemono-a445c18f4a6d.herokuapp.com';

const StatisticsScreen = () => {
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/food/statistics`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleDone = () => {
    router.push('/questions');
  };

  if (!stats) return <Text>Loading statistics...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Foods</Text>
      <FlatList
        data={stats.popularFoods}
        renderItem={({ item }) => (
          <Text>{item.namefood}: {item.view_count} views</Text>
        )}
        keyExtractor={(item) => item.namefood}
      />
      <Text style={styles.title}>Category Selections</Text>
      <FlatList
        data={stats.userSelectionStats}
        renderItem={({ item }) => (
          <Text>{item.category_name}: {item.selection_count} selections</Text>
        )}
        keyExtractor={(item) => item.category_name}
      />
      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>เสร็จสิ้น</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StatisticsScreen;