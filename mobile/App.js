import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>ONOFF</Text>
      </View>

      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1583391733958-d25e07fac66a?w=800' }} 
          style={styles.heroImage} 
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroSubText}>FESTIVE COLLECTION '24</Text>
          <Text style={styles.heroText}>ETHNIC WARDROBE</Text>
        </View>
      </View>

      {/* Product Banner */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TRENDING NOW</Text>
        
        <View style={styles.card}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800' }} 
            style={styles.cardImage} 
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Handwoven Banarasi Lehenga</Text>
            <Text style={styles.cardPrice}>₹ 45,500</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>QUICK ADD</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  brand: { fontSize: 28, fontWeight: 'bold', letterSpacing: 4 },
  heroContainer: { position: 'relative', height: 400 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', bottom: 30, left: 20 },
  heroSubText: { color: '#C5A880', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  heroText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardImage: { width: '100%', height: 300 },
  cardInfo: { paddingTop: 15 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardPrice: { fontSize: 14, color: '#666', marginTop: 5, marginBottom: 15 },
  button: { backgroundColor: '#000', padding: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
