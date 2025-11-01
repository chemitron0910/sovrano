import { LinearGradient } from 'expo-linear-gradient';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function LoginScreen({ navigation }) {
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);


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

      Alert.alert('Error', 'No se pudo iniciar sesión. Clave or email incorrecto');
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
    <LinearGradient
    colors={['#fffbe6', '#f5e1c0']} // cream to champagne gold
    style={{ flex: 1 }}
  >
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Verificando credenciales...</Text>
        </View>
      )}

      

      <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  style={{ flex: 1 }}
>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.logoContainer}>
          <Image            
            source={require('../assets/images/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
        />
        </View>

        <Text style={styles.welcomeText}>
          Bienvenido a Sovrano
        </Text>
        <Text style={styles.welcomeText}>
          Tu espacio de belleza y bienestar
        </Text>
          <View style={{ flexDirection: 'column', gap: 10 }}>
            <Text>Correo electrónico</Text>
            <TextInput
              style={[
              styles.inputText,{ backgroundColor: '#f0f0f0' }
              ]}
              placeholder="Entra tu correo electrónico"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text>Clave</Text>
            <TextInput
              style={[
              styles.inputText,{ backgroundColor: '#f0f0f0' },
              { borderColor: passwordFocused ? '#d46b37ff' : '#999' }
              ]}
              secureTextEntry
              placeholder="Entra tu clave"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <Button_style2
              title="Invitado"
              onPress={() => navigation.navigate('Invitado')}
            />

            <Button_style2
              title="Usuario registrado"
              onPress={handleLogin}
            />

            <Button_style2
              title="¿Olvidaste tu clave?"
              onPress={handleForgotPassword}
            />
          </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 0,
    justifyContent: 'flex-start',  
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
  borderWidth: 1,
  paddingHorizontal: 10,
  borderRadius: 5,
  marginBottom: 20,
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
  logoContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
},

logo: {
  width: 100,
  height: 100,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
welcomeText: {
  fontSize: 18,
  fontWeight: '500',
  textAlign: 'center',
  marginBottom: 20,
  color: '#6a4e2e', // elegant brown-gold tone
},
scrollContainer: {
  paddingHorizontal: 20,
  paddingTop: 20,
  alignItems: 'stretch',
},
});
