# QuickDoc Upload

CONSIGNES STRICTES D'ARCHITECTURE ET STYLE (ANTI-BLOAT & DIRECT-TO-APP) :

- PAS DE LANDING PAGE, PAS DE PAGE D'ACCUEIL MARKETING, PAS DE FOOTER PROMOTIONNEL.

- PAS DE TEXTES GÉNÉRIQUES OU FACTICES (Ex: "Bienvenue sur la meilleure plateforme...", "Solution de gestion 100% sécurisée", "Lorem Ipsum").

- PAS DE BADGES OU MENTIONS UI/UX DÉCORATIVES SANS UTILITÉ (Ex: "Beta", "Pro", "UI/UX v2.0", "Designed for Excellence").

- L'application doit être ULTRA-FONCTIONNELLE et DIRECTE : après la saisine du mot de passe, l'utilisateur arrive IMMEDIATEMENT sur l'outil/dashboard d'upload et de gestion des documents.

- Interface minimaliste, moderne et épurée (Style SaaS productif / Dashboard épuré avec Tailwind CSS).

---

spécifications techniques & fonctionnalités :

1. Identifiants & Configuration Cloudinary :

Intègre l'upload direct vers Cloudinary en utilisant ces identifiants pré-configurés :

- Cloud Name : xgittjcg

- Upload Preset : portail_preset

- Endpoint Cloudinary : https://api.cloudinary.com/v1_1/xgittjcg/auto/upload

2. Authentification Simplifiée (Écran de Verrouillage) :

- Affiche uniquement un champ de mot de passe propre et centré (sans blabla marketing).

- Mot de passe par défaut : "123456" (ou variable APP_PASSWORD).

- Stocke la session dans le localStorage pour éviter de redemander le mot de passe après rafraîchissement.

- Bouton "Déconnexion" discret dans le header.

3. Module d'Upload (Direct à l'essentiel) :

- Zone Drag & Drop compacte + bouton "Parcourir" supportant tous formats (PDF, PNG, JPG, DOCX, ZIP, MP4, etc.).

- Requête POST vers Cloudinary avec :

  * `file`: le fichier

  * `upload_preset`: "portail_preset"

- Indicateur/Barre de progression réelle de l'upload.

- Champs optionnels lors de l'ajout : "Titre" et "Catégorie" (Cours, Relevés de notes, Projets, Administratif, Autre).

4. Gestion des Documents (Dashboard) :

- Grille ou liste d'affichage des documents réellement envoyés (sauvegardés dans le localStorage avec leurs URLs Cloudinary).

