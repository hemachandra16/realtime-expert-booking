import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, StyleSheet
} from 'react-native';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL, COLORS } from '../constants';

export default function ExpertDetailScreen({ route, navigation }) {
  const { expertId } = route.params;
  const [expert, setExpert] = useState(null);
  const [slots, setSlots] = useState({});
  const [slotDetails, setSlotDetails] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_URL}/api/experts/${expertId}`);
        setExpert(data.expert);
        setSlots(data.slots);
        setSlotDetails(data.slotDetails);
        setBookedSlots(data.bookedSlots);
        const dateKeys = Object.keys(data.slots).sort();
        if (dateKeys.length > 0) setSelectedDate(dateKeys[0]);
      } catch (err) {
        setError('Failed to load expert details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [expertId]);

  // Socket.io real-time slot updates
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.emit('join-expert-room', expertId);

    socket.on('slot-booked', (data) => {
      setBookedSlots((prev) => [...prev, data.slotId]);
      setSlotDetails((prev) => {
        const updated = { ...prev };
        if (updated[data.date]) {
          updated[data.date] = updated[data.date].map((s) =>
            s._id === data.slotId ? { ...s, isBooked: true } : s
          );
        }
        return updated;
      });
      if (selectedSlot === data.slotId) {
        setSelectedSlot(null);
        setSelectedTime('');
      }
    });

    return () => {
      socket.emit('leave-expert-room', expertId);
      socket.disconnect();
    };
  }, [expertId]);

  const formatDateTab = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[d.getDay()]} ${d.getDate()}`;
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (error) return <View style={s.center}><Text style={s.errorText}>{error}</Text></View>;
  if (!expert) return <View style={s.center}><Text>Expert not found</Text></View>;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=5b0fa8&color=fff&size=120`;
  const dateKeys = Object.keys(slots).sort();
  const currentSlots = slotDetails[selectedDate] || [];

  return (
    <ScrollView style={s.container}>
      {/* Expert Header */}
      <View style={s.header}>
        <Image source={{ uri: avatarUrl }} style={s.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{expert.name}</Text>
          <View style={s.tagRow}>
            <View style={s.tag}><Text style={s.tagText}>{expert.category}</Text></View>
            {expert.languages?.map((l) => (
              <View key={l} style={[s.tag, { backgroundColor: COLORS.primaryLight }]}>
                <Text style={s.tagText}>{l}</Text>
              </View>
            ))}
          </View>
          <Text style={s.meta}>★ {expert.rating} · {expert.experience} Yrs · {expert.totalSessions} Sessions</Text>
          <Text style={s.price}>₹{expert.pricePerSession} / session</Text>
        </View>
      </View>

      {/* Bio */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>About</Text>
        <Text style={s.bio}>{expert.bio}</Text>
      </View>

      {/* Slot Picker */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>📅 Select a Date & Time Slot</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {dateKeys.map((date) => (
            <TouchableOpacity
              key={date}
              style={[s.dateTab, selectedDate === date && s.dateTabActive]}
              onPress={() => { setSelectedDate(date); setSelectedSlot(null); setSelectedTime(''); }}
            >
              <Text style={[s.dateTabText, selectedDate === date && s.dateTabTextActive]}>
                {formatDateTab(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.slotsGrid}>
          {currentSlots.length === 0 && (
            <Text style={s.noSlots}>No slots available for this date.</Text>
          )}
          {currentSlots.map((slot) => {
            const isBooked = slot.isBooked || bookedSlots.includes(slot._id);
            const isSelected = selectedSlot === slot._id;
            return (
              <TouchableOpacity
                key={slot._id}
                style={[
                  s.slotBtn,
                  isBooked && s.slotBooked,
                  isSelected && s.slotSelected,
                  !isBooked && !isSelected && s.slotAvailable,
                ]}
                disabled={isBooked}
                onPress={() => { setSelectedSlot(slot._id); setSelectedTime(slot.time); }}
              >
                <Text style={[
                  s.slotText,
                  isBooked && { color: COLORS.error },
                  isSelected && { color: COLORS.white },
                  !isBooked && !isSelected && { color: COLORS.success },
                ]}>
                  {slot.time}{isBooked ? ' ✕' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Book Button */}
      {selectedSlot && (
        <TouchableOpacity
          style={s.bookBtn}
          onPress={() => navigation.navigate('BookingForm', {
            expertId, slotId: selectedSlot, date: selectedDate, timeSlot: selectedTime,
            expertName: expert.name, expertCategory: expert.category, expertPrice: expert.pricePerSession,
          })}
        >
          <Text style={s.bookBtnText}>Book This Slot →</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  errorText: { color: COLORS.error, fontSize: 16, fontWeight: '600' },
  header: {
    flexDirection: 'row', gap: 16, backgroundColor: COLORS.white,
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  name: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  tag: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  tagText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  meta: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  section: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  bio: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  dateTab: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 2, borderColor: COLORS.cardBorder, backgroundColor: COLORS.white, marginRight: 8,
  },
  dateTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  dateTabTextActive: { color: COLORS.white },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  noSlots: { color: COLORS.textSecondary, fontSize: 14 },
  slotBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 2 },
  slotAvailable: { borderColor: '#d1fae5', backgroundColor: COLORS.white },
  slotBooked: { borderColor: '#fecaca', backgroundColor: '#fef2f2', opacity: 0.6 },
  slotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotText: { fontSize: 13, fontWeight: '500' },
  bookBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 24,
    alignItems: 'center', marginBottom: 16,
  },
  bookBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
