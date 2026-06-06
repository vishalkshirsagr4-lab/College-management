const StatCard = ({ icon, label, value, detail, accent = 'blue' }) => (
  <article className={`stat-card stat-card-${accent}`}>
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-body">
      <p className="stat-card-label">{label}</p>
      <h3>{value}</h3>
      {detail && <p className="stat-card-detail">{detail}</p>}
    </div>
  </article>
);

export default StatCard;
