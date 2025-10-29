import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from '../Components/Button_style2';
import { auth, db } from '../Services/firebaseConfig';

export default function LoginScreen({ navigation }) {
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let errors = {};
    if (!email) errors.email = 'Correo electrónico es requerido';
    if (!password) errors.password = 'Clave es requerida';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      if (!user.emailVerified) {
        Alert.alert('Verifica tu correo electrónico antes de continuar.');
        navigation.navigate('Re-enviar correo electronico');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      setEmail('');
      setPassword('');

      switch (userData?.role) {
        case 'admin':
          navigation.navigate('Administrador');
          break;
        case 'empleado':
          navigation.navigate('Empleado');
          break;
        default:
          navigation.navigate('Usuario');
      }
    } catch (error) {
      console.log('Login error:', error);
      console.log('Login error:', JSON.stringify(error, null, 2));
      console.log('Trying login with:', email.trim(), 'Password length:', password.trim().length);

      Alert.alert('Error', 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
  if (!email.trim()) {
    Alert.alert('Error', 'Por favor ingresa tu correo electrónico para recuperar la clave.');
    return;
  }

  Alert.alert(
    '¿Enviar correo de recuperación?',
    `Se enviará un correo a ${email.trim()} para restablecer tu clave.`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Confirmar',
        onPress: async () => {

        try {
          await sendPasswordResetEmail(auth, email.trim());
          Alert.alert('Correo enviado', 'Revisa tu bandeja de entrada para restablecer tu clave.');
        } catch (error) {
          console.error('Password reset error:', error);
          Alert.alert('Error', 'No se pudo enviar el correo de recuperación.');
        }
        },
      },
    ]
  );
};

  return (
    <SafeAreaView style={styles.safeContainer}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Verificando credenciales...</Text>
        </View>
      )}
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={styles.container}
      >
        <View style={styles.form}>
          <View style={{ flexDirection: 'column', gap: 10 }}>
            <Text>Correo electrónico</Text>
            <TextInput
              style={styles.inputText}
              placeholder="Entra tu correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text>Clave</Text>
            <TextInput
              style={styles.inputText}
              secureTextEntry
              placeholder="Entra tu clave"
              value={password}
              onChangeText={setPassword}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <Button_style2
              title="Ingresar"
              onPress={handleLogin}
              gradientColors={['#00c6ff', '#0072ff']}
              textColor="#fff"
            />

            <Button_style2
              title="Registrarse"
              onPress={() => navigation.navigate('Registrarse')}
              gradientColors={['#00c6ff', '#0072ff']}
              textColor="#fff"
            />

            <Button_style2
              title="¿Olvidaste tu clave?"
              onPress={handleForgotPassword}
              gradientColors={['#00c6ff', '#0072ff']}
              textColor="#fff"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 0,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
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
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
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
});
