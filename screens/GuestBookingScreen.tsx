import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
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

type TimeSlot = {
  time: string;
  booked: boolean;
};

type AvailabilityDay = {
  date: string;
  timeSlots: TimeSlot[];
  isDayOff: boolean;
};

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

export default function GuestBookingScreen() {
  const [stylists, setStylists] = useState<{ id: string; name: string }[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<{ id: string; name: string } | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState<AvailabilityDay[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const services = useServices();

  // ✅ Authenticate guest
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

  // ✅ Load stylists
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

  // ✅ Clear slot when stylist changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedStylist]);

  const formatLocalYMD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  // ✅ Fetch weekly availability when stylist selected
  useEffect(() => {
    const fetchWeeklyAvailability = async () => {
      if (!selectedStylist?.id) return;

      setLoadingAvailability(true);
      try {
        const startDate = new Date();
        const dates: string[] = [];

        for (let i = 0; i < 7; i++) {
          const d = new Date(startDate);
          d.setDate(startDate.getDate() + i);
          dates.push(formatLocalYMD(d)); // ✅ local IDs
        }

        const availabilityRef = collection(db, `users/${selectedStylist.id}/availability`);
        const snapshot = await getDocs(availabilityRef);

        const results: AvailabilityDay[] = [];

        for (const date of dates) {
          const match = snapshot.docs.find(doc => doc.id === date);
          if (match) {
            const data = match.data();
            const slots: TimeSlot[] = (data.timeSlots || []).map((slot: any) => ({
              time: (slot.time ?? slot).replace(/['"]+/g, '').trim(),
              booked: slot.booked ?? false,
            }));
            results.push({ date, timeSlots: slots, isDayOff: data.isDayOff ?? false });
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

  // ✅ Handle booking
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

    const isoDate = selectedSlot.date;
    let selectedTime = selectedSlot.time.replace(/['"]+/g, '').trim();

    const [year, month, day] = isoDate.split('-').map(Number);
    const [hour, minute] = selectedTime.split(':').map(Number);
    const fullDate = new Date(year, month - 1, day, hour, minute);

    const bookingData = {
      service: selectedService?.name || '',
      date: fullDate.toISOString(),
      time: selectedTime,
      guestName,
      email,
      phoneNumber,
      stylistId: selectedStylist.id,
      stylistName: selectedStylist.name,
      createdAt: new Date().toISOString(),
      role: 'guest',
    };

    try {
      // ✅ Update stylist availability
      const availabilityRef = doc(db, 'users', selectedStylist.id, 'availability', isoDate);
      const availabilitySnap = await getDoc(availabilityRef);
      const availabilityData = availabilitySnap.exists()
        ? availabilitySnap.data()
        : { timeSlots: [], isDayOff: false };

      let slots: any[] = availabilityData.timeSlots || [];
      const slotIndex = slots.findIndex((slot: any) => slot.time === selectedTime);

      if (slotIndex >= 0 && slots[slotIndex].booked) {
        Alert.alert('Error', 'Este horario ya está reservado');
        setLoading(false);
        return;
      }

      if (slotIndex >= 0) {
        slots[slotIndex].booked = true;
      } else {
        slots.push({ time: selectedTime, booked: true });
      }

      await setDoc(availabilityRef, { ...availabilityData, timeSlots: slots });

      // ✅ Save booking
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

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

  // ✅ Render availability like UserBookingScreen
  return (
    <SafeAreaView style={styles.safeContainer}>
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
</View>
          {/* Service Picker */}
          {/* Stylist Picker */}
          {/* Weekly Availability */}
          {selectedStylist && (
            <View style={{ marginTop: 20 }}>
              <BodyBoldText style={styles.label}>Disponibilidad semanal</BodyBoldText>
              {weeklyAvailability.map(({ date, timeSlots, isDayOff }) => (
                <View key={date} style={{ marginBottom: 12 }}>
                  <BodyText style={{ fontWeight: 'bold' }}>{formatDateWithWeekday(date)}</BodyText>
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
                              disabled={slot.booked}
                              onPress={() => setSelectedSlot({ date, time: slot.time })}
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
                ))}
            </View>
          )}

          {/* Guest Info */}
          <BodyBoldText style={styles.label}>Nombre de usuario</BodyBoldText>
          <TextInput
            style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
            placeholder="Entra tu nombre"
            placeholderTextColor="#888"
            value={guestName}
            onChangeText={setGuestName}
          />

          <BodyBoldText style={styles.label}>Correo electrónico</BodyBoldText>
          <TextInput
            style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
            autoCapitalize="none"
            placeholder="Entra tu correo electrónico"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />

          <BodyBoldText style={styles.label}>Número telefónico</BodyBoldText>
          <TextInput
            style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
            placeholder="Entra tu número telefónico"
            placeholderTextColor="#888"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          {/* Buttons */}
          <View style={{ marginTop: 12 }}>
            <Button_style2 title="Confirma tu cita" onPress={handleBooking} />
          </View>

          <View style={{ marginTop: 12 }}>
            <Button_style2
              title="Vuelve al inicio"
              onPress={() => navigation.navigate('Inicio-Invitado')}
            />
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
scrollContent: {
  justifyContent: 'flex-start',
  paddingBottom: 40,
  alignItems: 'center',
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
  gridItem: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 6,
  marginBottom: 8,
  marginRight: 8,
  minWidth: 80,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
});