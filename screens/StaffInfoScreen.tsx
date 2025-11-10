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
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, TextInput, TouchableOpacity, View
} from 'react-native';
import Button_style2 from '../Components/Button_style2';

  export default function StaffInfoScreen(){

    const auth = getAuth();
  const firestore = getFirestore();
  const uid = auth.currentUser?.uid;

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState({ instagram: '', facebook: '', website: '' });
  const [generalInfo, setGeneralInfo] = useState('');
  const [services, setServices] = useState<{ id: string; name: string; duration: string }[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [availableServices, setAvailableServices] = useState<
  { id: string; name: string; duration: string; description?: string }[]
>([]);

    const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!uid) return;
      const ref = doc(firestore, `users/${uid}/profile/info`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfilePic(data.profilePic ?? null);
        setSocialLinks(data.socialLinks ?? {});
        setGeneralInfo(data.generalInfo ?? '');
        setServices(data.services ?? []);
      }
    };
    loadProfile();
  }, [uid]);

  useEffect(() => {
  const loadAvailableServices = async () => {
    const snapshot = await getDocs(collection(firestore, 'services'));
    const list = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        duration: data.duration,
        description: data.description,
      };
    });
    setAvailableServices(list);
  };
  loadAvailableServices();
}, []);


  const handleEdit = (index: number) => setEditingIndex(index);

const handleDelete = async (index: number) => {
  if (!uid) return;

  const updated = services.filter((_, i) => i !== index);
  setServices(updated);

  if (editingIndex === index) setEditingIndex(null);

  try {
    const ref = doc(firestore, `users/${uid}/profile/info`);
    await setDoc(ref, {
      profilePic,
      socialLinks,
      generalInfo,
      services: updated,
    }, { merge: true }); // ✅ merge ensures other fields stay intact
  } catch (err) {
    console.error('Error deleting service from Firestore:', err);
  }
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

  const addService = () => setServices([...services, { id: '', name: '', duration: '' }]);

  
  const removeService = (index: number) => {
  const updated = services.filter((_, i) => i !== index);
  setServices(updated);
};

  const saveProfile = async () => {
  if (!uid) return;
  setSaving(true);
  try {
    const ref = doc(firestore, `users/${uid}/profile/info`);
    await setDoc(ref, {
      profilePic,
      socialLinks,
      generalInfo,
      services,
    });
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
        {saving && (
  <View style={styles.overlay}>
    <BodyText style={{ color: '#fff', fontSize: 18 }}>Guardando...</BodyText>
  </View>
)}

        <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust as needed
>
    <ScrollView style={{ flex: 1, padding: 16 }}>
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

      <SubTitleText>Servicios ofrecidos</SubTitleText>
      {services.map((service, index) => (
  <View key={index} style={styles.serviceItem}>
    {editingIndex === index ? (
      <>
      <View style={styles.pickerWrapper}>
        <Picker
  selectedValue={service.name}
  onValueChange={(selectedName) => {
    const selected = availableServices.find(s => s.name === selectedName);
    if (selected) {
  const updated = [...services];
  updated[index] = {
    id: selected.id,
    name: selected.name,
    duration: selected.duration,
  };
  setServices(updated);
}

  }}
  mode={Platform.OS === 'android' ? 'dropdown' : undefined}
      style={styles.picker}
      itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
>
  <Picker.Item label="Selecciona un servicio" value="" />
  {availableServices.map((s, i) => (
    <Picker.Item key={i} label={`${s.name} (${s.duration})`} value={s.name} />
  ))}
</Picker>
</View>

            <TouchableOpacity onPress={() => setEditingIndex(null)} >
                  <BodyText style={styles.edit}>Guardar</BodyText>
                </TouchableOpacity>
      </>
    ) : (
      <>
        <View style={{ flex: 1 }}>
          <BodyBoldText style={styles.serviceName}>{service.name}</BodyBoldText>
          <BodyText style={styles.serviceTime}>{service.duration}</BodyText>
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
    <View style={styles.buttonRow}>
  <Button_style2 title="Agregar servicio" onPress={addService} style={styles.button} />
  <Button_style2 title="Guardar perfil" onPress={saveProfile} style={styles.button} />
</View>

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
  serviceItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
  padding: 12,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
},
serviceName: {
  fontSize: 16,
  marginBottom: 4,
},
serviceTime: {
  fontSize: 14,
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
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
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
});