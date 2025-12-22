import type { User, UserStatusHistory, UserRoleHistory, UserAuditLog } from '@/types';

// Terminal-based user distribution: 470 users total
// - 150 Admins (1-2 per terminal × 116 terminals)  
// - 300 Workers (2-3 per terminal × 116 terminals)
// - 12 Supervisors (1-2 per region × 8 regions)
// - 8 Leaders (1 per region × 8 regions)

// Helper function to generate users for each terminal
const generateTerminalUsers = () => {
  const users: User[] = [];
  
  // Generate admins and workers for each terminal (terminals 1-116)
  for (let terminalNum = 1; terminalNum <= 116; terminalNum++) {
    const terminalId = `terminal${terminalNum}`;
    const regionId = getRegionIdFromTerminal(terminalNum);
    
    // Generate 1-2 admins per terminal (alternating pattern)
    const adminCount = terminalNum % 2 === 1 ? 2 : 1; // Odd terminals get 2 admins, even get 1
    
    for (let adminIndex = 1; adminIndex <= adminCount; adminIndex++) {
      const adminId = `admin${terminalNum}_${adminIndex}`;
      
      users.push({
        id: adminId,
        name: generateAdminName(terminalNum, adminIndex),
        email: `admin${adminIndex}@terminal${terminalNum}.com`,
        employeeId: `EMP-A-${terminalNum.toString().padStart(3, '0')}-${adminIndex}`,
        phoneNumber: generatePhoneNumber(),
        role: 'admin',
        status: 'active',
        terminalId: terminalId,
        regionId: regionId,
        department: 'Terminal Operations',
        hireDate: generateHireDate('admin'),
        ssoProvider: 'talenta',
        mfaEnabled: true,
        lastLogin: generateRecentDateTime(),
        passwordLastChanged: generatePasswordChangeDate(),
        createdAt: generateHireDate('admin'),
        updatedAt: generateRecentDateTime(),
        createdBy: 'system',
        lastModifiedBy: adminId,
        avatar: `/avatars/admin${(terminalNum % 10) + 1}.jpg`
      });
    }
    
    // Generate 2-3 workers per terminal
    // Terminal 1 gets 2 generated workers (worker1_2, worker1_3) + 1 custom worker (worker1_1 = Candra Wijaya)
    const baseWorkerCount = terminalNum % 3 === 0 ? 2 : 3; // Every 3rd terminal gets 2 workers, others get 3
    const workerCount = terminalNum === 1 ? baseWorkerCount : baseWorkerCount; // Same count, but Terminal 1 gets custom worker1_1
    
    for (let workerIndex = 1; workerIndex <= workerCount; workerIndex++) {
      const workerId = `worker${terminalNum}_${workerIndex}`;
      
      // Skip worker1_1 as we have a custom user (Candra Wijaya) with this ID
      if (workerId === 'worker1_1') {
        continue;
      }
      
      users.push({
        id: workerId,
        name: generateWorkerName(terminalNum, workerIndex),
        email: `worker${workerIndex}@terminal${terminalNum}.com`,
        employeeId: `EMP-W-${terminalNum.toString().padStart(3, '0')}-${workerIndex}`,
        phoneNumber: generatePhoneNumber(),
        role: 'worker',
        status: 'active',
        terminalId: terminalId,
        regionId: regionId,
        department: 'Field Operations',
        hireDate: generateHireDate('worker'),
        ssoProvider: 'talenta',
        mfaEnabled: false,
        lastLogin: generateRecentDateTime(),
        passwordLastChanged: generatePasswordChangeDate(),
        createdAt: generateHireDate('worker'),
        updatedAt: generateRecentDateTime(),
        createdBy: `admin${terminalNum}_1`,
        lastModifiedBy: workerId,
        avatar: `/avatars/worker${(terminalNum % 15) + 1}.jpg`
      });
    }
  }
  
  return users;
};

