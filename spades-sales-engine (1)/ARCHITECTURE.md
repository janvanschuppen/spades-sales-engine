# Spades Sales Engine - Domain Architecture & Specification

## 1. Core Domain Entities

### 1.1 User
*   **Purpose:** Represents an identity capable of authenticating into the system.
*   **Ownership:** System-level (Authentication Provider).
*   **Required Fields:** `id` (UUID), `email` (string), `passwordHash` (string), `role` (enum: 'admin'|'user'), `isVerified` (boolean).
*   **Optional Fields:** `lastLoginAt` (timestamp), `verificationToken` (string).
*   **Relationships:**
    *   Has one **UserProfile** (1:1).
    *   Belongs to one **Company** (N:1, currently enforced 1:1 via domain matching).

### 1.2 Company
*   **Purpose:** The business entity being analyzed and automated.
*   **Ownership:** User (Creator).
*   **Required Fields:** `id` (UUID), `name` (string), `domain` (string), `websiteUrl` (string).
*   **Optional Fields:** `industry` (string), `size` (string).
*   **Relationships:**
    *   Has many **Users**.
    *   Has one **Subscription** (1:1).
    *   Has one **CoreProduct** (1:1).
    *   Has one **ICP** (1:1).
    *   Has one **MarketAnalysis** (1:1).
    *   Has many **Documents** (1:N).

### 1.3 UserProfile
*   **Purpose:** User-specific configuration and display details.
*   **Ownership:** User.
*   **Required Fields:** `userId` (FK), `firstName` (string), `lastName` (string).
*   **Optional Fields:** `phoneNumber` (string), `jobTitle` (string).
*   **Relationships:**
    *   Belongs to **User**.

### 1.4 CoreProduct
*   **Purpose:** The extracted and refined definition of what the company sells.
*   **Ownership:** Company.
*   **Required Fields:** `companyId` (FK), `offerStructure` (string), `positioningStatement` (string).
*   **Optional Fields:** `pricePoints` (array<string>), `trustMarkers` (array<string>).
*   **Dependencies:** Derived initially from `WebsiteData`, refined by User.

### 1.5 ICP (Ideal Customer Profile)
*   **Purpose:** structured definition of the target audience for outreach.
*   **Ownership:** Company.
*   **Required Fields:** `companyId` (FK), `title` (string), `description` (string).
*   **Optional Fields:** `roles` (array), `industries` (array), `geography` (array), `painPoints` (array).
*   **Dependencies:** Generated from `CoreProduct` and `MarketAnalysis`.

### 1.6 MarketAnalysis
*   **Purpose:** AI-generated analysis of the company's market position.
*   **Ownership:** Company (System-Generated).
*   **Required Fields:** `companyId` (FK), `rawAnalysis` (JSON), `generatedAt` (timestamp).
*   **Access:** Read-only for User. Regeneratable by System.

### 1.7 Document
*   **Purpose:** Training files uploaded by the user to context-load the AI.
*   **Ownership:** Company.
*   **Required Fields:** `id` (UUID), `companyId` (FK), `storageKey` (string), `name` (string), `mimeType` (string), `size` (integer).
*   **Relationships:** Used by **Pipeline** generation.

### 1.8 Subscription
*   **Purpose:** Tracks the billing status and feature access level.
*   **Ownership:** System (Billing).
*   **Required Fields:** `companyId` (FK), `tier` (enum: 'free'|'mid'|'full'), `status` (enum: 'active'|'past_due'|'cancelled').
*   **Optional Fields:** `stripeCustomerId` (string), `currentPeriodEnd` (timestamp).

### 1.9 OnboardingState
*   **Purpose:** Tracks the progress of a Company through the setup wizard.
*   **Ownership:** Company.
*   **Required Fields:** `companyId` (FK), `analysisComplete` (bool), `icpGenerated` (bool), `profileCompleted` (bool).
*   **Optional Fields:** `docsUploaded` (bool), `qaCompleted` (bool), `videoWatched` (bool).

### 1.10 DashboardState
*   **Purpose:** Transient state for UI preferences (e.g., dismissed welcomes).
*   **Ownership:** User (Local).
*   **Fields:** `hasSeenWelcome` (bool), `hasSeenTransition` (bool).

### 1.11 CRMContact (External Reference)
*   **Purpose:** Mapping between Internal User/Company and External CRM (Close).
*   **Ownership:** System (Integration).
*   **Required Fields:** `userId` (FK), `externalLeadId` (string), `externalContactId` (string), `lastSyncedAt` (timestamp).

---

## 2. Lifecycle States & Transitions

### 2.1 User Lifecycle
| State | Meaning | Allowed Transitions | Trigger Event |
| :--- | :--- | :--- | :--- |
| `REGISTERED` | Account created, email unverified. | `VERIFIED` | `EmailVerified` |
| `VERIFIED` | Email confirmed, full access enabled. | `SUSPENDED` | `AdminSuspend` |
| `SUSPENDED` | Access blocked. | `VERIFIED` | `AdminUnsuspend` |

### 2.2 Onboarding Lifecycle
| State | Meaning | Allowed Transitions | Trigger Event |
| :--- | :--- | :--- | :--- |
| `NOT_STARTED` | No URL analyzed. | `ANALYSIS_COMPLETE` | `CompanyURLSubmitted` |
| `ANALYSIS_COMPLETE` | Website scraped. | `ICP_GENERATED` | `ICPGenerated` |
| `ICP_GENERATED` | Target audience defined. | `PROFILE_COMPLETE` | `UserProfileUpdated` |
| `PROFILE_COMPLETE` | User details added. | `READY` | `OnboardingStepCompleted` |
| `READY` | All inputs gathered. | `COMPLETED` | `EngineInitialized` |

