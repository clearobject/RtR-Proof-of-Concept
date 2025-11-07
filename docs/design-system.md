# RTR Design System

This document outlines the design system for the Rent the Runway Operations Portal, inspired by Rent the Runway's brand identity.

## Color Palette

### Brand Colors

- **`rtr-wine`** (`#29000b`) - Primary brand color, used for headers, key accents, and primary buttons
- **`rtr-wine-light`** (`#4a0018`) - Lighter wine tint for hover states and subtle backgrounds
- **`rtr-blush`** (`#FDECEF`) - Soft blush/pink for secondary backgrounds and accents
- **`rtr-cream`** (`#FFF8F4`) - Warm off-white for main page backgrounds

### Text Colors

- **`rtr-ink`** (`#111827`) - Primary text color, very dark for maximum readability
- **`rtr-slate`** (`#6b7280`) - Secondary text color for labels and less prominent text

### UI Colors

- **`rtr-border`** (`#E5E7EB`) - Subtle border color for cards and dividers

### Status Colors

- **`rtr-success`** (`#10b981`) - Green for "running / healthy" status
- **`rtr-warning`** (`#f59e0b`) - Amber/orange for "warning / trending issue" status
- **`rtr-danger`** (`#ef4444`) - Red for "critical / down" status

## Typography

The design system uses **Inter** as the primary typeface, with a fallback stack:

```css
font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

### Usage

- **Headings**: Use `text-rtr-ink` with `font-semibold` or `font-bold`
- **Body text**: Use `text-rtr-ink` for primary text, `text-rtr-slate` for secondary text
- **Labels**: Use `text-rtr-slate` or `text-rtr-ink` with `font-medium`

## Components

### Button

The `Button` component supports multiple variants:

```tsx
import { Button } from '@/components/ui/button'

// Primary button (default) - uses rtr-wine background
<Button variant="primary">Submit</Button>

// Secondary button - uses rtr-blush background
<Button variant="secondary">Cancel</Button>

// Ghost button - transparent with hover state
<Button variant="ghost">Learn More</Button>

// Destructive button - for delete/dangerous actions
<Button variant="destructive">Delete</Button>
```

**Sizes**: `sm`, `md` (default), `lg`

### Card

The `Card` component provides a consistent container with rounded corners, subtle shadow, and border:

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Your content */}
  </CardContent>
  <CardFooter>
    {/* Footer content */}
  </CardFooter>
</Card>
```

### Badge

The `Badge` component is used for status indicators:

```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="success">Running</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Critical</Badge>
<Badge variant="neutral">Idle</Badge>
```

## Usage Guidelines

### Color Usage

1. **Primary Actions**: Use `rtr-wine` for primary buttons and key interactive elements
2. **Backgrounds**: Use `rtr-cream` for page backgrounds, `white` for cards
3. **Status Indicators**: 
   - `rtr-success` for operational/running states
   - `rtr-warning` for warnings/trending issues
   - `rtr-danger` for critical/down states
   - Neutral gray for idle/offline states

### Spacing & Layout

- Use `max-w-7xl mx-auto px-4 py-6` for main content containers
- Cards use `rounded-2xl` for a premium, modern feel
- Consistent padding: `p-4` for small cards, `p-6` for larger sections

### Shadows

- Cards use `shadow-sm` for subtle elevation
- Hover states on buttons use `shadow-md` for depth
- Avoid heavy shadows - keep it minimal and professional

### Focus States

All interactive elements use `rtr-wine` for focus rings:
- `focus-visible:ring-2 focus-visible:ring-rtr-wine focus-visible:ring-offset-2`

## Tailwind Classes

All RTR colors are available as Tailwind utility classes:

- `bg-rtr-wine`, `text-rtr-wine`, `border-rtr-wine`
- `bg-rtr-blush`, `text-rtr-blush`
- `bg-rtr-cream`, `text-rtr-cream`
- `bg-rtr-ink`, `text-rtr-ink`
- `bg-rtr-slate`, `text-rtr-slate`
- `bg-rtr-success`, `text-rtr-success`
- `bg-rtr-warning`, `text-rtr-warning`
- `bg-rtr-danger`, `text-rtr-danger`

## CSS Variables

All colors are also available as CSS variables for use in custom CSS:

- `var(--rtr-wine)`
- `var(--rtr-wine-light)`
- `var(--rtr-blush)`
- `var(--rtr-cream)`
- `var(--rtr-ink)`
- `var(--rtr-slate)`
- `var(--rtr-border)`
- `var(--rtr-success)`
- `var(--rtr-warning)`
- `var(--rtr-danger)`

## Design Principles

1. **Harmony with RTR Brand**: The design system maintains visual consistency with Rent the Runway's brand identity through the deep wine color and clean, minimal aesthetic.

2. **Professional & Internal**: Designed for an internal operations dashboard - fewer gradients, more solid colors, clear hierarchy.

3. **Accessibility First**: All color combinations meet WCAG contrast requirements. Text colors are chosen for maximum readability.

4. **Consistency**: Use the provided components and color tokens rather than custom colors to maintain visual consistency across the application.

