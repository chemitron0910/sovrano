import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../Services/firebaseConfig';
import { fetchUserProfile } from '../Services/userService';

export default function BookingScreen() {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const user = auth.currentUser;
  const guestName = user?.displayName || '';
  const email = user?.email || '';

  useEffect(() => {
  const loadUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const profile = await fetchUserProfile(user.uid);
    if (profile?.phoneNumber) {
      setPhoneNumber(profile.phoneNumber);
    }
  };

  loadUserProfile();
}, []);

  const handleBooking = async () => {

    if (!auth.currentUser) {
      Alert.alert('Error', 'No se pudo autenticar el usuario');
      return;
    }

    setLoading(true); // ✅ show spinner
    const bookingData = {
      service,
      date: date.toISOString(), // UTC format
      time: date.toISOString(),
      guestName: auth.currentUser.displayName || '',
      email: auth.currentUser.email || '',
      phoneNumber: phoneNumber || '',
      userId: auth.currentUser.uid,
      createdAt: new Date().toISOString(),
    };

  if (!auth.currentUser) {
    //console.warn('User not authenticated');
    Alert.alert('Error', 'No se pudo autenticar el usuario');
    return;
  }

  try {
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    //console.log('Booking saved with ID:', docRef.id);
    // ✅ Navigate to confirmation screen with required params
    navigation.navigate('Cita confirmada', {
      service: bookingData.service,
      date: bookingData.date.split('T')[0], // format as YYYY-MM-DD
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // e.g., "14:00"
      guestName: bookingData.guestName,
      bookingId: docRef.id,});
  } catch (error) {
    console.error('Error saving booking:', error);
    Alert.alert('Error', 'No se pudo crear tu cita');
  } finally {
    setLoading(false); // ✅ hide spinner
  }
};

  return (
    
    <SafeAreaView style={styles.safeContainer}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Guardando tu cita...</Text>
        </View>
      )}
      <View style={styles.container}>
        <View style={{width: windowWidth > 500 ? "70%" : "90%"}}
          >
          <Text style={styles.label}>Select Service</Text>
            <TextInput style={styles.input} value={service} onChangeText={setService} placeholder="e.g. Haircut" />

          <Text style={styles.label}>Escoge fecha y hora</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
              <Text>{date.toLocaleString()}</Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                onChange={(e, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

          <Text style={styles.label}>Tu nombre</Text>
          <View style={styles.readOnlyField}>
            <Text>{guestName || 'No disponible'}</Text>
          </View>

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.readOnlyField}>
            <Text>{email || 'No disponible'}</Text>
          </View>

          <Text style={styles.label}>Número telefónico</Text>
          <View style={styles.readOnlyField}>
            <Text>{phoneNumber || 'No disponible'}</Text>
          </View>

          <TouchableOpacity onPress={handleBooking} disabled={loading} style={styles.button}>
            <Text style={styles.buttonText}>Confirma tu cita</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: { fontSize: 16, fontWeight: '600', marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 30,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
  },
  readOnlyField: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 12,
  marginTop: 8,
  backgroundColor: '#f5f5f5',
}
});