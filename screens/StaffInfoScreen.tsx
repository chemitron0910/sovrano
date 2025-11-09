import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import SubTitleText from '@/Components/typography/SubTitleText';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
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
  const [services, setServices] = useState([{ name: '', duration: '' }]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
    console.log('Service deleted and profile updated in Firestore');
  } catch (err) {
    console.error('Error deleting service from Firestore:', err);
  }
};

  const pickImage = async () => {
  try {
    console.log('Opening image picker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (result.canceled || result.assets.length === 0  || !uid) {
      console.log('Image selection canceled or no assets returned.');
      return;
    }

    const asset = result.assets[0];
    console.log('Selected asset:', asset);

    // ✅ Convert to JPEG
    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      [],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    console.log('Manipulated image:', manipulated);

    const response = await fetch(manipulated.uri);
    const blob = await response.blob();
    console.log('Blob created:', blob);

    const storage = getStorage();
    const storageRef = ref(storage, `users/${uid}/profile/profilePic.jpg`);
    console.log('Uploading to path:', storageRef.fullPath);

    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error('Upload error:', error.code, error.message, error.customData);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('Upload complete. Download URL:', downloadUrl);
        setProfilePic(downloadUrl);
      }
    );
  } catch (err) {
    console.error('Unexpected error during image upload:', err);
  }
};

  const updateService = (index: number, field: 'name' | 'duration', value: string) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const addService = () => setServices([...services, { name: '', duration: '' }]);
  
  const removeService = (index: number) => {
  const updated = services.filter((_, i) => i !== index);
  setServices(updated);
};


  const saveProfile = async () => {
    if (!uid) return;
    const ref = doc(firestore, `users/${uid}/profile/info`);
    await setDoc(ref, {
      profilePic,
      socialLinks,
      generalInfo,
      services,
    });
  };

  return (
    <GradientBackground>
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

      <SubTitleText>Redes sociales</SubTitleText>
      <TextInput 
      placeholder="Instagram" 
      placeholderTextColor="#888" 
      value={socialLinks.instagram} onChangeText={text => setSocialLinks({ ...socialLinks, instagram: text })} 
      style={styles.inputText} />
      <TextInput 
      placeholder="Facebook" value={socialLinks.facebook} 
      placeholderTextColor="#888" 
      onChangeText={text => setSocialLinks({ ...socialLinks, facebook: text })} 
      style={styles.inputText} />
      <TextInput 
      placeholder="Sitio web" 
      placeholderTextColor="#888" 
      value={socialLinks.website} onChangeText={text => setSocialLinks({ ...socialLinks, website: text })} 
      style={styles.inputText} />

      <SubTitleText>Servicios ofrecidos</SubTitleText>
      {services.map((service, index) => (
  <View key={index} style={styles.serviceItem}>
    {editingIndex === index ? (
      <>
        <TextInput
          placeholder="Nombre del servicio"
          placeholderTextColor="#888"
          value={service.name}
          onChangeText={text => updateService(index, 'name', text)}
          style={styles.inputText}
        />
        <TextInput
          placeholder="Duración (ej. 30min)"
          placeholderTextColor="#888"
          value={service.duration}
          onChangeText={text => updateService(index, 'duration', text)}
          style={styles.inputText}
        />
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

      <Button_style2 title="Agregar servicio" onPress={addService} />

      <View style={{ marginTop: 24, marginBottom: 30 }}>
        <Button_style2 title="Guardar perfil" onPress={saveProfile} />
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
  }
});