// Generate regional supervisors (1-2 per region)
const generateRegionalSupervisors = () => {
  const supervisors: User[] = [];
  
  for (let regionNum = 1; regionNum <= 8; regionNum++) {
    const regionId = `region${regionNum}`;
    const supervisorCount = regionNum <= 4 ? 2 : 1; // First 4 regions get 2 supervisors, others get 1
    
    for (let supIndex = 1; supIndex <= supervisorCount; supIndex++) {
      const supervisorId = `supervisor${regionNum}_${supIndex}`;
      
      supervisors.push({
        id: supervisorId,
        name: generateSupervisorName(regionNum, supIndex),
        email: `supervisor${supIndex}@region${regionNum}.pertamc.com`,
        employeeId: `EMP-S-R${regionNum}-${supIndex.toString().padStart(2, '0')}`,
        phoneNumber: generatePhoneNumber(),
        role: 'supervisor',
        status: 'active',
        regionId: regionId,
        department: 'Regional Management',
        hireDate: generateHireDate('supervisor'),
        ssoProvider: 'idaman',
        mfaEnabled: true,
        lastLogin: generateRecentDateTime(),
        passwordLastChanged: generatePasswordChangeDate(),
        createdAt: generateHireDate('supervisor'),
        updatedAt: generateRecentDateTime(),
        createdBy: 'system',
        lastModifiedBy: supervisorId,
        avatar: `/avatars/supervisor${regionNum}.jpg`
      });
    }
  }
  
  return supervisors;
};

// Generate regional leaders (1 per region)
const generateRegionalLeaders = () => {
  const leaders: User[] = [];
  
  for (let regionNum = 1; regionNum <= 8; regionNum++) {
    const regionId = `region${regionNum}`;
    const leaderId = `leader${regionNum}`;
    
    leaders.push({
      id: leaderId,
      name: generateLeaderName(regionNum),
      email: `leader@region${regionNum}.pertamc.com`,
      employeeId: `EMP-L-R${regionNum}-01`,
      phoneNumber: generatePhoneNumber(),
      role: 'leader',
      status: 'active',
      regionId: regionId,
      department: 'Regional Leadership',
      hireDate: generateHireDate('leader'),
      ssoProvider: 'idaman',
      mfaEnabled: true,
      lastLogin: generateRecentDateTime(),
      passwordLastChanged: generatePasswordChangeDate(),
      createdAt: generateHireDate('leader'),
      updatedAt: generateRecentDateTime(),
      createdBy: 'system',
      lastModifiedBy: leaderId,
      avatar: `/avatars/leader${regionNum}.jpg`
    });
  }
  
  return leaders;
};

// Helper functions for data generation
function getRegionIdFromTerminal(terminalNum: number): string {
  if (terminalNum <= 15) return 'region1';
  if (terminalNum <= 30) return 'region2';
  if (terminalNum <= 45) return 'region3';
  if (terminalNum <= 60) return 'region4';
  if (terminalNum <= 75) return 'region5';
  if (terminalNum <= 90) return 'region6';
  if (terminalNum <= 105) return 'region7';
  return 'region8';
}

function generateAdminName(terminalNum: number, adminIndex: number): string {
  const firstNames = [
    'Ahmad', 'Sari', 'Bambang', 'Dewi', 'Hendra', 'Rina', 'Agus', 'Maya',
    'Edi', 'Lestari', 'Budi', 'Sinta', 'Dedi', 'Wati', 'Rudi', 'Indah',
    'Yudi', 'Fitri', 'Andi', 'Retno', 'Iwan', 'Sri', 'Joko', 'Nur',
    'Toni', 'Ratna', 'Vicky', 'Dian', 'Hadi', 'Yuni'
  ];
  
  const lastNames = [
    'Sutrisno', 'Indrawati', 'Hermanto', 'Sari', 'Wijaya', 'Purwanto',
    'Handoko', 'Maharani', 'Santoso', 'Rahayu', 'Kusuma', 'Wulandari',
    'Prasetyo', 'Ningrum', 'Setiawan', 'Anggraini', 'Nugroho', 'Safitri',
    'Susanto', 'Kartini', 'Subagyo', 'Pertiwi', 'Widodo', 'Sari',
    'Ramadan', 'Oktaviani', 'Firmansyah', 'Safira', 'Mahendra', 'Ayu'
  ];
  
  const nameIndex = (terminalNum + adminIndex - 1) % firstNames.length;
  return `${firstNames[nameIndex]} ${lastNames[nameIndex]}`;
}

