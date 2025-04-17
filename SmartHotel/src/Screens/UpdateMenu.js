import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';

const UpdateMenu = () => {
  const [menuId, setMenuId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch menu item details
  const fetchMenuItem = async () => {
    if (!menuId) {
      Alert.alert('Error', 'Please enter a Menu ID');
      return;
    }

    try {
      setIsFetching(true);
      const response = await axios.get(`http://192.168.18.50:8082/get_menu/${menuId}`);
      if (response.status === 200) {
        const { name, description, price, category, image_url } = response.data;
        setName(name || '');
        setDescription(description || '');
        setPrice(price ? price.toString() : '');
        setCategory(category || '');
        setImageUrl(image_url || '');
      } else {
        Alert.alert('Error', 'Menu item not found');
        resetForm();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch menu item');
      resetForm();
    } finally {
      setIsFetching(false);
    }
  };

  // Reset form fields (except menuId)
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImageUrl('');
  };

  // Handle form submission to update the menu item
  const handleUpdateMenu = async () => {
    if (!menuId || !name || !price) {
      Alert.alert('Error', 'Menu ID, Name, and Price are required');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Error', 'Price must be a valid number >= 0');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.put(`http://192.168.18.50:8082/update_menu/${menuId}`, {
        name,
        description,
        price: priceValue,
        category,
        image_url: imageUrl,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Menu updated successfully');
        setMenuId('');
        resetForm();
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update menu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Update Menu</Text>

            {/* Menu ID */}
            <Text style={styles.label}>Menu Id</Text>
            <View style={styles.menuIdContainer}>
              <TextInput
                style={[styles.input, styles.menuIdInput]}
                placeholder="Enter Menu Id"
                value={menuId}
                onChangeText={setMenuId}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.fetchButton, isFetching && styles.disabledButton]}
                onPress={fetchMenuItem}
                disabled={isFetching}
              >
                <Text style={styles.buttonText}>
                  {isFetching ? 'Fetching...' : 'Fetch'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Menu Name */}
            <Text style={styles.label}>Menu Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter menu name"
              value={name}
              onChangeText={setName}
            />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Price */}
            <Text style={styles.label}>Price in $</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category"
              value={category}
              onChangeText={setCategory}
            />

            {/* Image URL */}
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter image URL"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            {/* Update Menu Button */}
            <TouchableOpacity
              style={[styles.updateButton, isLoading && styles.disabledButton]}
              onPress={handleUpdateMenu}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Updating...' : 'Update Menu'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E050', // Yellow background
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  menuIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIdInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  fetchButton: {
    backgroundColor: '#87CEEB', // Blue button for Fetch
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#FF5733', // Red button
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#FF9999', // Lighter red when disabled
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateMenu;