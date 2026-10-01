/* ============================================================
   Portfolio Eddie Zida : langue, menu mobile, animations, filtres, formulaire
   ============================================================ */
const root = document.documentElement;

/* Stockage local protégé (navigation privée, cookies bloqués...) */
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignoré */ } }
};

/* ---------- Langue FR / EN ---------- */
const langBtn = document.getElementById('lang-btn');

function setLang(lang) {
  root.dataset.lang = lang;
  root.lang = lang;
  store.set('lang', lang);
  langBtn.innerHTML = lang === 'fr' ? '<b>FR</b> / EN' : 'FR / <b>EN</b>';

  // Placeholders des champs
  document.querySelectorAll('[data-ph-fr]').forEach((el) => {
    el.placeholder = lang === 'fr' ? el.dataset.phFr : el.dataset.phEn;
  });

  // Options du select (masquer celles de l'autre langue, compatible Safari)
  document.querySelectorAll('select option').forEach((opt) => {
    const other = lang === 'fr' ? 'en' : 'fr';
    opt.hidden = opt.disabled = opt.classList.contains(other);
  });
  document.querySelectorAll('select').forEach((sel) => {
    if (sel.selectedOptions[0] && sel.selectedOptions[0].hidden) {
      sel.value = [...sel.options].find((o) => !o.hidden).value;
    }
  });
}

const savedLang = store.get('lang');
const browserLang = (navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
setLang(savedLang || browserLang);
langBtn.addEventListener('click', () => setLang(root.dataset.lang === 'fr' ? 'en' : 'fr'));

/* ---------- Menu mobile ---------- */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  burger.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
});
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<i class="fas fa-bars"></i>';
}));

/* ---------- Animations d'apparition ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => revealObserver.observe(el));

/* ---------- Lien actif dans le menu selon la section visible ---------- */
const navLinks = [...nav.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

/* ---------- Filtres des projets ---------- */
const filterButtons = document.querySelectorAll('#filters button');
const projects = document.querySelectorAll('.project');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    projects.forEach((p) => p.classList.toggle('hidden', f !== 'all' && p.dataset.cat !== f));
  });
});

/* ---------- Formulaire de contact (Formspree) ---------- */
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const t = (fr, en) => (root.dataset.lang === 'fr' ? fr : en);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  // Tant que Formspree n'est pas configuré, on ouvre la messagerie de l'utilisateur
  if (form.action.includes('VOTRE_ID')) {
    const subject = encodeURIComponent('[Portfolio] ' + data.get('subject'));
    const body = encodeURIComponent(data.get('message') + '\n\n' + data.get('name') + ' (' + data.get('email') + ')');
    window.location.href = `mailto:zidaeddie@gmail.com?subject=${subject}&body=${body}`;
    return;
  }

  statusEl.className = 'form-status';
  statusEl.textContent = t('Envoi...', 'Sending...');
  try {
    const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error();
    form.reset();
    statusEl.textContent = t('Message envoyé, merci !', 'Message sent, thank you!');
  } catch (err) {
    statusEl.className = 'form-status error';
    statusEl.textContent = t("Échec de l'envoi. Écrivez-moi à zidaeddie@gmail.com", 'Sending failed. Email me at zidaeddie@gmail.com');
  }
});

/* ---------- Bandeau de logos : duplication pour une boucle sans coupure ---------- */
document.querySelectorAll('.marquee-track').forEach((track) => {
  [...track.children].forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
});

/* ---------- Tags de compétences : ordre d'apparition en cascade ---------- */
document.querySelectorAll('.skill-cards .card').forEach((card) => {
  card.querySelectorAll('.pill').forEach((pill, i) => pill.style.setProperty('--i', i));
});

/* ---------- Bouton retour en haut ---------- */
const toTop = document.getElementById('to-top');
const toggleToTop = () => toTop.classList.toggle('visible', window.scrollY > 600);
window.addEventListener('scroll', toggleToTop, { passive: true });
toggleToTop();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- Année du footer ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
