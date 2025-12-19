# PRD: SSO Login Revamp - Talenta & Idaman Integration

## Overview
**Purpose**: Revamp the login screen to integrate with SSO providers (Talenta HRIS and Idaman SSO) instead of traditional username/password authentication
**Scope**: Login UI redesign, SSO mock pages, authentication flow updates
**Impact**: Aligns with business requirements for role-based SSO authentication

## Business Context

### Current State
- Login page uses traditional email/password form
- Mock authentication with hardcoded credentials
- All users authenticate through the same interface

### Target State
- SSO-based authentication matching production architecture
- **Talenta HRIS (Mekari)**: Workers and Admin authentication
- **Idaman SSO**: Supervisors and Leaders authentication
- Mock SSO pages simulating actual external authentication providers
- No username/password fields on main login page

## User Roles & SSO Mapping

| Role | SSO Provider | Authentication URL Pattern |
|------|--------------|---------------------------|
| **Worker (Pekerja)** | Talenta HRIS | https://account.mekari.com/users/sign_in |
| **Admin** | Talenta HRIS | https://account.mekari.com/users/sign_in |
| **Supervisor (PertaMC)** | Idaman SSO | https://login.idaman.pertamina.com |
| **Supervisor (PatraNiaga)** | Idaman SSO | https://login.idaman.pertamina.com |
| **Leader** | Idaman SSO | https://login.idaman.pertamina.com |

## Detailed Requirements

### 1. Login Page Revamp (src/views/auth/Login.vue)

#### Remove
- Email input field
- Password input field
- Traditional login form
- Form submit button

