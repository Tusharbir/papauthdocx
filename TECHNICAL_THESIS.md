# PapDocAuthX: A Comprehensive Technical Thesis
## Advanced Database Technologies & Multi-Modal Document Authentication System

Advanced Database Technologies (ADT) - Fall 2025  
**Date**: November 19, 2025  
**Repository**: PapDocAuth-X (lovepreet-singh-virdi)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture & Design Philosophy](#2-system-architecture--design-philosophy)
3. [Polyglot Persistence Architecture](#3-polyglot-persistence-architecture)
4. [Database Schema Design](#4-database-schema-design)
5. [Advanced Database Concepts](#5-advanced-database-concepts)
6. [Cryptographic Architecture](#6-cryptographic-architecture)
7. [Multi-Modal Authentication](#7-multi-modal-authentication)
8. [Transaction Management & ACID Compliance](#8-transaction-management--acid-compliance)
9. [Security & Audit Trail Architecture](#9-security--audit-trail-architecture)
10. [Code Examples & Implementation Patterns](#10-code-examples--implementation-patterns)
11. [Scalability Strategies](#11-scalability-strategies)
12. [Research References & Academic Foundation](#12-research-references--academic-foundation)
13. [Future Work & Extensions](#13-future-work--extensions)

---

## 1. Executive Summary

### 1.1 Project Overview

PapDocAuthX is an enterprise-grade document authentication and verification system that leverages **polyglot persistence** (PostgreSQL + MongoDB) to provide cryptographically secure document management with tamper-proof audit trails. The system is designed for organizations requiring high-assurance document verification—universities issuing degrees, companies generating offer letters, and verification authorities validating credentials.

### 1.2 Key Innovations

1. **Polyglot Persistence Design**: Strategic separation of relational (users, organizations, access control) and document-oriented (cryptographic hashes, version history) data stores
2. **Multi-Modal Authentication**: Support for text, image, signature, and stamp verification using Merkle tree cryptography
3. **Tamper-Proof Audit Chain**: SHA-256 hash chaining across all audit events with cryptographic integrity verification
4. **Version Hash Chain**: Document versioning with cryptographic linking similar to blockchain architecture
5. **Idempotent Migrations**: Safe database schema evolution with `CREATE IF NOT EXISTS` patterns
6. **Sequelize Transaction Management**: ACID-compliant operations with automatic rollback on failure

### 1.3 Technology Stack

**Backend**:
- Node.js v18+ with Express.js
- PostgreSQL 14+ (Sequelize ORM v6.35+)
- MongoDB 6.0+ (Mongoose ODM v8.0+)
- Cryptographic libraries: Node.js `crypto` module (SHA-256)

**Frontend**:
- React 18 (Create React App)
- Material-UI (MUI) v5 for components
- Tailwind CSS for utility styling
- React Query for state management

**Infrastructure**:
- RESTful API architecture
- JWT-based authentication
- Role-Based Access Control (RBAC)

---

## 2. System Architecture & Design Philosophy

### 2.1 Architectural Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT TIER                             │
│  React SPA (Port 3000) - MUI + Tailwind + React Query      │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS REST API
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                          │
│  Express.js (Port 4000) - Node.js Runtime                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Routes    │  │  Controllers │  │   Middleware    │   │
│  │  (REST API) │→ │   (Business  │→ │ (Auth, RBAC,    │   │
│  │             │  │    Logic)    │  │  Error Handler) │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
│         │                  │                                │
│         ↓                  ↓                                │
│  ┌─────────────┐    ┌──────────────┐                       │
│  │  Services   │    │  Services    │                       │
│  │  (Postgres) │    │  (MongoDB)   │                       │
│  └─────────────┘    └──────────────┘                       │
└────────┬────────────────────┬───────────────────────────────┘
         │                    │
         ↓                    ↓
┌─────────────────┐  ┌──────────────────────┐
│   PostgreSQL    │  │      MongoDB         │
│  (Relational)   │  │  (Document Store)    │
│                 │  │                      │
│ • users         │  │ • documents          │
│ • organizations │  │ • documentversions   │
│ • roles         │  │ • hashparts          │
│ • audit_logs    │  │                      │
│ • access_reqs   │  │                      │
└─────────────────┘  └──────────────────────┘
```

### 2.2 Design Principles

#### 2.2.1 Separation of Concerns
- **Relational Data (PostgreSQL)**: User accounts, organization hierarchies, role assignments, access requests, audit logs
- **Document Data (MongoDB)**: Cryptographic hashes, document versions, metadata, Merkle trees

**Rationale**: PostgreSQL provides ACID guarantees for referential integrity critical to access control. MongoDB offers flexible schema for variable-structure cryptographic data and high-volume document versioning.

#### 2.2.2 Domain-Driven Design
Each database models a distinct bounded context:
- **Identity & Access Context** → PostgreSQL
- **Document Verification Context** → MongoDB
- **Audit & Compliance Context** → PostgreSQL (tamper-proof chain)

#### 2.2.3 CAP Theorem Considerations
- **PostgreSQL**: CP (Consistency + Partition Tolerance) - strong consistency for access control
- **MongoDB**: AP (Availability + Partition Tolerance) - eventual consistency acceptable for document versions

---

## 3. Polyglot Persistence Architecture

### 3.1 Theoretical Foundation

**Polyglot persistence** refers to using multiple database technologies within a single application to optimize for different data access patterns and consistency requirements. This approach contrasts with traditional single-database architectures.

**Academic Reference**:
> Sadalage, P. J., & Fowler, M. (2012). *NoSQL Distilled: A Brief Guide to the Emerging World of Polyglot Persistence*. Addison-Wesley Professional.

### 3.2 Data Distribution Strategy

| Data Type | Database | Justification |
|-----------|----------|---------------|
| Users, Organizations, Roles | PostgreSQL | Referential integrity, ACID transactions, complex joins |
| Access Requests | PostgreSQL | Workflow state machine, foreign key constraints |
| Audit Logs | PostgreSQL | Immutable append-only log, strong consistency |
| Documents, Versions | MongoDB | Schema flexibility, high write throughput |
| Hash Parts (Merkle Tree) | MongoDB | Variable structure, batch operations |
| File Metadata | MongoDB | Nested objects, GridFS integration |

### 3.3 Cross-Database Consistency

**Challenge**: Maintaining consistency across PostgreSQL and MongoDB without distributed transactions.

**Solution**: **Saga Pattern** with compensating transactions:

```javascript
// Example: Document upload with audit logging
async function uploadDocumentVersion({ orgId, userId, docId, hashes }) {
  const mongoSession = await mongoose.startSession();
  
  try {
    // Step 1: MongoDB transaction (ACID within MongoDB)
    const result = await mongoSession.withTransaction(async () => {
      // Create document version
      const version = await DocumentVersion.create([{ 
        docId, versionNumber, merkleRoot, versionHash 
      }], { session: mongoSession });
      
      // Create hash parts
      await HashPart.create([{ 
        docId, versionNumber, textHash, imageHash 
      }], { session: mongoSession });
      
      return version;
    });
    
    // Step 2: PostgreSQL audit log (separate transaction)
    // If this fails, MongoDB transaction has already committed
    await addAuditEntry({ userId, orgId, docId, action: "UPLOAD" });
    
    return result;
  } catch (err) {
    // Compensating action: Mark document as PENDING in MongoDB
    await DocumentVersion.updateOne(
      { docId, versionNumber },
      { workflowStatus: "PENDING" }
    );
    throw err;
  } finally {
    mongoSession.endSession();
  }
}
```

**Trade-off**: Eventual consistency for audit logs is acceptable (audit failures don't prevent document upload, but all failures are logged for manual review).

### 3.4 Connection Pooling & Performance

**PostgreSQL Configuration** (Sequelize):
```javascript
// src/config/dbPostgres.js
export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  pool: {
    max: 20,          // Maximum connections
    min: 5,           // Minimum connections
    acquire: 30000,   // Max time to acquire connection (ms)
    idle: 10000       // Max idle time before release (ms)
  },
  logging: false,     // Disable SQL logging in production
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});
```

**MongoDB Configuration** (Mongoose):
```javascript
// src/config/dbMongo.js
mongoose.connect(MONGO_URI, {
  maxPoolSize: 50,       // Connection pool size
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority'          // Write concern: majority acknowledgment
});
```

---

## 4. Database Schema Design

### 4.1 PostgreSQL Schema (Relational)

#### 4.1.1 Users Table
```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50) NOT NULL 
                CHECK (role IN ('superadmin', 'admin', 'verifier')),
  org_id        INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org_id ON users(org_id);
```

**Sequelize Model**:
```javascript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/dbPostgres.js";

export class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("superadmin", "admin", "verifier"),
    allowNull: false,
  },
  orgId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Superadmin has no org
  },
}, {
  sequelize,
  modelName: "User",
  tableName: "users",
});
```

#### 4.1.2 Organizations Table
```sql
CREATE TABLE organizations (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL UNIQUE,
  slug       VARCHAR(255) NOT NULL UNIQUE,
  type       VARCHAR(50) DEFAULT 'organization',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
```

**Sequelize Model with Hooks**:
```javascript
export class Organization extends Model {}

Organization.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.STRING, allowNull: false, defaultValue: "organization" },
}, {
  sequelize,
  modelName: "Organization",
  tableName: "organizations",
  hooks: {
    beforeValidate: (org) => {
      // Auto-generate slug from name
      if (org.name && !org.slug) {
        org.slug = org.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
    },
  },
});
```

#### 4.1.3 Access Requests Table (Fixed Schema)
```sql
-- Idempotent enum creation
CREATE TYPE IF NOT EXISTS enum_access_requests_status AS ENUM 
  ('pending', 'approved', 'rejected');

-- Idempotent table creation
CREATE TABLE IF NOT EXISTS access_requests (
  id           SERIAL PRIMARY KEY,
  email        VARCHAR(255) NOT NULL,
  name         VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  reason       TEXT,
  status       enum_access_requests_status DEFAULT 'pending',
  reviewedby   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewedat   TIMESTAMPTZ,
  reviewnotes  TEXT,
  createdat    TIMESTAMPTZ DEFAULT NOW(),
  updatedat    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_requests_email_status 
  ON access_requests(email, status);
```

**Critical Fix**: Sequelize model with explicit `field` mappings to avoid case-sensitivity errors:

```javascript
export class AccessRequest extends Model {}

AccessRequest.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  organization: { type: DataTypes.STRING },
  reason: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewedBy: { 
    type: DataTypes.INTEGER, 
    field: 'reviewedby'  // Maps camelCase to lowercase
  },
  reviewedAt: { 
    type: DataTypes.DATE, 
    field: 'reviewedat' 
  },
  reviewNotes: { 
    type: DataTypes.TEXT, 
    field: 'reviewnotes' 
  }
}, {
  sequelize,
  modelName: "AccessRequest",
  tableName: "access_requests",
  underscored: true,  // Auto-convert future fields to snake_case
});
```

**Lesson Learned**: PostgreSQL treats unquoted identifiers as case-insensitive (lowercased), but Sequelize generates quoted identifiers by default. Using explicit `field` mappings ensures column name consistency.

#### 4.1.4 Audit Logs Table (Tamper-Proof Chain)
```sql
CREATE TYPE IF NOT EXISTS enum_audit_action AS ENUM 
  ('UPLOAD', 'APPROVE', 'REVOKE', 'CRYPTO_CHECK', 'VERIFIED');

CREATE TABLE IF NOT EXISTS audit_logs (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  org_id          INTEGER NOT NULL REFERENCES organizations(id),
  doc_id          VARCHAR(255) NOT NULL,
  action          enum_audit_action NOT NULL,
  prev_audit_hash VARCHAR(64),
  audit_hash      VARCHAR(64) NOT NULL,  -- SHA-256 hash
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_doc 
  ON audit_logs(org_id, doc_id, timestamp DESC);

CREATE INDEX idx_audit_logs_user 
  ON audit_logs(user_id, timestamp DESC);
```

**Hash Chain Formula**:
```
auditHash = SHA256(
  userId + orgId + docId + action + timestamp + prevAuditHash + SECRET
)
```

**Code Implementation**:
```javascript
// src/services/hashingService.js
export function computeAuditHash({
  userId, orgId, docId, action, timestampISO, prevAuditHash = ""
}) {
  const data = `${userId}${orgId}${docId}${action}${timestampISO}${prevAuditHash}${env.hashSecret}`;
  return sha256(data);
}
```

### 4.2 MongoDB Schema (Document Store)

#### 4.2.1 Documents Collection
```javascript
// src/models/mongo/Document.js
const DocumentSchema = new mongoose.Schema({
  docId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  type: { 
    type: String, 
    required: true 
  }, // e.g., "degree", "offer_letter"
  ownerOrgId: { 
    type: Number, 
    required: true,
    index: true 
  }, // References SQL organizations.id
  currentVersion: { 
    type: Number, 
    default: 0 
  },
  metadata: {
    fileType: String,
    pageCount: Number,
    sizeInKB: Number,
    mimeType: String,
  },
  versionHashChain: {
    type: [String],  // Array of version hashes
    default: []
  }
}, { 
  timestamps: true,
  collection: 'documents'
});

// Compound index for organization queries
DocumentSchema.index({ ownerOrgId: 1, createdAt: -1 });

export const Document = mongoose.model("Document", DocumentSchema);
```

#### 4.2.2 Document Versions Collection
```javascript
// src/models/mongo/DocumentVersion.js
const DocumentVersionSchema = new mongoose.Schema({
  docId: { 
    type: String, 
    required: true,
    index: true 
  },
  versionNumber: { 
    type: Number, 
    required: true 
  },
  merkleRoot: { 
    type: String, 
    required: true 
  },
  prevVersionHash: { 
    type: String, 
    default: null 
  },
  versionHash: { 
    type: String, 
    required: true 
  },
  workflowStatus: {
    type: String,
    enum: ["APPROVED", "PENDING", "REVOKED"],
    default: "APPROVED",
  },
  createdByUserId: { 
    type: Number, 
    required: true 
  },
  ownerOrgId: { 
    type: Number, 
    required: true 
  },
}, { 
  timestamps: true,
  collection: 'documentversions'
});

// Compound unique index
DocumentVersionSchema.index({ 
  docId: 1, 
  versionNumber: 1 
}, { unique: true });

export const DocumentVersion = mongoose.model(
  "DocumentVersion", 
  DocumentVersionSchema
);
```

#### 4.2.3 Hash Parts Collection (Multi-Modal)
```javascript
// src/models/mongo/HashPart.js
const HashPartSchema = new mongoose.Schema({
  docId: { 
    type: String, 
    required: true 
  },
  versionNumber: { 
    type: Number, 
    required: true 
  },
  textHash: { 
    type: String, 
    required: true 
  },
  imageHash: { 
    type: String, 
    default: "" 
  },
  signatureHash: { 
    type: String, 
    default: "" 
  },
  stampHash: { 
    type: String, 
    default: "" 
  },
  ownerOrgId: { 
    type: Number, 
    required: true 
  },
  createdByUserId: { 
    type: Number 
  }
}, { 
  timestamps: true,
  collection: 'hashparts'
});

// Compound unique index
HashPartSchema.index({ 
  docId: 1, 
  versionNumber: 1 
}, { unique: true });

export const HashPart = mongoose.model("HashPart", HashPartSchema);
```

**Multi-Modal Hash Structure**:
```
HashPart = {
  textHash:      SHA256(extracted_text),
  imageHash:     pHash(embedded_images),      // Perceptual hash
  signatureHash: SIFT_features(signatures),   // Feature vectors
  stampHash:     SHA256(official_stamp_region)
}
```

---

## 5. Advanced Database Concepts

### 5.1 Sequelize Transactions (ACID Compliance)

Sequelize provides managed transactions with automatic rollback on errors.

#### 5.1.1 Managed Transactions
```javascript
// Example: Creating user with role assignment in a transaction
import { sequelize } from "../config/dbPostgres.js";
import { User } from "../models/sql/User.js";
import { UserRole } from "../models/sql/UserRole.js";

async function createUserWithRole({ fullName, email, passwordHash, role, orgId }) {
  return await sequelize.transaction(async (t) => {
    // All operations within this transaction
    const user = await User.create({
      fullName, email, passwordHash, role, orgId
    }, { transaction: t });
    
    await UserRole.create({
      userId: user.id,
      roleId: role === 'admin' ? 1 : 2
    }, { transaction: t });
    
    // If any operation fails, entire transaction rolls back
    return user;
  });
}
```

#### 5.1.2 Isolation Levels
```javascript
// Read Committed (default)
await sequelize.transaction({ 
  isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED 
}, async (t) => {
  // Transaction logic
});

// Serializable (strongest isolation)
await sequelize.transaction({ 
  isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE 
}, async (t) => {
  // Prevents phantom reads
});
```

### 5.2 MongoDB Transactions

MongoDB supports multi-document ACID transactions (MongoDB 4.0+).

#### 5.2.1 Session-Based Transactions
```javascript
// Example from documentService.js
async function uploadDocumentVersion({ orgId, userId, docId, hashes }) {
  const session = await mongoose.startSession();
  
  try {
    return await session.withTransaction(async () => {
      // Create document (if new)
      let doc = await Document.findOne({ docId }).session(session);
      if (!doc) {
        [doc] = await Document.create([{
          docId, ownerOrgId: orgId, currentVersion: 0
        }], { session });
      }
      
      // Increment version
      const versionNumber = doc.currentVersion + 1;
      
      // Create version record
      await DocumentVersion.create([{
        docId, versionNumber, merkleRoot, versionHash
      }], { session });
      
      // Create hash parts
      await HashPart.create([{
        docId, versionNumber, textHash, imageHash
      }], { session });
      
      // Update document
      doc.currentVersion = versionNumber;
      doc.versionHashChain.push(versionHash);
      await doc.save({ session });
      
      return { versionNumber, versionHash };
    }, {
      readPreference: 'primary',
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' }
    });
  } finally {
    session.endSession();
  }
}
```

**Transaction Guarantees**:
- **Atomicity**: All operations succeed or all fail
- **Consistency**: Schema validation enforced
- **Isolation**: Snapshot isolation prevents dirty reads
- **Durability**: Write concern `w: 'majority'` ensures replication

### 5.3 Indexing Strategies

#### 5.3.1 PostgreSQL Indexes
```sql
-- B-Tree indexes (default)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Composite index for multi-column queries
CREATE INDEX idx_access_requests_email_status 
  ON access_requests(email, status);

-- Partial index for specific query patterns
CREATE INDEX idx_pending_access_requests 
  ON access_requests(createdat DESC) 
  WHERE status = 'pending';

-- GIN index for full-text search (future)
CREATE INDEX idx_documents_search 
  ON documents USING GIN(to_tsvector('english', name || ' ' || description));
```

#### 5.3.2 MongoDB Indexes
```javascript
// Single field index
DocumentSchema.index({ docId: 1 });

// Compound index (order matters!)
DocumentSchema.index({ ownerOrgId: 1, createdAt: -1 });

// Unique compound index
DocumentVersionSchema.index({ 
  docId: 1, 
  versionNumber: 1 
}, { unique: true });

// Text index for search
DocumentSchema.index({ 
  'metadata.fileName': 'text',
  type: 'text' 
});

// TTL index for auto-expiry (e.g., temporary uploads)
TempUploadSchema.index({ 
  createdAt: 1 
}, { 
  expireAfterSeconds: 3600  // 1 hour
});
```

### 5.4 Query Optimization

#### 5.4.1 PostgreSQL Explain Plans
```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT u.full_name, o.name, a.action, a.timestamp
FROM audit_logs a
JOIN users u ON a.user_id = u.id
JOIN organizations o ON a.org_id = o.id
WHERE a.org_id = 5
  AND a.timestamp > NOW() - INTERVAL '30 days'
ORDER BY a.timestamp DESC
LIMIT 100;

-- Expected: Index Scan on idx_audit_logs_org_doc
-- Cost: 0.42..250.56 rows=100
```

#### 5.4.2 MongoDB Aggregation Pipeline
```javascript
// Analytics: Count documents by organization
const stats = await Document.aggregate([
  { $match: { createdAt: { $gte: thirtyDaysAgo } } },
  { $group: {
      _id: '$ownerOrgId',
      totalDocs: { $sum: 1 },
      avgPageCount: { $avg: '$metadata.pageCount' }
  }},
  { $sort: { totalDocs: -1 } },
  { $limit: 10 }
]);
```

### 5.5 Sharding Strategy (Future Scale)

#### 5.5.1 PostgreSQL Partitioning
```sql
-- Range partitioning by timestamp (for audit_logs)
CREATE TABLE audit_logs_master (
  id SERIAL,
  timestamp TIMESTAMPTZ NOT NULL,
  -- other columns
) PARTITION BY RANGE (timestamp);

-- Monthly partitions
CREATE TABLE audit_logs_2025_11 PARTITION OF audit_logs_master
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE audit_logs_2025_12 PARTITION OF audit_logs_master
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
```

#### 5.5.2 MongoDB Sharding (Horizontal Scaling)
```javascript
// Shard key selection: ownerOrgId (hash-based sharding)
sh.enableSharding("papdocauthx");
sh.shardCollection("papdocauthx.documents", { 
  ownerOrgId: "hashed" 
});

// Benefits:
// - Even distribution across shards
// - Organization-scoped queries route to single shard
// - Horizontal scalability for multi-tenant SaaS
```

**Shard Key Considerations**:
- **High Cardinality**: Many distinct `ownerOrgId` values
- **Low Frequency**: No single org dominates traffic
- **Query Isolation**: Queries filter by `ownerOrgId`

---

## 6. Cryptographic Architecture

### 6.1 Merkle Tree Construction

A **Merkle tree** (hash tree) enables efficient verification of data integrity. Each leaf node is a hash of a data block, and parent nodes are hashes of their children.

#### 6.1.1 Four-Leaf Merkle Tree (Multi-Modal)
```
                    Root Hash
                   /          \
              H(L1 + L2)    H(L3 + L4)
             /        \     /        \
          H(text)  H(image) H(sig) H(stamp)
```

**Code Implementation**:
```javascript
// src/services/hashingService.js
import crypto from "crypto";

export function computeMerkleRoot({ textHash, imageHash, signatureHash, stampHash }) {
  // Step 1: Create leaf nodes as buffers
  const leaves = [
    Buffer.from(textHash, "hex"),
    Buffer.from(imageHash, "hex"),
    Buffer.from(signatureHash, "hex"),
    Buffer.from(stampHash, "hex"),
  ];

  // Step 2: Hash adjacent pairs
  const hashPair = (a, b) => {
    const combined = Buffer.concat([a, b]);
    return crypto.createHash("sha256").update(combined).digest();
  };

  // Level 1: Hash pairs
  const level1_left = hashPair(leaves[0], leaves[1]);   // H(text + image)
  const level1_right = hashPair(leaves[2], leaves[3]);  // H(sig + stamp)

  // Level 2: Hash root
  const root = hashPair(level1_left, level1_right);

  return root.toString("hex");
}
```

**Research Reference**:
> Merkle, R. C. (1988). "A Digital Signature Based on a Conventional Encryption Function". *Advances in Cryptology — CRYPTO '87*. Springer. pp. 369–378.

### 6.2 Version Hash Chain (Blockchain-Inspired)

Each document version is cryptographically linked to its predecessor, creating a tamper-evident chain.

**Formula**:
```
versionHash(n) = SHA256(versionHash(n-1) + merkleRoot(n))
versionHash(0) = SHA256(merkleRoot(0))  // Genesis version
```

**Code**:
```javascript
export function computeVersionHash(prevVersionHash, merkleRoot) {
  const data = prevVersionHash ? prevVersionHash + merkleRoot : merkleRoot;
  return crypto.createHash("sha256").update(data).digest("hex");
}
```

**Visual Example**:
```
Version 1: versionHash(1) = SHA256(merkleRoot(1))
           = "a3f4b8c2..."

Version 2: versionHash(2) = SHA256("a3f4b8c2..." + merkleRoot(2))
           = "d9e8f1a7..."

Version 3: versionHash(3) = SHA256("d9e8f1a7..." + merkleRoot(3))
           = "f2c5d8e1..."
```

**Property**: Changing any past version invalidates all subsequent version hashes → tamper detection.

### 6.3 Audit Hash Chain

Similar to blockchain, audit logs are chained to detect tampering.

**Formula**:
```
auditHash(n) = SHA256(
  userId + orgId + docId + action + timestamp + auditHash(n-1) + SECRET
)
```

**Verification**:
```javascript
// src/services/auditService.js
export async function verifyAuditChain({ orgId, docId }) {
  const logs = await AuditLog.findAll({
    where: { orgId, docId },
    order: [['timestamp', 'ASC']]
  });

  const issues = [];
  
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const expectedPrevHash = i === 0 ? null : logs[i - 1].auditHash;

    // Check chain continuity
    if (log.prevAuditHash !== expectedPrevHash) {
      issues.push({ logId: log.id, message: "Chain broken" });
    }

    // Recompute hash
    const recomputedHash = computeAuditHash({
      userId: log.userId,
      orgId: log.orgId,
      docId: log.docId,
      action: log.action,
      timestampISO: log.timestamp,
      prevAuditHash: log.prevAuditHash || ""
    });

    if (recomputedHash !== log.auditHash) {
      issues.push({ logId: log.id, message: "Hash mismatch - tampering detected" });
    }
  }

  return { isValid: issues.length === 0, totalLogs: logs.length, issues };
}
```

---

## 7. Multi-Modal Authentication

### 7.1 Concept Overview

Traditional document authentication verifies only text content. **Multi-modal authentication** extends verification to:
1. **Text** (OCR-extracted content)
2. **Images** (embedded photos, logos, diagrams)
3. **Signatures** (handwritten or digital signatures)
4. **Stamps** (official seals, watermarks)

**Motivation**: Attackers can modify images/signatures without changing text → undetected tampering.

### 7.2 Perceptual Hashing for Images

Unlike cryptographic hashes (sensitive to single-bit changes), **perceptual hashes** (pHash) generate similar hashes for visually similar images.

**Algorithm** (Simplified):
1. Reduce image to 32x32 grayscale
2. Compute Discrete Cosine Transform (DCT)
3. Extract low-frequency components
4. Generate 64-bit hash

**Library**: `sharp` + `pHash` (Node.js)
```javascript
import sharp from 'sharp';
import { imageHash } from 'phash';

async function computeImageHash(imageBuffer) {
  // Resize to 32x32 grayscale
  const processed = await sharp(imageBuffer)
    .resize(32, 32, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();
  
  // Compute perceptual hash
  const hash = imageHash(processed);
  return hash.toString('hex');
}
```

**Research**:
> Zauner, C. (2010). "Implementation and Benchmarking of Perceptual Image Hash Functions". *Master's Thesis, Upper Austria University of Applied Sciences*.

### 7.3 Signature Verification (SIFT Features)

**SIFT** (Scale-Invariant Feature Transform) extracts keypoint descriptors invariant to rotation/scale.

**Workflow**:
1. Extract signature region (bounding box)
2. Compute SIFT keypoints
3. Generate 128-dimensional descriptors
4. Store feature vectors in MongoDB

**Code Sketch**:
```javascript
import cv from '@u4/opencv4nodejs';

function extractSignatureFeatures(signatureImagePath) {
  const img = cv.imread(signatureImagePath, cv.IMREAD_GRAYSCALE);
  const sift = new cv.SIFTDetector();
  const { keypoints, descriptors } = sift.detectAndCompute(img);
  
  // Serialize descriptors to JSON
  const features = descriptors.getDataAsArray().flat();
  return { keypoints: keypoints.length, descriptorVector: features };
}
```

**Verification**: Compare descriptor vectors using Euclidean distance threshold.

**Research**:
> Lowe, D. G. (2004). "Distinctive Image Features from Scale-Invariant Keypoints". *International Journal of Computer Vision*, 60(2), 91–110.

### 7.4 Multi-Modal Merkle Tree

**Enhanced Hash Parts Schema**:
```javascript
{
  docId: "DOC-2025-001",
  versionNumber: 1,
  textHash: "sha256_of_ocr_text",
  imageHashes: [
    { index: 0, hash: "phash_logo", bbox: [10, 20, 100, 80] },
    { index: 1, hash: "phash_photo", bbox: [150, 200, 250, 350] }
  ],
  signatureHashes: [
    { 
      index: 0, 
      siftFeatures: [0.12, 0.45, ...],  // 128-dim vector
      bbox: [300, 500, 400, 550] 
    }
  ],
  stampHash: "sha256_of_official_seal"
}
```

**Merkle Root Computation**:
```javascript
function computeMultiModalMerkleRoot(hashParts) {
  const textHash = hashParts.textHash;
  const imageHash = hashParts.imageHashes.map(h => h.hash).join('');
  const signatureHash = hashParts.signatureHashes.map(s => 
    crypto.createHash('sha256').update(JSON.stringify(s.siftFeatures)).digest('hex')
  ).join('');
  const stampHash = hashParts.stampHash;
  
  return computeMerkleRoot({ textHash, imageHash, signatureHash, stampHash });
}
```

---

## 8. Transaction Management & ACID Compliance

### 8.1 ACID Properties

| Property | PostgreSQL | MongoDB |
|----------|------------|---------|
| **Atomicity** | ✅ Full support (transaction rollback) | ✅ Multi-document transactions (4.0+) |
| **Consistency** | ✅ Constraints, triggers, foreign keys | ✅ Schema validation, unique indexes |
| **Isolation** | ✅ SERIALIZABLE, READ COMMITTED, etc. | ✅ Snapshot isolation (default) |
| **Durability** | ✅ WAL (Write-Ahead Logging) | ✅ Journal + replication (w: majority) |

### 8.2 Sequelize Transaction Patterns

#### 8.2.1 Managed Transactions (Recommended)
```javascript
// Automatic commit/rollback
const result = await sequelize.transaction(async (t) => {
  const user = await User.create({ email, passwordHash }, { transaction: t });
  await UserRole.create({ userId: user.id, roleId: 2 }, { transaction: t });
  return user;
});
```

#### 8.2.2 Unmanaged Transactions (Manual Control)
```javascript
const t = await sequelize.transaction();
try {
  const user = await User.create({ email }, { transaction: t });
  await UserRole.create({ userId: user.id }, { transaction: t });
  await t.commit();
} catch (err) {
  await t.rollback();
  throw err;
}
```

#### 8.2.3 Concurrent Transactions (Isolation Levels)
```javascript
// Prevent phantom reads
await sequelize.transaction({ 
  isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE 
}, async (t) => {
  const count = await AccessRequest.count({ 
    where: { status: 'pending' } 
  }, { transaction: t });
  
  // No other transaction can insert pending requests until commit
});
```

### 8.3 MongoDB Transaction Example (Real Code)

```javascript
// From src/services/documentService.js
export async function uploadDocumentVersion({ orgId, userId, docId, hashes }) {
  const session = await mongoose.startSession();
  
  try {
    return await session.withTransaction(async () => {
      // 1. Find or create document
      let doc = await Document.findOne({ docId }).session(session);
      if (!doc) {
        [doc] = await Document.create([{
          docId, ownerOrgId: orgId, currentVersion: 0
        }], { session });
      }

      // 2. Increment version
      const versionNumber = doc.currentVersion + 1;
      const merkleRoot = computeMerkleRoot(hashes);
      const prevHash = doc.versionHashChain[doc.versionHashChain.length - 1];
      const versionHash = computeVersionHash(prevHash, merkleRoot);

      // 3. Create version record
      await DocumentVersion.create([{
        docId, versionNumber, merkleRoot, prevHash, versionHash
      }], { session });

      // 4. Create hash parts
      await HashPart.create([{
        docId, versionNumber, ...hashes
      }], { session });

      // 5. Update document
      doc.currentVersion = versionNumber;
      doc.versionHashChain.push(versionHash);
      await doc.save({ session });

      return { versionNumber, versionHash };
    });
  } finally {
    session.endSession();
  }
}
```

**Guarantees**:
- All five operations succeed or all rollback
- Snapshot isolation prevents dirty reads
- Write concern ensures replication before commit

---

## 9. Security & Audit Trail Architecture

### 9.1 Authentication & Authorization

#### 9.1.1 JWT-Based Authentication
```javascript
// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/sql/User.js';

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;  // Attach user to request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token verification failed' });
  }
}
```

#### 9.1.2 Role-Based Access Control (RBAC)
```javascript
// src/middleware/checkRole.js
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        required: allowedRoles,
        actual: req.user.role
      });
    }
    
    next();
  };
}

