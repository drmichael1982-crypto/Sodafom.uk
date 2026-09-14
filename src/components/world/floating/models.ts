import * as T from 'three';

export function material(color: string, emissive = false) {
  return emissive ? new T.MeshBasicMaterial({ color }) : new T.MeshStandardMaterial({ color, roughness: .75 });
}

export function sphere(radius: number, color: string, emissive = false) {
  return new T.Mesh(new T.SphereGeometry(radius, 28, 18), material(color, emissive));
}

export function box(x: number, y: number, z: number, color: string) {
  return new T.Mesh(new T.BoxGeometry(x, y, z), material(color));
}

export function label(text: string, width = 1.6) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#15233a'; ctx.fillRect(0, 0, 512, 96);
    ctx.strokeStyle = '#c5dbf3'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 508, 92);
    ctx.fillStyle = '#f5f7ff'; ctx.font = 'bold 31px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 48, 480);
  }
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
  const sprite = new T.Sprite(new T.SpriteMaterial({ map: texture, depthTest: true }));
  sprite.scale.set(width, width * 96 / 512, 1);
  return sprite;
}

/** Decorative surface marks, deliberately not sold as geographic cartography. */
export function earth(radius: number) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2589d2'; ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#82c978';
    const patches = [[75, 82, 39, 45], [114, 155, 23, 42], [290, 88, 73, 32], [302, 139, 30, 42], [414, 178, 28, 16]];
    patches.forEach(([x, y, rx, ry]) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -.4, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#edf7f4'; ctx.fillRect(0, 0, 512, 10); ctx.fillRect(0, 241, 512, 15);
    ctx.strokeStyle = '#c3eaff'; ctx.globalAlpha = .3; ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke(); }
  }
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
  return new T.Mesh(new T.SphereGeometry(radius, 40, 28), new T.MeshStandardMaterial({ map: texture, roughness: .9 }));
}

export function openBook() {
  const group = new T.Group();
  const cover = box(2.8, .12, 1.85, '#a9528c'); group.add(cover);
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#fff9e9'; ctx.fillRect(0, 0, 512, 512); ctx.strokeStyle = '#454258'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(256, 190, 78, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(256 + 94 * Math.cos(a), 190 + 94 * Math.sin(a)); ctx.lineTo(256 + 125 * Math.cos(a), 190 + 125 * Math.sin(a)); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(55, 410); ctx.quadraticCurveTo(120, 300, 260, 398); ctx.quadraticCurveTo(370, 295, 460, 410); ctx.stroke();
    ctx.fillStyle = '#454258'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('COLOUR ME', 256, 475);
  }
  for (const side of [-1, 1]) {
    const page = box(1.3, .11, 1.7, '#fff9e9'); page.position.set(side * .68, .12, 0); page.rotation.z = -side * .09; group.add(page);
    const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
    const drawing = new T.Mesh(new T.PlaneGeometry(1.22, 1.58), new T.MeshStandardMaterial({ map: texture, roughness: 1 }));
    drawing.rotation.x = -Math.PI / 2; drawing.position.y = .061; page.add(drawing);
  }
  group.rotation.x = .25; group.rotation.y = -.15;
  return group;
}

export function pencils() {
  const group = new T.Group();
  ['#e97086', '#f7ca6b', '#77c9ba'].forEach((color, index) => {
    const pencil = new T.Group();
    pencil.add(new T.Mesh(new T.CylinderGeometry(.095, .095, 1.35, 6), material(color)));
    const point = new T.Mesh(new T.ConeGeometry(.095, .25, 6), material('#ead9bd')); point.position.y = .8; pencil.add(point);
    const lead = new T.Mesh(new T.ConeGeometry(.04, .1, 6), material(color)); lead.position.y = .95; pencil.add(lead);
    pencil.position.x = (index - 1) * .33; pencil.rotation.z = (index - 1) * -.18; group.add(pencil);
  });
  return group;
}

export function aircraft() {
  const group = new T.Group();
  const body = sphere(1, '#f5d797'); body.scale.set(.16, .17, .68); group.add(body);
  const wings = box(1.5, .07, .28, '#bd4c53'); wings.position.z = .05; group.add(wings);
  const tail = box(.65, .06, .18, '#bd4c53'); tail.position.z = .48; group.add(tail);
  const fin = box(.05, .3, .25, '#bd4c53'); fin.position.set(0, .18, .45); group.add(fin);
  const cockpit = sphere(.15, '#7ab6d3'); cockpit.scale.set(.85, .6, 1.1); cockpit.position.set(0, .15, -.17); group.add(cockpit);
  return group;
}

export function telescope() {
  const group = new T.Group();
  const barrel = new T.Mesh(new T.CylinderGeometry(.19, .14, .8, 20), material('#bca985')); barrel.rotation.x = Math.PI / 3; barrel.position.y = .35; group.add(barrel);
  for (let i = 0; i < 3; i++) { const leg = box(.04, .7, .04, '#cec9bd'); leg.position.set(.16 * Math.cos(i * Math.PI * 2 / 3), -.18, .16 * Math.sin(i * Math.PI * 2 / 3)); leg.rotation.z = .23; group.add(leg); }
  return group;
}
