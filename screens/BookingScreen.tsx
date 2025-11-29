import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity, View, useWindowDimensions
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from '../Components/Button_style2';
import { auth, db } from '../Services/firebaseConfig';
import { fetchUserProfile } from '../Services/userService';
import { useServices } from '../hooks/useServices';
import { RootStackParamList } from '../src/types';
import { handleBooking } from '../utils/handleBooking';

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

export default function BookingScreen() {
  type BookingScreenRouteProp = RouteProp<RootStackParamList, 'Agenda tu cita'>;
  const route = useRoute<BookingScreenRouteProp>();
  const { role, serviceFromUser, stylist } = route.params || {};
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date());
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [stylists, setStylists] = useState<{ id: string; name: string }[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<{ id: string; name: string } | null>(null);
  const services = useServices();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const selectedService = services.find(s => s.id === selectedServiceId) || null;
  const formatLocalYMD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  };
  const [weeklyAvailability, setWeeklyAvailability] = useState<AvailabilityDay[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const user = auth.currentUser;
  const guestName = user?.displayName || '';
  const [serviceProviders, setServiceProviders] = useState<Record<string, string[]>>({});
  const [stylistModalVisible, setStylistModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  // Prefill for users
  useEffect(() => {
    if (role !== "guest") {
      const user = auth.currentUser;
      if (!user) return;

      fetchUserProfile(user.uid).then(profile => {
        if (profile) {
          setNombre(profile.username || user.displayName || "");
          setEmail(profile.email || user.email || "");
          setPhoneNumber(profile.phoneNumber || "");
        }
      });
    } else {
      // Guest → leave fields empty
      setNombre("");
      setEmail("");
      setPhoneNumber("");
    }
  }, [role]);

  // Service/stylist preselection
  useEffect(() => {
    if (serviceFromUser?.id) setSelectedServiceId(serviceFromUser.id);
    if (stylist?.id) setSelectedStylist(stylist);
  }, [serviceFromUser, stylist]);

useEffect(() => {
  const buildServiceProviders = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "in", ["empleado", "admin"]));
      const snapshot = await getDocs(q);

      const providersMap: Record<string, string[]> = {};

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!data.activo) continue; // ✅ only active empleados/admins

        const stylistId = docSnap.id;
        const infoDoc = await getDoc(doc(db, `users/${stylistId}/profile/info`));
        if (!infoDoc.exists()) continue;

        const info = infoDoc.data();
        const providedServices = info?.services || [];
        for (const svc of providedServices) {
          if (!svc.id) continue;
          if (!providersMap[svc.id]) providersMap[svc.id] = [];
          providersMap[svc.id].push(stylistId);
        }
      }

      setServiceProviders(providersMap);
    } catch (err) {
      console.error("Error building serviceProviders:", err);
    }
  };

  buildServiceProviders();
}, []);

  useEffect(() => {
  if (serviceFromUser?.id) setSelectedServiceId(serviceFromUser.id);
  if (stylist?.id) setSelectedStylist(stylist);
}, [service, stylist]);

useEffect(() => {
  const loadStylists = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', 'in', ['empleado', 'admin']));
      const snapshot = await getDocs(q);

      const stylistList = snapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.username || data.email || 'Sin nombre',
            activo: data.activo ?? false, // ✅ include activo
          };
        })
        .filter(stylist => stylist.activo); // ✅ only active

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
  const start = new Date(weekStartDate);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  setWeekDates(week);
}, [weekStartDate]);

