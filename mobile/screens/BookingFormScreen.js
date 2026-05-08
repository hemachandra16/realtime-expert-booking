import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, StyleSheet, Image
} from 'react-native';
import axios from 'axios';
import { API_URL, COLORS } from '../constants';

export default function BookingFormScreen({ route, navigation }) {
  const { expertId, slotId, date, timeSlot, expertName, expertCategory, expertPrice } = route.params;
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(expertName)}&background=5b0fa8&color=fff&size=56`;

  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [conflict, setConflict] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Phone must be exactly 10 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setConflict(false);
    try {
      await axios.post(`${API_URL}/api/bookings`, {
        expertId, slotId, date, timeSlot,
        name: form.name, email: form.email, phone: form.phone, notes: form.notes,
      });
      setSuccess(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflict(true);
      } else if (err.response?.data?.errors) {
        const fieldErrs = {};
        err.response.data.errors.forEach((e) => { fieldErrs[e.path] = e.msg; });
        setErrors(fieldErrs);
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={s.centerContainer}>
        <View style={s.successCard}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
          <Text style={s.successTitle}>Booking Confirmed!</Text>
          <Text style={s.successText}>{expertName}</Text>
          <Text style={s.successText}>📅 {date}  🕐 {timeSlot}</Text>
          <Text style={s.successText}>Booked by: {form.name}</Text>
          <TouchableOpacity style={s.viewBtn} onPress={() => navigation.navigate('MyBookings')}>
            <Text style={s.viewBtnText}>View My Bookings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (conflict) {
    return (
      <View style={s.centerContainer}>
        <View style={s.errorCard}>
          <Text style={{ fontSize: 32 }}>⚠️</Text>
          <Text style={s.errorTitle}>Slot Unavailable</Text>
          <Text style={s.errorText}>This slot was just booked by someone else.</Text>
          <TouchableOpacity style={s.viewBtn} onPress={() => navigation.goBack()}>
            <Text style={s.viewBtnText}>← Choose Another Slot</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      {/* Expert Summary */}
      <View style={s.summary}>
        <Image source={{ uri: avatarUrl }} style={s.summaryAvatar} />
        <View>
          <Text style={s.summaryName}>{expertName}</Text>
          <Text style={s.summaryMeta}>{expertCategory} · ₹{expertPrice} / session</Text>
          <Text style={s.summaryMeta}>📅 {date}  🕐 {timeSlot}</Text>
        </View>
      </View>

      {/* Form */}
      <View style={s.formCard}>
        <Text style={s.formTitle}>Confirm Your Booking</Text>

        <Text style={s.label}>Full Name <Text style={s.req}>*</Text></Text>
        <TextInput
          style={[s.input, errors.name && s.inputError]}
          value={form.name}
          onChangeText={(v) => { setForm({ ...form, name: v }); setErrors({ ...errors, name: '' }); }}
          placeholder="Enter your full name"
        />
        {errors.name && <Text style={s.fieldError}>{errors.name}</Text>}

        <Text style={s.label}>Email <Text style={s.req}>*</Text></Text>
        <TextInput
          style={[s.input, errors.email && s.inputError]}
          value={form.email}
          onChangeText={(v) => { setForm({ ...form, email: v }); setErrors({ ...errors, email: '' }); }}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={s.fieldError}>{errors.email}</Text>}

        <Text style={s.label}>Phone <Text style={s.req}>*</Text></Text>
        <TextInput
          style={[s.input, errors.phone && s.inputError]}
          value={form.phone}
          onChangeText={(v) => { setForm({ ...form, phone: v }); setErrors({ ...errors, phone: '' }); }}
          placeholder="10-digit phone number"
          keyboardType="phone-pad"
          maxLength={10}
        />
        {errors.phone && <Text style={s.fieldError}>{errors.phone}</Text>}

        <Text style={s.label}>Date</Text>
        <TextInput style={[s.input, s.inputReadonly]} value={date} editable={false} />

        <Text style={s.label}>Time Slot</Text>
        <TextInput style={[s.input, s.inputReadonly]} value={timeSlot} editable={false} />

        <Text style={s.label}>Notes (optional)</Text>
        <TextInput
          style={[s.input, { height: 80, textAlignVertical: 'top' }]}
          value={form.notes}
          onChangeText={(v) => setForm({ ...form, notes: v })}
          placeholder="Any specific topics or questions..."
          multiline
        />

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={s.submitBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  centerContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', padding: 24 },
  summary: {
    flexDirection: 'row', gap: 14, alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16,
  },
  summaryAvatar: { width: 56, height: 56, borderRadius: 28 },
  summaryName: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  summaryMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  formCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  formTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6, marginTop: 12 },
  req: { color: COLORS.error },
  input: {
    borderWidth: 2, borderColor: COLORS.cardBorder, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, backgroundColor: COLORS.white,
  },
  inputError: { borderColor: COLORS.error },
  inputReadonly: { backgroundColor: COLORS.bg, color: COLORS.textSecondary },
  fieldError: { color: COLORS.error, fontSize: 12, marginTop: 4 },
  submitBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 24,
    alignItems: 'center', marginTop: 24,
  },
  submitBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  successCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: COLORS.success, marginBottom: 12 },
  successText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
  errorCard: {
    backgroundColor: '#fef2f2', borderRadius: 16, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorTitle: { fontSize: 18, fontWeight: '700', color: COLORS.error, marginTop: 8 },
  errorText: { fontSize: 14, color: COLORS.error, textAlign: 'center', marginTop: 8 },
  viewBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 28,
    borderRadius: 20, marginTop: 20,
  },
  viewBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
});
