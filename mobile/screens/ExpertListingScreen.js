import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Image, ActivityIndicator, StyleSheet
} from 'react-native';
import axios from 'axios';
import { API_URL, COLORS } from '../constants';

const categories = ['All', 'Vedic Astrology', 'Tarot Reading', 'Numerology', 'Palmistry', 'Vastu Shastra', 'KP Astrology'];

export default function ExpertListingScreen({ navigation }) {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const isFirstRender = useRef(true);

  const fetchExperts = useCallback(async (p, cat, q) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 8 };
      if (cat && cat !== 'All') params.category = cat;
      if (q) params.search = q;
      const { data } = await axios.get(`${API_URL}/api/experts`, { params });
      setExperts(data.experts);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load experts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Single fetch effect for page/category changes
  useEffect(() => {
    fetchExperts(page, category, search);
  }, [page, category]);

  // Debounced search — skip the initial mount to avoid double-fetch
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setPage(1);
      fetchExperts(1, category, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const renderExpertCard = ({ item, index }) => {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=5b0fa8&color=fff&size=80`;
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate('ExpertDetail', { expertId: item._id })}
        activeOpacity={0.85}
      >
        <Image source={{ uri: avatarUrl }} style={s.avatar} />
        <Text style={s.name}>{item.name}</Text>
        <View style={s.tagRow}>
          <View style={s.tag}><Text style={s.tagText}>{item.category}</Text></View>
        </View>
        <Text style={s.rating}>★ {item.rating} ({item.totalSessions})</Text>
        <Text style={s.meta}>{item.experience} Yrs Experience</Text>
        <Text style={s.price}>₹{item.pricePerSession} / session</Text>
        <TouchableOpacity
          style={s.bookBtn}
          onPress={() => navigation.navigate('ExpertDetail', { expertId: item._id })}
        >
          <Text style={s.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      {/* Nav to My Bookings */}
      <TouchableOpacity style={s.navLink} onPress={() => navigation.navigate('MyBookings')}>
        <Text style={s.navLinkText}>📋 My Bookings</Text>
      </TouchableOpacity>

      {/* Search */}
      <TextInput
        style={s.searchInput}
        placeholder="Search experts by name..."
        placeholderTextColor={COLORS.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      {/* Category Pills — using View+flexWrap instead of ScrollView for stable RN Web rendering */}
      <View style={s.pillRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[s.pill, category === cat && s.pillActive]}
            onPress={() => { setCategory(cat); setPage(1); }}
          >
            <Text style={[s.pillText, category === cat && s.pillTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>⚠️</Text>
          <Text style={s.emptyTitle}>{error}</Text>
          <TouchableOpacity style={s.bookBtn} onPress={() => fetchExperts(page, category, search)}>
            <Text style={s.bookBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : experts.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>🔎</Text>
          <Text style={s.emptyTitle}>No Experts Found</Text>
        </View>
      ) : (
        <FlatList
          data={experts}
          renderItem={renderExpertCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingBottom: 80, gap: 12 }}
        />
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <View style={s.pagination}>
          <TouchableOpacity
            style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
          >
            <Text style={s.pageBtnText}>← Prev</Text>
          </TouchableOpacity>
          <Text style={s.pageInfo}>{page} / {totalPages}</Text>
          <TouchableOpacity
            style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
          >
            <Text style={s.pageBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  navLink: { alignSelf: 'flex-end', marginBottom: 8 },
  navLinkText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  searchInput: {
    backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.cardBorder,
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, marginBottom: 12,
  },
  pillRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, minHeight: 36,
    borderWidth: 2, borderColor: COLORS.cardBorder, backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center',
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, lineHeight: 18 },
  pillTextActive: { color: COLORS.white },
  card: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 10 },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 6, textAlign: 'center' },
  tagRow: { flexDirection: 'row', marginBottom: 6 },
  tag: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  tagText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  rating: { fontSize: 12, color: '#fbbf24', fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 10 },
  bookBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 20, width: '100%', alignItems: 'center',
  },
  bookBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  pagination: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 16, paddingVertical: 16,
  },
  pageBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 2, borderColor: COLORS.cardBorder, backgroundColor: COLORS.white,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  pageInfo: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
});

