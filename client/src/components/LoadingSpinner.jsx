export default function LoadingSpinner({ small }) {
  if (small) return <div className={`spinner spinner-sm`}></div>;
  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
    </div>
  );
}
