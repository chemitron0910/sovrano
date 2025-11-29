import GradientBackground from '@/Components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { auth, db } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';

export default function UserProfileScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userAutoNumber, setUserAutoNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setUsername(user.displayName || '');
      setEmail(user.email || '');

      try {
        setLoading(true);
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setPhoneNumber(data.phoneNumber || '');
          setUserAutoNumber(data.autoNumber || '');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    setSaving(true);
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { phoneNumber });

    // 👇 Dismiss the keyboard after saving
    Keyboard.dismiss();

    Alert.alert('Perfil actualizado', 'Tu número telefónico ha sido guardado correctamente.');
  } catch (err) {
    console.error('Error updating phone number:', err);
    Alert.alert('Error', 'No se pudo guardar el número. Intenta de nuevo.');
  } finally {
    setSaving(false);
  }
};

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.label}>Numero de Usuario</Text>
        <View style={styles.readOnlyField}>
          <Text>{userAutoNumber || 'No disponible'}</Text>
        </View>

        <Text style={styles.label}>Usuario</Text>
        <View style={styles.readOnlyField}>
          <Text>{username || 'No disponible'}</Text>
        </View>

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.readOnlyField}>
          <Text>{email || 'No disponible'}</Text>
        </View>

        <Text style={styles.label}>Número telefónico</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Ingresa tu número"
          keyboardType="phone-pad"
        />

        <View style={{ marginTop: 20 }}>
          <Button_style2 title="Guardar cambios" onPress={handleSave} />
        </View>

        {/* ✅ Loading overlay */}
        {(loading || saving) && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>
              {loading ? 'Cargando perfil...' : 'Guardando cambios...'}
            </Text>
          </View>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'light grey',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#00796b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
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
});
