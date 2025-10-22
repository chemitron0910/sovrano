import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../Services/firebaseConfig';

export default function BookingScreen() {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleBooking = async () => {
  const bookingData = {
    service,
    date: date.toISOString(), // UTC format
    name,
    phone,
    userId: auth.currentUser.uid,
    createdAt: new Date().toISOString(),
  };

  if (!auth.currentUser) {
    console.warn('User not authenticated');
    return;
  }

  try {
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    console.log('Booking saved with ID:', docRef.id);
  } catch (error) {
    console.error('Error saving booking:', error);
  }
};

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={{width: windowWidth > 500 ? "70%" : "90%", height: windowHeight > 600 ? "60%" : "90%"}}>
          <Text style={styles.label}>Select Service</Text>
            <TextInput style={styles.input} value={service} onChangeText={setService} placeholder="e.g. Haircut" />

          <Text style={styles.label}>Choose Date & Time</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
              <Text>{date.toLocaleString()}</Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={date.tol}
                mode="datetime"
                display="default"
                onChange={(e, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

          <Text style={styles.label}>Your Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" />

          <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />

          <TouchableOpacity onPress={handleBooking} style={styles.button}>
            <Text style={styles.buttonText}>Confirm Booking</Text>
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
});