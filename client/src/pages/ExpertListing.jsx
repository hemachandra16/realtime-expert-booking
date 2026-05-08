import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ExpertCard from '../components/ExpertCard';
import LoadingSpinner from '../components/LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const categories = ['All', 'Technology', 'Finance', 'Health', 'Legal', 'Business', 'Marketing'];

export default function ExpertListing() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [searchTimer, setSearchTimer] = useState(null);

  const fetchExperts = useCallback(async (p, cat, q) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 8 };
      if (cat && cat !== 'All') params.category = cat;
      if (q) params.search = q;
      const { data } = await axios.get(`${API}/api/experts`, { params });
      setExperts(data.experts);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch experts:', err);
      setError('Failed to load experts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperts(page, category, search);
  }, [page, category, fetchExperts]);

  const handleSearch = (value) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => {
      setPage(1);
      fetchExperts(1, category, value);
    }, 300);
    setSearchTimer(timer);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const scrollToGrid = () => {
    document.getElementById('expert-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderSkeleton = () => (
    <div className="expert-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-circle"></div>
          <div className="skeleton-line w60"></div>
          <div className="skeleton-line w40"></div>
          <div className="skeleton-line w80"></div>
          <div className="skeleton-line w100"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <h1>Book a Session with an Expert</h1>
        <p>Connect with top professionals across Technology, Finance, Health, Legal & more</p>
        <button className="hero-cta" onClick={scrollToGrid}>Explore Experts</button>
      </section>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-bar-inner">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search experts by name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expert Grid */}
      <div id="expert-grid">
        {error ? (
          <div className="empty-state">
            <div className="icon">⚠️</div>
            <h3>Something Went Wrong</h3>
            <p>{error}</p>
            <button className="book-now-btn" style={{ marginTop: '16px', maxWidth: '200px', margin: '16px auto 0' }} onClick={() => fetchExperts(page, category, search)}>
              Retry
            </button>
          </div>
        ) : loading ? renderSkeleton() : (
          <>
            {experts.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔎</div>
                <h3>No Experts Found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="expert-grid">
                {experts.map((expert, i) => (
                  <ExpertCard key={expert._id} expert={expert} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
            ← Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
