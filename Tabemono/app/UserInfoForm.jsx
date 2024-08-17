import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.1.253:3000'; // แทนที่ด้วย URL ของ API ของคุณ

const UserInfoForm = () => {
  const { user } = useUser();
  const router = useRouter();
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = async () => {
    if (!gender || !age) {
      // ยังคงแสดง Alert สำหรับข้อมูลไม่ครบ
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
  
    try {
      console.log('Sending request to:', `${API_URL}/api/users`);
      const response = await axios.post(`${API_URL}/api/users`, {
        id: user.id,
        gender,
        age: parseInt(age)
      });
  
      console.log('User data saved:', response.data);
      // แทนที่จะแสดง Alert, เราจะนำทางไปยังหน้าคำถามทันที
      router.push('/questions');
    } catch (error) {
      console.error('Error saving user data:', error);
      // ยังคงแสดง Alert สำหรับข้อผิดพลาด
      if (error.response) {
        Alert.alert('ข้อผิดพลาด', `ไม่สามารถบันทึกข้อมูลได้: ${error.response.data.error}`);
      } else if (error.request) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      } else {
        Alert.alert('ข้อผิดพลาด', `เกิดข้อผิดพลาด: ${error.message}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>ข้อมูลผู้ใช้</Text>
        
        <Text style={styles.label}>เพศ:</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderButton, gender === 'ชาย' && styles.selectedGender]}
            onPress={() => setGender('ชาย')}
          >
            <Text style={styles.genderText}>ชาย</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, gender === 'หญิง' && styles.selectedGender]}
            onPress={() => setGender('หญิง')}
          >
            <Text style={styles.genderText}>หญิง</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>อายุ:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          placeholder="กรอกอายุของคุณ"
          textAlign="center"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>บันทึกข้อมูล</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '80%',
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedGender: {
    backgroundColor: '#e0e0e0',
  },
  genderText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserInfoForm;