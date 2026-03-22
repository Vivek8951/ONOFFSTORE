import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handleSendOtp = () => {
    if (phone.length < 10) return Alert.alert('Invalid Phone', 'Please enter a valid number');
    setShowOtp(true);
    Alert.alert('OTP Sent', 'Testing Mode: Use 123456');
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      setIsAuthenticated(true);
    } else {
      Alert.alert('Error', 'Invalid OTP');
    }
  };

  const [banners, setBanners] = useState([]);
  const API_URL = 'http://localhost:5000'; // Mobile fallback for local testing

  React.useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/api/banners`);
        const data = await res.json();
        setBanners(data);
      } catch (err) { console.log('Banner Sync Offline'); }
    };
    fetchBanners();
    const interval = setInterval(fetchBanners, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return (
      <View style={styles.landingContainer}>
        <Image 
          source={{ uri: banners[0]?.image || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800' }} 
          style={styles.landingBg} 
        />
        <View style={styles.landingOverlay}>
          <Text style={styles.landingTitle}>SMARTON</Text>
          <Text style={styles.landingSubTitle}>PRIVATE ATELIER</Text>
          
          <View style={styles.loginCard}>
            <Text style={styles.loginHeader}>{showOtp ? 'VERIFY ACCESS' : 'MEMBER ENTRANCE'}</Text>
            
            {!showOtp ? (
              <>
                <TextInput 
                  style={styles.input}
                  placeholder="PHONE NUMBER"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={phone}
                  onChangeText={setPhone}
                />
                <TouchableOpacity style={styles.primaryButton} onPress={handleSendOtp}>
                  <Text style={styles.buttonText}>REQUEST ACCESS</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput 
                  style={styles.input}
                  placeholder="OTP CODE"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={otp}
                  onChangeText={setOtp}
                />
                <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp}>
                  <Text style={styles.buttonText}>VERIFY & ENTER</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowOtp(false)}>
                  <Text style={styles.backLink}>CHANGE NUMBER</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          <Text style={styles.footerText}>© 2024 SMARTON WORLDWIDE</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>SMART<Text style={{color: '#f21c43'}}>ON</Text></Text>
        <TouchableOpacity onPress={() => setIsAuthenticated(false)}>
          <Text style={styles.logoutText}>EXIT</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Banners */}
      {banners.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerScroll}>
          {banners.map((banner, index) => (
            <View key={index} style={styles.bannerSlide}>
              <Image source={{ uri: banner.image }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Product List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PRIVATE DROPS</Text>
        
        <View style={styles.card}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800' }} 
            style={styles.cardImage} 
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Oversized Parachute Cargo</Text>
            <Text style={styles.cardPrice}>₹ 8,499</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>SECURE ITEM</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { marginTop: 20 }]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800' }} 
            style={styles.cardImage} 
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Essential Utility Jacket</Text>
            <Text style={styles.cardPrice}>₹ 12,999</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>SECURE ITEM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  landingContainer: { flex: 1, backgroundColor: '#000' },
  landingBg: { width: '100%', height: '100%', opacity: 0.6 },
  landingOverlay: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', padding: 30 },
  landingTitle: { color: '#fff', fontSize: 50, fontWeight: '900', letterSpacing: -2 },
  landingSubTitle: { color: '#aaa', fontSize: 12, fontWeight: 'bold', letterSpacing: 8, marginBottom: 50 },
  loginCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', padding: 30, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  loginHeader: { color: '#fff', fontSize: 14, fontWeight: '900', textAlign: 'center', marginBottom: 25, letterSpacing: 2 },
  input: { borderBottomWidth: 1, borderBottomColor: '#333', color: '#fff', padding: 15, marginBottom: 20, fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#fff', padding: 20, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '900', letterSpacing: 1 },
  backLink: { color: '#666', fontSize: 10, textAlign: 'center', marginTop: 15, fontWeight: 'bold' },
  footerText: { color: '#333', fontSize: 10, fontWeight: 'bold', position: 'absolute', bottom: 40 },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  brand: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  logoutText: { fontSize: 10, fontWeight: 'bold', color: '#999' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardImage: { width: '100%', height: 400, borderRadius: 5 },
  cardInfo: { paddingTop: 15 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  cardPrice: { fontSize: 16, fontWeight: '900', color: '#f21c43', marginTop: 5, marginBottom: 15 },
  button: { backgroundColor: '#000', padding: 15, alignItems: 'center' },
  bannerScroll: { height: 500 },
  bannerSlide: { width: width, height: 500, position: 'relative' },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  bannerTitle: { color: '#fff', fontSize: 32, fontStyle: 'italic', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: -1 }
});
