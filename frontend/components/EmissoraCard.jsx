function formatK(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
}

export default function EmissoraCard({ nome, cor, audiencia, share }) {
  return (
    <div className="emissora-card">
      <div className="emissora-card-title">
        <span className="dot" style={{ backgroundColor: cor }} />
        {nome}
      </div>

      <div className="emissora-card-metric">
        <span className="metric-label">AUDIÊNCIA</span>
        <span className="metric-value" style={{ color: cor }}>
          {formatK(audiencia)}
        </span>
      </div>

      <div className="emissora-card-metric">
        <span className="metric-label">SHARE</span>
        <span className="metric-value" style={{ color: cor }}>
          {share.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
