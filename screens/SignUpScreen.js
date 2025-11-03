import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import { useNavigation } from '@react-navigation/native';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword, updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StatusBar, StyleSheet, Text, TextInput, View, useWindowDimensions
} from 'react-native';
import Button_style2 from '../Components/Button_style2';
import { auth, db } from '../Services/firebaseConfig';

export default function SignUpScreen() {

const windowDimensions = useWindowDimensions();
const windowWidth = windowDimensions.width;
const windowHeight = windowDimensions.height;
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [passwordConfirmation, setPasswordConfirmation] = useState('');
const [email, setEmail] = useState('');
const [emailConfirmation, setEmailConfirmation] = useState('');
const [phoneNumber, setPhoneNumber] = useState('');
const [errors, setErrors] = useState({});
const navigation = useNavigation();
const [loading, setLoading] = useState(false);

const validateForm = () => {
    let errors = {};

    if (!username) {
      errors.username = 'Nombre de usuario es requerido';
    }
    if (!email) {
      errors.email = 'Correo electronico es requerido';
    }

    if (!emailConfirmation) {
      errors.emailConfirmation = 'Correo electronico es requerido';
    }

    if (email !== emailConfirmation) {
      errors.emailConfirmation = 'Los correos electronicos no coinciden';
    }

    if (!phoneNumber) {
      errors.phoneNumber = 'Numero telefonico es requerido';
    }

    if (!password) {
      errors.password = 'Clave es requerida';
    } else if (password.length < 6) {
      errors.password = 'Clave debe ser al menos de 6 caracteres';
    }
    if (!passwordConfirmation) {
      errors.passwordConfirmation = 'Confirmacion de clave es requerida';
    } else if (passwordConfirmation.length < 6) {
      errors.passwordConfirmation = 'Confirmacion de clave debe ser al menos de 6 caracteres';
    }
    if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'Las claves no coinciden';
    }
    setErrors(errors);
    const isValid = Object.keys(errors).length === 0;
  return isValid;
 };

 const handleSubmit = async () => {
  if (!validateForm()) return;
  setLoading(true); // ✅ show spinner

  try {
    // ✅ Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // ✅ Create user record in Firestore
    await setDoc(doc(db, 'users', uid), {
      username,
      email,
      phoneNumber,
      createdAt: new Date().toISOString(),
      role: 'usuario', // optional: for role-based access
    });

    await updateProfile(auth.currentUser, {
    displayName: username,
    });

    await sendEmailVerification(auth.currentUser);

    // ✅ Navigate to confirmation screen
    navigation.navigate('Registro exitoso', {
      username,
      email,
      userId: uid,
    });

    // ✅ Clear form
    setUsername('');
    setPassword('');
    setEmail('');
    setErrors({});
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      try {
        // ✅ Try to log in instead
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = loginCredential.user.uid;

        navigation.navigate('Registro exitoso', {
          username: loginCredential.user.displayName || '',
          email,
          userId: uid,
        });

        Alert.alert('Inicio de sesión', 'Ya tenías una cuenta. Has iniciado sesión correctamente.');
      } catch (error) {
        const firstKey = Object.keys(error)[0];
        const firstEntry = { [firstKey]: error[firstKey] };

        Alert.alert('Error al iniciar sesión:', JSON.stringify(firstEntry, null, 2));
      }
    } else {
      const firstKey = Object.keys(error)[0];
      const firstEntry = { [firstKey]: error[firstKey] };

      Alert.alert('Error creating user:', JSON.stringify(firstEntry, null, 2));
    }
  } finally {
    setLoading(false); // ✅ hide spinner
  }
};
  return (
    
    <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
    style={styles.container}>
      {loading && (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Creando tu usuario...</Text>
      </View>
    )}
    <GradientBackground
    colors={['#fffbe6', '#f5e1c0']} // cream to champagne gold
    style={{ flex: 1 }}>
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <BodyBoldText>Nombre de usuario</BodyBoldText>
        <TextInput style={[styles.inputText, { backgroundColor: '#f0f0f0' }]}
        placeholder='Entra tu nombre de usuario' placeholderTextColor="#888" value={username} onChangeText={setUsername}/>
        {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

        <BodyBoldText>Correo electronico</BodyBoldText>
        <TextInput style={[styles.inputText, { backgroundColor: '#f0f0f0' }]}
        autoCapitalize="none"
        placeholder='Entra tu corrreo electronico' placeholderTextColor="#888" value={email} onChangeText={setEmail}/>
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <BodyBoldText>Confirma correo electronico</BodyBoldText>
        <TextInput style={[styles.inputText, { backgroundColor: '#f0f0f0' }]}
        autoCapitalize="none"
        placeholder='Entra tu corrreo electronico' placeholderTextColor="#888" value={emailConfirmation} onChangeText={setEmailConfirmation}/>
        {errors.emailConfirmation ? <Text style={styles.errorText}>{errors.emailConfirmation}</Text> : null}

        <BodyBoldText>Telefono</BodyBoldText>
        <TextInput style={[styles.inputText, { backgroundColor: '#f0f0f0' }]}
        placeholder='Entra tu numero telefonico' placeholderTextColor="#888" value={phoneNumber} onChangeText={setPhoneNumber}/>
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

        <BodyBoldText>Entra tu clave</BodyBoldText>
        <TextInput style={[styles.inputText, { backgroundColor: '#f0f0f0' }]} secureTextEntry
        placeholder='Entra tu clave' placeholderTextColor="#888" value={password} onChangeText={setPassword}/>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <BodyBoldText>Confirma tu clave</BodyBoldText>
        <TextInput style={[styles.inputText, { backgroundColor: '#f0f0f0' }]} secureTextEntry
        placeholder='Re-entra tu clave' placeholderTextColor="#888" value={passwordConfirmation} onChangeText={setPasswordConfirmation}/>
        {errors.passwordConfirmation ? <Text style={styles.errorText}>{errors.passwordConfirmation}</Text> : null}

        <View style={{ marginTop: 20 }}>
          <Button_style2 title="Registrate" onPress={handleSubmit} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Button_style2
            title="Vuelve al inicio"
            onPress={() => navigation.navigate('Inicio-Invitado')}/>
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
    paddingTop: StatusBar.currentHeight || 0, //This only applies to android
  },
  form: {
  backgroundColor: 'transparent',
  borderRadius: 10,
  padding: 20,
  marginHorizontal: 20, // ✅ Add this for consistent side spacing
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
    fontSize: 16,         // ✅ Ensures placeholder is visible
    color: '#000',        // ✅ Ensures input text is visible
    placeholderTextColor: '#888',
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