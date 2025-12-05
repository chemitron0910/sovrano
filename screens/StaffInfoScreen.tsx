import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import SubTitleText from '@/Components/typography/SubTitleText';
import { Picker } from '@react-native-picker/picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView, StyleSheet, TextInput, TouchableOpacity, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button_style2 from '../Components/Button_style2';

  export default function StaffInfoScreen(){

  const auth = getAuth();
  const firestore = getFirestore();
  const uid = auth.currentUser?.uid;
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState({ instagram: '', facebook: '', website: '' });
  const [generalInfo, setGeneralInfo] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<{ id: string; name: string; duration: string; cost?: string }[]>([]);
  const [availableServices, setAvailableServices] = useState<
  { id: string; name: string; duration: string; description?: string; cost?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
  const loadProfile = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const ref = doc(firestore, `users/${uid}/profile/info`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfilePic(data.profilePic ?? null);
        setSocialLinks(data.socialLinks ?? {});
        setGeneralInfo(data.generalInfo ?? '');
        setServices(data.services ?? []);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };
  loadProfile();
}, [uid]);

useEffect(() => {
  const loadAvailableServices = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(firestore, 'services'));
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          duration: data.duration,
          description: data.description,
          cost: data.cost,
        };
      });
      setAvailableServices(list);
    } catch (err) {
      console.error("Error loading services:", err);
    } finally {
      setLoading(false);
    }
  };
  loadAvailableServices();
}, []);

  const handleEdit = (index: number) => setEditingIndex(index);

const handleDelete = (index: number) => {
  if (!uid) return;

  Alert.alert(
    "Confirmar eliminación",
    "¿Estás seguro de que deseas eliminar este servicio?",
    [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const updated = services.filter((_, i) => i !== index);
          setServices(updated);

          if (editingIndex === index) setEditingIndex(null);

          try {
            const ref = doc(firestore, `users/${uid}/profile/info`);
            await setDoc(
              ref,
              {
                profilePic,
                socialLinks,
                generalInfo,
                services: updated,
              },
              { merge: true }
            );
          } catch (err) {
            console.error("Error deleting service from Firestore:", err);
          }
        },
      },
    ]
  );
};

  const pickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (result.canceled || result.assets.length === 0  || !uid) {
      return;
    }

    const asset = result.assets[0];

    // ✅ Convert to JPEG
    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      [],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    const response = await fetch(manipulated.uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `users/${uid}/profile/profilePic.jpg`);

    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error('Upload error:', error.code, error.message, error.customData);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setProfilePic(downloadUrl);
      }
    );
  } catch (err) {
    console.error('Unexpected error during image upload:', err);
  }
};

  const addService = () => {
  const newService = { id: '', name: '', duration: '' };

  // Prepend new service
  const updated = [newService, ...services];

  // Sort alphabetically by name (empty names stay at the top until edited)
  const sorted = updated.sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' })
  );

  setServices(sorted);

  // Optional: immediately open the new service in edit mode
  setEditingIndex(0);
};

  const saveProfile = async () => {
  if (!uid) return;
  setSaving(true);
  try {
    // Sort before saving
    const sorted = [...services].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' })
    );

    const ref = doc(firestore, `users/${uid}/profile/info`);
    await setDoc(ref, {
      profilePic,
      socialLinks,
      generalInfo,
      services: sorted,
    });

    setServices(sorted); // ✅ keep local state consistent
    Alert.alert('Perfil guardado', 'Los cambios se han guardado correctamente.');
  } catch (err) {
    console.error('Error al guardar el perfil:', err);
    Alert.alert('Error', 'No se pudo guardar el perfil. Intenta de nuevo.');
  } finally {
    setSaving(false);
  }
};

  return (
    
    <GradientBackground>
        {(loading || saving) && (
  <View style={styles.overlay}>
    <BodyText style={{ color: '#fff', fontSize: 18 }}>
      {loading ? "Cargando..." : "Guardando..."}
    </BodyText>
  </View>
)}

        <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust as needed
>
    <ScrollView style={{ flex: 1, padding: 16, paddingBottom: insets.bottom + 40 }}>
        <View style ={styles.centerText}>
      <TouchableOpacity onPress={pickImage}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={{ width: 120, height: 120, borderRadius: 60 }} />
        ) : (
          <View style={styles.placeholderPic}><BodyText style={{ textAlign: 'center' }}>Seleccionar imagen</BodyText></View>
        )}
      </TouchableOpacity>
      </View>

      <SubTitleText>Hoja de vida abreviada</SubTitleText>
      <TextInput
        placeholder="Sobre mí, experiencia, etc."
        placeholderTextColor="#888" 
        value={generalInfo}
        onChangeText={setGeneralInfo}
        multiline
        style={[styles.inputText, { height: 100 }]}
      />

      <SubTitleText>Instagram</SubTitleText>
<TextInput
  placeholder="Link a tu cuenta de Instagram"
  placeholderTextColor="#888"
  value={socialLinks.instagram}
  onChangeText={(text) =>
    setSocialLinks((prev) => ({ ...prev, instagram: text }))
  }
  style={styles.inputText}
/>

<View style={styles.buttonRow}>
  <Button_style2 title="Agregar servicio" onPress={addService} style={styles.button} />
  <Button_style2 title="Guardar perfil" onPress={saveProfile} style={styles.button} />
