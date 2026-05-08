import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from './constants';

import ExpertListingScreen from './screens/ExpertListingScreen';
import ExpertDetailScreen from './screens/ExpertDetailScreen';
import BookingFormScreen from './screens/BookingFormScreen';
import MyBookingsScreen from './screens/MyBookingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="ExpertListing"
          component={ExpertListingScreen}
          options={{ title: 'Vedaz Expert' }}
        />
        <Stack.Screen
          name="ExpertDetail"
          component={ExpertDetailScreen}
          options={{ title: 'Expert Details' }}
        />
        <Stack.Screen
          name="BookingForm"
          component={BookingFormScreen}
          options={{ title: 'Confirm Booking' }}
        />
        <Stack.Screen
          name="MyBookings"
          component={MyBookingsScreen}
          options={{ title: 'My Bookings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
