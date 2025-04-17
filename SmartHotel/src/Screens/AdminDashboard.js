import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

const AdminDashboard = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalMenuItems: 0,
    orderGrowth: 0,
    salesGrowth: 0,
    customerGrowth: 0,
    menuGrowth: 0,
  });
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [pieChartData, setPieChartData] = useState([]);
  const [userName, setUserName] = useState('Admin'); // Default fallback

  // Fetch user name from AsyncStorage
  const fetchUserName = async () => {
    try {
      const userName = await AsyncStorage.getItem('name');
      if (userName) {
        setUserName(userName); // Use the stored name directly
      } else {
        setUserName('Admin'); // Fallback if no name is found
      }
    } catch (err) {
      console.error('Error fetching user name:', err);
      setUserName('Admin'); // Fallback on error
    }
  };

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://192.168.18.50:8082/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch category quantity statistics for the BarChart
  const fetchSalesStats = async () => {
    try {
      const response = await axios.get('http://192.168.18.50:8082/sales-stats');
      const { labels, quantities } = response.data;
      if (!labels || !quantities) {
        console.warn('Invalid sales stats data');
        return;
      }
      setBarChartData({
        labels,
        datasets: [{ data: quantities.map((value) => parseInt(value) || 0) }],
      });
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      setBarChartData({ labels: [], datasets: [{ data: [] }] });
    }
  };

  // Fetch category revenue for the PieChart
  const fetchCategoryRevenue = async () => {
    try {
      const response = await axios.get('http://192.168.18.50:8082/category-revenue');
      const { categories, revenues } = response.data;
      const colors = ['#ff6347', '#4e92e4', '#32CD32', '#ffa500', '#6a5acd'];
      const pieData = categories
        .map((category, index) => ({
          name: `${category} ($${revenues[index].toFixed(2)})`,
          population: parseFloat(revenues[index]) || 0,
          color: colors[index % colors.length],
          legendFontColor: '#7F7F7F',
          legendFontSize: 9,
        }))
        .filter((item) => item.population > 0);
      setPieChartData(pieData);
    } catch (error) {
      console.error('Error fetching category revenue:', error);
      setPieChartData([]);
    }
  };

  useEffect(() => {
    fetchUserName(); // Fetch name on mount
    fetchStats();
    fetchSalesStats();
    fetchCategoryRevenue();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={28} color="#000" />
          </TouchableOpacity>
          <View>
            <Text style={styles.greetingText}>Hello,</Text>
            <Text style={styles.username}>{userName}</Text>
            <Text style={styles.subText}></Text>
          </View>
          <Image
            source={{ uri: 'https://via.placeholder.com/50' }}
            style={styles.profileImage}
          />
        </View>

        {/* Overview Section */}
        <Text style={styles.sectionTitle}>OVERVIEW</Text>
        <View style={styles.overviewContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text
              style={[
                styles.statGrowth,
                { color: stats.orderGrowth >= 0 ? '#28a745' : '#dc3545' },
              ]}
            >
              {stats.orderGrowth >= 0 ? '+' : ''}
              {stats.orderGrowth}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Sales</Text>
            <Text style={styles.statValue}>{stats.totalSales.toLocaleString()}</Text>
            <Text
              style={[
                styles.statGrowth,
                { color: stats.salesGrowth >= 0 ? '#28a745' : '#dc3545' },
              ]}
            >
              {stats.salesGrowth >= 0 ? '+' : ''}
              {stats.salesGrowth}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Customers</Text>
            <Text style={styles.statValue}>{stats.totalCustomers}</Text>
            <Text
              style={[
                styles.statGrowth,
                { color: stats.customerGrowth >= 0 ? '#28a745' : '#dc3545' },
              ]}
            >
              {stats.customerGrowth >= 0 ? '+' : ''}
              {stats.customerGrowth}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Menu Items</Text>
            <Text style={styles.statValue}>{stats.totalMenuItems}</Text>
            <Text
              style={[
                styles.statGrowth,
                { color: stats.menuGrowth >= 0 ? '#28a745' : '#dc3545' },
              ]}
            >
              {stats.menuGrowth >= 0 ? '+' : ''}
              {stats.menuGrowth}
            </Text>
          </View>
        </View>

        {/* Bar Chart Section - Showing quantities sold */}
        <Text style={styles.sectionTitle}>Items Sold by Category</Text>
        <View style={styles.chartContainer}>
          {barChartData.labels.length > 0 && barChartData.datasets[0].data.length > 0 ? (
            <BarChart
              data={barChartData}
              width={width - 40}
              height={300}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  fontSize: 12,
                  rotation: 30,
                  translateY: 20,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#28a745',
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              yAxisLabel=""
              yAxisSuffix=" items"
              fromZero={true}
              showValuesOnTopOfBars={true}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="info" size={40} color="#666" />
              <Text style={styles.noDataText}>No Items Sold Data Available</Text>
            </View>
          )}
        </View>

        {/* Pie Chart Section - Showing revenue per category in dollars */}
        <Text style={styles.sectionTitle}>Revenue by Category</Text>
        <View style={styles.chartContainer}>
          {pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="info" size={40} color="#666" />
              <Text style={styles.noDataText}>No Revenue Data Available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollViewContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  greetingText: {
    fontSize: 24,
    color: '#666',
    right:40,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 18,
    color: '#666',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statGrowth: {
    fontSize: 14,
  },
  chartContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    marginBottom: 20,
    minHeight: 320,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 220,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default AdminDashboard;