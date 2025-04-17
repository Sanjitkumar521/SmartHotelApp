import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Image
          source={require('../../assets/images/welcome.png')} 
          style={styles.image}
        />

      <Text style={styles.title}>Smart Hotel Management system</Text>
      <Text style={styles.subtitle}>Order your favorite Meals{'\n'}Here!</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('loginscreen')}
        >
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1cd4c2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '60%',
    resizeMode: 'cover',
    borderRadius: 100,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#f5f5f5',
    marginTop: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 50,
    gap: 15,
  },
  signInButton: {
    backgroundColor: '#10b3a3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  registerButton: {
    backgroundColor: '#f3f3f3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerText: {
    color: '#000',
    fontWeight: 'bold',
},
});