import GradientBackground from '@/Components/GradientBackground';
import BodyBoldText from '@/Components/typography/BodyBoldText';
import BodyText from '@/Components/typography/BodyText';
import SubTitleText from '@/Components/typography/SubTitleText';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Button_style2 from '../Components/Button_style2';
import Logo from '../Components/Logo';
import { RootStackParamList } from '../src/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Registro exitoso'>;

export default function SignUpConfirmationScreen({ navigation, route }: Props) {
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;

  const { username, email, userId } = route.params;

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={{ paddingHorizontal: 24, gap: 10 }}>
          <Logo />
          <View style={{ marginLeft: 24 }}>
            <SubTitleText>Gracias por registrarte</SubTitleText>
          </View>
          <BodyBoldText>
            Por favor usa el enlace enviado a tu correo electronico para verificacion de tu cuenta
          </BodyBoldText>
          <BodyBoldText>
            Mira tu folder de correo no deseado si no lo encuentras
          </BodyBoldText>

          <View style={styles.inlineText}>
            <BodyBoldText>Nombre: </BodyBoldText>
            <BodyText>{username}</BodyText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Correo electronico: </BodyBoldText>
            <BodyText>{email}</BodyText>
          </View>
          <View style={styles.inlineText}>
            <BodyBoldText>Usuario ID: </BodyBoldText>
            <BodyText>{userId}</BodyText>
          </View>

          <View style={{ padding: 24 }}>
            <Button_style2
              title="Vuelve al inicio"
              onPress={() => navigation.navigate('Inicio-Sovrano')}
            />
          </View>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  inlineText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