useEffect(() => {
  const fetchWeeklyAvailability = async () => {
    if (!selectedStylist?.id || weekDates.length === 0) return;

    setLoadingAvailability(true);

    try {
      const dates: string[] = weekDates.map(d => formatLocalYMD(d));

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
          results.push({ date, timeSlots: [], isDayOff: false });
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
}, [selectedStylist, weekDates]); 

// Initialize from params (Option 1)
useEffect(() => {
  if (route.params?.serviceFromUser) {
    setSelectedServiceId(route.params.serviceFromUser.id);
  }
}, [route.params]);

return (
    
  <SafeAreaView
    style={styles.safeContainer}
    edges={Platform.OS === 'ios' ? ['left', 'right', 'bottom'] : undefined}
  >

  <View style={{ flex: 1 }}>
  <GradientBackground>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}>

<Modal
  visible={confirmModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setConfirmModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Confirmar cita</Text>

      {/* Service + Stylist */}
      <Text>
        {selectedService?.name} con {selectedStylist?.name}
      </Text>
      <Text>
        {selectedSlot?.date} a las {selectedSlot?.time}
      </Text>

      {/* 👇 Role-aware fields */}
      <BodyBoldText style={styles.label}>Tu nombre</BodyBoldText>
      {role === "guest" ? (
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Escribe tu nombre"
        />
      ) : (
        <View style={[styles.readOnlyField, { backgroundColor: "#d8d2c4" }]}>
          <Text>{nombre || "No disponible"}</Text>
        </View>
      )}

      <BodyBoldText style={styles.label}>Correo electrónico</BodyBoldText>
      {role === "guest" ? (
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Escribe tu correo"
        />
      ) : (
        <View style={[styles.readOnlyField, { backgroundColor: "#d8d2c4" }]}>
          <Text>{email || "No disponible"}</Text>
        </View>
      )}

      <BodyBoldText style={styles.label}>Número telefónico</BodyBoldText>
      {role === "guest" ? (
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Escribe tu teléfono"
        />
      ) : (
        <View style={[styles.readOnlyField, { backgroundColor: "#d8d2c4" }]}>
          <Text>{phoneNumber || "No disponible"}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
        <Button_style2
          title="Cancelar"
          onPress={() => setConfirmModalVisible(false)}
        />
        <Button_style2
  title="Confirmar"
  onPress={async () => {
    if (role === "usuario" || role === "guest") {
      try {
        setConfirmModalVisible(false);   // close modal immediately
        setBookingLoading(true);         // show loader overlay

        await handleBooking({
          selectedSlot: selectedSlot!,
          selectedStylist: selectedStylist!,
          selectedService: selectedService!,
          role,
          guestInfo: {
            guestName: nombre,
            email,
            phoneNumber,
          },
          navigation,
        });
      } finally {
        setBookingLoading(false);        // hide loader after booking
      }
    } else {
      Alert.alert(
        "Acción no permitida",
        "Solo usuarios o invitados pueden reservar citas."
      );
      setConfirmModalVisible(false);
    }
  }}
/>

      </View>
    </View>
  </View>
</Modal>
    
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}>
        <View style={[styles.formContainer, { width: windowWidth > 500 ? '70%' : '90%' }]}>
          {/* 👇 Role-aware fields */}
            <BodyBoldText style={styles.label}>Tu nombre</BodyBoldText>
            {role === "guest" ? (
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Escribe tu nombre"
              />
            ) : (
              <View style={[styles.readOnlyField, { backgroundColor: '#d8d2c4' }]}>
                <Text>{nombre || 'No disponible'}</Text>
              </View>
            )}

            <BodyBoldText style={styles.label}>Correo electrónico</BodyBoldText>
            {role === "guest" ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Escribe tu correo"
              />
            ) : (
              <View style={[styles.readOnlyField, { backgroundColor: '#d8d2c4' }]}>
                <Text>{email || 'No disponible'}</Text>
              </View>
            )}

            <BodyBoldText style={styles.label}>Número telefónico</BodyBoldText>
            {role === "guest" ? (
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Escribe tu teléfono"
              />
            ) : (
              <View style={[styles.readOnlyField, { backgroundColor: '#d8d2c4' }]}>
                <Text>{phoneNumber || 'No disponible'}</Text>
              </View>
            )}
          <View style={styles.pickerWrapper}>

{/* Service section */}
<BodyBoldText style={styles.pickerLabel}>Servicio seleccionado</BodyBoldText>

{route.params?.serviceFromUser ? (
  // 🔒 Read-only when coming from Services screen
  <View style={[styles.readOnlyField, { backgroundColor: '#d8d2c4' }]}>
    <Text>
      {`${route.params.serviceFromUser.name} (${route.params.serviceFromUser.duration} ${
        Number(route.params.serviceFromUser.duration) === 1 ? 'hora' : 'horas'
      })`}
    </Text>
  </View>
) : (
  // 🔄 Picker when coming directly to Booking screen
  <View style={[styles.inputPicker, { height: 150, justifyContent: "center" }]}>
    <LinearGradient colors={["#E9E4D4", "#E0CFA2"]}>
      <Picker
        selectedValue={selectedServiceId}
        onValueChange={(value) => {
          setSelectedServiceId(value);
          if (value) setStylistModalVisible(true); // open stylist modal
        }}
        mode={Platform.OS === "android" ? "dropdown" : undefined}
        style={[styles.picker]}
        itemStyle={Platform.OS === "ios" ? styles.pickerItem : undefined}
      >
        <Picker.Item label="Selecciona..." value={null} />
        {services
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((service) => (
            <Picker.Item
              key={service.id}
              label={`${service.name} (${service.duration} ${
                Number(service.duration) === 1 ? 'hora' : 'horas'
              })`}
              value={service.id}
            />
          ))}
      </Picker>
    </LinearGradient>
  </View>
)}

<BodyBoldText style={styles.label}>Costo estimado del servicio seleccionado</BodyBoldText>
<View style={[styles.readOnlyField, { backgroundColor: '#d8d2c4' }]}>
  <Text>{selectedService ? `$${selectedService.cost}` : 'No seleccionado'}</Text>
</View>
          </View>

         <Modal visible={stylistModalVisible} animationType="slide" transparent={true}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Elige un estilista
      </Text>
      {(selectedServiceId && serviceProviders[selectedServiceId] || []).map((stylistId, idx) => {
        const stylist = stylists.find(s => s.id === stylistId);
        if (!stylist) return null;
        return (
          <TouchableOpacity
            key={idx}
            style={styles.stylistButton}
            onPress={() => {
              setSelectedStylist(stylist);
              setStylistModalVisible(false);
            }}
          >
            <Text style={{ color: "white" }}>{stylist.name}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity onPress={() => setStylistModalVisible(false)} style={styles.cancelButton}>
        <Text style={{ color: "#333" }}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

          <BodyBoldText style={styles.label}>Estilista seleccionado</BodyBoldText>
<View style={[styles.readOnlyField, { backgroundColor: '#d8d2c4' }]}>
  <Text>{selectedStylist?.name || 'No seleccionado'}</Text>
</View>

<View style={{ marginTop: 24, alignItems: 'center' }}>
  <BodyBoldText style={styles.label}>Seleccionar inicio de semana</BodyBoldText>
  <TouchableOpacity
    onPress={() => setShowWeekPicker(true)}
    style={[styles.dateButton, { backgroundColor: '#d8d2c4' }]}
  >
    <BodyText>{formatLocalYMD(weekStartDate)}</BodyText>
  </TouchableOpacity>
</View>

{showWeekPicker && (
  <DateTimePicker
    value={weekStartDate}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
    onChange={(_, date) => {
      setShowWeekPicker(false);
      if (date) setWeekStartDate(date);
    }}
    textColor="black"
  />
)}

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
      {[...timeSlots]
        .sort((a, b) => {
          const [ah, am = 0] = a.time.split(":").map(Number);
          const [bh, bm = 0] = b.time.split(":").map(Number);
          return ah === bh ? am - bm : ah - bh;
        })
        .map((slot, index) => {
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
              onPress={async () => {
                const [hour, minute] = slot.time.split(":").map(Number);
                const [year, month, day] = date.split("-").map(Number);
                const selectedDateObj = new Date(year, month - 1, day, hour, minute);

                const localSelectedSlot = { date, time: slot.time };

                setDate(selectedDateObj);
                setSelectedSlot(localSelectedSlot);

                if (!localSelectedSlot) {
                  Alert.alert("Error", "Debes seleccionar un horario");
                  return;
                }
                if (!selectedStylist) {
                  Alert.alert("Error", "Debes seleccionar un estilista");
                  return;
                }
                if (!selectedService) {
                  Alert.alert("Error", "Debes seleccionar un servicio");
                  return;
                }

                if (role === "guest") {
                  if (!nombre?.trim() || !email?.trim() || !phoneNumber?.trim()) {
                    Alert.alert(
                      "Error",
                      "Debes ingresar tu nombre, correo electrónico y número telefónico"
                    );
                    return;
                  }
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(email)) {
                    Alert.alert("Error", "Debes ingresar un correo electrónico válido");
                    return;
                  }
                }

                setConfirmModalVisible(true);
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
    </ScrollView>
  </KeyboardAvoidingView>
  </GradientBackground>
  {bookingLoading && (
  <View style={styles.overlay} pointerEvents="none">
    <ActivityIndicator size="large" color="#fff" />
    <Text style={styles.loadingText}>Confirmando tu cita…</Text>
  </View>
)}

{loadingAvailability && (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color="#fff" />
    <Text style={styles.loadingText}>Cargando disponibilidad...</Text>
  </View>
)}
  </View>

  

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
    backgroundColor:"white"
  },
  inputPicker: {
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
    elevation: 9999,     // Android layering
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
modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "70%",
  },
  stylistButton: {
    backgroundColor: "#D1B380",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  cancelButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  activityContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',   // light neutral background
    justifyContent: 'center',     // center vertically
    alignItems: 'center',         // center horizontally
    paddingHorizontal: 20,
  },
  dateButton: { padding: 12, backgroundColor: '#eee', borderRadius: 8 },
});