import GradientBackground from '@/Components/GradientBackground';
import BodyText from '@/Components/typography/BodyText';
import TitleText from '@/Components/typography/TitleText';
import NetInfo from "@react-native-community/netinfo";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { sendPasswordResetEmail, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';
import { deleteDoc, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';
import Button_style2 from '../Components/Button_style2';
import Logo from '../Components/Logo';
import { auth, db } from '../Services/firebaseConfig';
import { RootStackParamList } from '../src/types';
import { ensureAvailability } from "../utils/ensureAvailability";
import { logError } from "../utils/logger";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Inicio-Sovrano">;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

type Errors = {
  email?: string;
  password?: string;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const firestore = getFirestore();
  const [isConnected, setIsConnected] = useState(true); 

  useEffect(() => {
    ensureAvailability();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  const handleGuestLogin = async () => {
    if (!isConnected) {
      Alert.alert("Error", "No hay conexión a internet. No se pudo iniciar sesión como invitado.");
      return;
    }
    try {
      setLoading(true);
      setLoadingMessage('Iniciando sesión como invitado...'); // 👈 overlay text for guest

      const result = await signInAnonymously(auth);
      const user = result.user;

      // Create a Firestore doc for the guest if needed
      await setDoc(doc(db, "users", user.uid), {
        role: "guest",
        createdAt: new Date().toISOString(),
      }, { merge: true });

      // Force token refresh
      await user.getIdToken(true);

      // ✅ Wait until the claim is actually present
      let claims;
      for (let i = 0; i < 5; i++) {
        await new Promise(res => setTimeout(res, 1000));
        claims = await user.getIdTokenResult(true);
        if (claims.claims.role === "guest") {
          setLoading(false);
          navigation.navigate("Inicio-Invitado", { role: "guest" });
          // 🧹 Clean up: delete the guest record from users collection
          await deleteDoc(doc(db, "users", user.uid));
          return;
        }
      }

      setLoading(false);
      Alert.alert("Error", "Guest role not yet assigned. Please try again.");
    } catch (error) {
      setLoading(false);
      logError("Guest login error:", error);
      Alert.alert("Error", "No se pudo iniciar sesión como invitado.");
    }
  };

  const validateForm = (): boolean => {
  const errors: Errors = {};
  if (!email) errors.email = 'Correo electrónico es requerido';
  if (!password) errors.password = 'Clave es requerida';
  setErrors(errors);
  return Object.keys(errors).length === 0;
};

  const handleLogin = async () => {
  if (!validateForm()) return;
  if (!isConnected) {
      Alert.alert("Error", "No hay conexión a internet. No se pudo iniciar sesión como invitado.");
      return;
    }
  setLoading(true);
  setLoadingMessage('Verificando credenciales...'); // 👈 overlay text for normal login
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (!user.emailVerified) {
      Alert.alert('Verifica tu correo electrónico antes de continuar.');
      navigation.navigate('Re-enviar correo electronico');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // ✅ Update LastLogin field
    await setDoc(
      userRef,
      { lastLogin: new Date().toISOString() }, // store ISO date string
      { merge: true }
    );

    setEmail('');
    setPassword('');

    async function registerPushToken(uid: string) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Notification permissions not granted');
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;

        await setDoc(
          doc(firestore, `users/${uid}`),
          { expoPushToken: token },
          { merge: true }
        );
      } catch (error) {}
    }

    await registerPushToken(user.uid);

    switch (userData?.role) {
      case 'admin':
        navigation.navigate('Administrador', { role: 'admin' });
        break;
      case 'empleado':
        navigation.navigate('Empleado', { role: 'empleado' });
        break;
      default:
        navigation.navigate('Usuario', { role: 'usuario' });
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo iniciar sesión. Clave o email incorrecto');
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async () => {
    if (!isConnected) {
      Alert.alert("Error", "No hay conexión a internet. No se pudo iniciar sesión como invitado.");
      return;
    }
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
          logError('Password reset error:', error);
          Alert.alert('Error', 'No se pudo enviar el correo de recuperación.');
        }
        },
      },
    ]
  );
};

  return (
    <GradientBackground>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      )}
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">

        <View>
          <Logo/>
        </View>

        <View style={styles.sovranoContainer}>
          <TitleText>
            Sovrano
          </TitleText>
        </View>
          <Text style={styles.welcomeText}>
            Bienvenido a tu espacio de belleza con maestria, atención y exclusividad
          </Text>
        <View style={{ flexDirection: 'column', gap: 10 }}>
          <BodyText>Correo electrónico</BodyText>
          <TextInput
            style={[
            styles.inputText,{ backgroundColor: '#d8d2c4' }
            ]}
            placeholder="Entra tu correo electrónico"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            autoCapitalize="none"
          />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <BodyText>Clave</BodyText>
          <TextInput
            style={[
            styles.inputText,{ backgroundColor: '#d8d2c4' },
            { borderColor: passwordFocused ? '#d46b37ff' : '#999' }
            ]}
            secureTextEntry
            placeholder="Entra tu clave"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <Button_style2
            title="Inicio-Invitado"
            onPress={handleGuestLogin}
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
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
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    color: '#6a4e2e', // elegant brown-gold tone
    fontFamily: 'Playfair-Bold',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'stretch',
  },
  sovranoContainer:{
    alignItems: 'center',     // centers horizontally
  }
});

