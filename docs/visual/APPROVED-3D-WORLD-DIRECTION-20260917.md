# Sodafom approved 3D world direction — 17 September 2026

Branch: `visual/approved-3d-world-20260917`
Base: `integration/sodafom-big-jobs-20260915`

This branch is a visual implementation branch only. It must not deploy to Railway or merge into production until the combined build and device tests pass.

## Approved visual target

Use the founder-approved visual references supplied in chat as the look-and-feel target. Use clean original artwork/assets from the project/Library for implementation; do not embed phone-gallery screenshots, black screenshot borders, phone chrome or gallery controls.

### World/navigation

- The 3D village/map becomes the main explorable navigation concept.
- Destinations include Village Shops, Fairground, School & Science, Library, Castle & Museum, Theatre, Sports & Swimming, Night Sky/Space, Harbour/Nature Trail, Birthday Room, Founder Room, Ask Archie/Conversation Corner, Family Home and Settings.
- Maintain clear normal navigation controls as an accessibility fallback; the 3D world must not trap a child inside a scene.

### Approved scene direction

- Fairground: premium colourful evening fairground, carousel and Twister-style ride atmosphere, child-friendly movement and lights.
- Library: warm magical library, real books and approved story art, characters may step out of books and return.
- Space: interactive solar-system room with planets rotating naturally; no decorative orbit-line clutter in immersive mode.
- Founder Room: approved founder visual direction and project story, with memorial material kept respectful and separate from game mechanics.
- Theatre: premium stage for approved Sodafom cartoons and learning shows.
- Birthday: colourful birthday scene with optional reduced-motion mode.
- Family/characters: keep approved character identities and proportions consistent across rooms.

## Character consistency

- Preserve the approved founder design, Archie design, robot design and family/dog references.
- Archie remains blond with bright emerald-green eyes and the approved blue/gold outfit unless a specific approved outfit is selected.
- Jessica and Sally remain black dogs; Daisy remains brown/white.
- Dogs use barks/reactions, never human speech.
- Do not replace existing approved book illustrations.

## Reusable movement system

Build/consume modular movement actions rather than one-off per-page animation. Required groups include character idle/walk/run/turn/wave/point/sit/stand/jump/talk/look/pick-up/carry/drop/enter/exit/follow/chase; dog walk/run/tail-wag/sit/lie/bark-reaction; book open/close/page-turn/spin/fly-off-shelf/character-step-out-and-return; object/globe spin/roll/bounce/wobble/float/swing; doors open/close and bounded environmental light movement.

All movement must support reduced-motion/static fallback and pause when off-screen where practical.

## Interaction rules

- Existing buttons, lessons, games, reading, homework, reports, parent and teacher functions remain functional underneath the visual upgrade.
- Never make decorative characters trigger real payment, delete, cancel, account, submit or navigation actions.
- Mischief animations are visual only and rate-limited.
- Do not introduce floating emoji/symbol clutter.
- Touch targets must work on phones/tablets and mouse/keyboard controls on desktop.

## Implementation order

1. Establish shared 3D scene shell and responsive camera/layout rules.
2. Implement the village/map navigation with accessible 2D fallback navigation.
3. Wire existing destination routes without changing their business logic.
4. Add the reusable movement library/test room.
5. Upgrade Fairground, Library, Space, Theatre, Birthday and Founder Room one at a time.
6. Reuse the integrated voice/audio framework for dialogue and reactions.
7. Test low/mid/high mobile performance, reduced-motion mode, tablet and desktop.
8. Run full type-check/build/tests on the combined integration branch before any Railway test deployment.

## Preservation rule

Do not delete existing learning content, books, approved artwork, account logic, progress saving, Local-AI routing or safety controls merely to achieve the new 3D appearance. Visual work must adapt around those systems.