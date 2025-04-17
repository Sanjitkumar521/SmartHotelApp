import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';

const DeleteMenu = () => {
  const [menuId, setMenuId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle form submission to delete the menu item
  const handleDeleteMenu = async () => {
    if (!menuId) {
      Alert.alert('Error', 'Please enter a Menu ID');
      return;
    }

    // Show confirmation alert
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete the menu item "${name}" (ID: ${menuId})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const response = await axios.delete(`http://192.168.18.50:8082/delete_menu/${menuId}`);
              if (response.status === 200) {
                Alert.alert('Success', 'Menu item deleted successfully');
                setMenuId('');
                resetForm();
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete menu item');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
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
            <Text style={styles.title}>Delete Menu</Text>

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

            {/* Display Menu Details (Read-Only) */}
            {name ? (
              <View style={styles.detailsContainer}>
                <Text style={styles.label}>Menu Name</Text>
                <Text style={styles.detailText}>{name}</Text>

                <Text style={styles.label}>Description</Text>
                <Text style={styles.detailText}>{description || 'N/A'}</Text>

                <Text style={styles.label}>Price in $</Text>
                <Text style={styles.detailText}>{price || 'N/A'}</Text>

                <Text style={styles.label}>Category</Text>
                <Text style={styles.detailText}>{category || 'N/A'}</Text>

                <Text style={styles.label}>Image URL</Text>
                <Text style={styles.detailText}>{imageUrl || 'N/A'}</Text>
              </View>
            ) : (
              <Text style={styles.noDataText}>Enter a Menu ID and press Fetch to see details.</Text>
            )}

            {/* Delete Menu Button */}
            <TouchableOpacity
              style={[styles.deleteButton, isDeleting && styles.disabledButton]}
              onPress={handleDeleteMenu}
              disabled={isDeleting}
            >
              <Text style={styles.buttonText}>
                {isDeleting ? 'Deleting...' : 'Delete Menu'}
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
    backgroundColor: '#F5E050', 
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
  deleteButton: {
    backgroundColor: '#FF5733', 
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#FF9999', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailText: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default DeleteMenu;