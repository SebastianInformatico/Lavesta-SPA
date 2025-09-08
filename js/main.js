// Utilidades
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Carrusel simple
(function initCarousel(){
  const carousel = document.querySelector('[data-carousel]');
  if(!carousel) return;
  const track = $('[data-track]', carousel);
  if(!track) return;
  let index = 0;
  const items = $$('.carousel-item', track);
  const update = () => { track.style.transform = `translateX(-${index * 100}%)`; };

  $$('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir || 1);
      index = (index + dir + items.length) % items.length;
      update();
    });
  });
})();

// Chatbot minimo (UI + respuestas basicas)
(function initChat(){
  const box = $('#chatbot');
  const btn = $('.chatbot-boton');
  const close = $('.chatbot-cerrar');
  const input = $('#userMessage');
  const out = $('#chatbotMessages');
  if(!box || !btn || !input || !out) return;

  const open = () => { box.style.display = 'flex'; btn.setAttribute('aria-expanded','true'); input.focus(); };
  const hide = () => { box.style.display = 'none'; btn.setAttribute('aria-expanded','false'); };

  btn.addEventListener('click', () => {
    const visible = box.style.display === 'flex';
    visible ? hide() : open();
  });
  close.addEventListener('click', hide);

  const print = (text, who='bot') => {
    const el = document.createElement('div');
    el.className = `msg ${who}`;
    el.textContent = text;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
  };

  const reply = (msg) => {
    const low = msg.toLowerCase();
    const hora = new Date().getHours();
    if(low.includes('hola')){
      if(hora < 12) return 'Buenos dias!';
      if(hora < 18) return 'Buenas tardes!';
      return 'Buenas noches!';
    }
    if(low.includes('servicio') || low.includes('precio')){
      return 'Ofrecemos lavado, traslados y custodia. Escribenos por WhatsApp para cotizar.';
    }
    if(low.includes('gracias')){
      return 'Con gusto! Estamos para ayudarte.';
    }
    return 'Gracias por contactarnos. Pronto te responderemos.';
  };

  input.addEventListener('keydown', (e) => {
    if(e.key !== 'Enter') return;
    const msg = input.value.trim();
    if(!msg) return;
    print(msg, 'me');
    input.value = '';
    setTimeout(() => print(reply(msg), 'bot'), 600);
  });

  // Burbuja de bienvenida tras 5s si el chat no esta abierto
  window.addEventListener('load', () => {
    setTimeout(() => {
      if(box.style.display === 'flex') return;
      const bubble = document.createElement('div');
      bubble.className = 'messages msg bot';
      bubble.style.position = 'fixed';
      bubble.style.right = '90px';
      bubble.style.bottom = '95px';
      bubble.style.background = 'rgba(69,123,157,.2)';
      bubble.style.padding = '10px 12px';
      bubble.style.borderRadius = '12px';
      bubble.textContent = 'Necesitas ayuda?';
      document.body.appendChild(bubble);
      bubble.addEventListener('click', () => { open(); bubble.remove(); });
      setTimeout(() => bubble.remove(), 8000);
    }, 5000);
  });
})();

// Animaciones de entrada on-scroll
(function initReveal(){
  const items = Array.from(document.querySelectorAll('.reveal'));
  if(!('IntersectionObserver' in window) || !items.length) return items.forEach(el=>el.classList.add('in-view'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); } });
  },{ threshold:.15 });
  items.forEach(el=>io.observe(el));
})();

// Parallax sutil para imagenes flotantes
(function initParallax(){
  const floats = Array.from(document.querySelectorAll('.float-img'));
  if(!floats.length) return;
  const strength = 10; // px
  window.addEventListener('mousemove', (e) => {
    const { innerWidth:w, innerHeight:h } = window;
    const x = (e.clientX / w - .5) * 2; // -1..1
    const y = (e.clientY / h - .5) * 2;
    floats.forEach((el,i)=>{
      const s = (i%3+1)/3; // variacion por elemento
      el.style.transform = `translate(${x*strength*s}px, ${y*strength*s}px)`;
    });
  });
})();

// Seasonal removed

// Formspree AJAX submit
(function initFormspree(){
  const form = document.getElementById('fs-contact');
  if(!form) return;
  const endpoint = form.getAttribute('data-formspree');
  const status = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(form.querySelector('.hp') && form.querySelector('.hp').value) return; // honeypot
    if(!endpoint || endpoint.includes('YOUR_FORM_ID')){
      if(status) status.textContent = 'Configura tu Form ID de Formspree.';
      return;
    }
    try{
      submitBtn.disabled = true; if(status) status.textContent = '';
      const data = new FormData(form);
      const res = await fetch(endpoint, { method:'POST', body:data, headers:{ 'Accept':'application/json' } });
      if(res.ok){
        if(status) status.textContent = 'Gracias! Te responderemos pronto.';
        form.reset();
      } else {
        if(status) status.textContent = 'No se pudo enviar. Intenta mas tarde.';
      }
    } catch{
      if(status) status.textContent = 'Error de red. Intenta nuevamente.';
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
