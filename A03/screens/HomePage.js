import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, Button, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();

  // Dummy data for the pie chart
  const pieData = [
    { name: 'Saving', population: 25, color: '#4CAF50', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Food', population: 15, color: '#FF9800', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Bill', population: 20, color: '#F44336', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Gas', population: 10, color: '#03A9F4', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Housing', population: 30, color: '#9C27B0', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ];

  // Dummy data for recent history
  const recentHistory = [
    { id: '1', title: 'Restaurant Bill', description: 'Detailed information of Restaurant bill.' },
    { id: '2', title: 'Electricity Bill', description: 'Detailed information of electricity bill.' },
  ];

  const renderRecentItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.historyIcon} />
      <View style={styles.historyText}>
        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historyDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Text>•••</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Pie chart and total estimate */}
      <View style={styles.pieChartContainer}>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={'15'}
          center={[10, 10]}
          absolute // Shows the percentage inside the pie chart
        />
        <Text style={styles.totalText}>Total Estimate: $70</Text>
      </View>

      {/* Recent history section */}
      <Text style={styles.historyHeader}>Recent History</Text>
      <FlatList
        data={recentHistory}
        renderItem={renderRecentItem}
        keyExtractor={(item) => item.id}
      />

      {/* Profile and Logout Buttons (side by side) */}
      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <Button
            title="Go to Profile"
            onPress={() => navigation.navigate('Profile')}
            color="#2596be"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Logout"
            onPress={() => navigation.navigate('Logout')}
            color="#2596be"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  searchButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
    padding: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  historyHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  historyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  historyText: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyDescription: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5, // Spacing between the buttons
  },
});

export default HomePage;