function generateWorkerName(terminalNum: number, workerIndex: number): string {
  const firstNames = [
    'Andi', 'Siti', 'Bayu', 'Rini', 'Doni', 'Lina', 'Eko', 'Nina',
    'Feri', 'Tari', 'Gani', 'Vera', 'Heri', 'Yanti', 'Imam', 'Zera',
    'Jono', 'Ari', 'Kris', 'Desi', 'Luis', 'Mega', 'Nino', 'Ola',
    'Pedi', 'Qory', 'Rico', 'Sari', 'Tedi', 'Ulfa', 'Vino', 'Wati',
    'Yuda', 'Zaki', 'Adi', 'Bela', 'Cici', 'Dedi', 'Erna', 'Fafa',
    'Candra'
  ];
  
  const lastNames = [
    'Pratama', 'Sari', 'Putra', 'Dewi', 'Wijaya', 'Lestari', 'Santosa', 'Wulan',
    'Rahman', 'Safitri', 'Kusuma', 'Pertiwi', 'Setiadi', 'Rahmawati', 'Gunawan', 'Sari',
    'Permana', 'Indah', 'Saputra', 'Maharani', 'Hidayat', 'Kartika', 'Maulana', 'Fitria',
    'Purnama', 'Safira', 'Nugraha', 'Ayu', 'Firmansyah', 'Dewi', 'Kurniawan', 'Sinta',
    'Ramadhan', 'Anggun', 'Saputri', 'Cantika', 'Maulida', 'Rizki', 'Fadila', 'Nurma'
  ];
  
  const nameIndex = (terminalNum + workerIndex + 50) % firstNames.length;
  return `${firstNames[nameIndex]} ${lastNames[nameIndex]}`;
}

function generateSupervisorName(regionNum: number, supIndex: number): string {
  const names = [
    'Dr. Budi Santoso', 'Ir. Fitri Rahman', 'Drs. Agus Hidayat', 'Dr. Retno Wulandari',
    'Ir. Hendra Wijaya', 'Dra. Maya Kusuma', 'Dr. Eko Prasetyo', 'Ir. Sari Maharani',
    'Drs. Joni Permana', 'Dr. Indah Pertiwi', 'Ir. Dedi Gunawan', 'Dra. Yuni Safitri',
    'Dr. Rudi Maulana', 'Ir. Nina Kartika', 'Drs. Vicky Purnama', 'Dr. Dian Anggun'
  ];
  
  const nameIndex = (regionNum - 1) * 2 + (supIndex - 1);
  return names[nameIndex % names.length] || 'Dr. Default Supervisor';
}

function generateLeaderName(regionNum: number): string {
  const names = [
    'Prof. Dr. Diana Sari', 'Prof. Ir. Hani Wijayanti', 'Prof. Dr. Indra Kurniawan',
    'Prof. Dra. Kartini Maharani', 'Prof. Dr. Joko Widodo', 'Prof. Ir. Maya Sari',
    'Prof. Dr. Nur Rahman', 'Prof. Dra. Oktavia Dewi'
  ];
  
  return names[(regionNum - 1) % names.length] || 'Prof. Dr. Default Leader';
}

function generatePhoneNumber(): string {
  const operators = ['812', '813', '814', '815', '816', '817', '818', '819'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return `+62-${operator}-${number.toString().slice(0, 4)}-${number.toString().slice(4)}`;
}

function generateHireDate(role: string): string {
  const currentYear = 2024;
  let startYear: number;
  
  switch (role) {
    case 'leader':
      startYear = 2015; // Leaders hired 9+ years ago
      break;
    case 'supervisor':
      startYear = 2017; // Supervisors hired 7+ years ago
      break;
    case 'admin':
      startYear = 2019; // Admins hired 5+ years ago
      break;
    case 'worker':
      startYear = 2020; // Workers hired 4+ years ago
      break;
    default:
      startYear = 2020;
  }
  
  const yearRange = currentYear - startYear;
  const randomYear = startYear + Math.floor(Math.random() * yearRange);
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  const randomDay = Math.floor(Math.random() * 28) + 1;
  
  return `${randomYear}-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}T00:00:00Z`;
}

function generateRecentDateTime(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7); // 0-7 days ago
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  const recentDate = new Date(now);
  recentDate.setDate(recentDate.getDate() - daysAgo);
  recentDate.setHours(recentDate.getHours() - hoursAgo);
  recentDate.setMinutes(recentDate.getMinutes() - minutesAgo);
  
  return recentDate.toISOString();
}

function generatePasswordChangeDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90) + 30; // 30-120 days ago
  
  const changeDate = new Date(now);
  changeDate.setDate(changeDate.getDate() - daysAgo);
  
  return changeDate.toISOString();
}

// Add specific named worker: Candra Wijaya at terminal 1 (define first to ensure availability)
const candraWijaya: User = {
  id: 'worker1_1',
  name: 'Candra Wijaya',
  email: 'candra.wijaya@terminal1.com',
  employeeId: 'EMP-W-001-CW',
  phoneNumber: '+62-812-3456-7890',
  role: 'worker',
  status: 'active',
  terminalId: 'terminal1',
  regionId: 'region1',
  department: 'Field Operations',
  hireDate: new Date(2022, 5, 15).toISOString().split('T')[0] || '',
  ssoProvider: 'talenta',
  notes: 'Emergency Contact: Sari Wijaya (Sister) - +62-813-9876-5432',
  mfaEnabled: true,
  lastLogin: new Date().toISOString(),
  passwordLastChanged: new Date(2024, 11, 1).toISOString().split('T')[0] || '',
  createdAt: new Date(2022, 5, 15).toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin1_1',
  lastModifiedBy: 'admin1_1',
  avatar: '/avatars/worker_candra.jpg'
};

