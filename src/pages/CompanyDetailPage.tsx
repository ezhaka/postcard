import { useParams, Link } from 'react-router-dom';
import { getCompanyById, getCompanyReleaseHistory, releases } from '../data/mockData';
import Disclaimer from '../components/Disclaimer';

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
        <div className="badges-row">
          {company.source === 'official' ? (
            <span className="badge badge-official">Official</span>
          ) : (
            <>
              <span className="badge badge-community">Community Submission</span>
              {company.verified ? (
                <span className="badge badge-verified">Verified</span>
              ) : (
                <span className="badge badge-unverified">Unverified</span>
              )}
            </>
          )}
        </div>

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

      <div className="sources-section">
        <h2>Sources</h2>
        {company.source === 'official' ? (
          <div className="source-item">
            <p>
              <strong>Official source:</strong> Home Affairs list (as at 15 Jan 2025)
            </p>
          </div>
        ) : (
          <div className="source-item">
            <p>
              <strong>Community:</strong> Submitted {company.submittedAt ? new Date(company.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
              {company.verified && company.verifiedAt && (
                <> • Verified {new Date(company.verifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>
              )}
              {company.evidenceLink && (
                <> • <a href={company.evidenceLink} target="_blank" rel="noopener noreferrer">Evidence</a></>
              )}
            </p>
          </div>
        )}
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

      <Disclaimer />
    </div>
  );
}