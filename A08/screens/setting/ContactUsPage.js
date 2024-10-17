// screens/ContactUsPage.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ContactUsPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Contact Us Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});

export default ContactUsPage;
