// Helper
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const hint = $('#hint');
const stage = $('#stage');
const candles = $('#candles');
const tappable = $('.c3', candles);
const confettiLayer = $('#confetti-layer');

// Set initial pieces (offscreen) so GSAP bisa animasi masuk
gsap.set(['#plate','#bottom','#top','#candles'], { y: -28, autoAlpha: 0 });

function runSequence(){
  const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power2.out" } });

  tl.addLabel('start')
    .to('#plate',  { y: 0, autoAlpha: 1 }, 'start')
    .call(() => hint.textContent = 'Piring turun…')
    .to('#bottom', { y: 0, autoAlpha: 1 }, '>-0.1')
    .call(() => hint.textContent = 'Kue bagian bawah turun…')
    .to('#top',    { y: 0, autoAlpha: 1 }, '>')
    .call(() => hint.textContent = 'Kue bagian atas turun…')
    // Lilin bisa dibuat berurutan: dua dulu, lalu terakhir
    .to('#candles', { y: 0, autoAlpha: 1 }, '>')
    .call(() => {
      hint.innerHTML = 'Ketuk lilin paling kanan untuk menyalakan api ✨';
      enableTap();
    });

  return tl;
}

function enableTap(){
  const on = () => {
    lightCandles();
    launchConfetti();
    disableTap();
  };
  tappable.addEventListener('click', on);
  tappable.addEventListener('touchend', on, { passive: true });

  // simpan untuk removable
  tappable._onTap = on;
}

function disableTap(){
  if (tappable._onTap){
    tappable.removeEventListener('click', tappable._onTap);
    tappable.removeEventListener('touchend', tappable._onTap);
    delete tappable._onTap;
  }
}

function lightCandles(){
  // Toggle class agar animasi api berjalan (CSS)
  candles.classList.add('lit');

  // Efek kecil: skala kue & glow cepat saat nyala
  gsap.fromTo('#top', { filter: 'brightness(1)' }, { filter:'brightness(1.05)', duration:0.6, yoyo:true, repeat:1, ease:'power1.inOut' });
  gsap.fromTo('#bottom', { filter: 'brightness(1)' }, { filter:'brightness(1.03)', duration:0.6, yoyo:true, repeat:1, ease:'power1.inOut' });

  hint.textContent = 'Selamat ulang tahun! 🎂';
}

/** Confetti: buat elemen <span> banyak, jatuhkan dengan GSAP **/
function launchConfetti(){
  const colors = ['#ff5757', '#ffd857', '#57ffa0', '#57c7ff', '#b657ff', '#ff8dd6'];
  const count = Math.floor(140 + Math.random()*60); // 140–200 butir
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  for (let i=0; i<count; i++){
    const el = document.createElement('span');
    el.className = 'confetti';
    const w = 6 + Math.random()*10;
    const h = 8 + Math.random()*14;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.left = `${Math.random()*vw}px`;
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    el.style.opacity = 0.95;

    // variasi bentuk pita (kadang garis putih)
    if (Math.random() < 0.25) el.style.background = `linear-gradient(180deg, #fff, ${el.style.background})`;

    confettiLayer.appendChild(el);

    // durasi jatuh & drift
    const dur = 2.5 + Math.random()*2.2;
    const delay = Math.random()*0.6;
    const xDrift = (Math.random()*2 - 1) * (80 + Math.random()*120); // kiri/kanan
    const rot = 180 + Math.random()*540;

    // Animasi utama jatuh
    gsap.fromTo(el,
      { y: -vh*0.25, rotation: Math.random()*360 },
      {
        y: vh + 40,
        x: `+=${xDrift}`,
        rotation: `+=${rot}`,
        ease: "power1.in",
        duration: dur,
        delay,
        onComplete: () => el.remove()
      }
    );

    // Wiggle horizontal kecil biar lebih hidup
    gsap.to(el, {
      x: `+=${(Math.random()*2 - 1) * 30}`,
      repeat: Math.ceil(dur/0.35),
      yoyo: true,
      duration: 0.35,
      ease: "sine.inOut",
      delay
    });
  }
}

// Jalankan urutan animasi saat halaman siap
window.addEventListener('load', runSequence);
