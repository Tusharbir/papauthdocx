# PapDocAuthX+ v2 - Frontend

## 🎨 Enterprise Document Verification Web Application

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.x-blue.svg)](https://mui.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Modern, responsive web application for zero-document-upload cryptographic verification of sensitive documents

---

## ✨ Key Features

### 🔐 **Advanced Authentication System**
- JWT-based authentication with secure token management
- Role-Based Access Control (RBAC): Superadmin, Admin, User/Verifier
- Protected routes with automatic redirection
- Persistent sessions using localStorage

### 📄 **Multi-Modal Document Verification**

#### **1. File Upload Verification**
- Drag-and-drop PDF/image upload
- Client-side hash extraction (text, image, signature, stamp)
- ROI (Region of Interest) selector for signatures and stamps
- Real-time Merkle root computation
- **Privacy-first**: Documents never leave user's device

#### **2. QR Code Verification** 
- Upload QR code image (screenshot/photo)
- Automatic QR decoding using jsQR library
- Parse `papdocauthx://docId/versionHash` format
- Auto-fill verification form
- No camera permissions required

#### **3. Manual Hash Entry**
- Direct input of document ID and version hash
- Copy-paste support from documents
- Email-based verification workflow

### 📊 **Role-Based Dashboards**

#### **Superadmin Dashboard**
- Global system analytics and statistics
- Create and manage organizations
- Assign organization administrators
- View all users across the platform
- System-wide document analytics
- Complete audit trail access

#### **Admin Dashboard**
- Organization-scoped document management
- Upload documents with multimodal hashing
- Browse and search documents (org-filtered)
- View document version history
- Generate QR codes for documents
- Manage organization users
- Organization-level analytics

#### **User/Verifier Dashboard**
- Document verification interface
- Personal verification history
- QR code scanner
- Verification statistics

### 🎨 **Theme System**
- **Light & Dark Mode** with smooth transitions
- Persistent theme preferences
- Theme-aware components throughout application
- Accessible color contrasts (WCAG compliant)
- Material-UI + TailwindCSS hybrid styling

### 📱 **Responsive Design**
- Mobile-first responsive layout
- Touch-friendly controls
- Adaptive layouts for tablet and desktop
- Progressive Web App (PWA) capabilities
- Cross-browser compatibility

### 🔍 **Document Management**

#### **Documents List**
- Search by document ID or type
- Filter by status (Approved, Revoked)
- Sort by date, version, organization
- Pagination for large datasets
- Quick document preview cards

#### **Document Details**
- Version history timeline
- Hash breakdown visualization
- QR code display
- Revocation status and history
- Organization information
- Downloadable verification reports

#### **Document Upload**
- Multi-step upload wizard
- ROI selector for signature/stamp regions
- Hash preview before submission
- Automatic Merkle root calculation
- Instant QR code generation
- Upload confirmation with QR code

### 👥 **User & Organization Management**

#### **Organization Management**
- Create and edit organizations
- Verify organization status
- Assign organization admins
- View organization members
- Track organization documents

#### **User Management**
- User list with role filtering
- Search by name or email
- Role assignment interface
- User activity tracking
- **Superadmin exclusion** from public user lists (privacy feature)

### 📈 **Analytics & Reporting**
- **Verification Trends**: Line charts showing verification count over time
- **Revocation Analytics**: Track revoked documents by week
- **Document Access Stats**: Most accessed documents with bar charts
- **Tamper Score Distribution**: Security metrics visualization
- **Organization Insights**: Org-specific analytics

### 🔄 **Additional Features**
- **Workflow Management**: State transition orchestration UI (backend pending)
- **Revocation System**: Document revocation interface with reason tracking (backend pending)
- **QR Code Generation**: Create scannable QR codes for documents
- **Audit Trail**: View tamper-proof verification history
- **Empty State Handling**: Graceful fallbacks for no data
- **Error Boundaries**: Robust error handling throughout

---

## 🛠️ Technology Stack

- **React 18.x** - Modern React with hooks and concurrent features
- **React Router v6** - Client-side routing
- **Material-UI (MUI) 5.x** - Enterprise component library
- **TailwindCSS 3.x** - Utility-first CSS
- **Zustand** - Lightweight state management
- **React Query** - Server state & caching
- **Axios** - HTTP client
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **jsQR** - QR code decoding
- **Notistack** - Toast notifications

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18.x or higher
- npm or yarn
- PapDocAuthX+ Backend running (port 4000)

### Install Dependencies
```bash
npm install
```

### Environment Configuration
Create `.env` file:
```bash
REACT_APP_API_URL=http://localhost:4000
REACT_APP_NAME=PapDocAuthX+
REACT_APP_VERSION=2.0.0
```

### Start Development Server
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📜 Available Scripts

### `npm start`
Runs the app in development mode. Hot-reload enabled.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build/` folder.
- Minified code
- Optimized bundles
- Ready for deployment

### `npm run eject`
⚠️ **One-way operation!** Ejects from Create React App.

---

## 📁 Project Structure

```
src/
├── api/                 # API integration layer
│   ├── authApi.js
│   ├── documentApi.js
│   ├── verificationApi.js
│   ├── analyticsApi.js
│   └── axiosInstance.js
├── components/          # Reusable components
│   ├── admin/          # Admin-specific components
│   ├── layout/         # Layout components
│   ├── ui/             # UI components
│   └── verification/   # Verification components
├── layouts/            # Page layouts
├── pages/              # Application pages
│   ├── Analytics/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Documents/
│   ├── Organizations/
│   ├── Users/
│   ├── Verification/
│   └── QR/
├── store/              # Zustand stores
│   ├── authStore.js
│   └── uiStore.js
├── theme/              # MUI theme
├── utils/              # Utilities
├── App.js              # Root component
└── index.js            # Entry point
```

---

## 🎯 Key Workflows

### **Document Verification Flow**
1. User selects verification mode (File/QR/Manual)
2. System extracts/decodes document hashes
3. Backend validates against stored hashes
4. Result displayed with cryptographic breakdown

### **Document Upload Flow**
1. Admin uploads document
2. Client extracts multimodal hashes
3. User selects signature/stamp regions (ROI)
4. Merkle root computed
5. Backend stores hash fingerprint
6. QR code generated and displayed

### **User Authentication**
1. User enters credentials
2. JWT token received from backend
3. Token stored in localStorage + Zustand
4. Axios interceptor adds token to requests
5. Protected routes accessible

---

## 🚀 Deployment

### **Production Build**
```bash
npm run build
```

### **Deploy to Netlify**
```bash
netlify deploy --prod --dir=build
```

### **Deploy to Vercel**
```bash
vercel --prod
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Tusharbir/papauthdocx/issues)
- **Email**: lovepreetsinghvirdi001@gmail.com

---

**Built with ❤️ by the PapDocAuthX+ Team**