#### Add
**Primary SSO Buttons**:
- "Sign in with Talenta" button
  - Branded with Talenta red (#E31E24)
  - Displays Talenta logo (SVG)
  - Hover state: Darker red (#C11A1F)
  - Prominent positioning
  - Click redirects to `/auth/sso/talenta`
  - Description: "For Workers and Admin"
  - Implementation: Native HTML button with inline styles for cross-platform compatibility

- "Sign in with Idaman" button
  - Branded with IdAMan blue (#0066CC)
  - Displays IdAMan logo (SVG)
  - Hover state: Darker blue (#0052A3)
  - Prominent positioning
  - Click redirects to `/auth/sso/idaman`
  - Description: "For Supervisors and Leaders"
  - Implementation: Native HTML button with inline styles for cross-platform compatibility

#### Keep (Modified)
- Page header: "Sign in to CMMS"
- System description
- SSO Provider information box
  - Shows which roles use which SSO provider
  - Clear mapping of Talenta and Idaman to user roles

#### Layout Structure
```
┌─────────────────────────────────────┐
│         Sign in to CMMS             │
│  Computerized Maintenance System    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Talenta Logo]             │   │
│  │  Sign in with Talenta       │   │
│  │  For Workers and Admin      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Idaman Logo]              │   │
│  │  Sign in with Idaman        │   │
│  │  For Supervisors & Leaders  │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  SSO Provider Information           │
│  - Talenta: Workers, Admin          │
│  - Idaman: Supervisors, Leaders     │
└─────────────────────────────────────┘
```

### 2. SSO Mock Pages

#### 2.1 Talenta SSO Mock Page (src/views/auth/sso/TalentaSSO.vue)

**Purpose**: Simulate Mekari/Talenta HRIS authentication interface

**Design Reference**: Based on https://account.mekari.com/users/sign_in

**Visual Design**:
- **Color Scheme**:
  - Primary: #E31E24 (Talenta red)
  - Hover: #C11A1F (Darker red)
  - Background: #f2f4f7 (light gray)
  - Card background: #ffffff
  - Hover background: #FFF5F5 (light red tint)
  - Text: #212121 (dark charcoal)
  - Secondary text: #777777
  - Borders: #e2e2e2
  - Hover border: #E31E24

- **Layout**:
  - Centered card with box shadow: `0 2px 4px 0 rgba(119,119,119,.2)`
  - Card padding: `32px 40px`
  - Border radius: `4px`

- **Branding**:
  - Talenta logo SVG at top (/logos/talenta-logo.svg)
  - Tagline: "Satu akun untuk Jurnal, Klikpajak, Talenta dan Qontak"
  - Footer: "© 2025 PT Mid Solusi Nusantara"
  - All interactive elements use Talenta red

**Features**:
- Page title: "Sign in to Talenta"
- Subtitle: "Select your account to continue to CMMS"
- User account picker showing available Talenta users
- Each user card shows:
  - Avatar/profile image
  - Full name
  - Role badge (Worker/Admin)
  - Terminal assignment
  - Email address
- "Back to Login" button
- Footer with language selection (EN/ID)

**Mock User Data** (Talenta):
```json
[
  {
    "id": "admin1",
    "name": "Ahmad Sutrisno",
    "email": "admin@terminal1.com",
    "role": "admin",
    "terminalId": "terminal1",
    "regionId": "region1",
    "avatar": "/avatars/admin.jpg"
  },
  {
    "id": "worker1",
    "name": "Candra Wijaya",
    "email": "worker@terminal1.com",
    "role": "worker",
    "terminalId": "terminal1",
    "regionId": "region1",
    "avatar": "/avatars/worker.jpg"
  },
  {
    "id": "worker2",
    "name": "Eko Prasetyo",
    "email": "worker2@terminal2.com",
    "role": "worker",
    "terminalId": "terminal2",
    "regionId": "region1",
    "avatar": "/avatars/worker2.jpg"
  }
]
```

**Authentication Simulation**:
```
User selects account
  ↓
Generate mock authorization code (OIDC flow)
  ↓
Redirect to: /auth/callback?code=MOCK_TALENTA_{timestamp}_{userId}&provider=talenta&state={random}
```

**OIDC Parameters** (mocked):
- `response_type`: code id_token
- `scope`: openid profile email talenta.read
- `client_id`: cmms-app-mock
- `redirect_uri`: https://{app}/auth/callback
- `state`: random string for CSRF protection
- `nonce`: random string for replay protection

#### 2.2 Idaman SSO Mock Page (src/views/auth/sso/IdamanSSO.vue)

**Purpose**: Simulate Idaman SSO authentication interface

**Design Reference**: Based on https://login.idaman.pertamina.com

**Visual Design**:
- **Color Scheme**:
  - Primary: #0066CC (IdAMan blue)
  - Hover: #0052A3 (Darker blue)
  - Background: Gradient from-slate-50 to-slate-100
  - Card background: #ffffff
  - Hover background: #EFF6FF (light blue tint)
  - Borders: #DBEAFE (light blue)
  - Hover border: #0066CC
  - Security notice: Blue background (#EFF6FF)

- **Logo**: IdAMan logo SVG at top (/logos/idaman-logo.svg)
- **Decorative elements**: Gradient dividers
- **Clean centered layout**
- **Security-focused UI**: Lock icon with security notice

**Features**:
- Page title: "IdAMan 3.0"
- Subtitle: "Sign in to continue"
- User account picker showing available Idaman users
- Each user card shows:
  - Avatar/profile image
  - Full name
  - Role badge (Supervisor/Leader)
  - Organization (PertaMC/PatraNiaga)
  - Regional assignment
  - Email address
  - Position/title
- "Back to Login" button
- Footer with security info

**Mock User Data** (Idaman):
```json
[
  {
    "id": "supervisor1",
    "name": "Budi Santoso",
    "email": "supervisor@pertamc.com",
    "role": "supervisor",
    "organization": "PertaMC",
    "regionId": "region1",
    "position": "Regional Supervisor",
    "avatar": "/avatars/supervisor.jpg"
  },
  {
    "id": "leader1",
    "name": "Diana Sari",
    "email": "leader@pertamc.com",
    "role": "leader",
    "organization": "PertaMC",
    "regionId": "region1",
    "position": "Regional Leader",
    "avatar": "/avatars/leader.jpg"
  },
  {
    "id": "supervisor2",
    "name": "Fikri Rahman",
    "email": "supervisor@patraniaga.com",
    "role": "supervisor",
    "organization": "PatraNiaga",
    "regionId": "region2",
    "position": "Regional Supervisor",
    "avatar": "/avatars/supervisor2.jpg"
  }
]
```

**Authentication Simulation**:
```
User selects account
  ↓
Generate mock authorization code (OIDC flow)
  ↓
Redirect to: /auth/callback?code=MOCK_IDAMAN_{timestamp}_{userId}&provider=idaman&state={random}
```

**OIDC Parameters** (mocked based on actual Idaman URL):
- `response_type`: code id_token
- `scope`: openid profile api.auth user.role user.read position.readAll offline_access
- `client_id`: 2d7678f6-2f42-4005-8cf2-0107709fa4ef (mocked)
- `redirect_uri`: https://{app}/auth/callback
- `response_mode`: form_post
- `state`: random CSRF token
- `nonce`: random replay protection token

### 3. SSO Callback Handler (src/views/auth/SSOCallback.vue)

**Purpose**: Handle SSO authentication callback and complete login

**Workflow**:
```
1. Page loads with URL parameters
   - code: Mock authorization code
   - provider: 'talenta' or 'idaman'
   - state: CSRF protection token (optional validation)

2. Display loading state
   - "Completing sign in..."
   - Loading spinner
   - Provider logo/branding

3. Call auth store to process SSO callback
   - Validate mock code format
   - Extract userId from code
   - Fetch user data by userId and provider
   - Validate role-provider match
   - Update auth state

4. Handle success
   - Brief "Success!" message
   - Store user session with SSO provider info
   - Auto-redirect to /dashboard

5. Handle errors
   - Show user-friendly error message
   - Log error details (console in dev)
   - Provide "Return to Login" button
```

**Error Scenarios**:
- Missing or invalid code parameter
- Invalid provider parameter
- User not found for given userId
- Role-provider mismatch
- Mock validation failure
- State token mismatch (optional)

**UI States**:
```
Loading:
  - Provider logo
  - Spinner animation
  - "Signing you in to CMMS..."
  - Progress indicator

Success:
  - Checkmark icon
  - "Success! Welcome back"
  - Auto-redirect after 1 second

Error:
  - Error icon
  - User-friendly message
  - Technical details (collapsed)
  - "Return to Login" button
  - "Try Again" option
```

### 4. Auth Store Updates (src/stores/auth.ts)

#### New Methods

**4.1 initiateSSO(provider)**
```typescript
const initiateSSO = (provider: 'talenta' | 'idaman') => {
  // Generate state token for CSRF protection
  const state = generateStateToken();
  sessionStorage.setItem('sso_state', state);

  // Navigate to appropriate SSO mock page
  router.push(`/auth/sso/${provider}`);
};

const generateStateToken = (): string => {
  return `STATE_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};
```

**4.2 handleSSOCallback(code, provider)**
```typescript
const handleSSOCallback = async (
  code: string,
  provider: 'talenta' | 'idaman',
  state?: string
) => {
  isLoading.value = true;

  try {
    // Simulate API call delay (realistic SSO processing time)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Optional: Validate state token
    const savedState = sessionStorage.getItem('sso_state');
    if (state && savedState && state !== savedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // Validate mock code format
    if (!code.startsWith('MOCK_')) {
      throw new Error('Invalid authorization code format');
    }

    // Extract userId from code
    // Format: MOCK_{PROVIDER}_{timestamp}_{userId}
    const parts = code.split('_');
    if (parts.length < 4) {
      throw new Error('Malformed authorization code');
    }
    const userId = parts.slice(3).join('_');

    // Fetch user data based on provider and userId
    const userData = await fetchUserFromProvider(provider, userId);

    if (!userData) {
      throw new Error('User not found');
    }

    // Validate role matches provider
    validateRoleProviderMatch(userData.role, provider);

    // Update current user
    currentUser.value = {
      ...userData,
      ssoProvider: provider,
      lastLogin: new Date().toISOString()
    };

    // Persist to localStorage
    localStorage.setItem('cmms_user', JSON.stringify(currentUser.value));
    localStorage.setItem('cmms_sso_provider', provider);

    // Clear state token
    sessionStorage.removeItem('sso_state');

    return { success: true, user: currentUser.value };
  } catch (error) {
    // Clear state token on error
    sessionStorage.removeItem('sso_state');

    return {
      success: false,
      error: error instanceof Error ? error.message : 'SSO authentication failed'
    };
  } finally {
    isLoading.value = false;
  }
};
```

**4.3 fetchUserFromProvider(provider, userId)**
```typescript
const fetchUserFromProvider = async (
  provider: 'talenta' | 'idaman',
  userId: string
): Promise<User | null> => {
  // Mock user databases matching SSO providers
  const talentaUsers: Record<string, User> = {
    'admin1': {
      id: 'admin1',
      name: 'Ahmad Sutrisno',
      email: 'admin@terminal1.com',
      role: 'admin',
      terminalId: 'terminal1',
      regionId: 'region1',
      status: 'active',
      avatar: '/avatars/admin.jpg'
    },
    'worker1': {
      id: 'worker1',
      name: 'Candra Wijaya',
      email: 'worker@terminal1.com',
      role: 'worker',
      terminalId: 'terminal1',
      regionId: 'region1',
      status: 'active',
      avatar: '/avatars/worker.jpg'
    },
    'worker2': {
      id: 'worker2',
      name: 'Eko Prasetyo',
      email: 'worker2@terminal2.com',
      role: 'worker',
      terminalId: 'terminal2',
      regionId: 'region1',
      status: 'active',
      avatar: '/avatars/worker2.jpg'
    }
  };

  const idamanUsers: Record<string, User> = {
    'supervisor1': {
      id: 'supervisor1',
      name: 'Budi Santoso',
      email: 'supervisor@pertamc.com',
      role: 'supervisor',
      organization: 'PertaMC',
      regionId: 'region1',
      position: 'Regional Supervisor',
      status: 'active',
      avatar: '/avatars/supervisor.jpg'
    },
    'leader1': {
      id: 'leader1',
      name: 'Diana Sari',
      email: 'leader@pertamc.com',
      role: 'leader',
      organization: 'PertaMC',
      regionId: 'region1',
      position: 'Regional Leader',
      status: 'active',
      avatar: '/avatars/leader.jpg'
    },
    'supervisor2': {
      id: 'supervisor2',
      name: 'Fikri Rahman',
      email: 'supervisor@patraniaga.com',
      role: 'supervisor',
      organization: 'PatraNiaga',
      regionId: 'region2',
      position: 'Regional Supervisor',
      status: 'active',
      avatar: '/avatars/supervisor2.jpg'
    }
  };

  const userDatabase = provider === 'talenta' ? talentaUsers : idamanUsers;
  return userDatabase[userId] || null;
};
```

**4.4 validateRoleProviderMatch(role, provider)**
```typescript
const validateRoleProviderMatch = (
  role: UserRole,
  provider: 'talenta' | 'idaman'
): void => {
  const talentaRoles: UserRole[] = ['admin', 'worker'];
  const idamanRoles: UserRole[] = ['supervisor', 'leader'];

  if (provider === 'talenta' && !talentaRoles.includes(role)) {
    throw new Error(
      `Invalid authentication: ${role} users must use Idaman SSO, not Talenta`
    );
  }

  if (provider === 'idaman' && !idamanRoles.includes(role)) {
    throw new Error(
      `Invalid authentication: ${role} users must use Talenta, not Idaman SSO`
    );
  }
};
```

**4.5 generateAuthCode(provider, userId)**
```typescript
const generateAuthCode = (provider: string, userId: string): string => {
  // Generate mock OIDC authorization code
  // Format: MOCK_{PROVIDER}_{TIMESTAMP}_{USERID}
  const timestamp = Date.now();
  return `MOCK_${provider.toUpperCase()}_${timestamp}_${userId}`;
};
```

#### Modified Methods

**4.6 Update checkAuth()**
```typescript
const checkAuth = () => {
  const stored = localStorage.getItem('cmms_user');
  const ssoProvider = localStorage.getItem('cmms_sso_provider');

  if (stored) {
    try {
      const user = JSON.parse(stored);
      currentUser.value = {
        ...user,
        ssoProvider: ssoProvider || undefined
      };
    } catch (error) {
      // Clear corrupted session data
      localStorage.removeItem('cmms_user');
      localStorage.removeItem('cmms_sso_provider');
      sessionStorage.removeItem('sso_state');
    }
  }
};
```

**4.7 Update logout()**
```typescript
const logout = () => {
  currentUser.value = null;

  // Clear all session data
  localStorage.removeItem('cmms_user');
  localStorage.removeItem('cmms_sso_provider');
  sessionStorage.removeItem('sso_state');

  router.push('/login');
};
```

#### Deprecated Methods
- `login(email, password)` - Mark as deprecated
  - Keep for backward compatibility and testing purposes
  - Add JSDoc comment indicating it's deprecated
  - Consider removing in future versions

#### New Computed Properties
```typescript
const ssoProvider = computed(() => currentUser.value?.ssoProvider);
const isTalentaUser = computed(() => ssoProvider.value === 'talenta');
const isIdamanUser = computed(() => ssoProvider.value === 'idaman');
```

#### Export Updates
```typescript
return {
  // Existing exports
  currentUser,
  isLoading,
  isAuthenticated,
  userRole,
  isAdmin,
  isSupervisor,
  isWorker,
  isLeader,
  logout,
  checkAuth,
  switchUser,
  hasPermission,

  // New SSO exports
  initiateSSO,
  handleSSOCallback,
  generateAuthCode,
  ssoProvider,
  isTalentaUser,
  isIdamanUser,

  // Deprecated (keep for demo mode)
  login
};
```

### 5. Router Updates (src/router/index.ts)

#### New Routes
```typescript
{
  path: '/auth/sso/talenta',
  name: 'TalentaSSO',
  component: () => import('@/views/auth/sso/TalentaSSO.vue'),
  meta: {
    requiresGuest: true,
    title: 'Sign in with Talenta'
  }
},
{
  path: '/auth/sso/idaman',
  name: 'IdamanSSO',
  component: () => import('@/views/auth/sso/IdamanSSO.vue'),
  meta: {
    requiresGuest: true,
    title: 'Sign in with Idaman'
  }
},
{
  path: '/auth/callback',
  name: 'SSOCallback',
  component: () => import('@/views/auth/SSOCallback.vue'),
  meta: {
    requiresGuest: true,
    title: 'Completing sign in...'
  }
}
```

### 6. Mock Data Structure

#### User Type Extension
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  terminalId?: string;
  regionId?: string;
  organization?: 'PertaMC' | 'PatraNiaga'; // For supervisors/leaders
  position?: string; // Job title
  status: 'active' | 'inactive';
  avatar?: string;
  ssoProvider?: 'talenta' | 'idaman'; // New field
  lastLogin?: string; // ISO timestamp
}
```

#### Mock Authorization Code Structure
```typescript
interface MockAuthCode {
  code: string;           // MOCK_{PROVIDER}_{TIMESTAMP}_{USERID}
  provider: 'talenta' | 'idaman';
  userId: string;
  createdAt: number;      // timestamp
  expiresAt: number;      // timestamp + 5 minutes
  state?: string;         // CSRF protection token
  nonce?: string;         // Replay protection
}
```

## User Experience Flow

### Flow 1: Admin Login (Talenta)
```
1. User visits /login
2. Sees two SSO buttons: "Sign in with Talenta" and "Sign in with Idaman"
3. Clicks "Sign in with Talenta" (for Admin access)
4. Redirected to /auth/sso/talenta (Mekari-styled mock page)
5. Sees list of Talenta users (Workers and Admins) with profile cards
6. Selects "Ahmad Sutrisno (Admin - Terminal 1)"
7. Mock authorization code generated
8. Redirected to /auth/callback?code=MOCK_TALENTA_1234567890_admin1&provider=talenta&state=...
9. Callback page shows:
   - Mekari logo
   - Loading spinner
   - "Signing you in to CMMS..."
10. Auth store processes callback:
    - Validates code format
    - Extracts userId (admin1)
    - Fetches user data from Talenta mock database
    - Validates role (admin) matches provider (talenta)
    - Updates currentUser state
    - Saves to localStorage
11. Success message briefly shown
12. Auto-redirected to /dashboard as Admin user
```

### Flow 2: Supervisor Login (Idaman)
```
1. User visits /login
2. Clicks "Sign in with Idaman" (for Supervisor access)
3. Redirected to /auth/sso/idaman (IdAMan 3.0 styled mock page)
4. Sees list of Idaman users (Supervisors and Leaders) with profile cards
5. Selects "Budi Santoso (Supervisor - PertaMC, Region 1)"
6. Mock authorization code generated
7. Redirected to /auth/callback?code=MOCK_IDAMAN_1234567890_supervisor1&provider=idaman&state=...
8. Callback page processes authentication with Idaman branding
9. Auth store validates and logs in user
10. Redirected to /dashboard as Supervisor
```

### Flow 3: Cancel SSO
```
1. User clicks "Sign in with Talenta"
2. Arrives at /auth/sso/talenta page
3. Changes mind, clicks "Back to Login" button
4. Returned to /login page
5. Can select different provider or try again
6. State token cleared from sessionStorage
```

### Flow 4: Role-Provider Mismatch (Error)
```
1. User somehow bypasses validation and sends invalid request
2. Example: Worker role with Idaman provider
3. Callback handler validates role-provider match
4. Validation fails with error:
   "Invalid authentication: worker users must use Talenta, not Idaman SSO"
5. Error page shown with:
   - Error icon
   - User-friendly message
   - Technical details in collapsed section
   - "Return to Login" button
6. User returned to login page
7. Error logged in console (dev mode)
```

### Flow 5: Invalid Code (Error)
```
1. User manually modifies callback URL
2. Invalid code parameter (e.g., missing MOCK_ prefix)
3. Auth store validation fails
4. Error message: "Invalid authorization code format"
5. "Return to Login" button shown
6. User can start authentication again
```

## UI/UX Considerations

### Design System
- Use Shadcn Vue components for consistency
- Mekari blue (#005fbf) for Talenta-related UI
- Pertamina/Idaman branding for Idaman-related UI
- SSO buttons prominently displayed with provider logos
- Clear visual hierarchy and spacing

### Branding Elements

**Talenta/Mekari:**
- Primary color: #005fbf
- Background: #f2f4f7
- Mekari logo
- Clean, corporate aesthetic
- Centered card layout with subtle shadow

**Idaman:**
- Modern, minimalist design
- IdAMan 3.0 logo
- Decorative SVG illustrations
- Security-focused UI elements
- Pertamina color scheme (if available)

### Accessibility
- Keyboard navigation for all interactive elements
- Screen reader labels: "Sign in with Talenta for Workers and Admin"
- ARIA labels for loading states
- Focus management throughout SSO flow
- Error announcements for screen readers
- Minimum 44px touch targets on mobile
- Clear focus indicators
- Color contrast meeting WCAG AA standards

### Responsive Design
- **Mobile (< 768px)**:
  - Stack SSO buttons vertically
  - Full-width buttons with adequate spacing
  - User cards in single column on SSO pages
  - Touch-friendly spacing (16px minimum)
  - Larger tap targets

- **Tablet (768px - 1024px)**:
  - Two-column layout for user cards
  - Larger SSO buttons with icons
  - Centered content with max-width

- **Desktop (> 1024px)**:
  - Multi-column user card grid
  - Side-by-side SSO buttons
  - Maximum content width for readability
  - Hover states and transitions

### Loading States
- Initial page load: Skeleton screens
- SSO button click: Button disabled with spinner
- Callback processing:
  - Full-screen loading overlay
  - Provider logo
  - Animated spinner
  - Progress message
  - Estimated time (1-2 seconds)
- Success state: Checkmark animation + brief delay before redirect

### Error Messages

**User-Friendly Messages**:
- "We couldn't sign you in. Please try again."
- "Your account wasn't found. Please contact support."
- "You need to use Talenta to sign in with your role."
- "Session expired. Please start sign in again."
- "Something went wrong. Please return to login."

**Technical Details** (collapsed, for advanced users):
- Error code
- Timestamp
- Request details
- Provider information

## Security Considerations (Mock)

### Mock Code Validation
- **Format validation**: Must start with `MOCK_`
- **Structure validation**: `MOCK_{PROVIDER}_{TIMESTAMP}_{USERID}`
- **Provider validation**: Must match callback provider parameter
- **Expiration** (optional): Codes expire after 5 minutes
- **Single-use** (optional): Track and invalidate used codes

### State Token (CSRF Protection)
- Generate random state token on SSO initiation
- Store in sessionStorage
- Validate on callback (optional for prototype)
- Clear after successful authentication
- Reject mismatched state tokens

### Role-Provider Enforcement
- **Talenta**: Only admin and worker roles
- **Idaman**: Only supervisor and leader roles
- Reject mismatched combinations
- Log validation failures
- Clear error messages for users

### Session Management
- Store SSO provider with user session
- Validate session on protected routes
- Clear all session data on logout
- Handle corrupted session data gracefully
- No sensitive data in localStorage (mock environment)

### Security Headers (Future)
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## Development Approach

### Phase 1: Login Page Revamp (2-3 hours)
1. ✅ Update Login.vue template
   - Remove email/password form
   - Add SSO provider buttons
   - Update demo information section
   - Add provider logos/icons
2. ✅ Style SSO buttons
   - Mekari blue for Talenta
   - Appropriate colors for Idaman
   - Hover and focus states
   - Responsive layout
3. ✅ Implement button click handlers
   - Navigate to SSO pages
   - Generate state tokens
4. ✅ Update component scripts
   - Remove form validation logic
   - Add SSO navigation methods
5. ✅ Test responsive layout

### Phase 2: SSO Mock Pages (4-5 hours)
1. ✅ Create TalentaSSO.vue
   - Mekari-styled layout
   - User selection cards
   - Mock user data
   - Authentication code generation
2. ✅ Create IdamanSSO.vue
   - IdAMan 3.0 styled layout
   - User selection cards
   - Mock user data
   - Authentication code generation
3. ✅ Implement user card components
   - Avatar display
   - User information
   - Click handlers
4. ✅ Add cancel/back navigation
5. ✅ Style according to provider branding
6. ✅ Test user selection flow

### Phase 3: Callback Handler (2-3 hours)
1. ✅ Create SSOCallback.vue
   - Parse URL parameters
   - Loading state UI
   - Success state UI
   - Error state UI
2. ✅ Implement callback logic
   - Call auth store methods
   - Handle success redirect
   - Handle error display
3. ✅ Add provider-specific branding
4. ✅ Test all callback scenarios

### Phase 4: Auth Store Updates (3-4 hours)
1. ✅ Add initiateSSO method
2. ✅ Add handleSSOCallback method
3. ✅ Add fetchUserFromProvider method
4. ✅ Add validateRoleProviderMatch method
5. ✅ Add generateAuthCode method
6. ✅ Update checkAuth method
7. ✅ Update logout method
8. ✅ Add new computed properties
9. ✅ Add TypeScript types
10. ✅ Add JSDoc comments
11. ✅ Deprecate login(email, password)

### Phase 5: Router & Integration (1-2 hours)
1. ✅ Add SSO page routes
2. ✅ Add callback route
3. ✅ Update route meta tags
4. ✅ Test route guards
5. ✅ Test navigation flow

### Phase 6: Testing & Polish (3-4 hours)
1. ✅ Functional testing
   - All SSO flows
   - Error scenarios
   - Session persistence
2. ✅ UI/UX testing
   - Responsive design
   - Loading states
   - Animations
3. ✅ Accessibility testing
   - Keyboard navigation
   - Screen reader
   - Focus management
4. ✅ Cross-browser testing
5. ✅ Documentation updates

**Total Estimated Time**: 15-21 hours

## Testing Checklist

### Functional Testing
- [ ] Talenta SSO button navigates to /auth/sso/talenta
- [ ] Idaman SSO button navigates to /auth/sso/idaman
- [ ] Talenta mock page displays only Workers and Admin users
- [ ] Idaman mock page displays only Supervisors and Leaders
- [ ] User selection generates correct authorization code format
- [ ] Authorization code includes provider, timestamp, and userId
- [ ] Callback URL has all required parameters
- [ ] Callback handler extracts userId correctly
- [ ] Talenta users authenticate successfully
- [ ] Idaman users authenticate successfully
- [ ] Admin can log in via Talenta
- [ ] Worker can log in via Talenta
- [ ] Supervisor can log in via Idaman
- [ ] Leader can log in via Idaman
- [ ] Invalid codes are rejected with clear error
- [ ] Worker attempting Idaman is rejected
- [ ] Supervisor attempting Talenta is rejected
- [ ] Session persists after page reload
- [ ] SSO provider saved in localStorage
- [ ] Logout clears SSO provider data
- [ ] Logout clears state tokens
- [ ] Back/Cancel buttons return to login
- [ ] SSO buttons navigate correctly
- [ ] State tokens generated correctly
- [ ] State tokens cleared after auth

### Error Handling
- [ ] Missing code parameter shows error
- [ ] Invalid code format shows error
- [ ] Missing provider parameter shows error
- [ ] Invalid provider parameter shows error
- [ ] User not found shows appropriate error
- [ ] Role-provider mismatch shows clear error
- [ ] Corrupted localStorage handled gracefully
- [ ] Network simulation errors handled
- [ ] Error messages are user-friendly
- [ ] Technical details available but collapsed
- [ ] "Return to Login" button works from errors
- [ ] Errors logged to console in dev mode

### UI/UX Testing
- [ ] SSO buttons visually distinct and prominent
- [ ] Talenta button uses Mekari blue (#005fbf)
- [ ] Provider logos display correctly
- [ ] User cards display all information
- [ ] Avatars load correctly
- [ ] Role badges display correctly
- [ ] Organization info shows for Idaman users
- [ ] Loading spinner displays during callback
- [ ] Success animation plays before redirect
- [ ] Error state clearly visible
- [ ] Mobile layout is usable and touch-friendly
- [ ] Tablet layout optimized
- [ ] Desktop layout uses space well
- [ ] Buttons stack vertically on mobile
- [ ] User cards responsive on all sizes
- [ ] Loading states are clear and informative
- [ ] Success states provide feedback
- [ ] Error states show actionable information
- [ ] Hover states work on desktop
- [ ] Focus states visible on all interactive elements
- [ ] Transitions smooth and professional

### Accessibility Testing
- [ ] Keyboard navigation works for all buttons
- [ ] Tab order is logical
- [ ] Enter/Space activates buttons
- [ ] Escape cancels SSO pages
- [ ] Screen reader announces SSO buttons
- [ ] Screen reader announces loading states
- [ ] Screen reader announces errors
- [ ] ARIA labels present and accurate
- [ ] Loading states announced
- [ ] Success states announced
- [ ] Error messages read by screen readers
- [ ] Focus management correct throughout flow
- [ ] Focus returns to login after cancel
- [ ] Focus on error message when shown
- [ ] Touch targets minimum 44px on mobile
- [ ] Color contrast meets WCAG AA
- [ ] No information conveyed by color alone
- [ ] Form labels associated correctly

### Security Testing (Mock)
- [ ] Role validation enforced for all users
- [ ] Talenta only allows admin/worker
- [ ] Idaman only allows supervisor/leader
- [ ] Provider validation prevents mismatches
- [ ] State tokens generated uniquely
- [ ] State tokens validated on callback
- [ ] Session data properly stored
- [ ] Logout clears all session data
- [ ] No sensitive data in URLs (except transient codes)
- [ ] Mock codes follow expected format
- [ ] Code structure parseable
- [ ] Invalid code formats rejected
- [ ] Console logging appropriate for dev mode

### Integration Testing
- [ ] Login → Talenta SSO → Callback → Dashboard
- [ ] Login → Idaman SSO → Callback → Dashboard
- [ ] SSO flow works for all user roles
- [ ] Session persistence across page reloads
- [ ] Protected routes accessible after SSO login
- [ ] Logout redirects to login correctly
- [ ] Re-login after logout works
- [ ] Route guards enforce authentication
- [ ] Permission checks work with SSO users
- [ ] Dashboard shows correct user info
- [ ] User switcher compatible with SSO (if exists)

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Success Criteria

### Must Have ✅
1. ✅ Login page shows only SSO buttons (no username/password fields)
2. ✅ "Sign in with Talenta" button redirects to Talenta mock page
3. ✅ "Sign in with Idaman" button redirects to Idaman mock page
4. ✅ Talenta mock page styled after Mekari design
5. ✅ Idaman mock page styled after IdAMan 3.0 design
6. ✅ Talenta page shows only Workers and Admin users
7. ✅ Idaman page shows only Supervisors and Leaders
8. ✅ User selection generates proper authorization code
9. ✅ Callback handler processes authentication correctly
10. ✅ Session persists with SSO provider information
11. ✅ Role-provider validation prevents mismatches
12. ✅ Error handling for all invalid scenarios
13. ✅ Mobile-responsive design for all pages
14. ✅ Loading states during authentication
15. ✅ Success feedback before redirect

### Should Have
- Clear demo user documentation
- Back/Cancel buttons on SSO pages
- User-friendly error messages
- Technical error details (collapsed)
- State token CSRF protection
- Accessibility features (keyboard, screen reader)
- Professional animations and transitions
- Provider branding (logos, colors)

### Nice to Have
- Actual Talenta/Idaman logos
- Profile avatars for mock users
- Mock code expiration (5 min)
- Used code tracking
- Detailed error logging
- Session timeout simulation
- Progress indicators
- Skeleton loading screens
- "Remember this device" option (mock)

## Migration Notes

### Breaking Changes
- ⚠️ Username/password form **removed** from login page
- ⚠️ `login(email, password)` method **deprecated**
- ⚠️ Direct credential login no longer available in UI
- ⚠️ All authentication must go through SSO flow

### Backward Compatibility
- Keep `login(email, password)` method for testing purposes
- Maintain localStorage structure (add ssoProvider field)
- Existing sessions remain valid (no forced logout)
- Old auth flow still functional via code (deprecated)

### Data Migration
- No database migration needed (prototype uses mock data)
- Existing localStorage sessions continue to work
- New logins will include ssoProvider field
- Old sessions without ssoProvider still valid
- Consider one-time cleanup of old session data

### User Communication
- Inform users about SSO change
- Provide SSO provider selection guide
- Update demo instructions
- Document role-to-provider mapping

## Documentation Updates

### Code Documentation
- JSDoc comments for all new methods
- Inline comments explaining SSO flow
- Document mock code format
- Explain role-provider validation logic
- Type definitions for SSO-related interfaces
- Comment OIDC parameter simulation

### README Updates
- Authentication section rewrite
- SSO provider documentation
- Role-to-provider mapping table
- Demo user credentials per provider
- Quick start guide for testing
- Troubleshooting common SSO issues

### Demo Instructions
- How to test Talenta authentication
- How to test Idaman authentication
- Which roles use which provider
- User selection on SSO pages
- Testing different user roles
- Error simulation for testing

### Developer Guide
- SSO flow architecture diagram
- Component interaction flowchart
- State management explanation
- Router configuration details
- Auth store API reference
- Testing strategy and checklist

## Open Questions

### High Priority
1. ✅ **RESOLVED**: Quick demo buttons removed
   - Users must go through SSO flow to authenticate
   - Legacy `login()` method kept for backward compatibility only

2. ❓ Should mock authorization codes expire?
   - **Options**: (a) No expiration, (b) 5-minute expiration, (c) Configurable
   - **Recommendation**: Implement optional 5-minute expiration for realism

3. ❓ Track and invalidate used authorization codes?
   - **Options**: (a) Allow reuse, (b) Single-use only
   - **Recommendation**: Allow reuse for testing convenience

### Medium Priority
4. ❓ Use actual Talenta/Idaman logos?
   - **Action**: Check if logos available or use placeholder icons

5. ❓ Implement state token validation strictly?
   - **Recommendation**: Yes, for security best practice demonstration

6. ❓ Add two-factor authentication simulation?
   - **Recommendation**: No, out of scope for initial revamp

7. ❓ Session timeout simulation?
   - **Recommendation**: Future enhancement, not critical

8. ❓ Show all mock users or add search/filter?
   - **Recommendation**: Show all (small dataset), add search if >10 users

### Low Priority
9. ❓ Track authentication attempts for rate limiting demo?
10. ❓ Add animation during SSO redirect?
11. ❓ Display last login timestamp in profile?
12. ❓ Show SSO provider badge in header/profile?
13. ❓ Add "Switch account" option after login?
14. ❓ Implement "Remember this device" checkbox?

## Timeline Estimate

### Development Phases
- **Phase 1 (Login Revamp)**: 2-3 hours
- **Phase 2 (SSO Mock Pages)**: 4-5 hours
- **Phase 3 (Callback Handler)**: 2-3 hours
- **Phase 4 (Auth Store)**: 3-4 hours
- **Phase 5 (Router & Integration)**: 1-2 hours
- **Phase 6 (Testing & Polish)**: 3-4 hours

**Total Estimated Time**: 15-21 hours

### Dependencies
- ✅ Shadcn Vue components (already available)
- ✅ Vue Router (already configured)
- ✅ Pinia store (already configured)
- ⚠️ TypeScript types (need User interface extension)
- ⚠️ Provider logos (need to source or create)
- ✅ Mock user data (need to expand current dataset)

## Implementation Priority

### P0 (Critical - Must Have)
1. Remove username/password from login page
2. Add SSO provider buttons
3. Create Talenta SSO mock page
4. Create Idaman SSO mock page
5. Create callback handler
6. Update auth store with SSO methods
7. Add router routes
8. Implement role-provider validation

### P1 (High Priority - Should Have)
9. Provider-specific styling
10. Loading and success states
11. Error handling and messages
12. Mobile responsive design
13. Accessibility features
14. Session persistence

### P2 (Medium Priority - Nice to Have)
15. Provider logos and branding
16. State token validation
17. User avatars
18. Animations and transitions

### P3 (Low Priority - Future)
20. Code expiration
21. Used code tracking
22. Session timeout
23. Advanced error logging
24. Analytics tracking

## References

### Related PRDs
- `03-user-roles-permissions.md` - Role definitions and SSO mapping
- `09-technical-architecture.md` - Authentication system architecture
- `01-core-system-overview.md` - SSO provider business requirements

### External Resources
- [Mekari Talenta](https://www.talenta.co/en/) - Talenta HRIS platform
- [Mekari Account Login](https://account.mekari.com) - Actual Talenta login page
- [Idaman SSO](https://login.idaman.pertamina.com) - Actual Idaman SSO page
- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html) - OIDC protocol reference
- [OAuth 2.0 Flow](https://oauth.net/2/) - OAuth authentication flow
- [Shadcn Vue Documentation](https://www.shadcn-vue.com/) - UI component library
- [Vue Router Documentation](https://router.vuejs.org/) - Routing library

### Design References
- Mekari design system colors and components
- IdAMan 3.0 UI patterns
- OIDC authentication flow diagrams
- Modern SSO page layouts

## Appendix

### A. Mock Authorization Code Format
```
MOCK_{PROVIDER}_{TIMESTAMP}_{USERID}

Examples:
- MOCK_TALENTA_1703001234567_admin1
- MOCK_IDAMAN_1703001234567_supervisor1

Structure:
- Prefix: MOCK_ (identifies as mock code)
- Provider: TALENTA or IDAMAN (uppercase)
- Timestamp: Unix timestamp in milliseconds
- UserId: User identifier from mock database
```

### B. OIDC Parameters Reference

**Talenta (Mekari) Simulation:**
```
response_type: code id_token
scope: openid profile email talenta.read
client_id: cmms-app-mock
redirect_uri: https://{app}/auth/callback
state: {random_string}
nonce: {random_string}
```

**Idaman SSO Simulation:**
```
response_type: code id_token
scope: openid profile api.auth user.role user.read position.readAll offline_access
client_id: 2d7678f6-2f42-4005-8cf2-0107709fa4ef
redirect_uri: https://{app}/auth/callback
response_mode: form_post
state: {random_string}
nonce: {random_string}
```

### C. Error Code Reference

| Code | Message | User Action |
|------|---------|-------------|
| ERR_INVALID_CODE | Invalid authorization code format | Return to login |
| ERR_MISSING_PARAM | Missing required parameter | Return to login |
| ERR_USER_NOT_FOUND | User not found | Contact support |
| ERR_ROLE_MISMATCH | Role doesn't match SSO provider | Use correct SSO provider |
| ERR_INVALID_PROVIDER | Invalid SSO provider | Return to login |
| ERR_STATE_MISMATCH | Invalid state parameter (CSRF) | Start over - security error |
| ERR_CODE_EXPIRED | Authorization code expired | Sign in again |
| ERR_CODE_USED | Authorization code already used | Sign in again |

## Version History
- **v1.0** (2025-12-19): Initial SSO login revamp plan with realistic Talenta/Idaman design references
- **v1.1** (2025-12-19): Implementation completed - Removed Quick Demo Access buttons from login page, users must authenticate via SSO flow
- **v1.2** (2025-12-19): Updated with actual brand colors and logos:
  - Talenta: Red (#E31E24) with SVG logo
  - IdAMan: Blue (#0066CC) with SVG logo
  - All components updated with consistent branding
- **v1.3** (2025-12-19): Cross-platform compatibility fix:
  - Replaced Shadcn Button component with native HTML buttons
  - Used inline styles with Vue reactivity for color states
  - Ensures consistent rendering across all operating systems (Windows, macOS, Linux)
  - Fixed black button background issue on Linux systems
