import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from '../Components/Button_style2';
import { signInAsGuest } from '../Services/authService';
import { auth, db } from '../Services/firebaseConfig';
import { useServices } from '../hooks/useServices';
import { RootStackParamList } from '../src/types';


export default function GuestBookingScreen() {

  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [stylists, setStylists] = useState<{ id: string; name: string }[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<{ id: string; name: string } | null>(null);
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const services = useServices();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
  const authenticateGuest = async () => {
    if (!auth.currentUser) {
      try {
        await signInAsGuest();
      } catch (error) {
        Alert.alert('Error', 'No se pudo iniciar sesión como invitado');
      }
    }
  };
  authenticateGuest();
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
      guestName: guestName || '',
      email: email || '',
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
    //console.log('Booking saved with ID:', docRef.id);
    // ✅ Navigate to confirmation screen with required params
    navigation.navigate('Cita confirmada', {
      service: bookingData.service,
      date: bookingData.date.split('T')[0], // format as YYYY-MM-DD
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // e.g., "14:00"
      guestName: bookingData.guestName,
      stylistName: bookingData.stylistName,
      bookingId: docRef.id,
      role:''});
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
      edges={Platform.OS === 'ios' ? ['left', 'right', 'bottom'] : undefined}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Guardando tu cita...</Text>
        </View>
      )}

    <GradientBackground>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}>
            <View style={[styles.formContainer, { width: windowWidth > 500 ? '70%' : '90%' }]}>
              <BodyBoldText>Select Service</BodyBoldText>
              <LinearGradient colors={['#E9E4D4', '#E0CFA2']}>
              <Picker
                selectedValue={selectedServiceId}
                onValueChange={(value) => setSelectedServiceId(value)}
                mode={Platform.OS === 'android' ? 'dropdown' : undefined}
                style={[styles.picker]}
                itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}>
                <Picker.Item label="Selecciona..." value={null} />
                  {services
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((service) => (
                <Picker.Item
                  key={service.id}
                  label={`${service.name} (${service.duration} min)`}
                  value={service.id}
                />
                ))}
              </Picker>
              </LinearGradient>
              <BodyBoldText style={styles.label}>Escoge fecha y hora</BodyBoldText>
              <TouchableOpacity onPress={() => setShowPicker(true)} 
                style={[styles.input, { backgroundColor: '#d8d2c4' }]}>
              <Text>{date.toLocaleString()}</Text>
              </TouchableOpacity>
                {showPicker && (
                  <DateTimePicker
                    value={date}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) setDate(selectedDate);
                    }}
                    textColor="black"/>
                )}

              <BodyBoldText style={styles.label}>Nombre de usuario</BodyBoldText>
              <TextInput 
                style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
                placeholder='Entra tu nombre' placeholderTextColor="#888" value={guestName} onChangeText={setGuestName}/>

              <BodyBoldText style={styles.label}>Correo electronico</BodyBoldText>
              <TextInput 
                style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
                autoCapitalize="none"
                placeholder='Entra tu corrreo electronico' placeholderTextColor="#888" value={email} onChangeText={setEmail}/>

              <BodyBoldText style={styles.label}>Número telefónico</BodyBoldText>
              <TextInput 
                style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
                placeholder='Entra tu numero telefonico' placeholderTextColor="#888" value={phoneNumber} onChangeText={setPhoneNumber}/>

              <BodyBoldText style={styles.label}>Selecciona estilista</BodyBoldText>
              <View style={[styles.input, { height: 150, justifyContent: 'center' }]}>
                <LinearGradient colors={['#E9E4D4', '#E0CFA2']}>
                <Picker
                  selectedValue={selectedStylist?.id || ''}
                  onValueChange={(value) => {
                  const stylist = stylists.find(s => s.id === value);
                  setSelectedStylist(stylist || null);
                  }}
                  mode={Platform.OS === 'android' ? 'dropdown' : undefined}
                  style={[styles.picker]}
                  itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}>
                  <Picker.Item label="Selecciona..." value="" />
                    {stylists
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(stylist => (
                  <Picker.Item key={stylist.id} label={stylist.name} value={stylist.id} />
                  ))}
                </Picker>
                </LinearGradient>
              </View>

              <View style={{ marginTop: 12 }}>
                <Button_style2
                  title="Confirma tu cita"
                  onPress={handleBooking}/>
              </View>

              <View style={{ marginTop: 12 }}>
                <Button_style2
                  title="Vuelve al inicio"
                  onPress={() => navigation.navigate('Inicio-Invitado')}/>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </GradientBackground>
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
      justifyContent: 'center',
    },
  }),
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#00796b',
},
pickerItem: {
    fontSize: 16,
    color: 'black',
  },
  inputText: {
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1, 
    marginBottom: 20, 
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,         // ✅ Ensures placeholder is visible
    color: '#000',        // ✅ Ensures input text is visible
  },
});
