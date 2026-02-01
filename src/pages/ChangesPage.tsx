import { useState } from 'react';
import { releases, getAddedCompanies, getRemovedCompanies } from '../data/mockData';
import type { Release, Company } from '../types';
import { Link } from 'react-router-dom';
import Disclaimer from '../components/Disclaimer';

export default function ChangesPage() {
  const [selectedRelease, setSelectedRelease] = useState<Release>(releases[releases.length - 1]);
  
  const currentIndex = releases.findIndex(r => r.id === selectedRelease.id);
  const previousRelease = currentIndex > 0 ? releases[currentIndex - 1] : null;
  
  const addedCompanies = previousRelease 
    ? getAddedCompanies(selectedRelease.id, previousRelease.id)
    : [];
  
  const removedCompanies = previousRelease
    ? getRemovedCompanies(selectedRelease.id, previousRelease.id)
    : [];

  return (
    <div className="changes-page">
      <header className="page-header">
        <Link to="/" className="back-link">← Back to Directory</Link>
        <h1>Release Changes</h1>
      </header>

      <div className="release-selector">
        <label htmlFor="release">Select Release:</label>
        <select
          id="release"
          value={selectedRelease.id}
          onChange={(e) => {
            const release = releases.find(r => r.id === e.target.value);
            if (release) setSelectedRelease(release);
          }}
        >
          {releases.map(release => (
            <option key={release.id} value={release.id}>
              {release.displayName}
            </option>
          ))}
        </select>
      </div>

      {previousRelease ? (
        <div className="changes-content">
          <p className="comparison-text">
            Comparing <strong>{selectedRelease.displayName}</strong> with previous release <strong>{previousRelease.displayName}</strong>
          </p>

          <div className="changes-section">
            <h2 className="added-heading">Added Companies ({addedCompanies.length})</h2>
            {addedCompanies.length > 0 ? (
              <div className="companies-list">
                {addedCompanies.map(company => (
                  <Link to={`/company/${company.id}`} key={company.id} className="company-card added">
                    <div className="card-header">
                      <h3>{company.name}</h3>
                      <div className="badges">
                        {company.source === 'official' ? (
                          <span className="badge badge-official">Official</span>
                        ) : (
                          <>
                            <span className="badge badge-community">Community</span>
                            {company.verified ? (
                              <span className="badge badge-verified">Verified</span>
                            ) : (
                              <span className="badge badge-unverified">Unverified</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <p className="category">{company.category}</p>
                    <a 
                      href={company.website}
                      className="website"
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {company.website}
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="no-changes">No companies added</p>
            )}
          </div>

          <div className="changes-section">
            <h2 className="removed-heading">Removed Companies ({removedCompanies.length})</h2>
            {removedCompanies.length > 0 ? (
              <div className="companies-list">
                {removedCompanies.map(company => (
                  <Link to={`/company/${company.id}`} key={company.id} className="company-card removed">
                    <div className="card-header">
                      <h3>{company.name}</h3>
                      <div className="badges">
                        {company.source === 'official' ? (
                          <span className="badge badge-official">Official</span>
                        ) : (
                          <>
                            <span className="badge badge-community">Community</span>
                            {company.verified ? (
                              <span className="badge badge-verified">Verified</span>
                            ) : (
                              <span className="badge badge-unverified">Unverified</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <p className="category">{company.category}</p>
                    <a 
                      href={company.website}
                      className="website"
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {company.website}
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="no-changes">No companies removed</p>
            )}
          </div>
        </div>
      ) : (
        <p className="no-previous">This is the first release. No previous data to compare.</p>
      )}

      <Disclaimer />
    </div>
  );
}