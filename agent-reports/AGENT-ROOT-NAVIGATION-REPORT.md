# Agent Root Navigation Report

- Agent: Worker 1 — navigation audit
- Original task: Audit Home destinations and Home/back navigation; prevent old rainbow Games menu and legacy dark-green subject menu from being reached through current or saved routes.
- Branch: `agent-root-navigation-audit-20260913`
- Latest code commit before this report: `836f0ae0576e5b07d2ce16519c2a56db22ea59aa`
- Pushed: yes (GitHub branch)
- Master merged: no
- Railway deployed: no

## Completed

1. Replaced the legacy `/games` route with a redirect to `/game-islands`.
2. Replaced the legacy `/subjects` route with a redirect to `/lessons`.
3. Redirected legacy saved game-hub links:
   - `/games/reading` -> `/reading`
   - `/games/maths` -> `/game-islands?island=maths`
   - `/games/spelling` -> `/game-islands?island=spelling`
4. Corrected the visible **Reading Games** button on `ReadingPage`: it now opens the English Game Island instead of the old reading Games menu, preventing the reported Reading -> old Games route.
5. Removed unused route imports for the old menu components.

## Tests performed

Static route assertions were run against the branch after both code commits. All passed:
- legacy Games route is a redirect to Game Islands
- legacy Subjects route is a redirect to Lessons
- reading, maths and spelling hub aliases redirect to their intended current destinations
- Reading Games button opens English Game Island
- old GamesPage and SubjectsPage are no longer mounted by these legacy routes

## Limits / next checks

- This was a source-level route audit. A full phone/PC click-through test still needs the app built and run with a browser/device.
- Individual game pages were deliberately retained; only the old menu and hub entry points were redirected.
- Parent, teacher, rewards and progress pages remain separate feature routes because their replacement artwork is being handled in other work; they were not deleted in this navigation-only change.

## Follow-up route inventory

A second static route inventory found all 16 Home artwork destinations and all 31 current artwork-page hotspot destinations have matching route definitions. Seven current artwork pages expose a direct Home hotspot. This verifies route availability only; it does not prove device tap targets or backend-dependent screens.