### 2.3 Subscription Lifecycle
| State | Meaning | Allowed Transitions | Trigger Event |
| :--- | :--- | :--- | :--- |
| `FREE` | Default tier. | `MID`, `FULL` | `SubscriptionUpgraded` |
| `MID` | Paid tier 1. | `FREE`, `FULL`, `CANCELLED` | `SubscriptionDowngraded` |
| `FULL` | Paid tier 2. | `FREE`, `MID`, `CANCELLED` | `SubscriptionDowngraded` |

---

## 3. System Events

| Event Name | Trigger | Payload | Affected Entities | Consumers |
| :--- | :--- | :--- | :--- | :--- |
| `UserRegistered` | Form Submit | `email`, `password`, `domain` | User, Company | Email Service, Auth |
| `EmailVerificationSent`| `UserRegistered` | `userId`, `token` | User | Email Service |
| `EmailVerified` | Token Click | `token` | User | Auth, CRM Service |
| `CompanyURLSubmitted` | Landing Page | `url` | Company, CoreProduct | AI Service, Onboarding |
| `CompanyDomainValidated`| Registration | `email`, `url` | User | Auth Validator |
| `ICPGenerated` | Auto/Manual | `companyId`, `icpData` | ICP, Onboarding | AI Service |
| `ICPUpdated` | User Edit | `companyId`, `icpData` | ICP | AI Service |
| `CRMContactCreated` | `EmailVerified` | `userId`, `crmId` | CRMContact | CRM Service |
| `DocumentUploaded` | File Input | `companyId`, `fileBlob` | Document | AI Service |

---

## 4. Access Rules by Subscription Tier

| Feature / Entity | Action | Free | Mid | Full |
| :--- | :--- | :--- | :--- | :--- |
| **Website Analysis** | Create/View | ✅ | ✅ | ✅ |
| **ICP** | View | ✅ | ✅ | ✅ |
| **ICP** | Edit/Regenerate | ✅ | ✅ | ✅ |
| **Market Analysis** | View | ❌ | ✅ | ✅ |
| **Email Sequences** | Generate | ✅ | ✅ | ✅ |
| **CRM Integration** | Connect/Sync | ❌ | ✅ | ✅ |
| **Lead Routing** | Configure | ✅ | ✅ | ✅ |
| **Inbound Engine** | Active | ❌ | ✅ | ✅ |
| **Voice Agents** | Deploy | ❌ | ✅ | ✅ |
| **Video Production** | Generate | ❌ | ❌ | ✅ |
| **Social Content** | Generate | ❌ | ❌ | ✅ |
| **Personal Strategy**| Access | ❌ | ❌ | ✅ |

*Enforcement:* Backend API endpoints must check `Company.Subscription.tier` before executing logic for restricted features.

---

## 5. External System Boundaries

### 5.1 Email System (Transactional)
*   **Purpose:** Account verification and system notifications.
*   **Trigger:** `UserRegistered` event.
*   **Failure Behavior:** If email fails, UI must allow "Resend Verification". Account remains in `REGISTERED` state (blocked).

### 5.2 CRM (Close)
*   **Purpose:** The destination for all generated leads and the "Single Source of Truth" for sales activity.
*   **Trigger:** `EmailVerified` event (Initial Sync).
*   **Mapping:**
    *   App `Company` -> Close `Lead`.
    *   App `User` -> Close `Contact`.
*   **Failure Behavior:** Retry 3 times with exponential backoff. If fail, log to `SystemLogs` and alert Admin. User can continue using App, but `CRMContact` status will be 'error'.

### 5.3 AI Service (Gemini)
*   **Purpose:** Analysis, content generation, reasoning.
*   **Trigger:** User actions (Analyze, Generate ICP).
*   **Failure Behavior:** Fallback to mock/template data to prevent blocking the user flow. UI displays "Analysis Estimate" or "Draft" tag.

---

## 6. Data Ownership & Integrity Rules

1.  **Immutable Identity:** A User's `email` domain MUST match the Company's `websiteUrl` domain. This is enforced at Registration. Modification of Company Domain is restricted to Admin only.
2.  **User-Editable Data:** Users may edit `UserProfile`, `ICP` details, and uploaded `Documents`.
3.  **System-Generated Data:** `MarketAnalysis` is read-only for users to ensure objective benchmarking. `Subscription` status is read-only and modified only via payment callbacks.
4.  **Isolation:** All data queries must be scoped by `companyId`. Users cannot access data belonging to other Companies.
5.  **Persistence:** All `OnboardingState` and `CoreProduct` data is persisted to LocalStorage (in current architecture) or DB (target architecture) immediately on change to prevent data loss during page reloads.

---

## 7. Summary

This specification defines a **Company-centric** architecture where the **User** acts as an agent of the company. The core value flow moves from **Analysis** (WebsiteData) to **Definition** (ICP/Product) to **Execution** (CRM/Voice/Video).

**Key Risk:** The tight coupling of Email Domain to Website Domain (`validateDomainMatch`) is a strong security feature but may cause friction for legitimate users (e.g., consultants, agencies). The `Request Access` exception flow is critical to mitigate this.
