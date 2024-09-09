import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchInitialCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/questions/initial-categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching initial categories:', error);
    }
  }, []);

  const fetchOptions = useCallback(async (currentStep, currentSelections) => {
    try {
      console.log('Fetching options for step:', currentStep, 'with selections:', currentSelections);
      const response = await axios.get(`${API_URL}/api/questions/food-options`, {
        params: currentSelections
      });
      console.log('Received response:', response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        setOptions(response.data);
      } else {
        router.push({
          pathname: '/filtered-results',
          params: { selections: JSON.stringify(currentSelections) }
        });
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  }, [router]);

  useEffect(() => {
    if (step === 0) {
      fetchInitialCategories();
    } else {
      fetchOptions(step, selections);
    }
  }, [step, selections, fetchInitialCategories, fetchOptions]);

  const handleSelection = useCallback(async (item) => {
    setSelections(prevSelections => {
      const newSelections = { ...prevSelections };
      if (step === 0) {
        newSelections.categoryId = item.id;
      } else {
        const typeKey = `type${step}`;
        newSelections[typeKey] = item[typeKey] || item;
      }
      console.log('Updated selections:', newSelections);
      return newSelections;
    });

    setStep(prevStep => prevStep + 1);

    try {
      const selectionToRecord = {
        userId: user.id,
        ...selections,
        [step === 0 ? 'categoryId' : `type${step}`]: item.id || (typeof item === 'object' ? item[`type${step}`] : item)
      };
      console.log('Recording selection:', selectionToRecord);
      await axios.post(`${API_URL}/api/food/record-selection`, selectionToRecord);
    } catch (error) {
      console.error('Error recording selection:', error);
    }
  }, [step, user.id, selections]);

  const goBack = useCallback(() => {
    setStep(0);
    setSelections({});
    setOptions([]);
    setFinalChoice(null);
    fetchInitialCategories();
    console.log('Went back to initial categories');
  }, [fetchInitialCategories]);

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
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>กลับไปเลือกประเภทอาหาร</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>
        {step === 0 ? 'เลือกประเภทอาหาร:' : `เลือกตัวเลือกที่ ${step}:`}
      </Text>
      <FlatList
        data={step === 0 ? categories : options}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        style={styles.optionList}
      />
      {step > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>กลับไปเลือกประเภทอาหาร</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 20,
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
  backButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FoodSelectionScreen;