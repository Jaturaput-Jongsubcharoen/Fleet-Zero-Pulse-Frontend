import { useParams, useNavigate } from "react-router-dom";

export default function BusDetailPage() {
  const { busId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="header">
        <div>
          <div className="title">Bus {busId} – Full Details</div>
          <div className="subtitle">Fleet Zero Pulse</div>
        </div>
      </div>

      <div className="card">
        <p><strong>Bus ID:</strong> {busId}</p>
        <p><strong>Status:</strong> (fetch from backend later)</p>
        <p><strong>Battery Health:</strong> (details)</p>
        <p><strong>Maintenance History:</strong> (table)</p>

        <button
          className="btn secondary"
          onClick={() => navigate(-1)}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
