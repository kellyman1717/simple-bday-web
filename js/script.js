document.addEventListener('DOMContentLoaded', () => {
  function ensureEl(id, make) {
    let el = document.getElementById(id);
    if (!el) {
      el = make();
      (document.getElementById('mobile-content') || document.body).appendChild(el);
    }
    return el;
  }

  const section0 = document.getElementById('section-0');
  const section1 = document.getElementById('section-1');
  const section2 = document.getElementById('section-2');
  const section3 = document.getElementById('section-3');
  const section4 = document.getElementById('section-4');
  const section5 = document.getElementById('section-5');

  const instructionText = document.getElementById('instruction');
  const introMessage = document.getElementById('intro-message');
  const semuaLilin = document.querySelectorAll('.lilin');
  const semuaApi = document.querySelectorAll('.api');
  const photos = document.querySelectorAll('.photo');
  const happyBirthdayText = document.getElementById('happy-birthday-text');
  const backgroundMusic = document.getElementById('background-music');
  
  let blurOverlay = null;

  const nextButton = ensureEl('nextButton', () => {
    const b = document.createElement('button');
    b.id = 'nextButton';
    b.textContent = 'Next';
    return b;
  });

  const confettiCanvas = ensureEl('confetti-canvas', () => {
    const c = document.createElement('canvas');
    c.id = 'confetti-canvas';
    return c;
  });

  const lightbox = ensureEl('photo-lightbox', () => {
    const d = document.createElement('div');
    d.id = 'photo-lightbox';
    d.setAttribute('aria-hidden', 'true');
    return d;
  });

  let lightboxClose = document.getElementById('lightbox-close');
  if (!lightboxClose) {
    lightboxClose = document.createElement('button');
    lightboxClose.id = 'lightbox-close';
    lightboxClose.setAttribute('aria-label', 'Tutup');
    lightboxClose.textContent = '×';
    lightbox.appendChild(lightboxClose);
  }

  let lightboxStage = document.getElementById('lightbox-stage');
  if (!lightboxStage) {
    lightboxStage = document.createElement('div');
    lightboxStage.id = 'lightbox-stage';
    lightbox.prepend(lightboxStage);
  }

  let lightboxImg = document.getElementById('lightbox-img');
  let lightboxStory = document.getElementById('lightbox-story');
  if (!lightboxImg) {
    const polaroid = document.createElement('figure');
    polaroid.className = 'polaroid';
    lightboxImg = document.createElement('img');
    lightboxImg.id = 'lightbox-img';
    lightboxImg.alt = 'Foto';
    lightboxStory = document.createElement('figcaption');
    lightboxStory.id = 'lightbox-story';
    polaroid.appendChild(lightboxImg);
    polaroid.appendChild(lightboxStory);
    lightboxStage.appendChild(polaroid);
  } else if (!lightboxImg.parentElement || lightboxImg.parentElement.id !== 'lightbox-stage') {
    const polaroid = document.createElement('figure');
    polaroid.className = 'polaroid';
    polaroid.appendChild(lightboxImg);
    polaroid.appendChild(lightboxStory);
    lightboxStage.appendChild(polaroid);
  }

  let candlesLit = false;
  let currentSection = 0;
  let musicPlaying = false;
  
  // -- PERUBAHAN DI SINI --
  let musicLoopCount = 0; // Variabel untuk menghitung putaran lagu

  const introMessages = [
    "Gift Sederhana Untuk My Pacar.",
    "Penasaran??",
    "Okee Okeee",
    "3",
    "2",
    "1"
  ];
  let currentIntroIndex = 0;

  if (introMessage) {
    introMessage.textContent = introMessages[0];
  }

  function playMusic() {
      if (backgroundMusic && !musicPlaying) {
          // Hapus atribut loop bawaan agar bisa kita kontrol manual
          backgroundMusic.loop = false; 
          backgroundMusic.play().then(() => {
              musicPlaying = true;
          }).catch(error => {
              console.log("Autoplay was prevented:", error);
          });
      }
  }
  
  // -- FUNGSI BARU UNTUK MENGONTROL PENGULANGAN LAGU --
  if (backgroundMusic) {
      backgroundMusic.addEventListener('ended', () => {
          musicLoopCount++;
          if (musicLoopCount < 3) { // Ulangi jika belum 3 kali
              backgroundMusic.currentTime = 0; // Kembali ke awal lagu
              backgroundMusic.play();
          }
      });
  }

  function handleIntroClick() {
    currentIntroIndex++;
    if (currentIntroIndex < introMessages.length) {
      introMessage.style.opacity = '0';
      setTimeout(() => {
        introMessage.textContent = introMessages[currentIntroIndex];
        introMessage.style.opacity = '1';
      }, 400);
    } else {
      if (section0) {
        section0.classList.remove('active');
        section0.classList.add('background');
      }
      if (section5) {
        section5.classList.add('active');
      }
      currentSection = 5;
      if (section0) {
        section0.removeEventListener('click', handleIntroClick);
      }
      const introInstruction = document.getElementById('intro-instruction');
      if (introInstruction) {
        introInstruction.style.opacity = '0';
      }
    }
  }

  if (section0) {
    section0.addEventListener('click', handleIntroClick);
  }

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
        y: -(Math.random() * 100 + 20),
        vx: (Math.random() * 2 - 1) * (40 + Math.random() * 60),
        vy: 80 + Math.random() * 160,
        size: 3 + Math.random() * 3,
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
      p.x += p.vx * dt + Math.sin(p.t * 4 + p.wobble) * 40 * dt;
      p.y += p.vy * dt;
      p.rot += p.rotSpd * dt;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2);
      confettiCtx.restore();
    });
    confettiParticles = confettiParticles.filter(p => p.y < h + 40);
    if (confettiParticles.length > 0) {
      requestAnimationFrame(stepConfetti);
    } else {
      confettiActive = false;
    }
  }

  function startConfetti(durationMs = 5000) {
    if (!hasConfetti) return;
    spawnConfetti(160);
    confettiActive = true;
    lastT = 0;
    requestAnimationFrame(stepConfetti);
    const interval = setInterval(() => spawnConfetti(40), 400);
    setTimeout(() => clearInterval(interval), durationMs);
  }

  if (hasConfetti) {
    confettiCtx = confettiCanvas.getContext('2d');
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();
  }

  function nyalakanLilin() {
    if (candlesLit) return;
    candlesLit = true;
    if (instructionText) {
      instructionText.style.opacity = '0';
      setTimeout(() => { instructionText.style.visibility = 'hidden'; }, 500);
    }
    semuaApi.forEach(api => api.classList.add('lit'));
    startConfetti(6000);
    if (happyBirthdayText) {
      if (!blurOverlay) {
        blurOverlay = document.createElement('div');
        blurOverlay.classList.add('blur-overlay');
        happyBirthdayText.parentNode.insertBefore(blurOverlay, happyBirthdayText);
      }
      setTimeout(() => {
        blurOverlay.style.visibility = 'visible';
        blurOverlay.style.opacity = '1';
        happyBirthdayText.style.visibility = 'visible';
        happyBirthdayText.style.opacity = '1';
      }, 500);
      setTimeout(() => {
        happyBirthdayText.style.opacity = '0';
        blurOverlay.style.opacity = '0';
        setTimeout(() => {
          happyBirthdayText.style.visibility = 'hidden';
          blurOverlay.style.visibility = 'hidden';
          if (nextButton) {
            nextButton.classList.add('visible');
          }
        }, 500);
      }, 3500);
    } else {
      if (nextButton) {
        nextButton.classList.add('visible');
      }
    }
  }
  semuaLilin.forEach(lilin => lilin.addEventListener('click', nyalakanLilin));

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentSection === 1) {
        if (section1) {
          section1.classList.remove('active');
          section1.classList.add('background');
        }
        if (section2) section2.classList.add('active');
        currentSection = 2;
      } else if (currentSection === 2) {
        if (section2) {
          section2.classList.remove('active');
          section2.classList.add('background');
        }
        if (section3) section3.classList.add('active');
        photos.forEach((photo, index) => {
          setTimeout(() => {
            photo.classList.add('visible');
          }, (index + 1) * 300);
        });
        nextButton.classList.add('visible');
        currentSection = 3;
      } else if (currentSection === 3) {
        if (section3) {
          section3.classList.remove('active');
          section3.classList.add('background');
        }
        if (section1) section1.classList.add('gone');
        if (section2) section2.classList.add('gone');
        if (section4) {
          section4.classList.add('active');
          const slideshow = section4.querySelector('.bg-slideshow');
          if (slideshow && slideshow.children.length === 0) {
            const totalFoto = 6;
            const names = Array.from({ length: totalFoto }, (_, i) => `${i + 1}.jpg`);
            for (let i = names.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [names[i], names[j]] = [names[j], names[i]];
            }
            names.forEach((filename, idx) => {
              const img = document.createElement('img');
              img.src = `assets/images/foto/gallery-${filename}`;
              img.alt = `Foto ${filename}`;
              if (idx === 0) img.classList.add('active');
              slideshow.appendChild(img);
            });
            let current = 0;
            const imgs = slideshow.querySelectorAll('img');
            setInterval(() => {
              imgs[current].classList.remove('active');
              current = (current + 1) % imgs.length;
              imgs[current].classList.add('active');
            }, 2000);
          }
        }
        nextButton.textContent = "Selesai";
        currentSection = 4;
      } else if (currentSection === 4) {
          window.location.reload();
      }
    });
  }

  function getPhotoRotationDeg(el) {
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
    return new Promise(res => {
      imgEl.onload = () => {
        if (imgEl.decode) imgEl.decode().then(res).catch(res);
        else res();
      };
      imgEl.onerror = res;
    });
  }

  async function openWithAnimation(imgEl) {
    lightboxImg.src = imgEl.src;
    lightbox.classList.add('visible', 'anim-start', 'opening');
    lightbox.setAttribute('aria-hidden', 'false');
    await waitImageReady(lightboxImg);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const thumbRect = imgEl.getBoundingClientRect();
    const stageRect = lightboxStage.getBoundingClientRect();
    if (stageRect.width <= 1 || stageRect.height <= 1) {
      lightbox.classList.remove('anim-start', 'opening');
      return;
    }
    const scaleX = thumbRect.width / stageRect.width;
    const scaleY = thumbRect.height / stageRect.height;
    const translateX = (thumbRect.left + thumbRect.width / 2) - (stageRect.left + stageRect.width / 2);
    const translateY = (thumbRect.top + thumbRect.height / 2) - (stageRect.top + stageRect.height / 2);
    const rotDeg = getPhotoRotationDeg(imgEl);
    lightboxStage.style.transform =
      `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotDeg}deg)`;
    lightboxStage.getBoundingClientRect();
    lightbox.classList.remove('anim-start');
    lightboxStage.style.transform = 'none';
    lightboxStage.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
        lightboxStage.removeEventListener('transitionend', onEnd);
        lightbox.classList.remove('opening');
      }
    });
  }

  function closeWithAnimation() {
    if (!lastInvert || !lightbox.classList.contains('visible')) {
      lightbox.classList.remove('visible', 'anim-start', 'opening');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxStage.style.transform = 'none';
      lightboxImg.src = '';
      return;
    }
    const { translateX, translateY, scaleX, scaleY, rotDeg } = lastInvert;
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

  photos.forEach(img => {
    img.addEventListener('click', () => {
      if (!img.classList.contains('visible')) return;
      const rect = img.getBoundingClientRect();
      lastInvert = {
        translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, rotDeg: getPhotoRotationDeg(img)
      };
      openWithAnimation(img);
      setTimeout(() => {
        const thumbRect = rect;
        const stageRect = lightboxStage.getBoundingClientRect();
        if (stageRect.width > 1 && stageRect.height > 1) {
          lastInvert.translateX = (thumbRect.left + thumbRect.width / 2) - (stageRect.left + stageRect.width / 2);
          lastInvert.translateY = (thumbRect.top + thumbRect.height / 2) - (stageRect.top + stageRect.height / 2);
          lastInvert.scaleX = thumbRect.width / stageRect.width;
          lastInvert.scaleY = thumbRect.height / stageRect.height;
        }
      }, 300);
    });
  });
  
  const giftBox = document.getElementById('gift-box');
  const giftContainer = document.getElementById('gift-container');
  const finalMessage = document.getElementById('final-message');
  const giftInstruction = document.getElementById('gift-instruction');

  if (giftBox) {
      giftBox.addEventListener('click', () => {
          playMusic(); 
          
          if (!giftBox.classList.contains('open')) {
              giftBox.classList.add('open');
              if (giftInstruction) {
                  giftInstruction.style.opacity = '0';
              }
              if (finalMessage) {
                  setTimeout(() => {
                      finalMessage.classList.add('visible');
                  }, 500);
              }

              setTimeout(() => {
                  if (giftContainer) {
                      giftContainer.classList.add('zoom-out');
                  }
                  
                  setTimeout(() => {
                      if (section5) {
                          section5.classList.remove('active');
                          section5.classList.add('background');
                      }
                      if (section1) {
                          section1.classList.add('active');
                          if (instructionText) {
                              setTimeout(() => {
                                  instructionText.style.opacity = '1';
                              }, 4800);
                          }
                      }
                      currentSection = 1;
                  }, 1200);

              }, 2500);
          }
      });
  }
  
  window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const parallaxBg = document.querySelector('#section-4 .bg-slideshow');
      if (parallaxBg) {
          parallaxBg.style.transform = `scale(1.15) translateY(${scrolled * 0.3}px)`;
      }
  });

  lightboxClose.addEventListener('click', closeWithAnimation);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeWithAnimation(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('visible')) closeWithAnimation(); });
});