// Usage in routes
router.get('/admin/users', 
  authenticate, 
  requireRole('superadmin', 'admin'), 
  userController.listUsers
);
```

### 9.2 Audit Trail Implementation

#### 9.2.1 Automatic Audit Logging
```javascript
// src/services/auditService.js
export async function addAuditEntry({ userId, orgId, docId, action }) {
  // Get previous audit hash for chain
  const prev = await AuditLog.findOne({
    where: { orgId, docId },
    order: [['timestamp', 'DESC']]
  });

  const timestampISO = new Date().toISOString();
  
  // Compute tamper-proof hash
  const auditHash = computeAuditHash({
    userId, orgId, docId, action, timestampISO,
    prevAuditHash: prev?.auditHash || ""
  });

  // Create log entry
  const entry = await AuditLog.create({
    userId, orgId, docId, action,
    prevAuditHash: prev?.auditHash || null,
    auditHash,
    timestamp: timestampISO
  });

  return entry;
}
```

#### 9.2.2 Audit Chain Verification
```javascript
// Verify integrity of audit trail
const { isValid, issues } = await verifyAuditChain({ 
  orgId: 5, 
  docId: "DOC-2025-001" 
});

if (!isValid) {
  console.error("Audit tampering detected:", issues);
  // Alert security team, freeze document
}
```

### 9.3 Password Security

#### 9.3.1 bcrypt Hashing
```javascript
import bcrypt from 'bcrypt';

