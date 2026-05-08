import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, StyleSheet
} from 'react-native';
import axios from 'axios';
import { API_URL, COLORS } from '../constants';

export default function MyBookingsScreen() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchBookings = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/bookings`, { params: { email } });
      setBookings(data);
      setSearched(true);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { bg: COLORS.pending, text: COLORS.pendingText };
      case 'Confirmed': return { bg: COLORS.confirmed, text: COLORS.confirmedText };
      case 'Completed': return { bg: COLORS.completed, text: COLORS.completedText };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const renderBooking = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={s.bookingCard}>
        <View style={{ flex: 1 }}>
          <Text style={s.expertName}>{item.expertId?.name || 'Expert'}</Text>
          <Text style={s.bookingMeta}>{item.expertId?.category} · 📅 {item.date} · 🕐 {item.timeSlot}</Text>
          <Text style={s.bookingDate}>Booked: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[s.statusText, { color: statusStyle.text }]}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>My Bookings</Text>

      <View style={s.searchRow}>
        <TextInput
          style={s.emailInput}
          placeholder="Enter your email..."
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onSubmitEditing={fetchBookings}
        />
        <TouchableOpacity style={s.searchBtn} onPress={fetchBookings}>
          <Text style={s.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />}

      {!loading && error && (
        <View style={s.emptyState}>
          <Text style={{ fontSize: 36 }}>⚠️</Text>
          <Text style={s.emptyTitle}>{error}</Text>
        </View>
      )}

      {!loading && !error && searched && bookings.length === 0 && (
        <View style={s.emptyState}>
          <Text style={{ fontSize: 36 }}>📭</Text>
          <Text style={s.emptyTitle}>No Bookings Found</Text>
          <Text style={s.emptySubtitle}>No bookings found for this email</Text>
        </View>
      )}

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  emailInput: {
    flex: 1, borderWidth: 2, borderColor: COLORS.cardBorder, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: COLORS.white, fontSize: 14,
  },
  searchBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 22, borderRadius: 12,
    justifyContent: 'center',
  },
  searchBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  bookingCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  expertName: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  bookingMeta: { fontSize: 12, color: COLORS.textSecondary },
  bookingDate: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginTop: 8 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});
