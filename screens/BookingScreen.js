import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert,
  StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../Services/firebaseConfig';

export default function BookingScreen() {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    setLoading(true); // ✅ show spinner
    const bookingData = {
      service,
      date: date.toISOString(), // UTC format
      time: date.toISOString(),
      name,
      phone,
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
      guestName: bookingData.name,
      bookingId: docRef.id,});
  } catch (error) {
    //console.error('Error saving booking:', error);
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
        <View style={{width: windowWidth > 500 ? "70%" : "90%", height: windowHeight > 600 ? "60%" : "90%"}}
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
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tu nombre completo" />
          <Text style={styles.label}>Numero telefonico</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Telefono" 
            keyboardType="phone-pad" />
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
    justifyContent: "center",
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
});