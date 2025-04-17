import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, StyleSheet, View, Text, Image, ScrollView, TextInput, TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constant/colors';
import { SecondaryButton } from '../../Components/Button';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.18.50:8082';

const DetailsScreen = ({ navigation, route }) => {
  const item = route.params?.item || route.params || {};
  console.log("Item extracted:", JSON.stringify(item, null, 2));

  const [reviews, setReviews] = useState([]);
  const [sentiments, setSentiments] = useState({});
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState(null);

  // Fetch user name from AsyncStorage
  const fetchUserName = async () => {
    try {
      const storedName = await AsyncStorage.getItem('name');
      setUserName(storedName || "Anonymous");
    } catch (err) {
      console.error("Error fetching user name:", err);
      setUserName("Anonymous");
    }
  };

  const fetchReviews = async () => {
    if (!userName || userName === "Anonymous") {
      setError("Please log in to view reviews");
      setLoading(false);
      return;
    }
    if (!item.id || typeof item.id !== 'number') {
      setError("Error: Invalid or missing item ID");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/reviews/${item.id}`);
      const fetchedReviews = response.data;
      console.log("Fetched reviews:", JSON.stringify(fetchedReviews, null, 2));

      // Create sentiments object, ensuring sentiment is lowercase
      const sentimentsObj = fetchedReviews.reduce((acc, review) => {
        const sentiment = review.sentiment
          ? String(review.sentiment).toLowerCase()
          : 'unknown';
        return {
          ...acc,
          [review.review_id]: sentiment
        };
      }, {});

      console.log("Sentiments object:", JSON.stringify(sentimentsObj, null, 2));

      setReviews(fetchedReviews);
      setSentiments(sentimentsObj);
      setError(null);
    } catch (err) {
      setError("Error fetching reviews: " + err.message);
      console.error("Fetch reviews error:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!userName || userName === "Anonymous") {
      alert("Please log in to submit a review");
      navigation.navigate('LoginScreen');
      return;
    }
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    if (!feedback.trim()) {
      alert("Please enter your feedback.");
      return;
    }

    const payload = {
      food_id: item.id,
      rating,
      feedback,
      customer_name: userName,
    };

    try {
      const response = await axios.post(`${BASE_URL}/reviews`, payload);
      console.log("Submit review response:", JSON.stringify(response.data, null, 2));
      const newReview = response.data.review;

      // Update reviews and sentiments immediately
      setReviews((prev) => [newReview, ...prev]);
      setSentiments((prev) => ({
        ...prev,
        [newReview.review_id]: newReview.sentiment
          ? String(newReview.sentiment).toLowerCase()
          : 'unknown'
      }));

      console.log("Updated sentiments after submit:", JSON.stringify(sentiments, null, 2));

      alert("Review submitted successfully!");
      setRating(0);
      setFeedback('');
      // Fetch reviews again to ensure consistency (optional)
      fetchReviews();
    } catch (err) {
      alert("Error submitting review: " + (err.response?.data?.error || err.message));
      console.error("Submit review error:", err);
    }
  };

  useEffect(() => {
    fetchUserName();
  }, []);

  useEffect(() => {
    if (userName !== null) {
      fetchReviews();
    }
  }, [userName]);

  const handleAddToCart = () => {
    alert("Item added to cart: " + item.name);
    navigation.goBack();
  };

  const renderStars = (ratingValue, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={interactive ? () => setRating(i) : null}
          disabled={!interactive}
        >
          <Icon
            name={i <= ratingValue ? "star" : "star-border"}
            size={20}
            color={i <= ratingValue ? COLORS.primary : COLORS.grey}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (!item.id || !item.name) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: Invalid or missing item details</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.primary, marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: COLORS.white, flex: 1 }}>
      <View style={style.header}>
        <Icon name="arrow-back-ios" size={28} onPress={navigation.goBack} />
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Details</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ justifyContent: 'center', alignItems: 'center', height: 280 }}>
          <Image source={{ uri: item.image_url }} style={{ height: 220, width: 220 }} />
        </View>
        <View style={style.details}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 25, fontWeight: 'bold', color: COLORS.white }}>
              {item.name}
            </Text>
            <View style={style.iconContainer}>
              <Icon name="favorite-border" color={COLORS.primary} size={25} />
            </View>
          </View>
          <Text style={style.detailsText}>{item.description}</Text>
          <Text style={{ marginTop: 20, fontSize: 18, color: COLORS.white }}>
            Price: ${parseFloat(item.price || 0).toFixed(2)}
          </Text>
          <View style={{ marginTop: 40, marginBottom: 40 }}>
            <SecondaryButton title="Add To Cart" onPress={handleAddToCart} />
          </View>
        </View>

        <View style={style.reviewsSection}>
          <Text style={style.reviewsTitle}>User Reviews</Text>
          {error && <Text style={style.errorText}>{error}</Text>}

          {userName === "Anonymous" ? (
            <TouchableOpacity
              style={style.loginPrompt}
              onPress={() => navigation.navigate('LoginScreen')}
            >
              <Text style={style.loginPromptText}>
                Log in to view and submit reviews
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={style.reviewForm}>
                <Text style={style.formLabel}>Rate this item:</Text>
                <View style={style.starContainer}>
                  {renderStars(rating, true)}
                </View>
                <Text style={style.formLabel}>Your Feedback:</Text>
                <TextInput
                  style={style.feedbackInput}
                  placeholder="Write your review here..."
                  placeholderTextColor={COLORS.grey}
                  value={feedback}
                  onChangeText={setFeedback}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity style={style.submitButton} onPress={submitReview}>
                  <Text style={style.submitButtonText}>Submit Review</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : reviews.length === 0 ? (
                <Text style={style.noReviewsText}>No reviews yet. Be the first to review!</Text>
              ) : (
                <FlatList
                  data={reviews}
                  keyExtractor={(review) => review.review_id.toString()}
                  renderItem={({ item: review }) => {
                    const sentiment = sentiments[review.review_id] || 'unknown';
                    return (
                      <View style={style.reviewCard}>
                        <View style={style.reviewHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={style.reviewUser}>
                              {review.customer_name || "Anonymous"}
                            </Text>
                            <View style={style.starContainer}>
                              {renderStars(review.rating)}
                            </View>
                          </View>
                          <Text
                            style={[
                              style.sentimentText,
                              {
                                color:
                                  sentiment === 'positive'
                                    ? COLORS.green
                                    : sentiment === 'negative'
                                    ? COLORS.red
                                    : COLORS.grey,
                              },
                            ]}
                          >
                            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                          </Text>
                        </View>
                        <Text style={style.reviewFeedback}>{review.feedback}</Text>
                        <Text style={style.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    );
                  }}
                  scrollEnabled={false}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  header: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  details: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
  },
  iconContainer: {
    backgroundColor: COLORS.white,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  detailsText: {
    marginTop: 10,
    lineHeight: 22,
    fontSize: 16,
    color: COLORS.white,
  },
  reviewsSection: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginPrompt: {
    backgroundColor: COLORS.light,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginPromptText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  reviewForm: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.light,
    borderRadius: 10,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: COLORS.black,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewCard: {
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  sentimentText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  reviewFeedback: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.grey,
  },
  noReviewsText: {
    fontSize: 16,
    color: COLORS.grey,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default DetailsScreen;