// Register user
export async function registerUser({ email, password, fullName }) {
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  
  const user = await User.create({ 
    email, 
    passwordHash, 
    fullName,
    role: 'verifier'
  });
  
  return user;
}

// Login
export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValid) {
    throw new Error('Invalid password');
  }
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
  
  return { user, token };
}
```

---

## 10. Code Examples & Implementation Patterns

### 10.1 Document Upload Workflow

```javascript
// POST /api/documents/upload
export async function uploadDocument(req, res) {
  const { docId, type, textHash, imageHash, signatureHash, stampHash } = req.body;
  const { id: userId, orgId } = req.user;
  
  try {
    const result = await uploadDocumentVersion({
      orgId,
      userId,
      docId,
      type,
      metadata: { pageCount: 5, sizeInKB: 320 },
      hashes: { textHash, imageHash, signatureHash, stampHash }
    });
    
    res.status(201).json({
      success: true,
      versionNumber: result.versionNumber,
      versionHash: result.versionHash,
      merkleRoot: result.merkleRoot
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: err.message });
  }
}
```

### 10.2 Document Verification Workflow

```javascript
// POST /api/verify/document
export async function verifyDocument(req, res) {
  const { docId, versionNumber, providedHashes } = req.body;
  
  try {
    // 1. Fetch version record
    const version = await DocumentVersion.findOne({ 
      docId, versionNumber 
    });
    
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }
    
    // 2. Fetch hash parts
    const hashParts = await HashPart.findOne({ 
      docId, versionNumber 
    });
    
    // 3. Recompute Merkle root
    const recomputedMerkle = computeMerkleRoot({
      textHash: providedHashes.textHash,
      imageHash: providedHashes.imageHash || hashParts.imageHash,
      signatureHash: providedHashes.signatureHash || hashParts.signatureHash,
      stampHash: providedHashes.stampHash || hashParts.stampHash
    });
    
    // 4. Compare
    const isValid = recomputedMerkle === version.merkleRoot;
    
    // 5. Log audit trail
    await addAuditEntry({
      userId: req.user?.id || 0,  // Public verification (userId=0)
      orgId: version.ownerOrgId,
      docId,
      action: isValid ? 'VERIFIED' : 'CRYPTO_CHECK'
    });
    
    res.json({
      isValid,
      versionHash: version.versionHash,
      merkleRoot: version.merkleRoot,
      recomputedMerkle,
      workflowStatus: version.workflowStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
```

### 10.3 Access Request Approval Workflow

```javascript
// PATCH /api/access-requests/:id/approve
export async function approveAccessRequest(req, res) {
  const { id } = req.params;
  const { reviewNotes } = req.body;
  const reviewer = req.user;
  
  try {
    const request = await AccessRequest.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }
    
    // Update request
    request.status = 'approved';
    request.reviewedBy = reviewer.id;
    request.reviewedAt = new Date();
    request.reviewNotes = reviewNotes || 'Approved';
    
    await request.save();
    
    // TODO: Send approval email to applicant
    
    res.json({
      success: true,
      request
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
```

---

## 11. Scalability Strategies

### 11.1 Horizontal Scaling (Multi-Tenant SaaS)

#### 11.1.1 Database Sharding
```
Organization ID Ranges:
  Shard 1: orgId 1-1000    → Server A
  Shard 2: orgId 1001-2000 → Server B
  Shard 3: orgId 2001-3000 → Server C
```

#### 11.1.2 Application Server Clustering
```
                 Load Balancer (Nginx)
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
   App Server 1    App Server 2    App Server 3
   (Node.js)       (Node.js)       (Node.js)
        │               │               │
        └───────────────┼───────────────┘
                        ↓
                  Database Pool
              (Postgres + MongoDB)
```

### 11.2 Caching Strategy

#### 11.2.1 Redis for Session Storage
```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache user session
await redis.setex(`session:${userId}`, 3600, JSON.stringify(user));

// Retrieve
const cachedUser = await redis.get(`session:${userId}`);
```

#### 11.2.2 MongoDB Result Caching
```javascript
// Cache frequently accessed documents
const cacheKey = `doc:${docId}:v${versionNumber}`;
let version = await redis.get(cacheKey);

if (!version) {
  version = await DocumentVersion.findOne({ docId, versionNumber });
  await redis.setex(cacheKey, 300, JSON.stringify(version));  // 5 min TTL
}
```

### 11.3 Read Replicas

#### 11.3.1 PostgreSQL Read Replicas
```javascript
// Write to master
const user = await User.create({ email });

// Read from replica (eventual consistency OK)
const users = await User.findAll({ 
  replication: 'read',  // Sequelize read replica
  where: { orgId: 5 }
});
```

#### 11.3.2 MongoDB Replica Set
```javascript
mongoose.connect(MONGO_URI, {
  readPreference: 'secondaryPreferred',  // Read from secondaries
  w: 'majority'  // Write to majority before acknowledging
});
```

---

## 12. Research References & Academic Foundation

### 12.1 Polyglot Persistence
1. **Sadalage, P. J., & Fowler, M.** (2012). *NoSQL Distilled: A Brief Guide to the Emerging World of Polyglot Persistence*. Addison-Wesley Professional.
   - Foundational text on using multiple databases optimized for different data models.

2. **Strauch, C., Sites, U. L. S., & Kriha, W.** (2011). "NoSQL databases". *Lecture Notes, Stuttgart Media University*.
   - Comparison of relational vs. document stores for modern applications.

### 12.2 Cryptographic Techniques

3. **Merkle, R. C.** (1988). "A Digital Signature Based on a Conventional Encryption Function". *Advances in Cryptology — CRYPTO '87*, Springer, pp. 369–378.
   - Original Merkle tree paper foundational to blockchain and document verification.

4. **Nakamoto, S.** (2008). "Bitcoin: A Peer-to-Peer Electronic Cash System". *bitcoin.org*.
   - Blockchain architecture inspiring version hash chains.

### 12.3 Multi-Modal Authentication

5. **Zauner, C.** (2010). "Implementation and Benchmarking of Perceptual Image Hash Functions". *Master's Thesis, Upper Austria University of Applied Sciences*.
   - Perceptual hashing (pHash) for image similarity detection.

6. **Lowe, D. G.** (2004). "Distinctive Image Features from Scale-Invariant Keypoints". *International Journal of Computer Vision*, 60(2), 91–110.
   - SIFT algorithm for signature feature extraction.

7. **Kumar, S., & Singh, S. K.** (2020). "A Survey on Document Image Authentication and Tampering Detection". *IEEE Access*, 8, 109071-109104.
   - Comprehensive survey on document forensics and multi-modal verification.

### 12.4 Database Transaction Management

8. **Gray, J., & Reuter, A.** (1992). *Transaction Processing: Concepts and Techniques*. Morgan Kaufmann.
   - Classic reference on ACID properties and transaction isolation levels.

9. **Bernstein, P. A., & Newcomer, E.** (2009). *Principles of Transaction Processing*. Morgan Kaufmann.
   - Distributed transaction patterns and two-phase commit.

### 12.5 Audit Logging & Security

10. **Schneier, B.** (1999). "Attack Trees". *Dr. Dobb's Journal*, 24(12), 21-29.
    - Threat modeling for audit trail integrity.

11. **Haber, S., & Stornetta, W. S.** (1991). "How to Time-Stamp a Digital Document". *Journal of Cryptology*, 3(2), 99-111.
    - Cryptographic timestamping foundational to audit chains.

---

## 13. Future Work & Extensions

### 13.1 Planned Features

#### 13.1.1 Multi-Modal Hash Extraction Pipeline
- **Image Extraction**: Use `pdf.js` + `sharp` to extract embedded images
- **Perceptual Hashing**: Compute pHash for each image
- **Signature Detection**: Use OpenCV.js for signature region detection
- **SIFT Feature Extraction**: Compute keypoint descriptors

**Timeline**: Q1 2026

#### 13.1.2 Public QR Code Verification
- Generate QR codes embedding `docId + versionHash`
- Public verification endpoint (no auth required)
- Mobile-friendly React UI

**Timeline**: Q2 2026

#### 13.1.3 Blockchain Integration
- Anchor Merkle roots to Ethereum/Polygon for immutable timestamping
- Use smart contracts for decentralized verification
- Cost optimization: Batch anchoring (100 docs per transaction)

**Timeline**: Q3 2026

### 13.2 Research Directions

1. **Zero-Knowledge Proofs for Privacy-Preserving Verification**
   - Verify document authenticity without revealing content
   - zk-SNARKs for Merkle tree membership proofs

2. **Federated Learning for Anomaly Detection**
   - Train ML models to detect forged signatures across organizations
   - Preserve data privacy using federated learning

3. **Quantum-Resistant Cryptography**
   - Replace SHA-256 with post-quantum hash functions
   - NIST PQC standards (CRYSTALS-DILITHIUM)

### 13.3 Scalability Milestones

| Milestone | Users | Documents | Infrastructure |
|-----------|-------|-----------|----------------|
| **MVP** (Current) | 100 | 10,000 | Single server |
| **Phase 1** | 1,000 | 100,000 | Postgres replication, MongoDB sharding |
| **Phase 2** | 10,000 | 1M | Kubernetes cluster, Redis caching |
| **Phase 3** | 100,000 | 10M | Multi-region deployment, CDN |

---

## Conclusion

PapDocAuthX demonstrates advanced database engineering through:
- **Polyglot persistence** optimizing PostgreSQL (relational) and MongoDB (document) for distinct use cases
- **Cryptographic integrity** using Merkle trees, hash chains, and tamper-proof audit trails
- **Multi-modal authentication** extending verification beyond text to images and signatures
- **Transaction management** ensuring ACID compliance across distributed datastores
- **Scalability architecture** supporting horizontal scaling via sharding and replication

This system represents a synthesis of **database theory, cryptographic engineering, and distributed systems design**, grounded in academic research and production-ready implementation patterns.

---

**Document Version**: 1.0  
**Last Updated**: November 19, 2025  
**License**: Proprietary (Academic Use)  
**Contact**: lovepreet-singh-virdi@github.com
