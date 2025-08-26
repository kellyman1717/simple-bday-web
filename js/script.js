// ===============================
// script.js (versi lengkap)
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Element refs ----------
  const section1 = document.getElementById('section-1');
  const section2 = document.getElementById('section-2');
  const section3 = document.getElementById('section-3');
  const section4 = document.getElementById('section-4'); // ada setelah kamu tambahkan Section 4 di HTML

  const nextButton = document.getElementById('nextButton');
  const instructionText = document.getElementById('instruction');

  const semuaLilin = document.querySelectorAll('.lilin'); // img lilin
  const semuaApi = document.querySelectorAll('.api');     // elemen nyala api (div.api)
  const photos = document.querySelectorAll('.photo');     // foto pada Section 3
  const lightbox = document.getElementById('photo-lightbox');
  let lightboxStage = document.getElementById('lightbox-stage');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  // ---------- State ----------
  let candlesLit = false;   // apakah lilin sudah dinyalakan
  let currentSection = 1;   // section aktif saat ini

  // =========================================================
  //  CONFETTI ENGINE (canvas overlay, jatuh dari atas layar)
  // =========================================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  const hasConfetti = !!confettiCanvas;
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiActive = false;
  let lastT = 0;

  if (!lightboxStage) {
    lightboxStage = document.createElement('div');
    lightboxStage.id = 'lightbox-stage';
    // sisipkan stage di paling depan lalu pindahkan img ke dalamnya
    lightbox.prepend(lightboxStage);
    lightboxStage.appendChild(lightboxImg);
  }

  /** Helper: ambil rotasi deg dari CSS custom prop --rot pada .photo (default 0deg) */
    function getPhotoRotationDeg(el){
        const val = getComputedStyle(el).getPropertyValue('--rot').trim();
        if (!val) return 0;
        const m = val.match(/(-?\d+(\.\d+)?)deg/);
        return m ? parseFloat(m[1]) : 0;
    }

    // Variabel untuk animasi balik
    let lastInvert = null;
    let lastSrc = '';

    function openWithAnimation(imgEl){
        // Set gambar
        lastSrc = imgEl.src;
        lightboxImg.src = imgEl.src;

        // Tampilkan overlay supaya kita bisa ukur stage final size
        lightbox.classList.add('visible', 'anim-start');

        // Biarkan browser layout final stage (80vw/80vh)
        requestAnimationFrame(() => {
            const thumbRect = imgEl.getBoundingClientRect();
            const stageRect = lightboxStage.getBoundingClientRect();

            // Hitung delta posisi & skala (FLIP)
            const scaleX = thumbRect.width / stageRect.width;
            const scaleY = thumbRect.height / stageRect.height;
            const translateX = (thumbRect.left + thumbRect.width/2) - (stageRect.left + stageRect.width/2);
            const translateY = (thumbRect.top + thumbRect.height/2) - (stageRect.top + stageRect.height/2);

            // Ambil rotasi awal dari foto (mis. --rot: 12deg pada CSS)
            const rotDeg = getPhotoRotationDeg(imgEl);

            // Set state awal (invert) → sama persis dengan posisi & ukuran thumbnail
            lightboxStage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotDeg}deg)`;

            // Simpan untuk animasi balik
            lastInvert = { translateX, translateY, scaleX, scaleY, rotDeg };

            // Force reflow supaya transition jalan
            lightboxStage.getBoundingClientRect();

            // Play → menuju final (center, 80%, tanpa transform)
            lightbox.classList.remove('anim-start');
            lightboxStage.style.transform = 'none';
        });
    }

    function closeWithAnimation(){
        if (!lastInvert || !lightbox.classList.contains('visible')) {
            lightbox.classList.remove('visible', 'anim-start');
            return;
        }

        // Set ke posisi awal lagi (balik ke thumbnail)
        const { translateX, translateY, scaleX, scaleY, rotDeg } = lastInvert;

        // Mulai fade-out sambil transform balik
        lightbox.classList.add('anim-start');
        lightboxStage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotDeg}deg)`;

        // Setelah transisi selesai, sembunyikan overlay & reset
        const onDone = () => {
            lightbox.removeEventListener('transitionend', onDone);
            lightbox.classList.remove('visible', 'anim-start');
            lightboxStage.style.transform = 'none';
            lightboxImg.src = '';
            lastInvert = null;
        };
        // Kita dengar transition pada opacity overlay; fallback timeout juga bisa ditambah
        lightbox.addEventListener('transitionend', onDone, { once: true });

        // Trigger opacity transition dari overlay
        // (opacity dikontrol kelas .anim-start pada CSS)
        requestAnimationFrame(() => {
            // nothing else needed; kelas sudah ditambahkan di atas
        });
    }

        // Buka saat foto diklik (hanya jika sudah visible/selesai animasi masuk)
        photos.forEach(img => {
        img.addEventListener('click', () => {
            if (!img.classList.contains('visible')) return;
            openWithAnimation(img);
        });
    });

        // Tutup lewat tombol X / klik backdrop / tombol Escape
        lightboxClose.addEventListener('click', closeWithAnimation);

        lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeWithAnimation();
    });

        document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('visible')) {
            closeWithAnimation();
        }
    });

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
        y: -(Math.random() * 100 + 20),
        vx: (Math.random() * 2 - 1) * (40 + Math.random() * 60),
        vy: 80 + Math.random() * 160,
        size: 3 + Math.random() * 3,   // <<<<< ukuran diperkecil: 3–6px
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
      // partikel berbentuk persegi panjang kecil
      confettiCtx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2);
      confettiCtx.restore();
    });

    // buang partikel yang sudah lewat bawah layar
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

  // init canvas confetti kalau ada
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

  // pasang listener untuk semua lilin
  semuaLilin.forEach(lilin => lilin.addEventListener('click', nyalakanLilin));

  // =========================================================
  //         Tombol Next: pindah section 1 -> 2 -> 3 -> 4
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

        // tampilkan foto satu per satu (fade-in berurutan)
        photos.forEach((photo, index) => {
          setTimeout(() => {
            photo.classList.add('visible');
          }, (index + 1) * 300); // jeda 300ms antar foto
        });

        // tetap tampilkan tombol untuk lanjut ke Section 4
        nextButton.classList.add('visible');

        currentSection = 3;

      } else if (currentSection === 3) {
        // 3 -> 4
        if (section3) {
          section3.classList.remove('active');
          section3.classList.add('background');
        }

        // Sembunyikan Section 1 & 2 total agar tidak mengganggu
        if (section1) section1.classList.add('gone');
        if (section2) section2.classList.add('gone');

        // Tampilkan Section 4 (card ucapan fade-in via CSS)
        if (section4) section4.classList.add('active');

        // Kalau tidak ada section selanjutnya, sembunyikan tombol Next
        nextButton.classList.remove('visible');

        currentSection = 4;
      }
    });
  }

  // =========================================================
  //             (Opsional) Navigasi sentuh / geser
  //  Jika ingin menambah navigasi swipe, tambahkan di sini.
  // =========================================================
});
