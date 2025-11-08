import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Button_style2 from "../Components/Button_style2";
import { auth, db } from '../Services/firebaseConfig';
import { assignWeeklyAvailability } from '../utils/assignWeeklyAvailability';

export default function AdminStylistScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleHireStylist = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const stylistId = userCredential.user.uid;

      // Step 2: Create Firestore stylist document
      const stylistRef = doc(db, 'stylists', stylistId);
      await setDoc(stylistRef, {
        name,
        email,
        role: 'empleado',
        hireDate: serverTimestamp(),
      });

      await assignWeeklyAvailability(stylistId, 4); // assigns 4 weeks of availability

      Alert.alert('Success', 'Stylist hired and added to Firestore.');
      setName('');
      setEmail('');
      setPassword('');
      navigation.goBack(); // or navigate to Inicio-Empleado
    } catch (error: any) {
      console.error('Error hiring stylist:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hire a New Stylist</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Temporary Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button_style2 title="Adicionar empleado" onPress={handleHireStylist}>
      </Button_style2>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
});
