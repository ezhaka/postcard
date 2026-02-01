import { useState, useMemo } from 'react';
import { companies, categories, releases, getCompaniesByRelease, communityMetadata } from '../data/mockData';
import type { Company, Release } from '../types';
import { Link } from 'react-router-dom';
import Disclaimer from '../components/Disclaimer';

export default function DirectoryPage() {
  const [selectedRelease, setSelectedRelease] = useState<Release>(releases[releases.length - 1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [includeCommunity, setIncludeCommunity] = useState(false);

  const filteredCompanies = useMemo(() => {
    let result = getCompaniesByRelease(selectedRelease.id, includeCommunity);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(company => 
        company.name.toLowerCase().includes(query) ||
        company.website.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter(company => company.category === selectedCategory);
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedRelease, searchQuery, selectedCategory, includeCommunity]);

  return (
    <div className="directory-page">
      <header className="directory-header">
        <h1>Sponsor Directory</h1>
        <p className="subtitle">Searchable directory of sponsor companies</p>
        
        <div className="data-sources">
          <div className="source-info">
            <span className="source-label">Official data:</span>
            <span className="source-value">As at {selectedRelease.displayName}</span>
          </div>
          <div className="source-info">
            <span className="source-label">Community updates:</span>
            <span className="source-value">Last updated {new Date(communityMetadata.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="community-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={includeCommunity}
              onChange={(e) => setIncludeCommunity(e.target.checked)}
            />
            <span>Include community additions</span>
          </label>
          <p className="toggle-hint">
            {includeCommunity ? '✓ Showing official list + community submissions' : '✓ Show official list only (default)'}
          </p>
        </div>
      </header>

      <div className="controls-section">
        <div className="release-selector">
          <label htmlFor="release">Release Date:</label>
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

        <div className="search-box">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="action-links">
        <Link to="/changes" className="link-button">View Changes</Link>
        <Link to="/request" className="link-button">Request Addition/Correction</Link>
      </div>

      <div className="results-count">
        {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'} found
      </div>

      <div className="companies-grid">
        {filteredCompanies.map(company => (
          <Link 
            to={`/company/${company.id}`} 
            key={company.id} 
            className="company-card"
          >
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

      <Disclaimer />
    </div>
  );
}