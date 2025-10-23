import { signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView, Platform,
  StatusBar, StyleSheet, Text, TextInput, View, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button_style2 from "../Components/Button_style2";
import { auth } from '../Services/firebaseConfig';

export default function LoginScreen({navigation}) {

const windowDimensions = useWindowDimensions();
const windowWidth = windowDimensions.width;
const windowHeight = windowDimensions.height;
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});

const validateForm = () => {
   let errors = {};
   if (!email) {
     errors.email = 'Correo electronico is requerido';
   }
   if (!password) {
     errors.password = 'Clave es requerida';
   }
   setErrors(errors);
   return Object.keys(errors).length === 0;
 };
 
  return (
    <SafeAreaView style={styles.safeContainer}>
    <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} style={styles.container}>
      <View style={styles.form} >
        <View style={{
            flexDirection: 'column', 
            gap: 10
            } }>
        <Text>Correo electronico</Text>
        <TextInput style={styles.inputText}
        placeholder='Entra tu correo electronico' value={email} onChangeText={setEmail} />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <Text>Clave</Text>
        <TextInput style={styles.inputText} secureTextEntry
        placeholder='Entra tu clave' value={password} onChangeText={setPassword} />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <Button_style2 title="Ingresa como invitado" onPress={async()=>{
          try{
            const result = await signInAnonymously(auth);
            console.log('Signed in anonymously:', result.user.uid);
            navigation.navigate("Ingresa como invitado");
            } catch (error) {
          console.error('Anonymous sign-in failed:', error);
          Alert.alert('Error', 'No se pudo entrar como invitado');
          }}}
          gradientColors={['#00c6ff', '#0072ff']}
          textColor="#fff">
        </Button_style2>

        <Button_style2 title="Ingresa como usuario" onPress={async()=>{
          if (!validateForm()) return;
          try{
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log('Signed in with credentials:', result.user.uid);
            // ✅ Clear form
            setPassword('');
            setEmail('');
            navigation.navigate("Ingresa como usuario");
            } catch(error){
            console.error('Sign-in failed:', error);
            Alert.alert('Error', 'No se pudo entrar como usuario');
            }
          }
        }
          gradientColors={['#00c6ff', '#0072ff']}
          textColor="#fff">
        </Button_style2>

        <Button_style2 title="Ingresa como administrador" onPress={()=>navigation.navigate("Ingresa como administrador")}
          gradientColors={['#00c6ff', '#0072ff']}
          textColor="#fff">
        </Button_style2>
        </View>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal : 20,
    paddingTop: StatusBar.currentHeight || 0, //This only applies to android
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
});