// ===============================
// script.js (full)
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  // --------- Helper: cari atau buat elemen by id ---------
  function ensureEl(id, make) {
    let el = document.getElementById(id);
    if (!el) {
      el = make();
      (document.getElementById('mobile-content') || document.body).appendChild(el);
    }
    return el;
  }

  // ---------- Refs section ----------
  const section1 = document.getElementById('section-1');
  const section2 = document.getElementById('section-2');
  const section3 = document.getElementById('section-3');
  const section4 = document.getElementById('section-4');

  const instructionText = document.getElementById('instruction');
  const semuaLilin = document.querySelectorAll('.lilin');
  const semuaApi   = document.querySelectorAll('.api');
  const photos     = document.querySelectorAll('.photo');

  // ---------- Next Button (buat jika belum ada) ----------
  const nextButton = ensureEl('nextButton', () => {
    const b = document.createElement('button');
    b.id = 'nextButton';
    b.textContent = 'Next';
    return b;
  });

  // ---------- Confetti Canvas (buat jika belum ada) ----------
  const confettiCanvas = ensureEl('confetti-canvas', () => {
    const c = document.createElement('canvas');
    c.id = 'confetti-canvas';
    return c;
  });

  // ---------- Lightbox (buat jika belum ada) ----------
  const lightbox = ensureEl('photo-lightbox', () => {
    const d = document.createElement('div');
    d.id = 'photo-lightbox';
    d.setAttribute('aria-hidden', 'true');
    return d;
  });
  // close button
  let lightboxClose = document.getElementById('lightbox-close');
  if (!lightboxClose) {
    lightboxClose = document.createElement('button');
    lightboxClose.id = 'lightbox-close';
    lightboxClose.setAttribute('aria-label', 'Tutup');
    lightboxClose.textContent = '×';
    lightbox.appendChild(lightboxClose);
  }
  // stage & image
  let lightboxStage = document.getElementById('lightbox-stage');
  if (!lightboxStage) {
    lightboxStage = document.createElement('div');
    lightboxStage.id = 'lightbox-stage';
    lightbox.prepend(lightboxStage);
  }
  let lightboxImg = document.getElementById('lightbox-img');
  if (!lightboxImg) {
    lightboxImg = document.createElement('img');
    lightboxImg.id = 'lightbox-img';
    lightboxImg.alt = 'Foto';
    lightboxStage.appendChild(lightboxImg);
  } else if (!lightboxImg.parentElement || lightboxImg.parentElement.id !== 'lightbox-stage') {
    lightboxStage.appendChild(lightboxImg);
  }

  // ---------- State ----------
  let candlesLit = false;   // apakah lilin sudah dinyalakan
  let currentSection = 1;   // section aktif saat ini

  // =========================================================
  //  CONFETTI ENGINE (canvas overlay, jatuh dari atas layar)
  // =========================================================
  const hasConfetti = !!confettiCanvas;
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiActive = false;
  let lastT = 0;

  function resizeConfetti() {
    if (!hasConfetti) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    confettiCanvas.style.width = w + 'px';
    confettiCanvas.style.height = h + 'px';
    confettiCanvas.width = Math.floor(w * dpr);
    confettiCanvas.height = Math.floor(h * dpr);
    confettiCtx.setTransform(1, 0, 0, 1, 0, 0);
    confettiCtx.scale(dpr, dpr);
  }

  function spawnConfetti(n = 160) {
    const w = window.innerWidth;
    for (let i = 0; i < n; i++) {
      confettiParticles.push({
        x: Math.random() * w,
        y: -(Math.random() * 100 + 20),                          // mulai di atas
        vx: (Math.random() * 2 - 1) * (40 + Math.random() * 60), // gerak samping
        vy: 80 + Math.random() * 160,                            // jatuh
        size: 3 + Math.random() * 3,   // ukuran kecil: 3–6 px
        color: ['#f94144','#f3722c','#f9c74f','#90be6d','#43aa8b','#577590','#f8961e'][Math.floor(Math.random() * 7)],
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() * 2 - 1) * 6,
        t: 0,
        wobble: Math.random() * Math.PI * 2
      });
    }
  }

  function stepConfetti(t) {
    if (!confettiActive || !hasConfetti) return;
    if (!lastT) lastT = t;
    const dt = (t - lastT) / 1000;
    lastT = t;

    const w = window.innerWidth, h = window.innerHeight;
    confettiCtx.clearRect(0, 0, w, h);

    confettiParticles.forEach(p => {
      p.t += dt;
      p.x += p.vx * dt + Math.sin(p.t * 4 + p.wobble) * 40 * dt; // goyang kiri/kanan
      p.y += p.vy * dt;
      p.rot += p.rotSpd * dt;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2);
      confettiCtx.restore();
    });

    // buang partikel di bawah layar
    confettiParticles = confettiParticles.filter(p => p.y < h + 40);

    if (confettiParticles.length > 0) {
      requestAnimationFrame(stepConfetti);
    } else {
      confettiActive = false;
    }
  }

  /** Mulai confetti untuk durasi tertentu (ms) */
  function startConfetti(durationMs = 5000) {
    if (!hasConfetti) return;
    spawnConfetti(160);
    confettiActive = true;
    lastT = 0;
    requestAnimationFrame(stepConfetti);

    const interval = setInterval(() => spawnConfetti(40), 400);
    setTimeout(() => clearInterval(interval), durationMs);
  }

  // init confetti
  if (hasConfetti) {
    confettiCtx = confettiCanvas.getContext('2d');
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();
  }

  // =========================================================
  //               INTERAKSI: Nyalakan Lilin
  // =========================================================
  function nyalakanLilin() {
    if (candlesLit) return;

    candlesLit = true;
    // tampilkan api pada ketiga lilin
    semuaApi.forEach(api => api.classList.add('lit'));

    // sembunyikan teks instruksi, munculkan tombol next
    if (instructionText) instructionText.style.opacity = '0';
    if (nextButton) nextButton.classList.add('visible');

    // Mulai confetti 6 detik
    startConfetti(6000);
  }
  semuaLilin.forEach(lilin => lilin.addEventListener('click', nyalakanLilin));

  // =========================================================
  //      Tombol Next: pindah section 1 -> 2 -> 3 -> 4
  // =========================================================
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentSection === 1) {
        // 1 -> 2
        if (section1) {
          section1.classList.remove('active');
          section1.classList.add('background');
        }
        if (section2) section2.classList.add('active');
        currentSection = 2;

      } else if (currentSection === 2) {
        // 2 -> 3
        if (section2) {
          section2.classList.remove('active');
          section2.classList.add('background');
        }
        if (section3) section3.classList.add('active');

        // tampilkan foto satu per satu
        photos.forEach((photo, index) => {
          setTimeout(() => {
            photo.classList.add('visible');
          }, (index + 1) * 300); // jeda 300ms antar foto
        });

        // tombol tetap terlihat untuk lanjut ke Section 4
        nextButton.classList.add('visible');
        currentSection = 3;

      } else if (currentSection === 3) {
        // 3 -> 4
        if (section3) {
            section3.classList.remove('active');
            section3.classList.add('background');
        }
        if (section1) section1.classList.add('gone');
        if (section2) section2.classList.add('gone');

        if (section4) {
            section4.classList.add('active');

            // === Slideshow background Section 4 ===
            const slideshow = section4.querySelector('.bg-slideshow');
            if (slideshow && slideshow.children.length === 0) {
            const totalFoto = 6; // jumlah foto di folder
            for (let i = 1; i <= totalFoto; i++) {
                const img = document.createElement('img');
                img.src = `assets/images/foto/gallery-${i}.png`; // sesuaikan format file
                img.alt = `Foto ${i}`;
                if (i === 1) img.classList.add('active');
                slideshow.appendChild(img);
            }

            // Jalankan slideshow
            let current = 0;
            const imgs = slideshow.querySelectorAll('img');
            setInterval(() => {
                imgs[current].classList.remove('active');
                current = (current + 1) % imgs.length;
                imgs[current].classList.add('active');
            }, 5000); // ganti setiap 1 detik
            }
        }

        nextButton.classList.remove('visible');
        currentSection = 4;
        }
    });
  }

  // =========================================================
  //           LIGHTBOX FOTO dengan animasi FLIP
  //      (beda durasi open vs close via .opening)
  // =========================================================
  function getPhotoRotationDeg(el){
    const val = getComputedStyle(el).getPropertyValue('--rot').trim();
    const m = val.match(/(-?\d+(\.\d+)?)deg/);
    return m ? parseFloat(m[1]) : 0;
  }

  let lastInvert = null;

  function waitImageReady(imgEl) {
    if (imgEl.complete && imgEl.naturalWidth > 0) {
      if (imgEl.decode) return imgEl.decode().catch(() => {});
      return Promise.resolve();
    }
    return new Promise((res) => {
      imgEl.onload = () => {
        if (imgEl.decode) imgEl.decode().then(res).catch(res);
        else res();
      };
      imgEl.onerror = res; // tetap lanjut walau gagal decode
    });
  }

  async function openWithAnimation(imgEl){
    // set src dulu
    lightboxImg.src = imgEl.src;

    // tampilkan overlay + state awal + tandai OPENING (durasi khusus)
    lightbox.classList.add('visible', 'anim-start', 'opening');
    lightbox.setAttribute('aria-hidden', 'false');

    // tunggu gambar siap agar stage size final benar
    await waitImageReady(lightboxImg);
    // double rAF agar layout settle
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const thumbRect = imgEl.getBoundingClientRect();
    const stageRect = lightboxStage.getBoundingClientRect();

    if (stageRect.width <= 1 || stageRect.height <= 1) {
      // fallback: tampilkan tanpa transform jika gagal ukur
      lightbox.classList.remove('anim-start', 'opening');
      return;
    }

    const scaleX = thumbRect.width / stageRect.width;
    const scaleY = thumbRect.height / stageRect.height;
    const translateX = (thumbRect.left + thumbRect.width/2) - (stageRect.left + stageRect.width/2);
    const translateY = (thumbRect.top  + thumbRect.height/2) - (stageRect.top  + stageRect.height/2);
    const rotDeg = getPhotoRotationDeg(imgEl);

    // set state awal (invert)
    lightboxStage.style.transform =
      `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotDeg}deg)`;
    // force reflow
    lightboxStage.getBoundingClientRect();

    // play -> menuju final (center, 80%, opacity 1)
    lightbox.classList.remove('anim-start');
    lightboxStage.style.transform = 'none';

    // hapus tanda 'opening' setelah transisi selesai (biar close pakai durasi default)
    lightboxStage.addEventListener('transitionend', function onEnd(e){
      if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
        lightboxStage.removeEventListener('transitionend', onEnd);
        lightbox.classList.remove('opening');
      }
    });
  }

  function closeWithAnimation(){
    if (!lastInvert || !lightbox.classList.contains('visible')) {
      lightbox.classList.remove('visible', 'anim-start', 'opening');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxStage.style.transform = 'none';
      lightboxImg.src = '';
      return;
    }
    const { translateX, translateY, scaleX, scaleY, rotDeg } = lastInvert;

    // CLOSE → pakai durasi default (karena .opening sudah hilang)
    lightbox.classList.add('anim-start');
    lightboxStage.style.transform =
      `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotDeg}deg)`;

    const onDone = () => {
      lightbox.removeEventListener('transitionend', onDone);
      lightbox.classList.remove('visible', 'anim-start', 'opening');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxStage.style.transform = 'none';
      lightboxImg.src = '';
      lastInvert = null;
    };
    lightbox.addEventListener('transitionend', onDone, { once: true });
  }

  // buka saat klik foto (hanya jika sudah muncul di section)
  photos.forEach(img => {
    img.addEventListener('click', () => {
      if (!img.classList.contains('visible')) return;
      // simpan invert untuk animasi balik
      const rect = img.getBoundingClientRect();
      lastInvert = { // nilai awal akan dihitung ulang saat closeWithAnimation dipanggil
        translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, rotDeg: getPhotoRotationDeg(img)
      };
      openWithAnimation(img);
      // hitung ulang nilai invert yang tepat untuk close:
      // (diset saat open selesai — sudah cukup untuk animasi close)
      setTimeout(() => {
        const thumbRect = rect;
        const stageRect = lightboxStage.getBoundingClientRect();
        if (stageRect.width > 1 && stageRect.height > 1) {
          lastInvert.translateX = (thumbRect.left + thumbRect.width/2) - (stageRect.left + stageRect.width/2);
          lastInvert.translateY = (thumbRect.top  + thumbRect.height/2) - (stageRect.top  + stageRect.height/2);
          lastInvert.scaleX = thumbRect.width / stageRect.width;
          lastInvert.scaleY = thumbRect.height / stageRect.height;
        }
      }, 300);
    });
  });

  // tutup via tombol X / klik backdrop / Escape
  lightboxClose.addEventListener('click', closeWithAnimation);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeWithAnimation(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('visible')) closeWithAnimation(); });
});
