import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity, View, useWindowDimensions
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../Services/firebaseConfig';
import { fetchUserProfile } from '../Services/userService';
import { useServices } from '../hooks/useServices';
import { RootStackParamList } from '../src/types'; // adjust path

export default function BookingScreen() {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stylists, setStylists] = useState<{ id: string; name: string }[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<{ id: string; name: string } | null>(null);
  const services = useServices();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

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

  useEffect(() => {
  const loadStylists = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', 'in', ['empleado', 'admin']));
      const snapshot = await getDocs(q);
      const stylistList = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().username || doc.data().email || 'Sin nombre',
      }));
      setStylists(stylistList);
    } catch (error) {
      console.error('Error fetching stylists:', error);
    }
  };
  loadStylists();
}, []);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const handleBooking = async () => {

    if (!auth.currentUser) {
      Alert.alert('Error', 'No se pudo autenticar el usuario');
      return;
    }

    setLoading(true); // ✅ show spinner
    const bookingData = {
      service: selectedService?.name || '',
      date: date.toISOString(), // UTC format
      time: date.toISOString(),
      guestName: auth.currentUser.displayName || '',
      userId: auth.currentUser.uid,
      email: auth.currentUser.email || '',
      phoneNumber: phoneNumber || '',
      stylistId: selectedStylist?.id || "",
      stylistName: selectedStylist?.name || '',
      createdAt: new Date().toISOString(),
    };

  if (!auth.currentUser) {
    //console.warn('User not authenticated');
    Alert.alert('Error', 'No se pudo autenticar el usuario');
    return;
  }

  try {
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    // ✅ Navigate to confirmation screen with required params
    navigation.navigate('Cita confirmada', {
      service: bookingData.service,
      date: bookingData.date.split('T')[0], // format as YYYY-MM-DD
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // e.g., "14:00"
      guestName: bookingData.guestName,
      stylistName: bookingData.stylistName,
      bookingId: docRef.id,});
  } catch (error) {
    console.error('Error saving booking:', error);
    Alert.alert('Error', 'No se pudo crear tu cita');
  } finally {
    setLoading(false); // ✅ hide spinner
  }
};

  return (
    
    <SafeAreaView
      style={styles.safeContainer}
      edges={Platform.OS === 'ios' ? ['left', 'right', 'bottom'] : undefined}
    >
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Guardando tu cita...</Text>
        </View>
      )}

      {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={(e, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
              }}
              {...(Platform.OS === 'ios' ? { textColor: 'black' } : {})} // ✅ only apply on iOS
            />
            )}

      {showTimePicker && (
  <DateTimePicker
    value={date}
    mode="time"
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    onChange={(e, selectedTime) => {
      setShowTimePicker(false);
      if (selectedTime) setDate(selectedTime);
    }}
  />
)}


      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}>
        <View style={[styles.formContainer, { width: windowWidth > 500 ? '70%' : '90%' }]}>
          <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Select Service</Text>
            <Picker
              selectedValue={selectedServiceId}
              onValueChange={(value) => setSelectedServiceId(value)}
              mode={Platform.OS === 'android' ? 'dropdown' : undefined}
              style={[
                styles.picker,
                Platform.OS === 'android' && { color: '#004d40' },
                ]}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
            >
            <Picker.Item label="Selecciona..." value={null} />
            {services.map((service) => (
              <Picker.Item
                key={service.id}
                label={`${service.name} (${service.duration} min)`}
                value={service.id}
              />
            ))}
            </Picker>
          </View>
          <Text style={styles.label}>Escoge fecha y hora</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
              <Text>{date.toLocaleString()}</Text>
            </TouchableOpacity>
            

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

          <Text style={styles.label}>Selecciona estilista</Text>
          <View style={[styles.input, { height: 150, justifyContent: 'center' }]}>
          <Picker
            selectedValue={selectedStylist?.id || ''}
            onValueChange={(value) => {
            const stylist = stylists.find(s => s.id === value);
            setSelectedStylist(stylist || null);
            }}
            mode={Platform.OS === 'android' ? 'dropdown' : undefined}
          style={[
            styles.picker,
            Platform.OS === 'android' && { color: '#004d40' },
          ]}
          itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
        >
          <Picker.Item label="Selecciona..." value="" />
            {stylists.map(stylist => (
            <Picker.Item key={stylist.id} label={stylist.name} value={stylist.id} />
            ))}
          </Picker>

          </View>

          <TouchableOpacity onPress={handleBooking} disabled={loading} style={styles.button}>
            <Text style={styles.buttonText}>Confirma tu cita</Text>
          </TouchableOpacity>
        </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
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
},
scrollContent: {
  justifyContent: 'flex-start',
  paddingBottom: 40,
  alignItems: 'center',
},
formContainer: {
  alignSelf: 'center',
},
picker: {
  ...Platform.select({
    ios: {
      height: 150, // enough for scroll wheel
      justifyContent: 'center',
    },
    android: {
      height: 50,
      color: '#004d40',
      justifyContent: 'center',
    },
  }),
  backgroundColor: '#e0f7fa',
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#00796b',
},
pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
pickerItem: {
    fontSize: 16,
    color: 'black',
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '600',
  },
});