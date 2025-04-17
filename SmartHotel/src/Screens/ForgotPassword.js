import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Button, Icon } from 'react-native-elements';

API_URL='http://192.168.18.50:8082/password_reset'

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleResetPassword = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    console.log(email)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      navigation.navigate('CheckEmailScreen', { email });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', padding: 20 }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginBottom: 20 }}
      >
        <Icon name="arrow-back" type="material" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#000' }}>
        Forget Password
      </Text>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 }}>
        Please enter your email to reset the password
      </Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>
        Your Email
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#E0E0E0',
          borderRadius: 8,
          padding: 10,
          marginBottom: 20,
          backgroundColor: '#FFF',
          fontSize: 16,
        }}
        placeholder="Enter your email (e.g., contact@dscodetech.com)"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button
        title="Reset Password"
        buttonStyle={{
          backgroundColor: '#4A90E2',
          borderRadius: 8,
          paddingVertical: 15,
          marginBottom: 20,
        }}
        titleStyle={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}
        onPress={handleResetPassword}
        disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || isLoading}
        loading={isLoading}
      />
    </SafeAreaView>
  );
};

export default ForgotPassword;