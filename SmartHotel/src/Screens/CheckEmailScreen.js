import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import { Alert } from 'react-native';

const API_URLs = 'http://192.168.18.50:8082/password_reset_OTP';

const CheckEmailScreen = ({ navigation, route }) => {
  const CELL_COUNT = 5;
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { email } = route.params;

  const handelOTP = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('value', value);
    console.log(value);
    try {
      const response = await fetch(API_URLs, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'OTP not matched. Please try again.');
        return;
      }

      navigation.navigate('SetNewPasswordScreen');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
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
        Check your email
      </Text>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 20 }}>
        We sent a reset link to {email}{'\n'}enter 5 digit code that mentioned in the email
      </Text>
      <CodeField
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={{ marginVertical: 20 }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <Text
            key={index}
            style={{
              width: 40,
              height: 40,
              lineHeight: 38,
              fontSize: 24,
              borderWidth: 2,
              borderColor: isFocused ? '#000' : '#ccc',
              textAlign: 'center',
              marginHorizontal: 5,
              borderRadius: 5,
            }}
          >
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />
      <Button
        title="Verify Code"
        buttonStyle={{
          backgroundColor: '#007AFF',
          borderRadius: 10,
          paddingVertical: 12,
          width: 200,
          marginVertical: 20,
        }}
        onPress={handelOTP}
        loading={isLoading}
      />
      <Text style={{ fontSize: 14, color: '#666' }}>
        Haven't got the email yet?{' '}
        <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Resend email</Text>
      </Text>
    </SafeAreaView>
  );
};

export default CheckEmailScreen;