import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity, View, useWindowDimensions
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from '../Components/Button_style2';
import { auth, db } from '../Services/firebaseConfig';
import { fetchUserProfile } from '../Services/userService';
import { useServices } from '../hooks/useServices';
import { RootStackParamList } from '../src/types';

export default function UserBookingScreen() {
  type BookingScreenRouteProp = RouteProp<RootStackParamList, 'UserBookingScreen'>;
const route = useRoute<BookingScreenRouteProp>();
const { serviceFromUser, stylist } = route.params || {};

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
  const [role, setRole] = useState('');
  const [stylists, setStylists] = useState<{ id: string; name: string }[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<{ id: string; name: string } | null>(null);
  const services = useServices();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const user = auth.currentUser;
  const guestName = user?.displayName || '';
  const email = user?.email || '';

  useEffect(() => {
  if (serviceFromUser?.id) setSelectedServiceId(serviceFromUser.id);
  if (stylist?.id) setSelectedStylist(stylist);
}, [service, stylist]);


  useEffect(() => {
  const loadUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const profile = await fetchUserProfile(user.uid);
    if (profile?.phoneNumber) {
      setPhoneNumber(profile.phoneNumber);
    }
    if (profile?.role) {;
      setRole(profile.role);
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
      role: role,
    };

  if (!auth.currentUser) {
    //console.warn('User not authenticated');
    Alert.alert('Error', 'No se pudo autenticar el usuario');
    return;
  }

  try {
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    // ✅ Navigate to confirmation screen with required params
    navigation.navigate('Cita confirmada.', {
      service: bookingData.service,
      date: bookingData.date.split('T')[0], // format as YYYY-MM-DD
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // e.g., "14:00"
      guestName: bookingData.guestName,
      stylistName: bookingData.stylistName,
      bookingId: docRef.id,
      role: bookingData.role,
    });
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

  <GradientBackground>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}>
    
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}>
        <View style={[styles.formContainer, { width: windowWidth > 500 ? '70%' : '90%' }]}>
          <View style={styles.pickerWrapper}>
          <BodyBoldText style={styles.pickerLabel}>Select Service</BodyBoldText>
            <LinearGradient colors={['#E9E4D4', '#E0CFA2']}>
            <Picker
              selectedValue={selectedServiceId}
              onValueChange={(value) => setSelectedServiceId(value)}
              mode={Platform.OS === 'android' ? 'dropdown' : undefined}
              style={[styles.picker, { backgroundColor: '#E9E4D4' }]}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
            >
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
          </View>
          <BodyBoldText style={styles.label}>Escoge fecha y hora</BodyBoldText>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
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

          <BodyBoldText style={styles.label}>Tu nombre</BodyBoldText>
          <View style={[styles.readOnlyField, ,{ backgroundColor: '#d8d2c4' }]}>
            <Text>{guestName || 'No disponible'}</Text>
          </View>

          <BodyBoldText style={styles.label}>Correo electrónico</BodyBoldText>
          <View style={[styles.readOnlyField, ,{ backgroundColor: '#d8d2c4' }]}>
            <Text>{email || 'No disponible'}</Text>
          </View>

          <BodyBoldText style={styles.label}>Número telefónico</BodyBoldText>
          <View style={[styles.readOnlyField, ,{ backgroundColor: '#d8d2c4' }]}>
            <Text>{phoneNumber || 'No disponible'}</Text>
          </View>

          <BodyBoldText style={styles.label}>Selecciona estilista</BodyBoldText>
          <View style={[styles.input, { height: 150, justifyContent: 'center' }]}>
          <LinearGradient colors={['#DEC89C', '#D1B380']}>
          <Picker
            selectedValue={selectedStylist?.id || ''}
            onValueChange={(value) => {
            const stylist = stylists.find(s => s.id === value);
            setSelectedStylist(stylist || null);
            }}
            mode={Platform.OS === 'android' ? 'dropdown' : undefined}
            style={[styles.picker]}
            itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
          >
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
              onPress={() => navigation.navigate('Inicio-Usuario')}/>
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
  label: { fontSize: 16, fontWeight: '600', marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
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