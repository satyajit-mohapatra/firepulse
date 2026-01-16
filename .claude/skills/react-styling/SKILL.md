name: react-styling
description: Tailwind CSS styling patterns, responsive design, and component styling conventions. Use when styling components, adding responsive breakpoints, or applying color themes.
---

**CSS Framework:** Tailwind CSS (utility classes)

## Class Patterns

### Container Patterns
```tsx
// Card section
<section className="space-y-6 p-6 md:p-8 rounded-[1.5rem] border shadow-lg relative z-10">
    {/* content */}
</section>

// Grid layout
<div className="grid grid-cols-12 gap-3 items-end">
    <div className="col-span-12 sm:col-span-5">{/* field */}</div>
</div>

// Flex layout
<div className="flex items-center justify-between gap-2">
    <span>Left</span>
    <span>Right</span>
</div>
```

### Typography
```tsx
// Labels (small, uppercase, tracking)
<label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
    Field Label
</label>

// Headings
<h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em]">
    Section Title
</h3>

// Body text
<p className="text-sm text-slate-600">
    Regular paragraph text
</p>
```

### Form Elements
```tsx
// Input field
<input
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg
               text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/50"
/>

// Button
<button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg
                  text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
    Click
</button>
```

### Color Themes
Reference: `components/wizard/Phase1Inputs.tsx` (lines 36-43)

```tsx
const COLORS = {
    emerald: 'from-emerald-600 to-teal-600 border-emerald-200/50 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-emerald-50/60 text-emerald-700',
    amber: 'from-amber-600 to-orange-600 border-amber-200/50 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-50/60 text-amber-700',
    // ...
};

// Usage
<div className={colorClasses.split(' ').slice(2).join(' ')}>
    {/* content */}
</div>
```

## Responsive Design

- Prefix: `sm:`, `md:`, `lg:`
- Pattern: `text-[10px] sm:text-xs md:text-sm`
- Use for: font sizes, spacing, column spans

## Animations

```tsx
// Fade-in animation
<div className="animate-in fade-in slide-in-from-top-2">
    {/* content */}
</div>

// Transition classes
className="transition-colors duration-200"
```

## Custom Component Styling

Example from SliderInput:
```tsx
className="flex flex-col space-y-2 group w-full slider-input-container"
```

Add custom identifier classes (`slider-input-container`) for specific targeting if needed.
