# UI Changes - Visual Reference

## Overview

This document describes the visual changes made to the Accounts/Models page and related components.

---

## 1. Model Card Layout

### New Structure

```
┌─────────────────────────────────────────┐
│  [Avatar]  Model Name              [⚙️] [🗑️]
│            Bio text...                   
│─────────────────────────────────────────│
│  Revenus mois  │  Posts publiés          │ ← Clickable
│     0€         │       0                 │
├─────────────────────────────────────────┤
│  🔵 CHATTING IA                         │
│  [OnlyFans Badge] [MYM Badge]           │ ← Clickable links
├─────────────────────────────────────────┤
│  🔗 RÉSEAUX SOCIAUX                     │
│  [Insta] [TikTok] [Telegram] [Twitter]  │ ← Clickable links
├─────────────────────────────────────────┤
│       [⚙️ Configurer]                    │
└─────────────────────────────────────────┘
```

---

## 2. Avatar Section

### Avatar Upload Interaction

**Hover State:**
```
     ┌─────────────┐
     │   [Avatar]  │
     │     [⬆️]    │  ← Upload button appears
     └─────────────┘
```

**Upload Button Styles:**
- Position: Bottom-right corner
- Size: 24x24px
- Background: Purple (#7c3aed)
- Hover: Darker purple
- Icon: Upload arrow (⬆️)

**Accepted Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

**Fallback:** First letter of model name in gradient background

---

## 3. Platform Logos (SVG)

### OnlyFans Badge
```
Background: #00AFF0 (Cyan)
Icon: OnlyFans logo SVG
Size: 16px circular
Text: "ONLYFANS"
Color: White on cyan
```

Example appearance:
```
[🔵 ONLYFANS]
```

### MYM Badge
```
Background: #000 (Black)
Text: "M" (letter)
Size: 16px circular
Color: White letter on black
```

Example appearance:
```
[⚫ MYM]
```

### Instagram Badge
```
Background: Linear gradient (#E1306C → #F77737)
Icon: Camera/frame SVG
Size: 16px circular
```

Example appearance:
```
[📷 INSTAGRAM]
```

### TikTok Badge
```
Background: #000 (Black)
Text: "T" (letter)
Size: 16px circular
Color: White on black
```

Example appearance:
```
[⚫ TIKTOK]
```

### Telegram Badge
```
Background: #2AABEE (Blue)
Icon: Plane SVG
Size: 16px circular
```

Example appearance:
```
[✈️ TELEGRAM]
```

### Twitter/X Badge
```
Background: #000 (Black)
Text: "X" (letter)
Size: 16px circular
Color: White on black
```

Example appearance:
```
[⚫ TWITTER/X]
```

---

## 4. Clickable Elements

### Stats (Dashboard Links)

**Revenus mois**
- Text: Green (#22c55e)
- Clickable: Yes → `/finance`
- On hover: Border color changes to green
- Display: `{amount}€` or `0€`

**Posts publiés**
- Text: Cyan (#06b6d4)
- Clickable: Yes → `/posting`
- On hover: Border color changes to cyan
- Display: `{count}` or `0`

### Platform Badges

**Chatting Platforms** (OnlyFans, MYM)
- Border: Purple (#a855f7)
- Background: Purple/20% opacity
- Clickable: Yes → `/chatting/ai`
- On hover: Border brightens, background increases

**Social Networks** (Instagram, TikTok, Telegram, Twitter)
- Border: Cyan (#06b6d4)
- Background: Cyan/20% opacity
- Clickable: Yes → `/posting`
- On hover: Border brightens, background increases

---

## 5. Modal Form - Create/Edit

### Header
```
┌─────────────────────────────────────────┐
│ [Title: "Ajouter un modèle" / "Modifier le modèle"]  [X]
└─────────────────────────────────────────┘
```

### Form Fields

**Nom du modèle** (Required)
```
Label: "Nom du modèle"
Placeholder: "Leelou, Sophie, etc."
Type: Text input
Required: Yes
```

**Bio / Description** (Optional)
```
Label: "Bio / Description"
Placeholder: "Courte description du modèle..."
Type: Textarea (5 lines)
Required: No
```

**Plateformes Chatting IA**
```
Options:
  ☐ OnlyFans
  ☐ MYM

Selected style: Purple background + border
```

**Réseaux sociaux** (Reddit removed)
```
Options:
  ☐ Instagram
  ☐ TikTok
  ☐ Telegram
  ☐ Twitter/X

NOTE: Reddit is no longer available
Selected style: Cyan background + border
```

### Buttons
```
[Cancel]              [✓ Create/Update]
Gray border           Purple-to-cyan gradient
Hover: More opaque    Hover: Opacity change + scale
```

---

## 6. Color Scheme

### Primary Colors
- Purple: `#7c3aed` (form, primary UI)
- Cyan: `#06b6d4` (secondary, social platforms)
- Green: `#22c55e` (revenue/success)
- Red: `#ef4444` (delete, danger)

### Glass Morphism
- Background: `rgba(255, 255, 255, 0.05)`
- Borders: `rgba(255, 255, 255, 0.1)`
- Hover: `rgba(255, 255, 255, 0.2)`

### Gradients
- Instagram: `#E1306C → #F77737` (pink to orange)
- OnlyFans: Solid `#00AFF0` (cyan)
- Telegram: Solid `#2AABEE` (light blue)

---

## 7. Responsive Behavior

### Desktop (1024px+)
```
Grid: 3 columns
Card width: ~330px
Avatar size: 64x64px
Spacing: 24px gaps
```

### Tablet (768px - 1023px)
```
Grid: 2 columns
Card width: ~350px
Avatar size: 64x64px
Spacing: 20px gaps
```

### Mobile (< 768px)
```
Grid: 1 column
Card width: 100% (with padding)
Avatar size: 56x56px
Spacing: 16px gaps
Modal: Full screen - padding
```

---

## 8. Icon Reference

**Header Icons:**
- Users icon (👥) - Light purple
- Plus icon (+) - White on gradient button

**Section Icons:**
- MessageSquare (💬) - Purple (chatting)
- Share2 (🔗) - Cyan (social)
- Settings (⚙️) - Blue (edit)
- Trash2 (🗑️) - Red (delete)
- Upload (⬆️) - White on purple (avatar)

---

## 9. Animation/Transitions

### Hover Effects
- Buttons: `transition-all` (~200ms)
- Opacity changes
- Border color shifts
- Scale transforms (small ±2%)

### Load States
- Avatar upload: Spinner on button
- Model load: Central spinner
- Stats load: Simultaneous with models

### State Changes
- Form open/close: Backdrop blur + overlay
- Delete confirmation: Browser alert
- Success/Error: Toast notifications

---

## 10. Before & After Comparison

### Before
```
┌──────────────────────┐
│ [A]  Model Name  [🗑️]
│─────────────────────│
│  3.2K    │   24    │ ← Fake data
│ Revenus  │  Posts  │
│──────────────────────│
│ 🔵 ONLYFANS        │ ← Emoji
│ 📸 INSTAGRAM       │
│ 🎵 TIKTOK          │
│──────────────────────│
│   [⚙️ Configurer]   │
└──────────────────────┘
```

### After
```
┌──────────────────────────────────────┐
│  [Avatar with upload]  Name      [⚙️][🗑️]
│  Bio: Short description...
│──────────────────────────────────────│
│  Revenus mois  │  Posts publiés  ← Clickable
│     0€         │      0
├──────────────────────────────────────┤
│ 🔵 CHATTING IA
│ [Proper OF logo] [M on black]   ← SVG logos
├──────────────────────────────────────┤
│ 🔗 RÉSEAUX SOCIAUX
│ [Insta gradient] [TikTok] [Telegram] [X]
├──────────────────────────────────────┤
│      [⚙️ Configurer]
└──────────────────────────────────────┘
```

---

## 11. Data States

### Empty State
```
┌────────────────────────────────────┐
│             👥                      │
│                                    │
│    Aucun modèle pour le moment    │
│                                    │
│   [➕ Créer le premier]            │
└────────────────────────────────────┘
```

### Loading State
```
      ⟳ (spinning loader)
```

### With Data
```
3-column grid with model cards
Each card fully populated with data
```

---

## 12. Form Validation

### Visual Feedback
- Empty required field: Normal styling, red error on submit
- Successful upload: Toast "Avatar mis à jour ✅"
- Upload error: Toast with red "Erreur lors de l'upload"
- No platforms selected: Toast "Sélectionnez au moins une plateforme"

---

**Design Specs Version:** 1.0  
**Last Updated:** May 22, 2026  
**Approved By:** Development Team
