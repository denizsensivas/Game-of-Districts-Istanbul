# Frontend Skill Guideline: "Monopoly Go" Style & Mobile Game Look

This document outlines the UI/UX and frontend implementation guidelines to achieve a vibrant, engaging "Mobile Game Look" for Game of Districts: Istanbul, inspired by games like "Monopoly Go".

## 1. Design Philosophy
The goal is to move away from standard, rigid web application interfaces and create a tactile, playful, and highly responsive mobile game experience inside a web browser. Every interaction should feel rewarding.

## 2. Color Palette & Lighting
- **Vibrant & Saturated:** Avoid muted or pastel colors. Use rich, primary, and secondary colors (Bright Reds, Electric Blues, Neon Greens, Deep Yellows).
- **Contrasting Accents:** Use bright contrasting colors for Call to Action (CTA) buttons (e.g., a bright yellow/gold "Roll Dice" button on a blue background).
- **Gradients & Shadows:** Flat design should be avoided. Use subtle linear or radial gradients to give elements volume. Apply soft, colored drop shadows to buttons and modal windows to make them "pop" off the screen.

## 3. Typography
- **Chunky & Playful Fonts:** Use thick, bold, and rounded sans-serif fonts (e.g., Fredoka One, Nunito, Poppins, or similar Google Fonts). 
- **Legibility:** Ensure text is highly legible on small mobile screens.
- **Text Effects:** Use text strokes (outlines) and subtle text-shadows for titles, numbers (like currency amounts), and important notifications to give them a 3D, sticker-like appearance.

## 4. UI Components (Mobile-First)
- **Buttons:** 
  - Must be large and easily tappable (minimum 48x48px touch target).
  - Should have a 3D pill or rounded-rectangle shape.
  - **Interaction:** Buttons must visually depress (scale down slightly or translate downwards on the Y-axis) when clicked/tapped, simulating a physical button press.
- **Modals & Pop-ups:** 
  - Should not just appear; they should "spring" or "bounce" into view.
  - Background overlays should have a dark, semi-transparent blur (glassmorphism combined with game UI styling).
- **HUD (Heads Up Display):** 
  - Keep the screen uncluttered. Pin essential information (Ticket Wallet, Turn Timer, Player Avatar) to the edges of the screen.

## 5. Animations & Micro-interactions
CSS animations and libraries like Framer Motion or GSAP are crucial.
- **Bouncy Physics:** Use spring animations rather than linear or simple ease-in-out transitions. Menus should overshoot slightly and bounce back when opening.
- **Particle Effects:** Consider lightweight particle systems (e.g., confetti when winning, floating numbers when spending/earning tickets) to enhance the feeling of reward.
- **State Changes:** Map polygons (districts) should pulse or highlight smoothly when selectable. When a district is captured, apply a satisfying stamp or color-fill animation.

## 6. Mobile Compatibility
- **Responsive Layout:** Ensure the map scales correctly and remains navigable on both portrait and landscape modes.
- **Touch Gestures:** Implement smooth panning and zooming for the map. Ensure no native browser behaviors (like pull-to-refresh or double-tap to zoom) interfere with the game experience.
- **Performance:** Optimize SVG paths and CSS animations to ensure 60fps performance on mid-range mobile devices. Use `transform` and `opacity` for animations to utilize GPU acceleration.
