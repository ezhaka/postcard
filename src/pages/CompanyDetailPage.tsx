import { useParams, Link } from 'react-router-dom';
import { getCompanyById, getCompanyReleaseHistory, releases } from '../data/mockData';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const company = id ? getCompanyById(id) : undefined;
  const releaseHistory = id ? getCompanyReleaseHistory(id) : [];

  if (!company) {
    return (
      <div className="company-detail-page">
        <header className="page-header">
          <Link to="/" className="back-link">← Back to Directory</Link>
          <h1>Company Not Found</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="company-detail-page">
      <header className="page-header">
        <Link to="/" className="back-link">← Back to Directory</Link>
        <h1>{company.name}</h1>
      </header>

      <div className="company-details">
        <div className="detail-row">
          <label>Category:</label>
          <span>{company.category}</span>
        </div>
        <div className="detail-row">
          <label>Website:</label>
          <a href={company.website} target="_blank" rel="noopener noreferrer">
            {company.website}
          </a>
        </div>
      </div>

      <div className="release-history">
        <h2>Release History</h2>
        <p className="history-subtitle">
          This company appears in {releaseHistory.length} {releaseHistory.length === 1 ? 'release' : 'releases'}
        </p>

        <div className="timeline">
          {releases.map(release => {
            const isPresent = releaseHistory.some(r => r.id === release.id);
            return (
              <div key={release.id} className={`timeline-item ${isPresent ? 'present' : 'absent'}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-date">{release.displayName}</div>
                  <div className="timeline-status">
                    {isPresent ? '✓ Present' : '✗ Not present'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}