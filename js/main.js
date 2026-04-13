// Utilities
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ─── Mobile nav toggle ──────────────────────────────────────────
(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('mobile-nav');
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.mobile-link, .btn').forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ─── Header scroll shadow ───────────────────────────────────────
(function initHeaderScroll() {
  const header = $('#site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ─── Carousel ───────────────────────────────────────────────────
(function initCarousel() {
  const carousel = $('[data-carousel]');
  if (!carousel) return;
  const track = $('[data-track]', carousel);
  if (!track) return;
  const items = $$('.carousel-item', track);
  let index = 0;
  let autoTimer = null;

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  const advance = (dir) => {
    index = (index + dir + items.length) % items.length;
    update();
  };

  $$('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      advance(Number(btn.dataset.dir || 1));
      resetAuto();
    });
  });

  // Auto-advance every 5s
  const startAuto = () => { autoTimer = setInterval(() => advance(1), 5000); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };
  startAuto();
})();

// ─── Scroll Reveal ──────────────────────────────────────────────
(function initReveal() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window) || !items.length) {
    return items.forEach(el => el.classList.add('in-view'));
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
})();

// ─── Parallax on hero images (desktop only) ─────────────────────
(function initParallax() {
  const mainImg = $('.hero-main-img');
  const thumb = $('.hero-thumb');
  if (!mainImg || window.matchMedia('(max-width: 900px)').matches) return;
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    mainImg.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
    if (thumb) thumb.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
  }, { passive: true });
})();


// ─── Chatbot ────────────────────────────────────────────────────
(function initChat() {
  const box     = $('#chatbot');
  const toggle  = $('#chatbot-toggle');
  const close   = $('#chatbot-close');
  const input   = $('#userMessage');
  const sendBtn = $('#chatbot-send');
  const out     = $('#chatbotMessages');
  if (!box || !toggle || !input || !out) return;

  // Open / Close
  const openChat = () => {
    box.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    input.focus();
    if (!out.children.length) greet();
  };

  const closeChat = () => {
    box.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    box.classList.contains('open') ? closeChat() : openChat();
  });
  close.addEventListener('click', closeChat);

  // Print message
  const print = (text, who = 'bot') => {
    const el = document.createElement('div');
    el.className = `msg ${who}`;
    el.textContent = text;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
  };

  // Greeting
  const greet = () => {
    const h = new Date().getHours();
    const saludo = h < 12 ? '¡Buenos días!' : h < 18 ? '¡Buenas tardes!' : '¡Buenas noches!';
    setTimeout(() => print(`${saludo} 👋 Bienvenido a Lavesta Spa. ¿En qué puedo ayudarte?`), 300);
  };

  // Auto-reply logic
  const reply = (msg) => {
    const low = msg.toLowerCase();
    if (/(hola|buenas|buenos|hi)/.test(low)) return '¡Hola! ¿En qué te puedo ayudar hoy? 😊';
    if (/(precio|costo|cuánto|cuanto|tarifa|cobr)/.test(low))
      return 'Los precios varían según el servicio. Te recomendamos escribirnos por WhatsApp para una cotización personalizada.';
    if (/(lav|lavado|brillo|sucio)/.test(low))
      return 'Ofrecemos lavado exterior e interior con productos de calidad. ¡Dejamos tu vehículo impecable!';
    if (/(custodia|guardar|deposito|depósito|estacion|estacionamiento|mensual)/.test(low))
      return 'Contamos con estacionamiento seguro y monitoreado. Puedes dejar tu vehículo por el tiempo que necesites.';
    if (/(traslado|mover|llevar|transporte)/.test(low))
      return 'Realizamos traslados de vehículos dentro y fuera de Chiloé con conductores de confianza.';
    if (/(horario|hora|atienden|abren|abierto)/.test(low))
      return 'Para consultar el horario actualizado, escríbenos por WhatsApp al +56 9 5400 8455.';
    if (/(ubicacion|ubicación|donde|dirección|llegar|address)/.test(low))
      return 'Estamos en Pindapulli km 1163, Dalcahue, Chiloé 5730000. A minutos del Aeropuerto de Mocopulli. 📍';
    if (/(gracias|thank|perfecto|excelente|genial|bien)/.test(low))
      return '¡Con mucho gusto! Estamos para ayudarte. 😊';
    if (/(whatsapp|wsp|contacto|escribir|llamar)/.test(low))
      return 'Puedes escribirnos directamente por WhatsApp: +56 9 5400 8455 o desde el botón flotante en la pantalla.';
    return '¡Gracias por tu consulta! Para mayor información, escríbenos por WhatsApp. Respondemos a la brevedad. 😊';
  };

  // Send handler
  const send = () => {
    const msg = input.value.trim();
    if (!msg) return;
    print(msg, 'me');
    input.value = '';
    const thinking = document.createElement('div');
    thinking.className = 'msg bot';
    thinking.innerHTML = '<em style="opacity:.5">Escribiendo...</em>';
    out.appendChild(thinking);
    out.scrollTop = out.scrollHeight;
    setTimeout(() => {
      out.removeChild(thinking);
      print(reply(msg));
    }, 700);
  };

  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  sendBtn.addEventListener('click', send);

  // Welcome bubble after 6s if chat is closed
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (box.classList.contains('open')) return;
      const bubble = document.createElement('div');
      bubble.style.cssText = `
        position:fixed; right:100px; bottom:36px;
        background:white; padding:12px 16px; border-radius:14px;
        box-shadow:0 10px 30px rgba(0,0,0,0.12); font-size:.9rem;
        cursor:pointer; z-index:1002; border:1px solid rgba(14,165,233,0.2);
        animation: fadeIn .4s ease;
        color:#1e293b; font-family:'Inter',sans-serif;
        white-space:nowrap;
      `;
      bubble.textContent = '¿Necesitas ayuda? 💬';
      const style = document.createElement('style');
      style.textContent = '@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }';
      document.head.appendChild(style);
      document.body.appendChild(bubble);
      bubble.addEventListener('click', () => { openChat(); bubble.remove(); });
      setTimeout(() => { if (bubble.parentNode) bubble.remove(); }, 9000);
    }, 6000);
  });
})();

// ─── Formspree AJAX ─────────────────────────────────────────────
(function initFormspree() {
  const form = $('#fs-contact');
  if (!form) return;
  const endpoint = form.getAttribute('data-formspree');
  const status   = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const hp = form.querySelector('.hp');
    if (hp && hp.value) return;
    if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
      if (status) status.textContent = 'Configura tu Form ID de Formspree.';
      return;
    }
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      if (status) status.textContent = '';
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        if (status) status.textContent = '✅ ¡Mensaje enviado! Te respondemos pronto.';
        form.reset();
      } else {
        if (status) status.textContent = '❌ No se pudo enviar. Intenta más tarde.';
      }
    } catch {
      if (status) status.textContent = '❌ Error de red. Intenta nuevamente.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar mensaje';
    }
  });
})();
