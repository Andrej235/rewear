# ReWear — MVP Scope Definition

This document defines the **locked MVP scope** for the ReWear project.  
The goal is to deliver a **fully working wardrobe-as-a-service application** with **admin-managed inventory** and **AI-assisted recommendations**, suitable for a college project demo.

This is not a full production system. Features are intentionally scoped.

---

## 1. Core Idea

ReWear allows users to subscribe to a monthly wardrobe.  
Each month, users receive a curated set of clothing items based on their preferences.  
After use, items are returned, cleaned, and re-circulated.

Admins manage inventory at the **physical garment level**, not just product types.

---

## 2. User-Facing Requirements (Must Have)

### 2.1 User Profile & Preferences

- Users create a style profile:
  - preferred styles
  - colors
  - fit
  - occasions
  - season
- Profile data is structured (not free text)

---

### 2.2 Subscription & Monthly Box

- Users select a subscription plan
- Each month:
  - one “monthly box” is created
  - box contains multiple clothing items
- Users can view:
  - current box
  - previously received boxes

Payment handling can be mocked or simplified.

---

### 2.3 Wardrobe Recommendations (AI-assisted)

- The system recommends clothing items based on:
  - user style profile
  - item metadata
  - availability
- Recommendations are ranked using:
  - **vector embeddings**
  - **cosine similarity**
- AI is used for ranking, not for enforcing business rules

Optional:

- Show a short explanation for why an item was recommended

---

## 3. Admin Requirements (Must Have)

### 3.1 Inventory Management

- Admins manage clothing at two levels:
  - clothing type (model, style, description)
  - physical item (individual garment)
- Each physical item:
  - has a unique barcode
  - has a condition and lifecycle status

---

### 3.2 Barcode-Based Item Control

- Admins can:
  - scan or enter a barcode
  - assign items to a monthly box
  - mark items as returned
  - mark items as cleaned
- Item state changes are explicit and visible

Camera scanning is optional; manual input is sufficient.

---

### 3.3 Admin Visibility

- Admins can see:
  - active monthly boxes
  - which items are currently rented
  - item condition and usage count

---

## 4. AI Scope (Must Have)

### 4.1 Recommendation Logic

- User profiles and clothing items are converted into embeddings
- Similarity is computed using **cosine similarity**
- The system returns the most relevant items

AI does NOT:

- directly assign inventory items
- bypass availability rules
- make irreversible decisions

---

### 4.2 Explainability (Optional)

- AI can generate a short explanation describing:
  - why an item matches a user’s style
- Explanations are informational only

---

## 5. Inventory Lifecycle (Must Have)

Each physical clothing item must support the following states:

- available
- assigned to box
- returned
- in cleaning
- unavailable (damaged or retired)

State transitions are controlled by admins.

---

## 6. What Is Explicitly Out of Scope

- Real payment processing
- Real logistics integration
- User-to-user clothing exchange
- Dynamic pricing
- Real-time delivery tracking
- Advanced AI training or fine-tuning
- Social features

---

## 7. Nice-to-Have Features (Optional)

These features are not required but may be added if time allows:

- AI-generated outfit explanations
- Admin dashboard metrics
- Item usage history
- Condition degradation tracking
- Mobile barcode scanning
- Outfit-level recommendations (not just items)

---

## 8. Success Criteria

The project is considered successful if:

- Users can receive a monthly wardrobe
- Admins can control physical inventory via barcodes
- AI-based recommendations use cosine similarity
- The system can be fully demonstrated end-to-end

---

## 9. Guiding Principle

**The system must feel real, even if simplified.**

Functionality and clarity are more important than feature count.
