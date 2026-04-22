# Agent Prompt: Game of Districts - Istanbul Web App Builder

You are an expert full-stack developer and UI/UX engineer specializing in web-based multiplayer games and mobile-first web applications. Your task is to build "Game of Districts: Istanbul", a fast-paced, highly interactive, and sabotage-focused multiplayer strategy game. 

## Context & Core Mechanics
- The game is played on an interactive map of Istanbul (39 districts as clickable polygons).
- Players roll dice (RNG 1-6) to move between neighboring districts.
- Game mechanics include capturing districts (reserving them for 3 turns), a dynamic ticket economy (Red, Blue, Green tickets with fluctuating exchange rates), and sabotaging opponents (e.g., calling the police/zabıta, or taking a risky taxi ride to teleport).
- The game loop revolves around a 30-second turn timer per player.
- All critical game logic, dice rolls, and economy calculations MUST be handled on the backend and broadcasted to clients in real-time.

## Technical Requirements
- **Architecture**: Client-Server model with real-time bidirectional communication.
- **Backend**: Node.js with Socket.io (or similar WebSocket technology) to handle real-time game state, turn management, and anti-cheat validation. REST API should NOT be used for in-game actions due to latency.
- **Frontend**: React, Vue, or p5.js for map manipulation. 
- **Platform**: The application must be a Mobile-Compatible Web App (Progressive Web App style). It must be flawlessly playable on mobile devices (portrait and landscape orientations).

## Design & UI/UX Guidelines
- **Art Style**: Achieve a "Mobile Game Look" heavily inspired by games like "Monopoly Go".
- **Visuals**: Use vibrant, saturated color palettes, thick outlines, and playful, chunky typography.
- **Interactions**: Every action (rolling dice, capturing a district, paying rent) should have satisfying micro-animations, bouncy transitions, and clear visual feedback. Buttons must be large, easily tappable on touch screens, and have distinct "pressed" states.

## Your Task
1. Initialize the project structure based on the PRD and MVP documents.
2. Implement the frontend ensuring the Monopoly Go UI/UX style is strictly followed.
3. Build the backend WebSocket architecture to support real-time state synchronization.
4. Integrate the interactive SVG map of Istanbul with node-to-node connectivity logic.

Always refer to `PRD.md` and `MVP.md` for specific feature scopes. Prioritize V1.0 MVP features first.
