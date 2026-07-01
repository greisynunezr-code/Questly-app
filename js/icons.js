/* ============================================================
   Questly — hand-drawn kawaii icon set (pastel sticker style)
   Exposes window.KAWAII (key -> <svg> string) plus curated lists.
   ============================================================ */
(function () {
  const OL = '#9E8FB0';      // soft outline
  const FC = '#6E5C86';      // face (eyes/mouth)
  const CH = '#F3A9C0';      // cheeks
  const sw = 'stroke-width="1.6"';

  // cute face: eyes + blush + smile centered at (x,y), size s
  function face(x, y, s) {
    s = s || 1;
    return `<circle cx="${x - 2.4 * s}" cy="${y}" r="${0.9 * s}" fill="${FC}"/>` +
      `<circle cx="${x + 2.4 * s}" cy="${y}" r="${0.9 * s}" fill="${FC}"/>` +
      `<ellipse cx="${x - 3.9 * s}" cy="${y + 1.5 * s}" rx="${1.15 * s}" ry="${0.9 * s}" fill="${CH}" opacity=".85"/>` +
      `<ellipse cx="${x + 3.9 * s}" cy="${y + 1.5 * s}" rx="${1.15 * s}" ry="${0.9 * s}" fill="${CH}" opacity=".85"/>` +
      `<path d="M${x - 1.6 * s} ${y + 1.4 * s} Q${x} ${y + 3.1 * s} ${x + 1.6 * s} ${y + 1.4 * s}" stroke="${FC}" stroke-width="${0.9 * s}" fill="none" stroke-linecap="round"/>`;
  }
  const svg = (inner) => `<svg viewBox="0 0 40 40" fill="none">${inner}</svg>`;
  const K = {};

  K.book = svg(`<path d="M6 12 C10 9 16 9 20 12 C24 9 30 9 34 12 L34 30 C30 27 24 27 20 30 C16 27 10 27 6 30 Z" fill="#F8CFDE" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M20 12 V30" stroke="${OL}" stroke-width="1.3"/>` + face(13, 19, 0.85));
  K.pencil = svg(`<g transform="rotate(45 20 20)"><rect x="16" y="6" width="8" height="21" rx="2" fill="#FBE08A" stroke="${OL}" ${sw}/><path d="M16 27 L20 33 L24 27 Z" fill="#F3C6A0" stroke="${OL}" ${sw} stroke-linejoin="round"/><rect x="16" y="6" width="8" height="4" rx="2" fill="#F2A8BE" stroke="${OL}" ${sw}/></g>` + face(20, 19, 0.8));
  K.laptop = svg(`<rect x="8" y="9" width="24" height="16" rx="2.5" fill="#CDE3E6" stroke="${OL}" ${sw}/><rect x="10.5" y="11.5" width="19" height="11" rx="1.5" fill="#EAF6F7"/><path d="M5 27 H35 L33 31 H7 Z" fill="#B8CFD3" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(20, 16, 0.85));
  K.backpack = svg(`<path d="M11 15 C11 9 29 9 29 15 L29 31 C29 33 27 34 25 34 L15 34 C13 34 11 33 11 31 Z" fill="#C9BEEB" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M15 15 C15 11 25 11 25 15" stroke="${OL}" ${sw} fill="none"/><rect x="15" y="24" width="10" height="8" rx="2" fill="#EDE7FA" stroke="${OL}" ${sw}/>` + face(20, 20, 0.8));
  K.palette = svg(`<path d="M20 8 C29 8 33 15 32 21 C31 26 26 25 25 28 C24 31 26 33 22 33 C13 33 7 27 7 20 C7 13 12 8 20 8 Z" fill="#F7E7C6" stroke="${OL}" ${sw} stroke-linejoin="round"/><circle cx="14" cy="16" r="1.8" fill="#F2A8BE"/><circle cx="24" cy="13" r="1.8" fill="#B7D9A8"/><circle cx="28" cy="19" r="1.8" fill="#A9C7EC"/><circle cx="13" cy="23" r="1.8" fill="#F6D06B"/>` + face(19, 25, 0.7));
  K.note = svg(`<rect x="10" y="7" width="20" height="26" rx="3" fill="#FBEF9E" stroke="${OL}" ${sw}/><line x1="10" y1="12" x2="30" y2="12" stroke="${OL}" stroke-width="1"/><g stroke="#C9A15A" stroke-width="1.4"><line x1="12" y1="9.5" x2="12" y2="5.5"/><line x1="20" y1="9.5" x2="20" y2="5.5"/><line x1="28" y1="9.5" x2="28" y2="5.5"/></g>` + face(20, 22, 0.85));
  K.broom = svg(`<rect x="18.5" y="6" width="3" height="18" rx="1.5" fill="#D9B48A" stroke="${OL}" ${sw}/><path d="M12 24 H28 L31 34 H9 Z" fill="#FBE08A" stroke="${OL}" ${sw} stroke-linejoin="round"/><line x1="16" y1="26" x2="14" y2="33" stroke="${OL}" stroke-width="1"/><line x1="20" y1="26" x2="20" y2="33" stroke="${OL}" stroke-width="1"/><line x1="24" y1="26" x2="26" y2="33" stroke="${OL}" stroke-width="1"/>` + face(20, 28, 0.7));
  K.bed = svg(`<path d="M5 20 C5 17 8 16 11 16 H26 C30 16 33 18 33 22 V30 H5 Z" fill="#C9E3D8" stroke="${OL}" ${sw} stroke-linejoin="round"/><rect x="8" y="18" width="10" height="7" rx="2.5" fill="#FFFFFF" stroke="${OL}" ${sw}/><path d="M5 26 H33" stroke="${OL}" stroke-width="1.2"/><line x1="6.5" y1="30" x2="6.5" y2="33" stroke="${OL}" ${sw}/><line x1="33" y1="30" x2="33" y2="33" stroke="${OL}" ${sw}/>` + face(24, 24, 0.75));
  K.trash = svg(`<path d="M10 12 H30 L28 33 C28 34 27 34 26 34 H14 C13 34 12 34 12 33 Z" fill="#C9BEEB" stroke="${OL}" ${sw} stroke-linejoin="round"/><rect x="8" y="9" width="24" height="4" rx="2" fill="#B7ADE0" stroke="${OL}" ${sw}/><rect x="16" y="6" width="8" height="4" rx="2" fill="#B7ADE0" stroke="${OL}" ${sw}/>` + face(20, 22, 0.85));
  K.basket = svg(`<path d="M9 16 H31 L28 32 C28 33 27 34 26 34 H14 C13 34 12 33 12 32 Z" fill="#F8CFDE" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M14 16 C14 10 26 10 26 16" stroke="${OL}" ${sw} fill="none"/>` + face(20, 24, 0.85));
  K.plant = svg(`<path d="M20 20 C20 12 26 10 28 8 C28 15 25 19 20 20 Z" fill="#B7D9A8" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M20 21 C20 14 15 12 12 11 C12 18 15 21 20 21 Z" fill="#C9E3B8" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M12 22 H28 L26 32 C26 33 25 34 24 34 H16 C15 34 14 33 14 32 Z" fill="#F2B7C8" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(20, 27, 0.8));
  K.dog = svg(`<ellipse cx="20" cy="22" rx="11" ry="10" fill="#F2D7B8" stroke="${OL}" ${sw}/><path d="M9 13 C6 12 5 17 8 20 Z" fill="#D9A876" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M31 13 C34 12 35 17 32 20 Z" fill="#D9A876" stroke="${OL}" ${sw} stroke-linejoin="round"/><ellipse cx="20" cy="24" rx="4" ry="3" fill="#FBEFE0"/><circle cx="20" cy="23" r="1.4" fill="${FC}"/>` + `<circle cx="16.4" cy="20" r="0.9" fill="${FC}"/><circle cx="23.6" cy="20" r="0.9" fill="${FC}"/><ellipse cx="13.6" cy="24" rx="1.1" ry="0.9" fill="${CH}" opacity=".85"/><ellipse cx="26.4" cy="24" rx="1.1" ry="0.9" fill="${CH}" opacity=".85"/>`);
  K.water = svg(`<path d="M20 6 C26 15 30 20 30 25 A10 10 0 0 1 10 25 C10 20 14 15 20 6 Z" fill="#B7D9EC" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(20, 24, 0.9));
  K.tooth = svg(`<path d="M11 12 C11 8 17 8 20 10 C23 8 29 8 29 12 C29 18 27 20 26 27 C25 31 22 31 22 26 C22 22 18 22 18 26 C18 31 15 31 14 27 C13 20 11 18 11 12 Z" fill="#FFFFFF" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(20, 17, 0.8));
  K.dumbbell = svg(`<rect x="17" y="17" width="6" height="6" rx="1" fill="#C9BEEB" stroke="${OL}" ${sw}/><g fill="#F2A8BE" stroke="${OL}" ${sw}><rect x="6" y="13" width="6" height="14" rx="2.5"/><rect x="28" y="13" width="6" height="14" rx="2.5"/></g><rect x="11" y="18" width="6" height="4" fill="#C9BEEB" stroke="${OL}" ${sw}/><rect x="23" y="18" width="6" height="4" fill="#C9BEEB" stroke="${OL}" ${sw}/>` + face(20, 20, 0.55));
  K.salad = svg(`<path d="M8 19 H32 C31 28 26 32 20 32 C14 32 9 28 8 19 Z" fill="#FFFFFF" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M8 19 C10 15 30 15 32 19 Z" fill="#C9E3B8" stroke="${OL}" ${sw} stroke-linejoin="round"/><circle cx="15" cy="17.5" r="2" fill="#F2A8BE"/><circle cx="24" cy="17" r="2" fill="#F6D06B"/>` + face(20, 25, 0.8));
  K.moon = svg(`<path d="M25 8 A13 13 0 1 0 32 24 A10 10 0 0 1 25 8 Z" fill="#D8CEF0" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(17, 22, 0.85));
  K.cup = svg(`<path d="M9 14 H27 V24 C27 28 24 31 20 31 C16 31 13 28 13 24 Z" fill="#F2B7C8" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M27 16 C32 16 32 24 27 24" stroke="${OL}" ${sw} fill="none"/><path d="M15 11 C15 9 17 9 17 7 M20 11 C20 9 22 9 22 7" stroke="${OL}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` + face(19, 21, 0.85));
  K.sun = svg(`<g stroke="#F6C045" stroke-width="2.4" stroke-linecap="round"><line x1="20" y1="4" x2="20" y2="8"/><line x1="20" y1="32" x2="20" y2="36"/><line x1="4" y1="20" x2="8" y2="20"/><line x1="32" y1="20" x2="36" y2="20"/><line x1="8.5" y1="8.5" x2="11" y2="11"/><line x1="29" y1="29" x2="31.5" y2="31.5"/><line x1="8.5" y1="31.5" x2="11" y2="29"/><line x1="29" y1="11" x2="31.5" y2="8.5"/></g><circle cx="20" cy="20" r="9" fill="#FCD360" stroke="${OL}" ${sw}/>` + face(20, 20, 0.95));
  K.star = svg(`<path d="M20 5 L23.5 15.2 L34.3 15.4 L25.7 21.9 L28.8 32.1 L20 26 L11.2 32.1 L14.3 21.9 L5.7 15.4 L16.5 15.2 Z" fill="#F6D06B" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(20, 18, 0.85));
  K.heart = svg(`<path d="M20 32 C6 23 8 11 15 11 C18.5 11 20 14 20 14 C20 14 21.5 11 25 11 C32 11 34 23 20 32 Z" fill="#F2A8BE" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(20, 20, 0.85));
  K.cloud = svg(`<g fill="#D8E4F5" stroke="${OL}" ${sw} stroke-linejoin="round"><path d="M12 28 A6 6 0 0 1 11 16.2 A7.5 7.5 0 0 1 25.5 14 A5.5 5.5 0 0 1 29 28 Z"/></g>` + face(20, 22, 0.85));
  K.alarm = svg(`<circle cx="20" cy="22" r="11" fill="#CDE3E6" stroke="${OL}" ${sw}/><circle cx="20" cy="22" r="8" fill="#EAF6F7"/><path d="M9 9 L14 13 M31 9 L26 13" stroke="${OL}" ${sw} stroke-linecap="round"/><path d="M20 17 V22 L24 24" stroke="${FC}" stroke-width="1.4" stroke-linecap="round"/>` + `<circle cx="16.5" cy="21" r="0.8" fill="${FC}"/><circle cx="23.5" cy="21" r="0.8" fill="${FC}"/>`);
  K.phone = svg(`<rect x="12" y="6" width="16" height="28" rx="4" fill="#F2B7C8" stroke="${OL}" ${sw}/><rect x="14.5" y="10" width="11" height="18" rx="1.5" fill="#FBEFF3"/>` + face(20, 18, 0.85));
  K.game = svg(`<path d="M11 15 H29 C33 15 34 25 31 29 C28 32 26 27 24 27 H16 C14 27 12 32 9 29 C6 25 7 15 11 15 Z" fill="#C9BEEB" stroke="${OL}" ${sw} stroke-linejoin="round"/><g stroke="${FC}" stroke-width="1.6" stroke-linecap="round"><line x1="14" y1="20" x2="14" y2="24"/><line x1="12" y1="22" x2="16" y2="22"/></g><circle cx="26" cy="20.5" r="1.4" fill="#F2A8BE"/><circle cx="28.5" cy="23" r="1.4" fill="#B7D9A8"/>` + face(20, 22, 0.7));
  K.icecream = svg(`<path d="M13 17 A7 7 0 0 1 27 17 Z" fill="#F2B7C8" stroke="${OL}" ${sw} stroke-linejoin="round"/><circle cx="20" cy="12" r="3" fill="#F8CFDE" stroke="${OL}" ${sw}/><path d="M13.5 18 L20 33 L26.5 18 Z" fill="#F3D8B0" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(20, 20, 0.7));
  K.pizza = svg(`<path d="M20 6 L34 30 C28 33 12 33 6 30 Z" fill="#FBE08A" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M20 6 L33 28 C28 31 12 31 7 28 Z" fill="#F3C29A"/><circle cx="16" cy="22" r="2" fill="#E7877A"/><circle cx="24" cy="20" r="2" fill="#E7877A"/><circle cx="20" cy="27" r="2" fill="#E7877A"/>` + face(20, 16, 0.7));
  K.movie = svg(`<rect x="7" y="15" width="26" height="18" rx="2" fill="#C9BEEB" stroke="${OL}" ${sw}/><path d="M7 15 L11 9 L16 15 M15 15 L19 9 L24 15 M23 15 L27 9 L32 15" fill="#EDE7FA" stroke="${OL}" stroke-width="1.3" stroke-linejoin="round"/>` + face(20, 24, 0.85));
  K.gift = svg(`<rect x="8" y="16" width="24" height="17" rx="2.5" fill="#F2B7C8" stroke="${OL}" ${sw}/><rect x="6" y="12" width="28" height="6" rx="2" fill="#F8CFDE" stroke="${OL}" ${sw}/><rect x="17" y="12" width="6" height="21" fill="#C9BEEB" stroke="${OL}" ${sw}/><path d="M20 12 C17 7 11 8 14 12 Z M20 12 C23 7 29 8 26 12 Z" fill="#B7ADE0" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(13, 25, 0.75));
  K.boba = svg(`<path d="M12 13 H28 L26 32 C26 33 25 34 24 34 H16 C15 34 14 33 14 32 Z" fill="#E7DFF5" stroke="${OL}" ${sw} stroke-linejoin="round"/><rect x="11" y="11" width="18" height="3" rx="1.5" fill="#D8CEF0" stroke="${OL}" ${sw}/><line x1="24" y1="6" x2="21" y2="13" stroke="${OL}" ${sw} stroke-linecap="round"/><g fill="#7A5E74"><circle cx="17" cy="30" r="1.4"/><circle cx="21" cy="31" r="1.4"/><circle cx="24" cy="29" r="1.4"/></g>` + face(20, 22, 0.8));
  K.cupcake = svg(`<path d="M11 20 H29 L26 32 C26 33 25 34 24 34 H16 C15 34 14 33 14 32 Z" fill="#F3D8B0" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M10 20 C10 13 30 13 30 20 Z" fill="#F8CFDE" stroke="${OL}" ${sw} stroke-linejoin="round"/><circle cx="20" cy="10" r="2.4" fill="#E7877A" stroke="${OL}" ${sw}/>` + face(20, 24, 0.75));
  K.cookie = svg(`<circle cx="20" cy="21" r="12" fill="#E7C089" stroke="${OL}" ${sw}/><g fill="#8A5A3A"><circle cx="15" cy="16" r="1.3"/><circle cx="26" cy="17" r="1.3"/><circle cx="27" cy="25" r="1.3"/><circle cx="14" cy="26" r="1.3"/></g>` + face(20, 21, 0.85));
  K.rocket = svg(`<path d="M20 5 C26 9 27 18 25 25 H15 C13 18 14 9 20 5 Z" fill="#EDE7FA" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M15 22 L10 27 L15 26 Z M25 22 L30 27 L25 26 Z" fill="#F2A8BE" stroke="${OL}" ${sw} stroke-linejoin="round"/><path d="M17 28 C17 32 23 32 23 28 Z" fill="#F6C045" stroke="${OL}" ${sw} stroke-linejoin="round"/>` + face(20, 16, 0.8));

  // categories default icons
  K.briefcase = svg(`<rect x="7" y="14" width="26" height="18" rx="3" fill="#C9BEEB" stroke="${OL}" ${sw}/><path d="M15 14 V11 C15 10 16 10 17 10 H23 C24 10 25 10 25 11 V14" stroke="${OL}" ${sw} fill="none"/><line x1="7" y1="22" x2="33" y2="22" stroke="${OL}" stroke-width="1.2"/>` + face(20, 18, 0.8));

  window.KAWAII = K;
  window.KAWAII_TASKS = ['book', 'pencil', 'note', 'laptop', 'backpack', 'palette', 'phone', 'dumbbell', 'water', 'tooth', 'salad', 'moon', 'bed', 'broom', 'basket', 'trash', 'plant', 'dog', 'cup', 'sun', 'star', 'heart', 'cloud', 'alarm', 'rocket'];
  window.KAWAII_REWARDS = ['game', 'icecream', 'pizza', 'movie', 'boba', 'cupcake', 'cookie', 'gift', 'phone', 'star', 'heart', 'cup'];

  /* ---------- Sprout: the evolving pet mascot ---------- */
  const G1 = '#CDE8BE', G2 = '#B7DDA6', LEAF = '#A6D18C', LEAFD = '#7FB271';
  const EGG = '#FBF3E1';
  const PS = (inner) => `<svg viewBox="0 0 48 48" fill="none">${inner}</svg>`;
  function peyes(x, y, s, mood) {
    if (mood === 'sleepy') return `<path d="M${x - 3.4 * s} ${y} q${1.5 * s} ${1.6 * s} ${3 * s} 0" stroke="${FC}" stroke-width="${1 * s}" fill="none" stroke-linecap="round"/><path d="M${x + 0.4 * s} ${y} q${1.5 * s} ${1.6 * s} ${3 * s} 0" stroke="${FC}" stroke-width="${1 * s}" fill="none" stroke-linecap="round"/>`;
    if (mood === 'happy') return `<path d="M${x - 3.6 * s} ${y + 0.6 * s} q${1.5 * s} -${1.8 * s} ${3 * s} 0" stroke="${FC}" stroke-width="${1.05 * s}" fill="none" stroke-linecap="round"/><path d="M${x + 0.6 * s} ${y + 0.6 * s} q${1.5 * s} -${1.8 * s} ${3 * s} 0" stroke="${FC}" stroke-width="${1.05 * s}" fill="none" stroke-linecap="round"/>`;
    const e = (ex) => `<circle cx="${ex}" cy="${y}" r="${1.7 * s}" fill="${FC}"/><circle cx="${ex - 0.55 * s}" cy="${y - 0.6 * s}" r="${0.55 * s}" fill="#fff"/>`;
    return e(x - 2.9 * s) + e(x + 2.9 * s);
  }
  function pmouth(x, y, s, mood) {
    if (mood === 'party') return `<path d="M${x - 2.2 * s} ${y + 2.2 * s} a${2.2 * s} ${2.2 * s} 0 0 0 ${4.4 * s} 0 Z" fill="#C56B7E"/>`;
    if (mood === 'sleepy') return `<ellipse cx="${x}" cy="${y + 2.8 * s}" rx="${0.9 * s}" ry="${1.2 * s}" fill="${FC}"/>`;
    const w = mood === 'happy' ? 2.6 * s : 1.9 * s;
    return `<path d="M${x - w} ${y + 2 * s} Q${x} ${y + 4 * s} ${x + w} ${y + 2 * s}" stroke="${FC}" stroke-width="${1 * s}" fill="none" stroke-linecap="round"/>`;
  }
  function pface(x, y, s, mood) {
    return `<ellipse cx="${x - 5.2 * s}" cy="${y + 1.8 * s}" rx="${1.7 * s}" ry="${1.2 * s}" fill="${CH}" opacity=".8"/><ellipse cx="${x + 5.2 * s}" cy="${y + 1.8 * s}" rx="${1.7 * s}" ry="${1.2 * s}" fill="${CH}" opacity=".8"/>` + peyes(x, y, s, mood) + pmouth(x, y, s, mood);
  }
  function pleaf(x, y, rot, sc) { sc = sc || 1; return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"><path d="M0 0 C-5 -2 -6.5 -9 -1 -12.5 C3.5 -8.5 3.5 -3 0 0 Z" fill="${LEAF}" stroke="${LEAFD}" stroke-width="1.1" stroke-linejoin="round"/><path d="M-0.5 -1 L-1 -10" stroke="${LEAFD}" stroke-width="0.8"/></g>`; }
  function ppetals(cx, cy, r, fill) { let p = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, px = cx + Math.cos(a) * r * 0.55, py = cy + Math.sin(a) * r * 0.55; p += `<ellipse cx="${px}" cy="${py}" rx="${r * 0.5}" ry="${r * 0.34}" fill="${fill}" stroke="${OL}" stroke-width="0.9" transform="rotate(${a * 57.3} ${px} ${py})"/>`; } return p; }
  function pspark(x, y, r) { return `<path d="M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z" fill="#FBE08A"/>`; }
  function pcrown(cx, cy) { return `<path d="M${cx - 7} ${cy + 4} L${cx - 7} ${cy} L${cx - 3} ${cy + 3} L${cx} ${cy - 3} L${cx + 3} ${cy + 3} L${cx + 7} ${cy} L${cx + 7} ${cy + 4} Z" fill="#FBD36B" stroke="${OL}" stroke-width="1.1" stroke-linejoin="round"/>`; }
  function pzzz(mood) { return mood === 'sleepy' ? `<text x="35" y="15" font-family="sans-serif" font-weight="700" font-size="8" fill="${FC}" opacity=".65">z</text><text x="40" y="9" font-family="sans-serif" font-weight="700" font-size="5.5" fill="${FC}" opacity=".5">z</text>` : ''; }

  window.PET_STAGE = (level) => level < 3 ? 0 : level < 5 ? 1 : level < 8 ? 2 : level < 11 ? 3 : level < 15 ? 4 : 5;
  window.petSVG = function (level, mood) {
    mood = mood || 'normal';
    const st = window.PET_STAGE(level);
    let s;
    if (st === 0) { // egg
      s = `<ellipse cx="24" cy="27" rx="13" ry="16" fill="${EGG}" stroke="${OL}" stroke-width="1.6"/>` + pface(24, 27, 0.95, mood);
    } else if (st === 1) { // hatchling in shell
      s = pleaf(27, 12, 22, 1) +
        `<ellipse cx="24" cy="23" rx="11" ry="10" fill="${G1}" stroke="${OL}" stroke-width="1.6"/>` +
        `<path d="M13 31 l3 -4 3 4 3 -4 3 4 3 -4 3 4 v3 a10 6 0 0 1 -21 0 Z" fill="${EGG}" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/>` +
        pface(24, 23, 0.9, mood);
    } else if (st === 2) { // baby sprout
      s = pleaf(27, 11, 18, 1) +
        `<ellipse cx="24" cy="28" rx="13" ry="12" fill="${G1}" stroke="${OL}" stroke-width="1.6"/>` +
        `<ellipse cx="18" cy="40" rx="3" ry="2.2" fill="${G2}" stroke="${OL}" stroke-width="1.4"/><ellipse cx="30" cy="40" rx="3" ry="2.2" fill="${G2}" stroke="${OL}" stroke-width="1.4"/>` +
        pface(24, 27, 1, mood);
    } else if (st === 3) { // teen (two leaves + arms)
      s = pleaf(21, 10, -16, 1.1) + pleaf(28, 10, 20, 1.1) +
        `<ellipse cx="24" cy="28" rx="14" ry="13" fill="${G2}" stroke="${OL}" stroke-width="1.6"/>` +
        `<ellipse cx="10.5" cy="28" rx="2.6" ry="4" fill="${G2}" stroke="${OL}" stroke-width="1.4"/><ellipse cx="37.5" cy="28" rx="2.6" ry="4" fill="${G2}" stroke="${OL}" stroke-width="1.4"/>` +
        `<ellipse cx="18" cy="42" rx="3.2" ry="2.4" fill="${G2}" stroke="${OL}" stroke-width="1.4"/><ellipse cx="30" cy="42" rx="3.2" ry="2.4" fill="${G2}" stroke="${OL}" stroke-width="1.4"/>` +
        pface(24, 27, 1.05, mood);
    } else if (st === 4) { // bloom
      s = ppetals(24, 11, 7, '#F3B7CF') + `<circle cx="24" cy="11" r="2.4" fill="#FBE08A" stroke="${OL}" stroke-width="1.1"/>` +
        pleaf(15, 16, -34, 0.9) +
        `<ellipse cx="24" cy="29" rx="14.5" ry="13.5" fill="${G2}" stroke="${OL}" stroke-width="1.6"/>` +
        `<ellipse cx="18" cy="43" rx="3.2" ry="2.4" fill="${G2}" stroke="${OL}" stroke-width="1.4"/><ellipse cx="30" cy="43" rx="3.2" ry="2.4" fill="${G2}" stroke="${OL}" stroke-width="1.4"/>` +
        pface(24, 28, 1.1, mood);
    } else { // max: crown + full bloom + sparkles
      s = pspark(9, 13, 2) + pspark(40, 15, 2.6) + pspark(39, 35, 2) +
        pcrown(24, 7) +
        ppetals(24, 14, 7.5, '#EAB7E0') + `<circle cx="24" cy="14" r="2.6" fill="#FBE08A" stroke="${OL}" stroke-width="1.1"/>` +
        `<ellipse cx="24" cy="30" rx="15" ry="14" fill="${G2}" stroke="${OL}" stroke-width="1.6"/>` +
        `<ellipse cx="9" cy="30" rx="2.8" ry="4.4" fill="${G2}" stroke="${OL}" stroke-width="1.4"/><ellipse cx="39" cy="30" rx="2.8" ry="4.4" fill="${G2}" stroke="${OL}" stroke-width="1.4"/>` +
        pface(24, 29, 1.15, mood);
    }
    return PS(s + pzzz(mood));
  };

  /* ---------- Fox mascot (evolves; overrides the sprout above) ---------- */
  const FUR = '#FCF3EC', EAR = '#F7C9CE', FOX_OL = '#CBA98B', FKCHEEK = '#F2A6B6', FEAT = '#7A614E', TTIP = '#E7CBAD', PAD = '#F4B4C2';
  function fEar(cx, cy, R, dir) {
    return `<path d="M${cx + dir * R * 0.18} ${cy - R * 0.5} L${cx + dir * R * 0.64} ${cy - R * 1.34} L${cx + dir * R * 0.96} ${cy - R * 0.3} Z" fill="${FUR}" stroke="${FOX_OL}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M${cx + dir * R * 0.34} ${cy - R * 0.56} L${cx + dir * R * 0.6} ${cy - R * 1.04} L${cx + dir * R * 0.79} ${cy - R * 0.4} Z" fill="${EAR}"/>`;
  }
  function fEye(ex, y, s, mood) {
    if (mood === 'happy') return `<path d="M${ex - 2 * s} ${y + 0.7 * s} q${2 * s} -${2.3 * s} ${4 * s} 0" stroke="${FEAT}" stroke-width="${1.15 * s}" fill="none" stroke-linecap="round"/>`;
    if (mood === 'sleepy') return `<path d="M${ex - 2 * s} ${y} q${2 * s} ${2.1 * s} ${4 * s} 0" stroke="${FEAT}" stroke-width="${1.15 * s}" fill="none" stroke-linecap="round"/>`;
    const r = mood === 'party' ? 2 * s : 1.7 * s;
    return `<circle cx="${ex}" cy="${y}" r="${r}" fill="${FEAT}"/><circle cx="${ex - 0.5 * s}" cy="${y - 0.6 * s}" r="${0.55 * s}" fill="#fff"/>`;
  }
  function fFace(cx, cy, s, mood) {
    const eyeY = cy - 0.6 * s, noseY = cy + 1.9 * s;
    let m = `<ellipse cx="${cx - 4.7 * s}" cy="${cy + 1 * s}" rx="${1.7 * s}" ry="${1.2 * s}" fill="${FKCHEEK}" opacity=".8"/><ellipse cx="${cx + 4.7 * s}" cy="${cy + 1 * s}" rx="${1.7 * s}" ry="${1.2 * s}" fill="${FKCHEEK}" opacity=".8"/>`;
    m += fEye(cx - 3.5 * s, eyeY, s, mood) + fEye(cx + 3.5 * s, eyeY, s, mood);
    m += `<ellipse cx="${cx}" cy="${noseY}" rx="${1.1 * s}" ry="${0.85 * s}" fill="${FEAT}"/>`;
    if (mood === 'party') m += `<path d="M${cx - 1.8 * s} ${noseY + 1 * s} a${1.8 * s} ${1.8 * s} 0 0 0 ${3.6 * s} 0 Z" fill="#C56B7E"/>`;
    else m += `<path d="M${cx} ${noseY + 0.7 * s} Q${cx - 1.2 * s} ${noseY + 2.2 * s} ${cx - 2.2 * s} ${noseY + 1.3 * s} M${cx} ${noseY + 0.7 * s} Q${cx + 1.2 * s} ${noseY + 2.2 * s} ${cx + 2.2 * s} ${noseY + 1.3 * s}" stroke="${FEAT}" stroke-width="${0.95 * s}" fill="none" stroke-linecap="round"/>`;
    return m;
  }
  function fHead(cx, cy, R, mood) {
    return fEar(cx, cy, R, -1) + fEar(cx, cy, R, 1) +
      `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.94}" fill="${FUR}" stroke="${FOX_OL}" stroke-width="1.6"/>` +
      fFace(cx, cy + R * 0.1, R * 0.125, mood);
  }
  function fBody(cx, cy, w, h) { return `<ellipse cx="${cx}" cy="${cy}" rx="${w}" ry="${h}" fill="${FUR}" stroke="${FOX_OL}" stroke-width="1.6"/>`; }
  function fTail(bx, by, sc) { sc = sc || 1; return `<g transform="translate(${bx} ${by}) scale(${sc})"><path d="M0 0 q9 -4 12 2 q3 7 -3 9 q-7 2 -11 -4 Z" fill="${FUR}" stroke="${FOX_OL}" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 3 q5 1 5 7 q-5 2 -8 -2 q3 -2 3 -5 Z" fill="${TTIP}" stroke="${FOX_OL}" stroke-width="1.1" stroke-linejoin="round"/></g>`; }
  function fPaw(x, y, r) { return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${FUR}" stroke="${FOX_OL}" stroke-width="1.4"/><ellipse cx="${x}" cy="${y + r * 0.3}" rx="${r * 0.42}" ry="${r * 0.36}" fill="${PAD}"/>`; }

  window.petSVG = function (level, mood) {
    mood = mood || 'normal';
    const st = window.PET_STAGE(level);
    let s = '';
    if (st === 0) {            // tiny kit
      s = fBody(24, 37, 8, 6) + fHead(24, 23, 12.5, mood);
    } else if (st === 1) {     // kit + little tail
      s = fTail(30, 32, 0.8) + fBody(24, 35, 10, 8) + fHead(24, 21, 12.5, mood);
    } else if (st === 2) {     // young fox, fluffier tail
      s = fTail(31, 30, 1) + fBody(24, 34, 11, 9) + fHead(24, 20, 12.5, mood);
    } else if (st === 3) {     // paws up
      s = fTail(32, 30, 1.05) + fBody(24, 34, 11.5, 9.5) + fPaw(13, 31, 3.1) + fPaw(35, 31, 3.1) + fHead(24, 20, 12.5, mood);
    } else if (st === 4) {     // bloom on ear
      s = fTail(32, 30, 1.1) + fBody(24, 34, 12, 10) + fPaw(12.5, 31, 3.2) + fPaw(35.5, 31, 3.2) + fHead(24, 20, 13, mood) + ppetals(33, 9, 5.5, '#F3B7CF') + `<circle cx="33" cy="9" r="1.8" fill="#FBE08A"/>`;
    } else {                   // crowned + sparkles
      s = pspark(8, 12, 2) + pspark(41, 14, 2.6) + pspark(40, 35, 2) + fTail(33, 30, 1.15) + fBody(24, 34, 12.5, 10.5) + fPaw(12, 31, 3.3) + fPaw(36, 31, 3.3) + fHead(24, 21, 13, mood) + pcrown(24, 8);
    }
    return PS(s + pzzz(mood));
  };
})();
