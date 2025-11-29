import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, runTransaction, setDoc } from 'firebase/firestore';
import { ReactElement, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { auth, db } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registro exitoso'>;

type Errors = {
  username?: string;
  email?: string;
  emailConfirmation?: string;
  phoneNumber?: string;
  password?: string;
  passwordConfirmation?: string;
};

export default function SignUpScreen(): ReactElement {
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);

  // Helper to get next sequential number
async function getNextUserNumber() {
  const counterRef = doc(db, "counters", "usersCounter");

  const newNumber = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);

    if (!counterSnap.exists()) {
      transaction.set(counterRef, { lastNumber: 1 });
      return 1;
    }

    const lastNumber = counterSnap.data().lastNumber || 0;
    const nextNumber = lastNumber + 1;
    transaction.update(counterRef, { lastNumber: nextNumber });
    return nextNumber;
  });

  return newNumber;
}

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!username) newErrors.username = 'Nombre de usuario es requerido';
    if (!email) newErrors.email = 'Correo electronico es requerido';
    if (!emailConfirmation) newErrors.emailConfirmation = 'Correo electronico es requerido';
    if (email !== emailConfirmation) newErrors.emailConfirmation = 'Los correos electronicos no coinciden';
    if (!phoneNumber) newErrors.phoneNumber = 'Numero telefonico es requerido';
    if (!password) newErrors.password = 'Clave es requerida';
    else if (password.length < 6) newErrors.password = 'Clave debe ser al menos de 6 caracteres';
    if (!passwordConfirmation) newErrors.passwordConfirmation = 'Confirmacion de clave es requerida';
    else if (passwordConfirmation.length < 6)
      newErrors.passwordConfirmation = 'Confirmacion de clave debe ser al menos de 6 caracteres';
    if (password !== passwordConfirmation) newErrors.passwordConfirmation = 'Las claves no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) return;
  setLoading(true);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // ✅ Get sequential number
    const autoNumber = await getNextUserNumber();

    await setDoc(doc(db, 'users', uid), {
      username,
      email,
      phoneNumber,
      createdAt: new Date().toISOString(),
      role: 'usuario',
      activo: true,
      autoNumber, // ✅ sequential number
    });

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: username });
      await sendEmailVerification(auth.currentUser);
    }

    navigation.navigate('Registro exitoso', {
      username,
      email,
      userId: uid,
    });

    setUsername('');
    setPassword('');
    setEmail('');
    setErrors({});
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      try {
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = loginCredential.user.uid;

        navigation.navigate('Registro exitoso', {
          username: loginCredential.user.displayName || '',
          email,
          userId: uid,
        });

        Alert.alert('Inicio de sesión', 'Ya tenías una cuenta. Has iniciado sesión correctamente.');
      } catch (loginError: any) {
        Alert.alert('Error al iniciar sesión:', JSON.stringify(loginError, null, 2));
      }
    } else {
      Alert.alert('Error creando usuario:', JSON.stringify(error, null, 2));
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={styles.container}
    >
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Creando tu usuario...</Text>
        </View>
      )}
      <GradientBackground colors={['#fffbe6', '#f5e1c0']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <BodyBoldText>Nombre de usuario</BodyBoldText>
            <TextInput
              style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
              placeholder="Entra tu nombre de usuario"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

            <BodyBoldText>Correo electronico</BodyBoldText>
            <TextInput
              style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
              autoCapitalize="none"
              placeholder="Entra tu correo electronico"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <BodyBoldText>Confirma correo electronico</BodyBoldText>
            <TextInput
              style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
              autoCapitalize="none"
              placeholder="Confirma tu correo electronico"
              placeholderTextColor="#888"
              value={emailConfirmation}
              onChangeText={setEmailConfirmation}
            />
            {errors.emailConfirmation && <Text style={styles.errorText}>{errors.emailConfirmation}</Text>}

            <BodyBoldText>Telefono</BodyBoldText>
            <TextInput
              style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
              placeholder="Entra tu numero telefonico"
              placeholderTextColor="#888"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

            <BodyBoldText>Entra tu clave</BodyBoldText>
            <TextInput
              style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
              secureTextEntry
              placeholder="Entra tu clave"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <BodyBoldText>Confirma tu clave</BodyBoldText>
            <TextInput
              style={[styles.inputText, { backgroundColor: '#d8d2c4' }]}
              secureTextEntry
              placeholder="Re-entra tu clave"
              placeholderTextColor="#888"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
            />
            {errors.passwordConfirmation && <Text style={styles.errorText}>{errors.passwordConfirmation}</Text>}

            <View style={{ marginTop: 20 }}>
              <Button_style2 title="Registrate" onPress={handleSubmit} />
            </View>

            <View style={{ marginTop: 12 }}>
              <Button_style2 title="Vuelve al inicio" onPress={() => navigation.navigate('Inicio-Invitado', { role: "guest" })} />
            </View>
          </View>
        </ScrollView>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: StatusBar.currentHeight || 0,
  },
  form: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputText: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0072ff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc', // light gray
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  scrollContainer: {
  alignItems: 'stretch',
},
});