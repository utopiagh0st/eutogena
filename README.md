# Friend-Dex — Social Atlas

A local-first React + TypeScript prototype for mapping people and their relationships.

## Requirements
- Node.js 20.19+ or 22.12+ (current LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually http://localhost:5173).

## What is implemented
- Interactive graph using `@xyflow/react`
- Fictional starter people and relationships
- Click a node to inspect a profile
- Edit profile notes
- Add people
- Connect nodes by dragging from one node handle to another
- Search people
- Save people, node positions, and connections in browser `localStorage`
- Responsive layout for smaller screens

## Important prototype limitations
- Data is saved only in this browser on this device. It is not synced to other devices and is not a secure database.
- Demo people are fictional.
- Relationship labels/colors are currently starter defaults; a dedicated relationship editor is a next milestone.
- The Oracle button is a placeholder. No AI calls or predictions are made yet.
- Do not enter highly sensitive information into this prototype.

## Next milestones
1. Create a dedicated relationship editor with relationship type and dimensions (trust, friendship, respect, etc.).
2. Add events and dated observations.
3. Export/import JSON backups.
4. Move storage to a backend/database when remote access is needed.
5. Add the Oracle with explicit uncertainty, evidence references, and approval before any edits to stored profiles.
