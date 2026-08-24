# Frontend Development Guidelines

## Project Context

This frontend is part of an AI-powered Industrial Fire Detection and Thermal Intelligence Platform.

The frontend is responsible for:

- Visualizing thermal events on a GIS dashboard
- Displaying AI classification results
- Showing risk scores and anomaly information
- Providing investigation tools for detected events
- Presenting explainable AI insights

The frontend is NOT responsible for:

- Data processing
- ML execution
- Classification logic
- Satellite data processing

All intelligence comes from backend APIs.

---

# Before Starting Any Frontend Work

## Mandatory Rule

Before creating or modifying ANY frontend element:

1. Read and understand `DESIGN.md`
2. Follow the defined:
   - Design system
   - Layout rules
   - Component usage
   - Typography
   - Spacing
   - Colors
   - UI patterns

Do not implement UI based on personal assumptions.

`DESIGN.md` is the single source of truth for frontend design decisions.

If a design decision is not covered in `DESIGN.md`, choose the option that best matches the existing design system and update `DESIGN.md` if required.

---

# Component Guidelines

## Use Existing Components First

The project already contains reusable shadcn/ui components inside:

```
components/ui/
```

Before creating any new UI element:

1. Check if an existing shadcn component already solves the requirement.
2. Extend or compose existing components whenever possible.
3. Only create a custom component when no suitable reusable component exists.

---

# Do NOT Create Components From Scratch

Avoid manually creating:

- Buttons
- Inputs
- Cards
- Dialogs
- Dropdowns
- Tabs
- Tooltips
- Badges
- Selects
- Tables
- Modals

when equivalent components already exist in:

```
components/ui/
```

Example:

Instead of creating:

```
components/Button.jsx
```

use:

```
components/ui/button
```

Instead of creating:

```
components/Card.jsx
```

use:

```
components/ui/card
```

---

# Component Architecture

Follow this structure:

```
frontend/

src/

├── components/

│   ├── ui/
│   │   └── shadcn components
│   │
│   ├── map/
│   │   ├── FireMap
│   │   ├── HotspotMarker
│   │   └── MapControls
│   │
│   ├── dashboard/
│   │   ├── RiskCard
│   │   ├── EventPanel
│   │   └── Statistics
│   │
│   └── shared/
│       └── reusable project components


├── pages/

├── hooks/

├── services/

├── lib/

└── utils/

```

---

# GIS Dashboard Rules

The main product interface is a geospatial intelligence dashboard.

Every map-related component should prioritize:

- Clear visualization
- Fast understanding
- Minimal clutter
- Actionable information

The map should not only show points.

Every event should communicate:

- What happened
- Where it happened
- Why the AI classified it
- How risky it is

---

# Hotspot Visualization Rules

Every thermal event marker should support:

- Classification
- Confidence score
- Risk level
- Timestamp
- Location details

Example:

```
Industrial Fire

Confidence:
94%

Risk:
High

Reason:

✓ Persistent for 30 days
✓ Near refinery
✓ Night activity dominant
```

---

# Explainability First

Never display only:

```
Industrial Fire
```

Always provide:

```
Classification
+
Confidence
+
Reasoning
```

The frontend must make AI decisions understandable.

---

# API Usage Rules

The frontend communicates only through backend APIs.

Do not:

- Import ML files
- Access raw datasets
- Perform prediction calculations
- Duplicate backend logic

Expected flow:

```
Backend API

      ↓

Frontend Service Layer

      ↓

React Components

      ↓

User Interface
```

---

# Service Layer

All API communication should be separated.

Example:

```
services/

├── hotspotService.js
├── predictionService.js
└── riskService.js
```

Components should not directly handle API calls.

---

# State Management

Keep state organized.

Separate:

## Server State

Examples:

- Hotspot data
- Predictions
- Risk information

Handled through API/service layer.

---

## UI State

Examples:

- Selected hotspot
- Active filters
- Open panels

Handled through React state/hooks.

---

# Styling Rules

Before writing custom styles:

1. Check existing Tailwind utilities.
2. Check shadcn component variants.
3. Follow DESIGN.md.

Avoid:

- Random colors
- Random spacing values
- One-off CSS
- Duplicate styles

Consistency is more important than individual component appearance.

---

# Responsive Design

Every component must work on:

- Desktop
- Tablet
- Smaller screens

Do not create layouts that only work for one screen size.

---

# Code Quality Rules

## Components should be:

- Small
- Reusable
- Focused on one responsibility

Avoid:

- Large page components
- Duplicate UI logic
- Hardcoded data
- Repeated styles

---

# Naming Rules

Use meaningful names.

Good:

```
ThermalEventCard

RiskScorePanel

HotspotDetails

MapLegend
```

Avoid:

```
Box1

Component2

DataCard
```

---

# Development Workflow

Before building a feature:

1. Check DESIGN.md
2. Check existing components
3. Check API contract
4. Create component structure
5. Implement UI
6. Connect real API data
7. Test user flow

---

# Required User Flows

The frontend must support these primary flows:

## Flow 1: Monitoring

```
Open Dashboard

↓

View thermal events

↓

Identify high-risk events
```

---

## Flow 2: Investigation

```
Click Event

↓

View classification

↓

View confidence

↓

View explanation

↓

View historical behavior
```

---

## Flow 3: Filtering

Users should be able to filter by:

- Event type
- Risk level
- Date/time
- Region

---

# Final Rule

The frontend should feel like an operational intelligence product, not a simple visualization dashboard.

Every UI decision should answer:

"Does this help a user understand and act on thermal intelligence faster?"

If yes, implement it.

If no, avoid unnecessary complexity.
