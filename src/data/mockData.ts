import type { Company, Release, CommunityMetadata } from '../types';

export const categories = [
  "Technology",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Energy",
  "Telecommunications",
  "Media"
];

export const companies: Company[] = [
  { id: "1", name: "TechCorp Solutions", website: "https://techcorp.example", category: "Technology", source: "official" },
  { id: "2", name: "Global Finance Partners", website: "https://gfp.example", category: "Finance", source: "official" },
  { id: "3", name: "HealthPlus Medical", website: "https://healthplus.example", category: "Healthcare", source: "official" },
  { id: "4", name: "Advanced Manufacturing Inc", website: "https://advmfg.example", category: "Manufacturing", source: "official" },
  { id: "5", name: "RetailWorld Group", website: "https://retailworld.example", category: "Retail", source: "official" },
  { id: "6", name: "Energy Solutions Ltd", website: "https://energysol.example", category: "Energy", source: "official" },
  { id: "7", name: "TeleConnect Communications", website: "https://teleconnect.example", category: "Telecommunications", source: "official" },
  { id: "8", name: "MediaVision Entertainment", website: "https://mediavision.example", category: "Media", source: "official" },
  { id: "9", name: "CloudTech Innovations", website: "https://cloudtech.example", category: "Technology", source: "official" },
  { id: "10", name: "Capital Investments Group", website: "https://capitalinv.example", category: "Finance", source: "official" },
  { id: "11", name: "MediCare Systems", website: "https://medicare-sys.example", category: "Healthcare", source: "official" },
  { id: "12", name: "Industrial Automation Co", website: "https://indauto.example", category: "Manufacturing", source: "official" },
  { id: "13", name: "ShopSmart Retail", website: "https://shopsmart.example", category: "Retail", source: "official" },
  { id: "14", name: "GreenPower Energy", website: "https://greenpower.example", category: "Energy", source: "official" },
  { id: "15", name: "NextGen Networks", website: "https://nextgen-net.example", category: "Telecommunications", source: "official" },
  { id: "16", name: "Digital Media Corp", website: "https://digimedia.example", category: "Media", source: "official" },
  { id: "17", name: "DataStream Technologies", website: "https://datastream.example", category: "Technology", source: "official" },
  { id: "18", name: "Premier Banking Solutions", website: "https://premierbank.example", category: "Finance", source: "official" },
  { id: "19", name: "LifeCare Pharmaceuticals", website: "https://lifecare-pharma.example", category: "Healthcare", source: "official" },
  { id: "20", name: "Precision Manufacturing", website: "https://precisionmfg.example", category: "Manufacturing", source: "official" },
  { id: "21", name: "MegaMart Enterprises", website: "https://megamart.example", category: "Retail", source: "official" },
  { id: "22", name: "SolarTech Industries", website: "https://solartech.example", category: "Energy", source: "official" },
  { id: "23", name: "Wireless Solutions Inc", website: "https://wireless-sol.example", category: "Telecommunications", source: "official" },
  { id: "24", name: "Broadcast Media Network", website: "https://broadcastmedia.example", category: "Media", source: "official" },
  { id: "25", name: "AI Systems Corporation", website: "https://aisystems.example", category: "Technology", source: "official" },
  { id: "26", name: "Quantum Finance", website: "https://quantumfin.example", category: "Finance", source: "official" },
  { id: "27", name: "BioTech Medical Research", website: "https://biotech-med.example", category: "Healthcare", source: "official" },
  { id: "28", name: "SmartFactory Solutions", website: "https://smartfactory.example", category: "Manufacturing", source: "official" },
  // Community submissions
  { id: "c1", name: "DevOps Experts Pty Ltd", website: "https://devopsexperts.example", category: "Technology", source: "community", verified: true, submittedAt: "2025-01-20", verifiedAt: "2025-01-22", evidenceLink: "https://example.com/evidence1" },
  { id: "c2", name: "Fintech Innovations Group", website: "https://fintechinno.example", category: "Finance", source: "community", verified: true, submittedAt: "2025-01-25", verifiedAt: "2025-01-27", evidenceLink: "https://example.com/evidence2" },
  { id: "c3", name: "Global Consulting Partners", website: "https://globalcp.example", category: "Technology", source: "community", verified: false, submittedAt: "2025-02-01" },
  { id: "c4", name: "EcoEnergy Solutions", website: "https://ecoenergy.example", category: "Energy", source: "community", verified: true, submittedAt: "2025-01-28", verifiedAt: "2025-01-30", evidenceLink: "https://example.com/evidence3" },
  { id: "c5", name: "Digital Healthcare Systems", website: "https://digitalhealthcare.example", category: "Healthcare", source: "community", verified: false, submittedAt: "2025-02-02" }
];

export const communityMetadata: CommunityMetadata = {
  lastUpdated: "2025-02-02"
};

export const releases: Release[] = [
  {
    id: "1",
    date: "2024-01-15",
    displayName: "15 Jan 2024",
    companyIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]
  },
  {
    id: "2",
    date: "2024-04-20",
    displayName: "20 Apr 2024",
    companyIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"]
  },
  {
    id: "3",
    date: "2024-07-10",
    displayName: "10 Jul 2024",
    companyIds: ["1", "2", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
  },
  {
    id: "4",
    date: "2024-10-05",
    displayName: "05 Oct 2024",
    companyIds: ["1", "2", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26"]
  },
  {
    id: "5",
    date: "2025-01-15",
    displayName: "15 Jan 2025",
    companyIds: ["1", "2", "4", "5", "6", "7", "8", "9", "10", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"]
  }
];

export function getCompanyById(id: string): Company | undefined {
  return companies.find(c => c.id === id);
}

export function getCompaniesByRelease(releaseId: string, includeCommunity: boolean = false): Company[] {
  const release = releases.find(r => r.id === releaseId);
  if (!release) return [];
  
  const officialCompanies = release.companyIds.map(id => getCompanyById(id)).filter(c => c !== undefined) as Company[];
  
  if (!includeCommunity) {
    return officialCompanies;
  }
  
  // Include all community submissions when toggle is on
  const communityCompanies = companies.filter(c => c.source === 'community');
  return [...officialCompanies, ...communityCompanies];
}

export function getAddedCompanies(currentReleaseId: string, previousReleaseId: string): Company[] {
  const current = releases.find(r => r.id === currentReleaseId);
  const previous = releases.find(r => r.id === previousReleaseId);
  if (!current || !previous) return [];
  
  const added = current.companyIds.filter(id => !previous.companyIds.includes(id));
  return added.map(id => getCompanyById(id)).filter(c => c !== undefined) as Company[];
}

export function getRemovedCompanies(currentReleaseId: string, previousReleaseId: string): Company[] {
  const current = releases.find(r => r.id === currentReleaseId);
  const previous = releases.find(r => r.id === previousReleaseId);
  if (!current || !previous) return [];
  
  const removed = previous.companyIds.filter(id => !current.companyIds.includes(id));
  return removed.map(id => getCompanyById(id)).filter(c => c !== undefined) as Company[];
}

export function getCompanyReleaseHistory(companyId: string): Release[] {
  return releases.filter(r => r.companyIds.includes(companyId));
}