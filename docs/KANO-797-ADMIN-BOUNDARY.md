# Kano 797 adult/admin boundary

`/admin/797` is a private business-support surface. It is not part of Archie,
Ask Archie, lessons, games, reading, teacher mode or the 3D world.

Access requires an authenticated user with both `isAdmin: true` and the exact
role `kano797-admin`. Child, parent and teacher roles are denied even if an
account is incorrectly marked as an administrator. Future APIs under this area
must enforce `canAccessPrivate797` on the server; a client gate is not enough.

Never place links to this route in child-facing navigation. Never return secrets,
raw prompts, memory, logs, tokens or private business data to child routes. The
free-access/1182 session is explicitly a non-admin child session.

The visual consistency checklist may reference only the approved character
sheet, island/castle map and interiors. It must not create or alter child-facing
artwork.