- Pour chaque document :

  * Titre, catégorie, date d'ajout et icône indicative du format (Lucide React).

  * Bouton "Ouvrir / Voir" (ouvre l'URL Cloudinary dans un nouvel onglet).

  * Bouton "Copier l'URL".

  * Bouton "Supprimer" (retire le document de la liste locale).

- Barre de recherche textuelle et filtre par catégorie. voici les desing md a utiliser ---

name: Modern Campus Pulse

colors:

  surface: '#f7f9fb'

  surface-dim: '#d8dadc'

  surface-bright: '#f7f9fb'

  surface-container-lowest: '#ffffff'

  surface-container-low: '#f2f4f6'

  surface-container: '#eceef0'

  surface-container-high: '#e6e8ea'

  surface-container-highest: '#e0e3e5'

  on-surface: '#191c1e'

  on-surface-variant: '#464554'

  inverse-surface: '#2d3133'

  inverse-on-surface: '#eff1f3'

  outline: '#777586'

  outline-variant: '#c7c4d7'

  surface-tint: '#5148d7'

  primary: '#2a14b4'

  on-primary: '#ffffff'

  primary-container: '#4338ca'

  on-primary-container: '#c1beff'

  inverse-primary: '#c3c0ff'

  secondary: '#0051d5'

  on-secondary: '#ffffff'

  secondary-container: '#316bf3'

  on-secondary-container: '#fefcff'

  tertiary: '#760045'

  on-tertiary: '#ffffff'

  tertiary-container: '#a0005f'

  on-tertiary-container: '#ffadcc'

  error: '#ba1a1a'

  on-error: '#ffffff'

  error-container: '#ffdad6'

  on-error-container: '#93000a'

  primary-fixed: '#e3dfff'

  primary-fixed-dim: '#c3c0ff'

  on-primary-fixed: '#100069'

  on-primary-fixed-variant: '#372abf'

  secondary-fixed: '#dbe1ff'

  secondary-fixed-dim: '#b4c5ff'

  on-secondary-fixed: '#00174b'

  on-secondary-fixed-variant: '#003ea8'

  tertiary-fixed: '#ffd9e4'

  tertiary-fixed-dim: '#ffb0cd'

  on-tertiary-fixed: '#3e0022'

  on-tertiary-fixed-variant: '#8c0053'

  background: '#f7f9fb'

  on-background: '#191c1e'

  surface-variant: '#e0e3e5'

typography:

  headline-hero:

    fontFamily: Plus Jakarta Sans

    fontSize: 22px

    fontWeight: '700'

    lineHeight: 28px

    letterSpacing: -0.02em

  headline-section:

    fontFamily: Plus Jakarta Sans

    fontSize: 18px

    fontWeight: '700'

    lineHeight: 24px

    letterSpacing: -0.01em

  title-card:

    fontFamily: Plus Jakarta Sans

    fontSize: 13px

    fontWeight: '600'

    lineHeight: 18px

  body-default:

    fontFamily: Plus Jakarta Sans

    fontSize: 14px

    fontWeight: '400'

    lineHeight: 20px

  body-sm:

    fontFamily: Plus Jakarta Sans

    fontSize: 12px

    fontWeight: '400'

    lineHeight: 16px

  body-xs:

    fontFamily: Plus Jakarta Sans

    fontSize: 10.5px

    fontWeight: '400'

    lineHeight: 14px

  label-nav:

    fontFamily: Inter

    fontSize: 11px

    fontWeight: '500'

    lineHeight: 14px

  label-badge:

    fontFamily: Inter

    fontSize: 10px

    fontWeight: '700'

    lineHeight: 12px

    letterSpacing: 0.04em

  label-action:

    fontFamily: Plus Jakarta Sans

    fontSize: 13px

    fontWeight: '600'

    lineHeight: 16px

rounded:

  sm: 0.25rem

  DEFAULT: 0.5rem

  md: 0.75rem

  lg: 1rem

  xl: 1.5rem

  full: 9999px

spacing:

  space-2xs: 0.25rem

  space-xs: 0.5rem

  space-sm: 0.75rem

  space-md: 1rem

  space-lg: 1.25rem

  space-xl: 1.5rem

  space-2xl: 2rem

  page-padding-x: 1rem

  grid-gutter: 0.75rem

  header-bottom-overlap: -1.5rem

---

## Brand & Style

This design system establishes an approachable, organized, and motivating mobile experience for students, educators, and campus administrators. Designed primarily for high school and university students, it balances institutional clarity with youthful energy. 

The aesthetic is Modern Android Material-meets-Soft Neomorphism: a vibrant, saturated gradient masthead anchoring the top of the viewport, transitioning seamlessly into an ultra-clean, airy content canvas. The signature visual identity relies on soft, rounded dashboard cards with candy-tinted pastel micro-containers that categorise essential tools into an engaging, glanceable grid. It eliminates bureaucratic academic clutter, projecting warmth, progress, and effortless daily organization.

## Colors

The color architecture is built around an energetic indigo-to-royal-blue linear gradient (`#4338CA` to `#2563EB`) that commands the header and active state highlights. The content background relies on a tranquil off-white canvas (`#F8FAFC`) framed with bright white surfaces (`#FFFFFF`).

### Functional Palette

- **Hero / Header Gradient:** `linear-gradient(135deg, #3B5998 0%, #4F46E5 60%, #2563EB 100%)`

- **Text & Contrast:** 

  - On-gradient / Hero text: `#FFFFFF` (headings), `rgba(255, 255, 255, 0.82)` (body/subheadings).

  - Surface titles: `#0F172A` (Slate 900).

  - Body & secondary captions: `#64748B` (Slate 500).

  - Outlines / Subtle borders: `#F1F5F9` (Slate 100) to `#E2E8F0` (Slate 200).

### Pastel Category Palette (Card Icon Surrounds)

Each core dashboard module pairs a high-contrast glyph with an ultra-light pastel background:

- **Violet (Profile, Notices):** Icon `#7C3AED` | Container `#F3E8FF`

- **Tangerine (Events, Assignments):** Icon `#EA580C` | Container `#FFEDD5`

- **Sky (Staffs, Library):** Icon `#0284C7` | Container `#E0F2FE`

- **Emerald (Attendance, Exams):** Icon `#059669` | Container `#D1FAE5`

- **Rose (Chatbox):** Icon `#E11D48` | Container `#FFE4E6`

- **Amber (GradeSheet):** Icon `#D97706` | Container `#FEF3C7`

- **Teal / Cyan (Fee Details):** Icon `#0D9488` | Container `#CCFBF1`

- **Blue (Gallery):** Icon `#2563EB` | Container `#DBEAFE`

## Typography

Typographic rhythm relies on `Plus Jakarta Sans` for titles, headers, and quick-scan card labels to impart a warm, rounded, contemporary aesthetic. `Inter` provides structured, tabular clarity for navigation items, date blocks, and status badges.

Visual hierarchy prioritizes instant legibility during quick mobile interactions:

- Subtitle descriptions on module cards use subdued Slate 500 at 10.5px to preserve breathing room within multi-column grids.

- Section headers (`Quick Access`, `Upcoming Events`) contrast with right-aligned action links (`View All`, `View Calendar`) using bold weights and brand indigo accents.

## Layout & Spacing

The layout follows a mobile-first fluid model built on an 8pt base grid system:

- **Horizontal Margins:** Outer content bounds are fixed at `16px` (`1rem`) on standard viewport widths (360px–430px).

- **Header Masthead:** Features a generous curved bottom edge (24px radius) extending behind floating elements. The search bar uses an overlap technique (`header-bottom-overlap`), positioned half over the indigo banner and half over the off-white page background.

- **Quick Access Grid:** A strict 3-column fluid grid (`grid-cols-3`) with uniform `12px` (`0.75rem`) horizontal and vertical gutters. All cards maintain matching heights.

- **List Rows:** Event lists and timeline feeds occupy full container widths with `12px` inner vertical padding and `12px` item separation.

- **Fixed Bottom Navigation:** Sticky `64px` height bar anchored to the bottom with built-in device safe-area inset support.

## Elevation & Depth

Depth is created using a harmonious blend of low-contrast borders and tinted ambient shadows rather than harsh drop shadows.

- **Level 0 (Flat):** Off-white base canvas (`#F8FAFC`).

- **Level 1 (Card Default):** `#FFFFFF` surface with a subtle perimeter stroke of `1px solid rgba(226, 232, 240, 0.6)` and an ambient shadow: `0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.03)`.

- **Level 2 (Floating Search & Modals):** `0 10px 25px -5px rgba(37, 99, 235, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)`.

- **Level 3 (Sticky Nav):** Reverse top shadow (`0 -4px 16px rgba(15, 23, 42, 0.04)`) over a crisp `#FFFFFF` or `rgba(255, 255, 255, 0.95)` backdrop with `blur(12px)`.

- **Active State Interaction:** Subtle `scale(0.98)` spring animation coupled with an elevated ambient drop shadow.

## Shapes

The design embraces a friendly, rounded aesthetic tailored for touch-driven mobile experiences:

- **Dashboard Cards:** Standardized to `16px` (`rounded-2xl`) to provide an organic, approachable feel.

- **Icon Micro-Containers:** Nested squircle containers sized at 40px × 40px with `12px` (`rounded-xl`) corner radius, creating concentric harmony inside parent cards.

- **Search Bar & Pills:** Fully pill-shaped (`9999px`) to invite text entry and interaction.

- **Status Chips & Badges:** `6px` to `8px` roundedness for compact information density.

- **Masthead Bottom Corners:** Smooth `24px` radius curving inwards into the content canvas.

## Components

### 1. App Header Masthead

- **Container:** Indigo-blue linear gradient backdrop with status bar integration, hamburger drawer toggle, notification bell with unread indicator badge (solid red `#EF4444` with white counter), and student profile avatar in an accent ring.

- **Floating Search Field:** Pill-shaped, pure `#FFFFFF`, carrying search icon, muted placeholder text (`#94A3B8`), and ambient level 2 elevation.

### 2. Quick Access Grid Cards

- **Structure:** Vertical flex layout inside a 3-column grid cell. 

- **Top Row:** 40px × 40px pastel-tinted icon container with centered glyph, optionally housing top-right status micro-chips (e.g., "NEW" badge in solid violet).

- **Center / Bottom:** Bold title (13px, Slate 900), descriptive subtext (10.5px, Slate 500, clamped to 1 line), and a light gray chevron icon (`#CBD5E1`) indicating touch targets.

### 3. Event & Agenda Cards

- **Structure:** Horizontal split card.

- **Date Column:** Left-anchored date block featuring uppercase 3-letter month label (10px, bold, primary/accent color) stacked over the numerical day (18px, bold, Slate 900).

- **Details Column:** Event title (14px, semi-bold), time range with clock icon, and location with map pin icon.

- **Trailing Action:** Pill-shaped status badge ("Upcoming", "Completed") with subtle colored outline and tint.

### 4. Status Chips & Badges

- **Notification Dot:** 8px circular indicator or 16px numbered pill with white high-contrast borders.

- **Category Chips:** Subtle tinted background matching text color at 15% opacity (e.g., Orange chip: text `#EA580C`, background `#FFEDD5`).

### 5. Sticky Bottom Navigation

- **Structure:** 4-tab bar (Home, Calendar, Messages, More) distributed equally with safe-area spacing.

- **Inactive Tab:** Slate 400 icon and 11px label.

- **Active Tab:** Primary Indigo (`#4338CA`) filled icon, bold label, with an optional subtle 4px dot indicator underneath.

### 6. Input Fields & Search Bars

- Background `#FFFFFF`, border `1px solid #E2E8F0`, focused ring `2px solid #6366F1` with soft focus glow.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/df5fc427-6732-4ca9-827b-c6ca18929052).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
 
# quickdoc-uploads  