</View>

      <SubTitleText>Servicios ofrecidos</SubTitleText>
      {services.map((service, index) => (
  <View key={index} 
  style={[
    styles.serviceItem,
    editingIndex === index && styles.serviceItemEdit, // ✅ override layout when editing
  ]}>
    {editingIndex === index ? (
      <View style={styles.editContainer}>
      {/* Service Picker */}
    <View style={styles.pickerWrapper}>
      <TextInput
  style={styles.inputText}
  placeholder="Selecciona un servicio"
  placeholderTextColor="#888"
  value={service.name}
  editable={false}
  onPressIn={() => {
    setEditingServiceIndex(index);
    setServiceModalVisible(true);
  }}
/>
    </View>

    {/* 👇 Editable cost lives in edit mode */}
    <TextInput
      style={styles.inputText}
      value={service.cost?.toString() || ""}
      placeholder="Costo personalizado"
      onChangeText={(text) => {
        const updated = [...services];
        updated[index] = {
          ...updated[index],
          cost: text,
        };
        setServices(updated);
      }}
    />

    {/* Action buttons */}
    <View style={styles.editActions}>
      <TouchableOpacity
  onPress={async () => {
    await saveProfile();   // ✅ save to Firestore
    Alert.alert("Servicio guardado", "Los cambios se han guardado correctamente.");
    setEditingIndex(null); // ✅ exit edit mode
  }}
>
  <BodyText style={styles.edit}>Cerrar</BodyText>
</TouchableOpacity>

      <TouchableOpacity onPress={() => setEditingIndex(null)}>
        <BodyText style={styles.cancel}>Cancelar</BodyText>
      </TouchableOpacity>
    </View>
    </View>
) : (
  <>
    <View style={{ flex: 1 }}>
      <BodyBoldText style={styles.serviceName}>{service.name}</BodyBoldText>
      <BodyText style={styles.serviceTime}>
        {service.duration} {Number(service.duration) === 1 ? "hora" : "horas"} — ${service.cost || "N/A"}
      </BodyText>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity onPress={() => handleEdit(index)}>
        <BodyText style={styles.edit}>Editar</BodyText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(index)}>
        <BodyText style={styles.delete}>Eliminar</BodyText>
      </TouchableOpacity>
    </View>
  </>
)}
  </View>
))}
<Modal
  visible={serviceModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setServiceModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <BodyBoldText style={styles.modalTitle}>Selecciona un servicio</BodyBoldText>

      <Picker
        selectedValue={
          editingServiceIndex !== null && services[editingServiceIndex]
            ? services[editingServiceIndex].name
            : ""
        }
        onValueChange={(selectedName) => {
          if (editingServiceIndex !== null && services[editingServiceIndex]) {
            const selected = availableServices.find((s) => s.name === selectedName);
            if (selected) {
              const updated = [...services];
              updated[editingServiceIndex] = {
                id: selected.id,
                name: selected.name,
                duration: selected.duration,
                cost: selected.cost,
              };
              setServices(updated);
            }
          }
        }}
        mode={Platform.OS === "android" ? "dropdown" : undefined}
        style={styles.picker}
        itemStyle={Platform.OS === "ios" ? styles.pickerItem : undefined}
      >
        <Picker.Item label="Selecciona un servicio" value="" />
        {availableServices.map((s, i) => (
          <Picker.Item key={i} label={`${s.name} (${s.duration})`} value={s.name} />
        ))}
      </Picker>

      <Button_style2
        title="Aceptar"
        onPress={() => setServiceModalVisible(false)}
        style={{ marginTop: 20 }}
      />
    </View>
  </View>
</Modal>
<View style={{ height: insets.bottom + 40 }} />
    </ScrollView>
    </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  inputText: {
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1, 
    marginTop: 12,
    marginBottom: 20, 
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,         // ✅ Ensures placeholder is visible
    color: '#000',        // ✅ Ensures input text is visible
  },
  placeholderPic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
serviceName: {
  fontSize: 16,
  marginBottom: 4,
},
serviceTime: {
  fontSize: 18,
  color: '#666',
},
actions: {
  flexDirection: 'column',
  justifyContent: 'space-between',
  marginLeft: 12,
},
actionButton: {
  marginVertical: 4,
},
edit: {
    color: '#0072ff',
    marginBottom: 4,
  },
  delete: {
    color: 'red',
  },
  centerText:{
    alignItems:'center'
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
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 12, // if supported, or use marginRight
},
button: {
  alignSelf: 'flex-start', // ✅ prevents full-width stretching
  paddingHorizontal: 12,   // ✅ optional: tighter padding
  marginBottom: 50,
},
editContainer: {
  flexDirection: 'column',   // stack vertically
  alignItems: 'stretch',     // let children fill width
  gap: 12,                   // if RN version supports gap
  width: '100%',             // ✅ take full width of parent
},

pickerWrapper: {
  width: '100%',
},
pickerItem: {
  fontSize: 16,
  color: 'black',
},
serviceItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 6,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  width: '100%',
},
serviceItemEdit: {
  flexDirection: 'column', // ✅ stack vertically when editing
  alignItems: 'stretch',
},
editActions: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: 20, // if RN version supports gap, otherwise use marginRight
  marginTop: 12,
},
cancel: {
  color: 'red', // grey tone for cancel
  marginLeft: 16,
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
},
modalTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 12,
},
});