// Generate all users
const terminalUsers = generateTerminalUsers();
const regionalSupervisors = generateRegionalSupervisors();
const regionalLeaders = generateRegionalLeaders();

// Combine all users
export const mockUsers: User[] = [
  ...terminalUsers,
  ...regionalSupervisors,
  ...regionalLeaders,
  candraWijaya
];

// Helper functions for user operations
export const getUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.id === userId);
};

export const getUsersByTerminal = (terminalId: string): User[] => {
  return mockUsers.filter(user => user.terminalId === terminalId);
};

export const getUsersByRegion = (regionId: string): User[] => {
  return mockUsers.filter(user => user.regionId === regionId);
};

export const getUsersByRole = (role: string): User[] => {
  return mockUsers.filter(user => user.role === role);
};

export const getActiveUsers = (): User[] => {
  return mockUsers.filter(user => user.status === 'active');
};

export const getAdminsByTerminal = (terminalId: string): User[] => {
  return mockUsers.filter(user => 
    user.terminalId === terminalId && user.role === 'admin'
  );
};

export const getWorkersByTerminal = (terminalId: string): User[] => {
  return mockUsers.filter(user => 
    user.terminalId === terminalId && user.role === 'worker'
  );
};

export const getSupervisorsByRegion = (regionId: string): User[] => {
  return mockUsers.filter(user => 
    user.regionId === regionId && user.role === 'supervisor'
  );
};

// User statistics
export const getUserStatistics = () => {
  const stats = {
    totalUsers: mockUsers.length,
    activeUsers: mockUsers.filter(u => u.status === 'active').length,
    usersByRole: {
      admin: mockUsers.filter(u => u.role === 'admin').length,
      worker: mockUsers.filter(u => u.role === 'worker').length,
      supervisor: mockUsers.filter(u => u.role === 'supervisor').length,
      leader: mockUsers.filter(u => u.role === 'leader').length
    },
    usersByRegion: {} as Record<string, number>,
    usersByTerminal: {} as Record<string, number>,
    averageUsersPerTerminal: 0,
    usersWithMFA: mockUsers.filter(u => u.mfaEnabled).length
  };
  
  // Count users by region
  for (let i = 1; i <= 8; i++) {
    const regionId = `region${i}`;
    stats.usersByRegion[regionId] = mockUsers.filter(u => u.regionId === regionId).length;
  }
  
  // Count users by terminal
  for (let i = 1; i <= 116; i++) {
    const terminalId = `terminal${i}`;
    stats.usersByTerminal[terminalId] = mockUsers.filter(u => u.terminalId === terminalId).length;
  }
  
  // Calculate average users per terminal (excluding regional users)
  const terminalUserCount = mockUsers.filter(u => u.terminalId).length;
  stats.averageUsersPerTerminal = Math.round(terminalUserCount / 116);
  
  return stats;
};

// Mock status and role history data
export const mockStatusHistory: UserStatusHistory[] = [
  // Add some sample status changes
  {
    id: 'status_1',
    userId: 'admin1_1',
    previousStatus: 'inactive',
    newStatus: 'active',
    reason: 'Account activated after initial setup',
    changedBy: 'system',
    changedAt: '2024-01-15T09:00:00Z',
    effectiveDate: '2024-01-15T09:00:00Z',
    notes: 'Initial activation'
  }
];

export const mockRoleHistory: UserRoleHistory[] = [
  // Add some sample role changes
  {
    id: 'role_1',
    userId: 'admin5_1',
    previousRole: 'worker',
    newRole: 'admin',
    promotionReason: 'Exceptional performance and leadership skills',
    approvedBy: 'supervisor1_1',
    approvedAt: '2024-06-15T10:00:00Z',
    effectiveDate: '2024-07-01T00:00:00Z',
    notes: 'Promoted from worker to admin after 3 years of service'
  }
];

export const mockAuditLogs: UserAuditLog[] = [
  // Add some sample audit entries
  {
    id: 'audit_1',
    userId: 'admin1_1',
    actionType: 'login_success',
    actionDescription: 'Successful login via Talenta SSO',
    performedBy: 'admin1_1',
    ipAddress: '192.168.1.100',
    timestamp: '2024-12-19T08:30:00Z'
  }
];