import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
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

function formatDateWithWeekday(dateString: string) {
  // Parse safely in local time
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('default', {
    weekday: 'short', // e.g., "Thu"
    year: 'numeric',
    month: 'short',   // e.g., "Nov"
    day: 'numeric',
  });
}

type TimeSlot = {
  time: string;
  booked: boolean;
};

type AvailabilityDay = {
  date: string;
  timeSlots: TimeSlot[];
  isDayOff: boolean;
};

export default function UserBookingScreen() {
  type BookingScreenRouteProp = RouteProp<RootStackParamList, 'Agenda tu cita.'>;
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
  const [weeklyAvailability, setWeeklyAvailability] = useState<AvailabilityDay[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
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

    useEffect(() => { //clear the selection when the stylist changes
  setSelectedSlot(null);
}, [selectedStylist]);

useEffect(() => {
  const fetchWeeklyAvailability = async () => {
    if (!selectedStylist?.id) return;

    setLoadingAvailability(true);

    try {
      const startDate = new Date();
      const dates: string[] = [];

      // Generate 7 days forward in LOCAL time
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);

        const pushedDate = formatLocalYMD(d);

        dates.push(pushedDate);
      }

      const availabilityRef = collection(db, `users/${selectedStylist.id}/availability`);
      const snapshot = await getDocs(availabilityRef);

      const results: { date: string; timeSlots: TimeSlot[]; isDayOff: boolean }[] = [];

      for (const date of dates) {
        const match = snapshot.docs.find(doc => doc.id === date);
        if (match) {
          const data = match.data();

          // Normalize slots: strip quotes immediately
          const slots: TimeSlot[] = (data.timeSlots || []).map((slot: any) => ({
            time: (slot.time ?? slot).replace(/['"]+/g, '').trim(),
            booked: slot.booked ?? false,
          }));

          results.push({
            date,
            timeSlots: slots,
            isDayOff: data.isDayOff ?? false,
          });
        } else {
          results.push({ date, timeSlots: [], isDayOff: true });
        }
      }

      setWeeklyAvailability(results);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  fetchWeeklyAvailability();
}, [selectedStylist]);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const formatLocalYMD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const handleBooking = async () => {
  if (!auth.currentUser) {
    Alert.alert('Error', 'No se pudo autenticar el usuario');
    return;
  }

  if (!selectedSlot || !selectedStylist) {
    Alert.alert('Error', 'Debes seleccionar un horario');
    return;
  }

  setLoading(true);

  const isoDate = selectedSlot.date; // "YYYY-MM-DD"
let selectedTime = selectedSlot.time; // e.g. "14:00"

// 🔧 Clean up legacy slot strings (remove stray quotes/whitespace)
selectedTime = selectedTime.replace(/['"]+/g, '').trim();

// 🔧 Guard against invalid values
if (!isoDate || !selectedTime) {
  Alert.alert('Error', 'Fecha u hora inválida');
  setLoading(false);
  return;
}
const [year, month, day] = isoDate.split('-').map(Number);
const [hour, minute] = selectedTime.split(':').map(Number);
if ([year, month, day, hour, minute].some(isNaN)) {
  Alert.alert('Error', `Formato inválido: ${isoDate} ${selectedTime}`);
  setLoading(false);
  return;
}

// ✅ Safe construction of Date object
const fullDate = new Date(year, month - 1, day, hour, minute);
const bookingData = {
  service: selectedService?.name || '',
  date: fullDate.toISOString(), // full UTC timestamp
  time: selectedTime,
  guestName: auth.currentUser.displayName || '',
  userId: auth.currentUser.uid,
  email: auth.currentUser.email || '',
  phoneNumber: phoneNumber || '',
  stylistId: selectedStylist.id,
  stylistName: selectedStylist.name,
  createdAt: new Date().toISOString(),
  role,
};

  try {
    // 1️⃣ Check stylist availability first
    const availabilityRef = doc(db, 'users', selectedStylist.id, 'availability', isoDate);
    const availabilitySnap = await getDoc(availabilityRef);

    const availabilityData = availabilitySnap.exists()
  ? availabilitySnap.data()
  : { timeSlots: [], isDayOff: false };

let slots: any[] = availabilityData.timeSlots || [];

// Check if slot exists
const slotIndex = slots.findIndex((slot: any) => slot.time === selectedTime);

if (slotIndex >= 0 && slots[slotIndex].booked) {
  Alert.alert('Error', 'Este horario ya está reservado');
  setLoading(false);
  return;
}

// Mark slot as booked (create if missing)
if (slotIndex >= 0) {
  slots[slotIndex].booked = true;
} else {
  slots.push({ time: selectedTime, booked: true });
}

await setDoc(availabilityRef, {
  ...availabilityData,
  timeSlots: slots,
});

    // 4️⃣ Save booking in global bookings collection
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);

    // 5️⃣ Navigate to confirmation
    navigation.navigate('Cita confirmada.', {
      service: bookingData.service,
      date: isoDate,
      time: selectedTime,
      guestName: bookingData.guestName,
      stylistName: bookingData.stylistName,
      bookingId: docRef.id,
      role: bookingData.role,
    });
  } catch (error) {
    console.error('Error saving booking:', error);
    Alert.alert('Error', 'No se pudo crear tu cita');
  } finally {
    setLoading(false);
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

  {loadingAvailability && (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color="#fff" />
    <Text style={styles.loadingText}>Cargando disponibilidad...</Text>
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
          
          {selectedStylist && (
  <View style={{ marginTop: 20 }}>
    <BodyBoldText style={styles.label}>Disponibilidad semanal</BodyBoldText>
    {weeklyAvailability.map(({ date, timeSlots, isDayOff }) => {

  return (
    <View key={date} style={{ marginBottom: 12 }}>
      {/* Show weekday + date */}
      <BodyText style={{ fontWeight: 'bold' }}>
        {formatDateWithWeekday(date)}
      </BodyText>

      {/* Show availability */}
      {isDayOff ? (
        <BodyText style={{ color: 'gray' }}>Día libre</BodyText>
      ) : timeSlots.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {timeSlots.map((slot, index) => {
              const isSelected =
                selectedSlot?.date === date && selectedSlot?.time === slot.time;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: isSelected
                        ? '#C2A878'
                        : slot.booked
                        ? '#ddd'
                        : '#f0f0f0',
                      borderColor: isSelected
                        ? '#8B6E4B'
                        : slot.booked
                        ? '#aaa'
                        : '#ccc',
                      borderWidth: isSelected ? 2 : 1,
                      opacity: slot.booked ? 0.6 : 1,
                    },
                  ]}
                  disabled={slot.booked} // ✅ prevent booking if already booked
                  onPress={() => {
  const [hour, minute] = slot.time.split(':').map(Number);

  // Parse the YYYY-MM-DD string safely in local time
  const [year, month, day] = date.split('-').map(Number);
  const selectedDateObj = new Date(year, month - 1, day, hour, minute);

  setDate(selectedDateObj);
  setSelectedSlot({ date, time: slot.time });
}}
                >
                  <Text
                    style={{
                      color: isSelected
                        ? 'white'
                        : slot.booked
                        ? '#888'
                        : 'black',
                    }}
                  >
                    {slot.booked ? '🔒' : '✅'} {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <Text>No hay disponibilidad</Text>
      )}
    </View>
  );
})}

  </View>
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
gridItem: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 6,
  marginBottom: 8,
  marginRight: 8,
  minWidth: 80,
  alignItems: 'center',
},

});