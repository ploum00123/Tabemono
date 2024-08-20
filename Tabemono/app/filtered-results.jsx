import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = 'https://tabemono-a445c18f4a6d.herokuapp.com';

const FilteredResultsScreen = () => {
  const { selections } = useLocalSearchParams();
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchFilteredResults();
  }, []);

  const fetchFilteredResults = async () => {
    try {
      setLoading(true);
      const parsedSelections = JSON.parse(selections);
      console.log('Sending request with params:', parsedSelections);
      const response = await axios.get(`${API_URL}/api/food/filtered-results`, {
        params: parsedSelections
      });
      console.log('Received response:', response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error('Error fetching filtered results:', error);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filteredItems.forEach(item => {
      incrementFoodView(item.id);
    });
  }, [filteredItems]);

  const incrementFoodView = async (foodItemId) => {
    try {
      await axios.post(`${API_URL}/api/food/increment-view`, { foodItemId });
    } catch (error) {
      console.error('Error incrementing food view:', error);
    }
  };

  const goToStatistics = () => {
    router.push('/statistics/statistics');
  };

  const handleDone = () => {
    router.push('/questions');
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.namefood || 'ไม่มีชื่อ'}</Text>
      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.itemImage} />}
    </View>
  );

  if (loading) {
    return <Text>กำลังโหลด...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ผลลัพธ์ที่กรองแล้ว</Text>
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      ) : (
        <Text>ไม่พบรายการอาหารที่ตรงกับเงื่อนไข</Text>
      )}
      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>เสร็จสิ้น</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.statsButton} onPress={goToStatistics}>
        <Text style={styles.statsButtonText}>View Statistics</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 5,
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
  statsButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  statsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FilteredResultsScreen;