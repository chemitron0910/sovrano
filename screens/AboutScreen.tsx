import GradientBackground from '@/Components/GradientBackground';
import { ReactElement } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen(): ReactElement {
  const { width: windowWidth } = useWindowDimensions();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { fontSize: windowWidth > 500 ? 42 : 28 }]}>
            Acerca de Sovrano
          </Text>

          <Text style={styles.subtitle}>Crowning Beauty</Text>

          <Text style={styles.paragraph}>
            Sovrano representa el equilibrio entre la técnica más avanzada y el cuidado artesanal.
            Inspirada en las casas de alta costura europeas, cada detalle se cuida con la precisión
            de un maestro artesano.
          </Text>

          <Text style={styles.sectionHeader}>Nuestra Filosofía</Text>
          <Text style={styles.paragraph}>
            El cabello es la corona invisible y el accesorio más importante que llevamos cada día.
            En Sovrano, cada cliente se convierte en una expresión de su propio poder mediante
            nuestros artistas.
          </Text>

          <Text style={styles.sectionHeader}>Los Tres Pilares</Text>
          <Text style={styles.paragraph}>• Maestría: Solo los mejores profesionales, formados en técnicas internacionales.</Text>
          <Text style={styles.paragraph}>• Atención sobremedida: Asesoramiento personalizado antes, durante y después del servicio.</Text>
          <Text style={styles.paragraph}>• Exclusividad discreta: Elegancia sin ostentación. El lujo que se siente, pero no se grita.</Text>

          <Text style={styles.sectionHeader}>Manifiesto</Text>
          <Text style={styles.quote}>
            "La belleza no es solo una cuestión de apariencia, es una declaración de quien eres.
            En Sovrano, cada corte, cada tono y cada textura es un acto de soberanía."
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#000", // Negro Carbón
  },
  subtitle: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 16,
    color: "black", // Oro Pálido
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#00796b",
    textAlign: "center",
  },
  paragraph: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  quote: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 12,
    color: "#555",
  },
});
