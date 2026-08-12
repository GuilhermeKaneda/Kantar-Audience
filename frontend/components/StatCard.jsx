export default function StatCard({ label, value, sublabel }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-sublabel">{sublabel}</div>
    </div>
  );
}
