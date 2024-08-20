import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

const API_URL = 'https://tabemono-a445c18f4a6d.herokuapp.com';

const FoodSelectionScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState([]);
  const [selections, setSelections] = useState({});
  const [finalChoice, setFinalChoice] = useState(null);

  useEffect(() => {
    fetchInitialCategories();
    if (user) {
      recordUserLogin();
    }
  }, [user]);

  const recordUserLogin = async () => {
    try {
      await axios.post(`${API_URL}/api/users/record-login`, { userId: user.id });
    } catch (error) {
      console.error('Error recording user login:', error);
    }
  };

  const fetchInitialCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/questions/initial-categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching initial categories:', error);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/questions/food-options`, {
        params: selections
      });
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Check if all items have null type4
        const allType4Null = response.data.every(item => item.type4 === null);
        
        if (allType4Null) {
          // Redirect to filtered-results page
          router.push({
            pathname: '/filtered-results',
            params: { selections: JSON.stringify(selections) }
          });
        } else if (response.data.length === 1 && response.data[0].type4) {
          setFinalChoice(response.data[0]);
        } else {
          const filteredOptions = response.data.filter(item => 
            Object.values(item).some(value => value !== null)
          );
          setOptions(filteredOptions);
          
          if (filteredOptions.length === 0) {
            router.push({
              pathname: '/filtered-results',
              params: { selections: JSON.stringify(selections) }
            });
          }
        }
      } else {
        router.push({
          pathname: '/filtered-results',
          params: { selections: JSON.stringify(selections) }
        });
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };
  
  useEffect(() => {
    if (step > 0) {
      fetchOptions();
    }
  }, [step, selections]);

  const handleSelection = async (item) => {
    const newSelections = { ...selections };
    if (step === 0) {
      newSelections.categoryId = item.id;
    } else {
      const typeKey = `type${step}`;
      newSelections[typeKey] = item[typeKey] || item;
    }
    setSelections(newSelections);
    setStep(step + 1);

    try {
      await axios.post(`${API_URL}/api/food/record-selection`, {
        userId: user.id,
        categoryId: newSelections.categoryId,
        type1: newSelections.type1,
        type2: newSelections.type2,
        type3: newSelections.type3,
        type4: newSelections.type4,
        type5: item.type5 || item
      });
    } catch (error) {
      console.error('Error recording selection:', error);
    }
  };

  const goToStatistics = () => {
    router.push('/statistics.jsx');
  };

  const renderItem = ({ item }) => {
    let displayText;
    if (step === 0) {
      displayText = item.category_name;
    } else {
      const typeKey = `type${step}`;
      displayText = item[typeKey] || (typeof item === 'string' ? item : JSON.stringify(item));
    }

    if (typeof displayText === 'undefined' || displayText === null) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleSelection(item)}
      >
        <Text style={styles.optionText}>{displayText}</Text>
      </TouchableOpacity>
    );
  };

  if (finalChoice) {
    return (
      <View style={styles.container}>
        <Text style={styles.finalChoiceText}>เมนูที่คุณเลือก: {finalChoice.type4}</Text>
        {finalChoice.image_url && (
          <Image source={{ uri: finalChoice.image_url }} style={styles.foodImage} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.statsButton} onPress={goToStatistics}>
        <Text style={styles.statsButtonText}>View Statistics</Text>
      </TouchableOpacity>
      <Text style={styles.questionText}>
        {step === 0 ? 'เลือกประเภทอาหาร:' : `เลือกตัวเลือกที่ ${step}:`}
      </Text>
      <FlatList
        data={step === 0 ? categories : options}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        style={styles.optionList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionList: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
  },
  finalChoiceText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  foodImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  statsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  statsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FoodSelectionScreen;