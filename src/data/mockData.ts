export interface Company {
  id: string;
  name: string;
  website: string;
  category: string;
}

export interface Release {
  id: string;
  date: string;
  displayName: string;
  companyIds: string[];
}

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
  { id: "1", name: "TechCorp Solutions", website: "https://techcorp.example", category: "Technology" },
  { id: "2", name: "Global Finance Partners", website: "https://gfp.example", category: "Finance" },
  { id: "3", name: "HealthPlus Medical", website: "https://healthplus.example", category: "Healthcare" },
  { id: "4", name: "Advanced Manufacturing Inc", website: "https://advmfg.example", category: "Manufacturing" },
  { id: "5", name: "RetailWorld Group", website: "https://retailworld.example", category: "Retail" },
  { id: "6", name: "Energy Solutions Ltd", website: "https://energysol.example", category: "Energy" },
  { id: "7", name: "TeleConnect Communications", website: "https://teleconnect.example", category: "Telecommunications" },
  { id: "8", name: "MediaVision Entertainment", website: "https://mediavision.example", category: "Media" },
  { id: "9", name: "CloudTech Innovations", website: "https://cloudtech.example", category: "Technology" },
  { id: "10", name: "Capital Investments Group", website: "https://capitalinv.example", category: "Finance" },
  { id: "11", name: "MediCare Systems", website: "https://medicare-sys.example", category: "Healthcare" },
  { id: "12", name: "Industrial Automation Co", website: "https://indauto.example", category: "Manufacturing" },
  { id: "13", name: "ShopSmart Retail", website: "https://shopsmart.example", category: "Retail" },
  { id: "14", name: "GreenPower Energy", website: "https://greenpower.example", category: "Energy" },
  { id: "15", name: "NextGen Networks", website: "https://nextgen-net.example", category: "Telecommunications" },
  { id: "16", name: "Digital Media Corp", website: "https://digimedia.example", category: "Media" },
  { id: "17", name: "DataStream Technologies", website: "https://datastream.example", category: "Technology" },
  { id: "18", name: "Premier Banking Solutions", website: "https://premierbank.example", category: "Finance" },
  { id: "19", name: "LifeCare Pharmaceuticals", website: "https://lifecare-pharma.example", category: "Healthcare" },
  { id: "20", name: "Precision Manufacturing", website: "https://precisionmfg.example", category: "Manufacturing" },
  { id: "21", name: "MegaMart Enterprises", website: "https://megamart.example", category: "Retail" },
  { id: "22", name: "SolarTech Industries", website: "https://solartech.example", category: "Energy" },
  { id: "23", name: "Wireless Solutions Inc", website: "https://wireless-sol.example", category: "Telecommunications" },
  { id: "24", name: "Broadcast Media Network", website: "https://broadcastmedia.example", category: "Media" },
  { id: "25", name: "AI Systems Corporation", website: "https://aisystems.example", category: "Technology" },
  { id: "26", name: "Quantum Finance", website: "https://quantumfin.example", category: "Finance" },
  { id: "27", name: "BioTech Medical Research", website: "https://biotech-med.example", category: "Healthcare" },
  { id: "28", name: "SmartFactory Solutions", website: "https://smartfactory.example", category: "Manufacturing" }
];

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

export function getCompaniesByRelease(releaseId: string): Company[] {
  const release = releases.find(r => r.id === releaseId);
  if (!release) return [];
  return release.companyIds.map(id => getCompanyById(id)).filter(c => c !== undefined) as Company[];
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