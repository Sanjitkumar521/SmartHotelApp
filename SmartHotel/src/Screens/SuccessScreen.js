import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';

const SuccessScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingHorizontal: 20 }}>
      <View style={{ marginTop: 80, backgroundColor: '#E6F0FA', borderRadius: 50, width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="check" type="material" size={40} color="#4A90E2" />
      </View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#000' }}>
        Successful
      </Text>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 20 }}>
        Congratulations! Your password has been changed. Click continue to login
      </Text>
      <Button
        title="Continue"
        buttonStyle={{
          backgroundColor: '#007AFF',
          borderRadius: 10,
          paddingVertical: 12,
          width: 200,
          marginVertical: 20,
        }}
        onPress={() => navigation.navigate('loginscreen')}
      />
    </SafeAreaView>
  );
};

export default SuccessScreen;