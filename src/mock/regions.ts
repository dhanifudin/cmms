import type { Region } from '@/types';

// Regional definitions for CMMS system
// 8 regions covering Indonesia with proper geographic distribution
export const mockRegions: Region[] = [
  {
    id: 'region1',
    name: 'jakarta-surrounding',
    displayName: 'Jakarta & Surrounding',
    description: 'Jakarta metropolitan area including Tangerang and Bekasi',
    terminalIds: [
      'terminal1', 'terminal2', 'terminal3', 'terminal4', 'terminal5',
      'terminal6', 'terminal7', 'terminal8', 'terminal9', 'terminal10',
      'terminal11', 'terminal12', 'terminal13', 'terminal14', 'terminal15'
    ],
    coordinates: {
      latitude: -6.2088,
      longitude: 106.8456
    },
    timezone: 'Asia/Jakarta',
    active: true
  },
  {
    id: 'region2',
    name: 'west-java',
    displayName: 'West Java',
    description: 'West Java province including Bandung, Bogor, and Cirebon',
    terminalIds: [
      'terminal16', 'terminal17', 'terminal18', 'terminal19', 'terminal20',
      'terminal21', 'terminal22', 'terminal23', 'terminal24', 'terminal25',
      'terminal26', 'terminal27', 'terminal28', 'terminal29', 'terminal30'
    ],
    coordinates: {
      latitude: -6.9147,
      longitude: 107.6098
    },
    timezone: 'Asia/Jakarta',
    active: true
  },
  {
    id: 'region3',
    name: 'central-java',
    displayName: 'Central Java',
    description: 'Central Java province including Semarang, Solo, and Yogyakarta',
    terminalIds: [
      'terminal31', 'terminal32', 'terminal33', 'terminal34', 'terminal35',
      'terminal36', 'terminal37', 'terminal38', 'terminal39', 'terminal40',
      'terminal41', 'terminal42', 'terminal43', 'terminal44', 'terminal45'
    ],
    coordinates: {
      latitude: -7.2575,
      longitude: 110.4017
    },
    timezone: 'Asia/Jakarta',
    active: true
  },
  {
    id: 'region4',
    name: 'east-java',
    displayName: 'East Java',
    description: 'East Java province including Surabaya, Malang, and Jember',
    terminalIds: [
      'terminal46', 'terminal47', 'terminal48', 'terminal49', 'terminal50',
      'terminal51', 'terminal52', 'terminal53', 'terminal54', 'terminal55',
      'terminal56', 'terminal57', 'terminal58', 'terminal59', 'terminal60'
    ],
    coordinates: {
      latitude: -7.2504,
      longitude: 112.7688
    },
    timezone: 'Asia/Jakarta',
    active: true
  },
  {
    id: 'region5',
    name: 'sumatra',
    displayName: 'Sumatra',
    description: 'Sumatra island including Medan, Palembang, and Padang',
    terminalIds: [
      'terminal61', 'terminal62', 'terminal63', 'terminal64', 'terminal65',
      'terminal66', 'terminal67', 'terminal68', 'terminal69', 'terminal70',
      'terminal71', 'terminal72', 'terminal73', 'terminal74', 'terminal75'
    ],
    coordinates: {
      latitude: 3.5952,
      longitude: 98.6722
    },
    timezone: 'Asia/Jakarta',
    active: true
  },
  {
    id: 'region6',
    name: 'kalimantan',
    displayName: 'Kalimantan',
    description: 'Kalimantan island including Balikpapan, Banjarmasin, and Pontianak',
    terminalIds: [
      'terminal76', 'terminal77', 'terminal78', 'terminal79', 'terminal80',
      'terminal81', 'terminal82', 'terminal83', 'terminal84', 'terminal85',
      'terminal86', 'terminal87', 'terminal88', 'terminal89', 'terminal90'
    ],
    coordinates: {
      latitude: -1.2379,
      longitude: 116.8336
    },
    timezone: 'Asia/Makassar',
    active: true
  },
  {
    id: 'region7',
    name: 'sulawesi',
    displayName: 'Sulawesi',
    description: 'Sulawesi island including Makassar, Manado, and Palu',
    terminalIds: [
      'terminal91', 'terminal92', 'terminal93', 'terminal94', 'terminal95',
      'terminal96', 'terminal97', 'terminal98', 'terminal99', 'terminal100',
      'terminal101', 'terminal102', 'terminal103', 'terminal104', 'terminal105'
    ],
    coordinates: {
      latitude: -5.1477,
      longitude: 119.4327
    },
    timezone: 'Asia/Makassar',
    active: true
  },
  {
    id: 'region8',
    name: 'eastern-indonesia',
    displayName: 'Eastern Indonesia',
    description: 'Eastern Indonesia including Bali, NTT, and Papua',
    terminalIds: [
      'terminal106', 'terminal107', 'terminal108', 'terminal109', 'terminal110',
      'terminal111', 'terminal112', 'terminal113', 'terminal114', 'terminal115', 'terminal116'
    ],
    coordinates: {
      latitude: -8.3405,
      longitude: 115.0920
    },
    timezone: 'Asia/Makassar',
    active: true
  }
];

// Helper functions for regional operations
export const getRegionById = (regionId: string): Region | undefined => {
  return mockRegions.find(region => region.id === regionId);
};

export const getRegionByTerminalId = (terminalId: string): Region | undefined => {
  return mockRegions.find(region => region.terminalIds.includes(terminalId));
};

export const getTerminalsByRegion = (regionId: string): string[] => {
  const region = getRegionById(regionId);
  return region ? region.terminalIds : [];
};

export const getActiveRegions = (): Region[] => {
  return mockRegions.filter(region => region.active);
};

export const getTotalTerminalsCount = (): number => {
  return mockRegions.reduce((count, region) => count + region.terminalIds.length, 0);
};

// Regional statistics
export const getRegionStatistics = () => {
  return {
    totalRegions: mockRegions.length,
    activeRegions: mockRegions.filter(r => r.active).length,
    totalTerminals: getTotalTerminalsCount(),
    averageTerminalsPerRegion: Math.round(getTotalTerminalsCount() / mockRegions.length),
    regionDistribution: mockRegions.map(region => ({
      regionId: region.id,
      displayName: region.displayName,
      terminalCount: region.terminalIds.length
    }))
  };
};