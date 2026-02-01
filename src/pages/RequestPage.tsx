import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categories } from '../data/mockData';
import type { SubmissionRequest } from '../types';

export default function RequestPage() {
  const navigate = useNavigate();
  const [requestType, setRequestType] = useState<'addition' | 'correction'>('addition');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const request: SubmissionRequest = {
      id: Date.now().toString(),
      type: requestType,
      companyName,
      website,
      category,
      details,
      submittedAt: new Date().toISOString()
    };

    // Save to local storage
    const existing = localStorage.getItem('sponsor_requests');
    const requests = existing ? JSON.parse(existing) : [];
    requests.push(request);
    localStorage.setItem('sponsor_requests', JSON.stringify(requests));

    setSubmitted(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="request-page">
        <header className="page-header">
          <h1>Request Submitted</h1>
        </header>
        <div className="success-message">
          <p>✓ Your request has been submitted successfully!</p>
          <p>Redirecting to directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="request-page">
      <header className="page-header">
        <Link to="/" className="back-link">← Back to Directory</Link>
        <h1>Request Addition/Correction</h1>
      </header>

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label>Request Type:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="addition"
                checked={requestType === 'addition'}
                onChange={(e) => setRequestType(e.target.value as 'addition')}
              />
              Add new company
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="correction"
                checked={requestType === 'correction'}
                onChange={(e) => setRequestType(e.target.value as 'correction')}
              />
              Correct existing company
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="companyName">Company Name *</label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website *</label>
          <input
            type="url"
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="details">Additional Details</label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            placeholder="Please provide any additional information or corrections..."
          />
        </div>

        <button type="submit" className="submit-button">
          Submit Request
        </button>
      </form>
    </div>
  );
}