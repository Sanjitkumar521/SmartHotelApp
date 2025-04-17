import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Button, Icon } from 'react-native-elements';

const SetNewPasswordScreen = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async () => {

    // Validate passwords
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('password', password);

    try {
      const response = await fetch('http://192.168.18.50:8082/update_password', {
        method: 'POST',
        body: formData,
        headers: {},
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        // Customize error message for user
        let errorMessage = data.error || 'Failed to update password';
        if (data.error === 'User not found') {
          errorMessage = 'Account not found. Please check your email or sign up.';
        }
        Alert.alert('Error', errorMessage);
        return;
      }

      Alert.alert('Success', 'Password updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('loginscreen'),
        },
      ]);
    } catch (error) {
      console.error('Error in handleUpdatePassword:', error);
      Alert.alert('Error', 'Failed to update password. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingHorizontal: 20 }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ position: 'absolute', top: 40, left: 20 }}
      >
        <Icon name="arrow-back" type="material" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 80, color: '#000' }}>
        Set a new password
      </Text>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 20 }}>
        Create a new password. Ensure it differs from previous ones for security
      </Text>
      <Text style={{ fontSize: 14, color: '#000', alignSelf: 'flex-start', marginLeft: 10, marginTop: 10 }}>
        Password
      </Text>
      <TextInput
        style={{
          width: '100%',
          height: 40,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 5,
          paddingHorizontal: 10,
          marginVertical: 10,
          fontSize: 16,
        }}
        placeholder="Enter your new password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Text style={{ fontSize: 14, color: '#000', alignSelf: 'flex-start', marginLeft: 10, marginTop: 10 }}>
        Confirm Password
      </Text>
      <TextInput
        style={{
          width: '100%',
          height: 40,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 5,
          paddingHorizontal: 10,
          marginVertical: 10,
          fontSize: 16,
        }}
        placeholder="Re-enter password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button
        title="Update Password"
        buttonStyle={{
          backgroundColor: '#007AFF',
          borderRadius: 10,
          paddingVertical: 12,
          width: 200,
          marginVertical: 20,
        }}
        onPress={handleUpdatePassword}
        disabled={isLoading}
        loading={isLoading}
      />
    </SafeAreaView>
  );
};

export default SetNewPasswordScreen;