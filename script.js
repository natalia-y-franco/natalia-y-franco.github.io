/* ========================================
   WEDDING LANDING PAGE — Natalia & Franco
   ======================================== */

(function () {
  'use strict';

  // ============================
  // CONFIGURACIÓN
  // ============================
  var SKIP_INTRO = false; // DEV FLAG: cambiar a true para saltarse la intro

  // Pega aquí la URL de tu Google Apps Script desplegado
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyYSHCf-zHTPKuvnms_6e_miHZzn3lAAZIp1wtHepb0kUAeImIzTS-9ZOlUnVqOLmXr/exec';

  // ============================
  // TOKEN DEL INVITADO
  // ============================
  var urlParams = new URLSearchParams(window.location.search);
  var guestToken = urlParams.get('token');
  var guestInfo = null;

  function isConfigured() {
    return APPS_SCRIPT_URL !== 'PEGAR_URL_DEL_APPS_SCRIPT_AQUI';
  }

  // ============================
  // PAGE REVEAL ANIMATIONS
  // ============================
  var revealHero = null;

  function initPageAnimations() {
    if (typeof gsap === 'undefined') return;

    // --- Split hero names into individual letter spans for handwriting effect ---
    var namesEl = document.getElementById('hero-names');
    if (namesEl) {
      var lines = ['Natalia', '&', 'Franco'];
      var html = '';
      for (var l = 0; l < lines.length; l++) {
        if (l > 0) html += '<br>';
        var word = lines[l];
        for (var c = 0; c < word.length; c++) {
          html += '<span class="hero__letter" style="display:inline-block;opacity:0;">' + word[c] + '</span>';
        }
      }
      namesEl.innerHTML = html;
    }
    var heroLetters = document.querySelectorAll('.hero__letter');

    // --- Initial hidden states: Hero ---
    gsap.set('.hero__photo', { opacity: 0, scale: 1.15 });
    gsap.set('.hero__photo img', { scale: 1.25 });
    gsap.set('.hero__date-line', { scaleX: 0 });
    gsap.set('.hero__date-text', { opacity: 0, y: 15, filter: 'blur(6px)' });
    gsap.set('.hero__names', { opacity: 1, y: 0, scale: 1 });
    gsap.set(heroLetters, { opacity: 0, y: 18, filter: 'blur(4px)', scale: 0.92 });
    gsap.set('.hero__line-bottom', { scaleX: 0 });
    gsap.set('.hero__espiga--left', { opacity: 0, x: -60, rotation: -12, scale: 0.85 });
    gsap.set('.hero__espiga--right', { opacity: 0, x: 60, rotation: 12, scale: 0.85 });
    gsap.set('.dog-intro', { opacity: 0 });

    // --- Initial hidden states: Countdown ---
    gsap.set('.countdown__bubble', { opacity: 0, y: 60, scale: 0.7 });
    gsap.set('.countdown__title', { opacity: 0, y: 20 });
    gsap.set('.countdown__number', { opacity: 0, y: 30, scale: 0.5 });
    gsap.set('.countdown__label', { opacity: 0, y: 10 });
    gsap.set('.countdown__separator', { opacity: 0, scaleY: 0 });
    gsap.set('.countdown__vector', { opacity: 0, scale: 0.6, rotation: -15 });
    gsap.set('.countdown__wave', { opacity: 0, y: 30 });

    // --- Initial hidden states: Message ---
    gsap.set('.message__text', { opacity: 0, y: 30, filter: 'blur(6px)' });
    gsap.set('.message__bajada', { opacity: 0, scaleX: 0.3 });

    // --- Initial hidden states: Fecha ---
    gsap.set('.fecha__title', { opacity: 0, y: 30, filter: 'blur(4px)' });
    gsap.set('.fecha__manzanilla', { opacity: 0, x: 30 });
    gsap.set('.fecha__flor', { opacity: 0, y: 40 });
    gsap.set('.fecha__day', { opacity: 0, y: 20 });
    gsap.set('.fecha__ceremonia, .fecha__capilla, .fecha__direccion, .fecha__direccion-detalle, .fecha__hora', { opacity: 0, y: 15 });
    gsap.set('.fecha__recepcion, .fecha__recepcion-venue', { opacity: 0, y: 15 });
    gsap.set('.fecha .btn, .fecha__status', { opacity: 0, y: 15 });
    gsap.set('.fecha .icon-separater', { opacity: 0, scale: 0.5, rotation: -20 });

    // --- Initial hidden states: Fiesta ---
    gsap.set('.fiesta__title', { opacity: 0, y: 30, filter: 'blur(4px)' });
    gsap.set('.fiesta__wave', { opacity: 0, y: 30 });
    gsap.set('.fiesta__card', { opacity: 0, y: 50, scale: 0.95 });
    gsap.set('.fiesta__card-icon', { opacity: 0, scale: 0.3, rotation: -15 });
    gsap.set('.fiesta__card-heading', { opacity: 0, y: 15 });
    gsap.set('.fiesta__card-text', { opacity: 0, y: 10 });
    gsap.set('.fiesta__qr', { opacity: 0, scale: 0.8 });
    gsap.set('.fiesta__flor2', { opacity: 0, x: 40 });
    gsap.set('.fiesta__flor3', { opacity: 0, x: -40 });
    gsap.set('#btn-confirmar', { opacity: 0, y: 20, scale: 0.9 });
    gsap.set('.fiesta .fecha__direccion-detalle', { opacity: 0, y: 15 });
    gsap.set('.foto-footer', { opacity: 0, y: 30, scale: 0.95 });

    // --- Hero reveal timeline ---
    revealHero = function () {
      var tl = gsap.timeline();

      tl
        // Photo breathes in with cinematic zoom-out
        .to('.hero__photo', { opacity: 1, scale: 1, duration: 3, ease: 'power2.out' }, 0)
        .to('.hero__photo img', { scale: 1, duration: 10, ease: 'power1.out' }, 0)

        // Date lines extend from center
        .to('.hero__date-line', { scaleX: 1, duration: 1.2, ease: 'expo.out' }, 0.6)

        // Date text materializes from blur
        .to('.hero__date-text', {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.2, ease: 'power3.out'
        }, 0.8)

        // Names — elegant handwriting reveal, letter by letter
        .to(heroLetters, {
          opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
          duration: 0.9, ease: 'power3.out',
          stagger: {
            each: 0.08,
            from: 'start'
          }
        }, 1.0)

        // Bottom line draws after last letter settles
        .to('.hero__line-bottom', { scaleX: 1, duration: 1, ease: 'expo.out' }, 2.4)

        // Espigas float in organically
        .to('.hero__espiga--left', {
          opacity: 1, x: 0, rotation: 0, scale: 1,
          duration: 2, ease: 'power2.out'
        }, 0.8)
        .to('.hero__espiga--right', {
          opacity: 1, x: 0, rotation: 0, scale: 1,
          duration: 2, ease: 'power2.out'
        }, 1.0)

        // Dog video — start playing first, then fade in so it's already running
        .add(function () {
          var dogVideo = document.getElementById('dog-video-player');
          if (!dogVideo) return;
          dogVideo.play().catch(function () {});
          // Fade out BEFORE the video ends so they finish together
          var fadeDuration = 1.5;
          var fadeStarted = false;
          dogVideo.addEventListener('timeupdate', function () {
            if (fadeStarted) return;
            var remaining = dogVideo.duration - dogVideo.currentTime;
            if (remaining <= fadeDuration && remaining > 0) {
              fadeStarted = true;
              gsap.to('.dog-intro', {
                opacity: 0, duration: remaining,
                ease: 'power2.in',
                onComplete: function () {
                  var el = document.getElementById('hero-dog');
                  if (el) el.remove();
                }
              });
              gsap.to('.mascota', {
                y: 0, opacity: 1, scale: 1, visibility: 'visible', duration: 1,
                ease: 'back.out(1.5)', delay: remaining * 0.5
              });
            }
          });
          // Fallback in case timeupdate doesn't fire precisely
          dogVideo.addEventListener('ended', function () {
            if (!fadeStarted) {
              fadeStarted = true;
              gsap.to('.dog-intro', {
                opacity: 0, duration: 0.6,
                ease: 'power2.inOut',
                onComplete: function () {
                  var el = document.getElementById('hero-dog');
                  if (el) el.remove();
                }
              });
              gsap.to('.mascota', {
                y: 0, opacity: 1, scale: 1, visibility: 'visible', duration: 1,
                ease: 'back.out(1.5)', delay: 0.3
              });
            }
          });
        }, 1.6)
        .to('.dog-intro', {
          opacity: 1, duration: 1.2,
          ease: 'power2.out'
        }, 1.8)

        // Countdown entrance — plays as hero settles
        .to('.countdown__wave', { opacity: 1, y: 0, duration: 1.4, stagger: 0.2, ease: 'power2.out' }, 2.0)
        .to('.countdown__vector', { opacity: 1, scale: 1, rotation: 0, duration: 1.6, ease: 'power3.out' }, 2.2)
        .to('.countdown__bubble', {
          opacity: 1, y: 0, scale: 1,
          duration: 1.6, ease: 'power4.out'
        }, 2.3)
        .to('.countdown__title', {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out'
        }, 2.8)
        .to('.countdown__number', {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8, stagger: 0.15, ease: 'back.out(2)'
        }, 3.0)
        .to('.countdown__separator', {
          opacity: 1, scaleY: 1,
          duration: 0.6, stagger: 0.1, ease: 'power2.out'
        }, 3.2)
        .to('.countdown__label', {
          opacity: 1, y: 0,
          duration: 0.6, stagger: 0.1, ease: 'power2.out'
        }, 3.3);
    };

    // If no intro, reveal hero immediately
    if (!document.getElementById('intro')) {
      revealHero();
      setupScrollReveals();
    }
  }

  // --- Scroll-triggered section reveals (separate so we can defer until intro is dismissed) ---
  function setupScrollReveals() {
    if (typeof gsap === 'undefined') return;
    var sectionDefs = [
      {
        el: '.message',
        anim: function () {
          gsap.timeline()
            .to('.message__text', {
              opacity: 1, y: 0, filter: 'blur(0px)',
              duration: 1.4, ease: 'power3.out'
            }, 0)
            .to('.message__bajada', {
              opacity: 0.8, scaleX: 1,
              duration: 1.2, ease: 'power2.out'
            }, 0.4);
        }
      },
      {
        el: '.fecha',
        anim: function () {
          var tl = gsap.timeline();
          tl
            .to('.fecha__title', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }, 0)
            .to('.fecha__manzanilla', { opacity: 1, x: 0, duration: 1.5, ease: 'power2.out' }, 0.2)
            .to('.fecha__day', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.3)

            // Ceremonia section cascades
            .to('.fecha__ceremonia', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.5)
            .to('.fecha .icon-separater', { opacity: 1, scale: 1, rotation: 0, duration: 0.8, stagger: 0.3, ease: 'back.out(1.7)' }, 0.55)
            .to('.fecha__capilla', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.6)
            .to('.fecha__direccion', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.7)
            .to('.fecha__direccion-detalle', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0.8)
            .to('.fecha__hora', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.9)

            // Recepción cascades
            .to('.fecha__recepcion', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.0)
            .to('.fecha__recepcion-venue', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.1)

            // Buttons + decorative
            .to('.fecha .btn', { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out' }, 1.2)
            .to('.fecha__flor', { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, 0.5);
        }
      },
      {
        el: '.fiesta',
        anim: function () {
          gsap.timeline()
            // Waves drift in
            .to('.fiesta__wave', { opacity: 1, y: 0, duration: 1.4, stagger: 0.2, ease: 'power2.out' }, 0)
            // Title
            .to('.fiesta__title', {
              opacity: 1, y: 0, filter: 'blur(0px)',
              duration: 1.2, ease: 'power3.out'
            }, 0.2)
            // Cards slide up with stagger
            .to('.fiesta__card', {
              opacity: 1, y: 0, scale: 1,
              duration: 1.2, stagger: 0.3, ease: 'power3.out'
            }, 0.5)
            // Card icons pop in with bounce
            .to('.fiesta__card-icon', {
              opacity: 1, scale: 1, rotation: 0,
              duration: 0.8, stagger: 0.2, ease: 'back.out(1.7)'
            }, 0.8)
            // Card headings
            .to('.fiesta__card-heading', {
              opacity: 1, y: 0,
              duration: 0.6, stagger: 0.15, ease: 'power2.out'
            }, 0.9)
            // Card text
            .to('.fiesta__card-text', {
              opacity: 1, y: 0,
              duration: 0.6, stagger: 0.15, ease: 'power2.out'
            }, 1.1)
            // QR code
            .to('.fiesta__qr', {
              opacity: 1, scale: 1,
              duration: 0.8, ease: 'power2.out'
            }, 1.3)
            // Confirm button bounces in
            .to('#btn-confirmar', {
              opacity: 1, y: 0, scale: 1,
              duration: 1, ease: 'elastic.out(1, 0.8)'
            }, 1.5)
            // Confirm text
            .to('.fiesta .fecha__direccion-detalle', {
              opacity: 1, y: 0,
              duration: 0.8, ease: 'power2.out'
            }, 1.7)
            // Decorative flowers
            .to('.fiesta__flor2', { opacity: 1, x: 0, duration: 1.5, ease: 'power2.out' }, 0.5)
            .to('.fiesta__flor3', { opacity: 1, x: 0, duration: 1.5, ease: 'power2.out' }, 0.8)
            // Footer photo
            .to('.foto-footer', {
              opacity: 1, y: 0, scale: 1,
              duration: 1.2, ease: 'power3.out'
            }, 1.9);
        }
      }
    ];

    var scrollObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var fn = entry.target._revealAnim;
        if (fn) fn();
        scrollObs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    sectionDefs.forEach(function (def) {
      var el = document.querySelector(def.el);
      if (el) {
        el._revealAnim = def.anim;
        scrollObs.observe(el);
      }
    });
  }

  // ============================
  // INTRO ANIMATION — BURLAP ENVELOPE
  // ============================
  function initIntro() {
    var intro = document.getElementById('intro');
    var canvas = document.getElementById('intro-canvas');
    var tap = document.getElementById('intro-tap');
    var flash = intro && intro.querySelector('.intro__flash');
    var seal = document.getElementById('intro-seal');
    var sealImg = seal && seal.querySelector('.intro__seal-img');
    var sealGlow = seal && seal.querySelector('.intro__seal-glow');
    var sealRing = seal && seal.querySelector('.intro__seal-ring');
    var glow = intro && intro.querySelector('.intro__glow');
    var glow2 = intro && intro.querySelector('.intro__glow2');
    var fragments = intro ? intro.querySelectorAll('.intro__fragment') : [];

    if (!intro || !canvas || typeof gsap === 'undefined') return;

    // ============================
    // CANVAS — LAYERED GOLDEN DUST
    // ============================
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleAlpha = { value: 0 };
    var particleRunning = true;
    var burstActive = false;
    var burstParticles = [];
    // Fiber particles (torn threads)
    var fiberActive = false;
    var fiberParticles = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Two layers: slow ambient + faster near-seal particles
    for (var i = 0; i < 90; i++) {
      var isSlow = i < 50;
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: isSlow ? (1.5 + Math.random() * 3) : (0.8 + Math.random() * 2),
        alpha: isSlow ? (0.06 + Math.random() * 0.25) : (0.15 + Math.random() * 0.45),
        drift: isSlow ? (0.1 + Math.random() * 0.35) : (0.3 + Math.random() * 0.7),
        phase: Math.random() * Math.PI * 2,
        speed: isSlow ? (0.0008 + Math.random() * 0.003) : (0.002 + Math.random() * 0.006),
        vy: isSlow ? (-0.06 - Math.random() * 0.18) : (-0.15 - Math.random() * 0.35),
        shimmer: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.001 + Math.random() * 0.003
      });
    }

    function drawParticles(time) {
      if (!particleRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Main dust
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var xOff = Math.sin(time * p.speed + p.phase) * 35 * p.drift;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }

        var shimmerMod = 0.7 + 0.3 * Math.sin(time * p.shimmerSpeed + p.shimmer);
        var cx = p.x + xOff;
        var cy = p.y;
        var a = p.alpha * particleAlpha.value * shimmerMod;

        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.r);
        grad.addColorStop(0, 'rgba(255,235,180,' + (a * 1.2).toFixed(3) + ')');
        grad.addColorStop(0.4, 'rgba(220,195,150,' + a.toFixed(3) + ')');
        grad.addColorStop(0.7, 'rgba(191,168,128,' + (a * 0.3).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(191,168,128,0)');

        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Burst particles (on seal break)
      if (burstActive) {
        for (var j = burstParticles.length - 1; j >= 0; j--) {
          var bp = burstParticles[j];
          bp.x += bp.vx;
          bp.y += bp.vy;
          bp.vy += 0.02;
          bp.life -= 0.008;
          if (bp.life <= 0) { burstParticles.splice(j, 1); continue; }

          var ba = bp.life * bp.alpha;
          var bGrad = ctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, bp.r);
          bGrad.addColorStop(0, 'rgba(255,230,160,' + ba.toFixed(3) + ')');
          bGrad.addColorStop(0.5, 'rgba(220,185,120,' + (ba * 0.5).toFixed(3) + ')');
          bGrad.addColorStop(1, 'rgba(191,168,128,0)');

          ctx.beginPath();
          ctx.arc(bp.x, bp.y, bp.r * (0.5 + bp.life * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = bGrad;
          ctx.fill();
        }
        if (burstParticles.length === 0) burstActive = false;
      }

      // Fiber particles (torn burlap threads)
      if (fiberActive) {
        for (var k = fiberParticles.length - 1; k >= 0; k--) {
          var fp = fiberParticles[k];
          fp.x += fp.vx;
          fp.y += fp.vy;
          fp.vy += 0.08; // gravity
          fp.rotation += fp.spin;
          fp.life -= 0.006;
          if (fp.life <= 0) { fiberParticles.splice(k, 1); continue; }

          ctx.save();
          ctx.translate(fp.x, fp.y);
          ctx.rotate(fp.rotation);
          ctx.globalAlpha = fp.life * 0.7;
          ctx.strokeStyle = fp.color;
          ctx.lineWidth = fp.width;
          ctx.beginPath();
          ctx.moveTo(-fp.len / 2, 0);
          ctx.quadraticCurveTo(0, fp.curve, fp.len / 2, 0);
          ctx.stroke();
          ctx.restore();
        }
        if (fiberParticles.length === 0) fiberActive = false;
      }

      requestAnimationFrame(drawParticles);
    }
    requestAnimationFrame(drawParticles);

    function spawnBurst(count) {
      var cx = canvas.width / 2;
      var cy = canvas.height / 2;
      burstActive = true;
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.6;
        var speed = 1.5 + Math.random() * 6;
        burstParticles.push({
          x: cx + (Math.random() - 0.5) * 30,
          y: cy + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          r: 1.5 + Math.random() * 5,
          alpha: 0.5 + Math.random() * 0.5,
          life: 0.6 + Math.random() * 0.4
        });
      }
    }

    // Spawn torn burlap fibers from the center tear line
    function spawnFibers(count) {
      var cx = canvas.width / 2;
      fiberActive = true;
      var colors = ['#8B7355', '#A0896A', '#6B5B45', '#C4A97D', '#917A5C'];
      for (var i = 0; i < count; i++) {
        var y = Math.random() * canvas.height;
        var side = Math.random() > 0.5 ? 1 : -1;
        fiberParticles.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: y,
          vx: side * (1 + Math.random() * 3),
          vy: -1 + Math.random() * 2,
          len: 8 + Math.random() * 18,
          width: 0.5 + Math.random() * 1.5,
          curve: (Math.random() - 0.5) * 10,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.08,
          life: 0.7 + Math.random() * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    // ============================
    // PHASE 1: CINEMATIC ENTRANCE
    // ============================
    var envelope = document.getElementById('intro-envelope');

    // New seal layers
    var sealShadow = seal && seal.querySelector('.intro__seal-shadow');
    var sealWax = seal && seal.querySelector('.intro__seal-wax');
    var sealImprint = seal && seal.querySelector('.intro__seal-imprint');

    // Initial states
    gsap.set(envelope, { opacity: 0, scale: 1.03 });
    // Seal starts above, larger (approaching from distance), with heavy floating shadow
    gsap.set(seal, { opacity: 0, scale: 1.5, y: -80 });
    gsap.set(sealImg, { filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.8)) brightness(0.6)' });
    gsap.set(sealShadow, { opacity: 0, scale: 0.5 });
    gsap.set(sealWax, { opacity: 0, scale: 0.6 });
    gsap.set(sealImprint, { opacity: 0 });
    gsap.set(sealGlow, { opacity: 0, scale: 0.4 });
    gsap.set(sealRing, { opacity: 0, scale: 0.7 });
    gsap.set(tap, { opacity: 0, y: 15 });
    gsap.set(glow2, { scale: 0, opacity: 0 });

    var entranceDone = false;
    var entranceTL = gsap.timeline({
      delay: 0.3,
      onComplete: function () { entranceDone = true; }
    });

    entranceTL
      // Ambient glow fades in
      .to(particleAlpha, { value: 0.4, duration: 2.5, ease: 'power1.inOut' }, 0)

      // Envelope materializes
      .to(envelope, { opacity: 1, scale: 1, duration: 2.5, ease: 'power3.out' }, 0.2)

      // Particles grow
      .to(particleAlpha, { value: 1, duration: 2, ease: 'power1.inOut' }, 1.5)

      // === SEAL STAMPS DOWN onto envelope ===
      // Phase 1: Seal drops from above and slams down
      .to(seal, {
        opacity: 1, scale: 1.08, y: 0, duration: 0.5,
        ease: 'power3.in'
      }, 2.0)
      // Phase 2: Impact — slight overshoot squish, then settle into pressed position
      .to(seal, {
        scale: 0.96, duration: 0.1,
        ease: 'power4.out'
      }, 2.5)
      .to(seal, {
        scale: 1, duration: 0.4,
        ease: 'elastic.out(1.2, 0.4)'
      }, 2.6)

      // Shadow transitions from floating (big blur) to pressed (tight contact shadow)
      .to(sealImg, {
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 1px 1px rgba(0,0,0,0.4)) brightness(0.85)',
        duration: 0.5, ease: 'power3.in'
      }, 2.0)
      // Impact flash — brief brightness spike
      .to(sealImg, {
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 1px 1px rgba(0,0,0,0.4)) brightness(1.3)',
        duration: 0.08, ease: 'power2.in'
      }, 2.5)
      .to(sealImg, {
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 1px 1px rgba(0,0,0,0.4)) brightness(1.05)',
        duration: 0.8, ease: 'power2.out'
      }, 2.58)

      // Pressed shadow ring appears on impact
      .to(sealShadow, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, 2.5)

      // Wax spread seeps into fabric after stamp
      .to(sealWax, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 2.55)

      // Burlap imprint texture fades in on the wax surface
      .to(sealImprint, { opacity: 0.7, duration: 1.5, ease: 'power1.inOut' }, 2.7)

      // Seal illumination sequence (warm glow now that it's settled)
      .to(sealImg, {
        filter: 'drop-shadow(0 2px 6px rgba(191,168,128,0.4)) drop-shadow(0 1px 1px rgba(0,0,0,0.3)) brightness(1.1)',
        duration: 1.5, ease: 'power2.inOut'
      }, 3.0)
      .to(sealGlow, { opacity: 0.9, scale: 1, duration: 1.4, ease: 'power2.out' }, 2.8)
      .to(sealRing, { opacity: 0.8, scale: 1, duration: 1.2, ease: 'power2.out' }, 3.0)

      // Inner glow
      .to(glow2, { scale: 0.5, opacity: 0.35, duration: 1.8, ease: 'power1.out' }, 3.2)

      // Tap prompt
      .to(tap, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 3.8);

    // Breathing loops — very subtle, slow, elegant
    var sealPulse = gsap.to(sealGlow, {
      scale: 1.15, opacity: 0.35, duration: 4.5,
      ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 5.2
    });

    var ringPulse = gsap.to(sealRing, {
      scale: 1.08, opacity: 0.15, duration: 4.5,
      ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 5.4
    });

    // No floating — seal stays pressed
    var sealFloat = gsap.to(sealImprint, {
      opacity: 0.55, duration: 4,
      ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 5.2
    });

    var tapPulse = gsap.to(tap, {
      opacity: 0.4, duration: 3.5, ease: 'sine.inOut',
      repeat: -1, yoyo: true, delay: 5.0
    });

    var glow2Pulse = gsap.to(glow2, {
      scale: 0.58, opacity: 0.18, duration: 4.5,
      ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 5.0
    });

    // ============================
    // CLICK — TEAR THE ENVELOPE
    // ============================
    var phase = 0;

    // Each fragment drifts apart gracefully — slow, gentle separation
    var fragPhysics = [
      // Left fragments: drift left with gentle rotation
      { x: '-65%', y: '-12%', rotation: -8,  delay: 0.3 },
      { x: '-55%', y: '8%',   rotation: -5,  delay: 0.5 },
      { x: '-50%', y: '22%',  rotation: -10, delay: 0.4 },
      // Right fragments: drift right
      { x: '65%',  y: '-10%', rotation: 6,   delay: 0.35 },
      { x: '55%',  y: '10%',  rotation: 8,   delay: 0.45 },
      { x: '60%',  y: '20%',  rotation: 5,   delay: 0.55 }
    ];

    intro.addEventListener('click', function () {
      if (phase !== 0 || !entranceDone) return;
      phase = 1;

      // Kill all breathing
      sealPulse.kill();
      ringPulse.kill();
      sealFloat.kill();
      tapPulse.kill();
      glow2Pulse.kill();
      gsap.killTweensOf(tap);
      gsap.killTweensOf(seal);
      gsap.killTweensOf(sealGlow);
      gsap.killTweensOf(sealRing);
      gsap.killTweensOf(sealImprint);
      gsap.killTweensOf(glow2);

      var openTL = gsap.timeline();

      openTL
        // === BEAT 1: Seal softens with warm glow (0 - 1.2s) ===
        .to(tap, { opacity: 0, y: 8, duration: 0.5, ease: 'power2.inOut' }, 0)

        // Wax layers soften
        .to(sealShadow, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 0)
        .to(sealImprint, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0)
        .to(sealWax, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 0)

        // Warm glow expands behind seal
        .to(sealGlow, { scale: 2.5, opacity: 0.8, duration: 1.2, ease: 'power2.out' }, 0.2)
        .to(glow2, { scale: 0.8, opacity: 0.5, duration: 1.2, ease: 'power2.out' }, 0.3)

        // Spawn just a few delicate particles
        .add(function () {
          spawnBurst(20);
          spawnFibers(12);
        }, 0.6)

        // === BEAT 2: Seal fades gracefully (1.0 - 2.8s) ===
        // Gentle lift and fade — opacity only, no filter changes
        .to(seal, {
          opacity: 0, y: -25, duration: 2,
          ease: 'power2.inOut'
        }, 1.0)
        .to(sealRing, { scale: 1.5, opacity: 0, duration: 1.2, ease: 'power2.out' }, 1.0)

        // Glow expands gently as seal releases
        .to(sealGlow, { scale: 3.5, opacity: 0, duration: 2, ease: 'power1.out' }, 1.2)

        // === BEAT 3: Fragments drift apart slowly (1.4 - 3.5s) ===
        .add(function () {
          fragments.forEach(function (frag, idx) {
            var phys = fragPhysics[idx];
            gsap.to(frag, {
              x: phys.x,
              y: phys.y,
              rotation: phys.rotation,
              opacity: 0,
              duration: 2.5 + Math.random() * 0.5,
              delay: phys.delay,
              ease: 'power2.inOut'
            });
          });
        }, 1.4)

        // A few gentle fibers drift as fabric parts
        .add(function () { spawnFibers(8); }, 2.0)

        // === BEAT 4: Warm golden light fills the space (2.0 - 4.0s) ===
        .to(glow, { scale: 1.2, opacity: 0.7, duration: 1.5, ease: 'power1.out' }, 2.0)
        .to(glow2, { scale: 1.8, opacity: 0.5, duration: 1.5, ease: 'power1.out' }, 2.2)

        // Particles gently fade
        .to(particleAlpha, { value: 0.6, duration: 1, ease: 'power1.inOut' }, 2.0)
        .to(particleAlpha, { value: 0, duration: 1.5, ease: 'power2.in' }, 3.0)

        // Glows dissolve slowly
        .to(glow, { scale: 2.5, opacity: 0, duration: 1.5, ease: 'power1.inOut' }, 3.5)
        .to(glow2, { scale: 2.5, opacity: 0, duration: 1.2, ease: 'power1.inOut' }, 3.6)

        // === BEAT 5: Soft warm transition to page (3.8 - 5.2s) ===
        .to(flash, { opacity: 1, duration: 1.4, ease: 'power1.inOut' }, 3.8)

        // Cleanup
        .add(function () {
          particleRunning = false;
          window.removeEventListener('resize', resizeCanvas);
          intro.remove();
          document.documentElement.classList.remove('intro-active');
          if (revealHero) revealHero();
          setupScrollReveals();
        }, 5.2);
    });
  }

  // ============================
  // PERSONALIZACIÓN & ARRANQUE
  // ============================
  function personalizeContent() {
    if (!guestInfo) return;

    // Personalizar título del formulario
    var titleEl = document.querySelector('#screen-confirmar .fullscreen__title');
    if (titleEl && guestInfo.invitado) {
      titleEl.innerHTML = guestInfo.invitado.split(' ')[0] + ',<br>confirma tu<br>asistencia';
    }

    updateConfirmButton();
    updateFormState();
  }

  function updateConfirmButton() {
    var btn = document.getElementById('btn-confirmar');
    var statusEl = document.getElementById('confirm-status');
    if (!btn || !statusEl) return;

    if (!guestInfo || !guestInfo.confirmacion) {
      statusEl.style.display = 'none';
      statusEl.className = 'fecha__status';
      btn.textContent = 'Confirmar asistencia';
      btn.className = 'btn btn--primary';
      return;
    }

    statusEl.style.display = '';
    statusEl.className = 'fecha__status';

    if (guestInfo.confirmacion === 'TRUE') {
      statusEl.textContent = 'Asistencia confirmada';
      statusEl.classList.add('fecha__status--confirmed');
    } else {
      statusEl.textContent = 'No podrás asistir';
      statusEl.classList.add('fecha__status--declined');
    }

    btn.textContent = 'Modificar respuesta';
    btn.className = 'btn btn--link';
  }

  function updateFormState() {
    if (!guestInfo || !guestInfo.confirmacion) return;

    var formEl = document.getElementById('form-confirmacion');
    if (!formEl) return;

    var statusMsg = guestInfo.confirmacion === 'TRUE'
      ? 'Ya confirmaste tu asistencia'
      : 'Registramos que no podrás asistir';

    formEl.innerHTML =
      '<div style="text-align:center;padding:24px 0;">' +
        '<p style="font-size:20px;color:#BFA880;margin-bottom:12px;">' + statusMsg + '</p>' +
        '<p style="font-size:14px;color:#999;">Si deseas cambiar tu respuesta, presiona el botón de abajo.</p>' +
        '<button type="button" class="btn btn--link" id="btn-change-response" style="margin-top:16px;font-size:14px;">Cambiar respuesta</button>' +
      '</div>';

    document.getElementById('btn-change-response').addEventListener('click', function () {
      formEl.innerHTML = originalFormHTML;
      rebindFormEvents();
    });
  }

  // Guardar HTML original del form para poder restaurarlo
  var originalFormHTML = document.getElementById('form-confirmacion').innerHTML;

  function rebindFormEvents() {
    var formEl = document.getElementById('form-confirmacion');
    var si = document.getElementById('alergia-si');
    var no = document.getElementById('alergia-no');
    var ga = document.getElementById('group-alergia');
    var gc = document.getElementById('group-cual');
    var ad = document.getElementById('alergia-detalle');
    var submitBtn = formEl.querySelector('.btn--submit');

    gc.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;

    formEl.querySelectorAll('input[name="asistencia"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (r.value === 'no') {
          ga.style.display = 'none';
          gc.style.display = 'none';
          si.checked = false;
          no.checked = false;
          ad.value = '';
          ad.disabled = true;
        } else {
          ga.style.display = '';
        }
        checkFormComplete(formEl, submitBtn);
      });
    });

    si.addEventListener('change', function () {
      gc.style.display = '';
      ad.disabled = false;
      checkFormComplete(formEl, submitBtn);
    });
    no.addEventListener('change', function () {
      gc.style.display = 'none';
      ad.disabled = true;
      ad.value = '';
      checkFormComplete(formEl, submitBtn);
    });
  }

  // Iniciar animaciones de página
  initPageAnimations();

  // Saltar intro en modo desarrollo
  function skipIntro() {
    var intro = document.getElementById('intro');
    if (intro) intro.remove();
    document.documentElement.classList.remove('intro-active');
    if (revealHero) revealHero();
    setupScrollReveals();
  }

  // Si hay token, buscar info del invitado primero
  if (guestToken && isConfigured()) {
    Promise.race([
      fetch(APPS_SCRIPT_URL + '?' + new URLSearchParams({
        action: 'info',
        token: guestToken
      }))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.ok) guestInfo = data;
        }),
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error('timeout')); }, 3000);
      })
    ])
      .catch(function () { /* timeout o error — continuar sin personalización */ })
      .then(function () {
        personalizeContent();
        if (SKIP_INTRO) skipIntro(); else initIntro();
      });
  } else {
    if (SKIP_INTRO) skipIntro(); else initIntro();
  }

  // ============================
  // COUNTDOWN TIMER
  // ============================
  var WEDDING_DATE = new Date('2026-05-01T19:00:00-04:00');

  var daysEl = document.getElementById('countdown-days');
  var hoursEl = document.getElementById('countdown-hours');
  var minutesEl = document.getElementById('countdown-minutes');

  function updateCountdown() {
    var now = new Date();
    var diff = WEDDING_DATE - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minutesEl.textContent = '0';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);

  // ============================
  // FULLSCREEN SCREENS
  // ============================

  // Ocultar botón de confirmar si no hay token (modo preview)
  var btnConfirmar = document.getElementById('btn-confirmar');
  if (!guestToken) {
    btnConfirmar.style.display = 'none';
  }

  btnConfirmar.addEventListener('click', function () {
    var screen = document.getElementById('screen-confirmar');
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  });

  document.getElementById('btn-close-confirmar').addEventListener('click', function () {
    var screen = document.getElementById('screen-confirmar');
    screen.classList.remove('is-open');
    screen.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  });

  document.getElementById('btn-mapa').addEventListener('click', function () {
    var screen = document.getElementById('screen-mapa');
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  });

  document.getElementById('btn-mapa-ceremonia').addEventListener('click', function () {
    var screen = document.getElementById('screen-mapa-ceremonia');
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  });

  document.getElementById('btn-close-mapa').addEventListener('click', function () {
    var screen = document.getElementById('screen-mapa');
    screen.classList.remove('is-open');
    screen.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  });

  document.getElementById('btn-close-mapa-ceremonia').addEventListener('click', function () {
    var screen = document.getElementById('screen-mapa-ceremonia');
    screen.classList.remove('is-open');
    screen.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.fullscreen.is-open').forEach(function (s) {
        s.classList.remove('is-open');
        s.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
      });
    }
  });

  // ============================
  // FORM HANDLING
  // ============================
  var form = document.getElementById('form-confirmacion');
  var alergiaSi = document.getElementById('alergia-si');
  var alergiaNo = document.getElementById('alergia-no');
  var groupCual = document.getElementById('group-cual');
  var alergiaDetalle = document.getElementById('alergia-detalle');
  var submitBtn = form.querySelector('.btn--submit');

  var groupAlergia = document.getElementById('group-alergia');

  function checkFormComplete(f, btn) {
    if (!f || !btn) return;
    var asistencia = f.querySelector('input[name="asistencia"]:checked');
    if (!asistencia) { btn.disabled = true; return; }

    // If not attending, no need for allergy info
    if (asistencia.value === 'no') {
      btn.disabled = false;
      return;
    }

    var alergia = f.querySelector('input[name="alergia"]:checked');
    btn.disabled = !alergia;
  }

  function handleAsistenciaChange(value) {
    if (value === 'no') {
      // Hide allergy sections
      groupAlergia.style.display = 'none';
      groupCual.style.display = 'none';
      // Reset allergy selections
      alergiaSi.checked = false;
      alergiaNo.checked = false;
      alergiaDetalle.value = '';
      alergiaDetalle.disabled = true;
    } else {
      groupAlergia.style.display = '';
    }
    checkFormComplete(form, submitBtn);
  }

  // Ocultar campo "¿Cuál?" por defecto, submit deshabilitado
  groupCual.style.display = 'none';
  if (submitBtn) submitBtn.disabled = true;

  // Listen to attendance radio changes
  form.querySelectorAll('input[name="asistencia"]').forEach(function (r) {
    r.addEventListener('change', function () { handleAsistenciaChange(r.value); });
  });

  alergiaSi.addEventListener('change', function () {
    groupCual.style.display = '';
    alergiaDetalle.disabled = false;
    checkFormComplete(form, submitBtn);
  });
  alergiaNo.addEventListener('change', function () {
    groupCual.style.display = 'none';
    alergiaDetalle.disabled = true;
    alergiaDetalle.value = '';
    checkFormComplete(form, submitBtn);
  });

  var loadingMessagesYes = [
    'Guardando tu lugar en nuestra mesa',
    'Preparando tu copa de bienvenida',
    'Reservando un brindis en tu honor',
    'Anotando tu nombre en nuestra historia'
  ];

  var loadingMessagesNo = [
    'Registrando tu respuesta',
    'Entendemos, te echaremos de menos',
    'Guardando tu mensaje para los novios',
    'Esperamos verte en otra ocasion'
  ];

  function showFormLoading(container, messages) {
    var msgs = messages || loadingMessagesYes;
    var overlay = document.createElement('div');
    overlay.className = 'form-loading';
    overlay.innerHTML =
      '<div class="form-loading__spinner">' +
        '<div class="form-loading__ring"></div>' +
        '<div class="form-loading__monogram">N&F</div>' +
      '</div>' +
      '<div class="form-loading__message"></div>' +
      '<div class="form-loading__dots">' +
        '<span class="form-loading__dot"></span>' +
        '<span class="form-loading__dot"></span>' +
        '<span class="form-loading__dot"></span>' +
      '</div>';
    container.appendChild(overlay);

    var msgEl = overlay.querySelector('.form-loading__message');
    var idx = 0;
    msgEl.textContent = msgs[idx];

    var msgInterval = setInterval(function () {
      idx = (idx + 1) % msgs.length;
      msgEl.style.opacity = '0';
      setTimeout(function () {
        msgEl.textContent = msgs[idx];
        msgEl.style.opacity = '1';
      }, 300);
    }, 2500);

    return { overlay: overlay, interval: msgInterval };
  }

  function hideFormLoading(loading, callback) {
    clearInterval(loading.interval);
    loading.overlay.style.opacity = '0';
    loading.overlay.style.transition = 'opacity 0.4s ease';
    setTimeout(function () {
      loading.overlay.remove();
      if (callback) callback();
    }, 400);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var formData = new FormData(form);
    var data = {
      asistencia: formData.get('asistencia') === 'si' ? 'TRUE' : 'FALSE',
      alergia: formData.get('alergia') === 'si' ? 'TRUE' : 'FALSE',
      alergia_detalle: formData.get('alergia_detalle') || ''
    };

    var screen = document.getElementById('screen-confirmar');
    var content = screen.querySelector('.fullscreen__content');
    var loading = showFormLoading(content, data.asistencia === 'TRUE' ? loadingMessagesYes : loadingMessagesNo);

    function closeModal() {
      screen.classList.remove('is-open');
      screen.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      form.reset();
      groupCual.style.display = 'none';

      // Update guest state and UI
      if (guestInfo) {
        guestInfo.confirmacion = data.asistencia;
      }
      updateConfirmButton();
      updateFormState();
    }

    if (guestToken && isConfigured()) {
      var confirmUrl = APPS_SCRIPT_URL + '?' + new URLSearchParams({
        action: 'confirmar',
        token: guestToken,
        asistencia: data.asistencia,
        alergia: data.alergia,
        detalle: data.alergia_detalle
      }).toString();

      var minTime = new Promise(function (resolve) { setTimeout(resolve, 3000); });

      var request = fetch(confirmUrl)
        .then(function (r) { return r.json(); })
        .catch(function () {});

      Promise.all([minTime, request]).then(function () {
        hideFormLoading(loading, function () {
          closeModal();
          showSuccessScreen(data.asistencia === 'TRUE');
        });
      });
    } else {
      setTimeout(function () {
        hideFormLoading(loading, function () {
          closeModal();
          showSuccessScreen(data.asistencia === 'TRUE');
        });
      }, 2500);
    }
  });

  // ============================
  // TOAST NOTIFICATION
  // ============================
  function showToast(message) {
    var existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        toast.remove();
      }, 400);
    }, 3000);
  }

  // ============================
  // SUCCESS SCREEN
  // ============================
  function showSuccessScreen(attending) {
    var screen = document.getElementById('success-screen');
    var msgEl = document.getElementById('success-message');

    msgEl.textContent = attending
      ? '¡Nos vemos el 1 de mayo!'
      : 'Lamentamos que no puedas acompañarnos';

    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');

    if (typeof gsap === 'undefined') return;

    gsap.set('.success-screen__leaf', { opacity: 0, scale: 0.8 });
    gsap.set('.success-screen__check', { opacity: 0, scale: 0.5 });
    gsap.set('.success-screen__circle', { attr: { 'stroke-dashoffset': 157 } });
    gsap.set('.success-screen__tick', { attr: { 'stroke-dashoffset': 50 } });
    gsap.set('.success-screen__title', { opacity: 0, y: 20 });
    gsap.set('.success-screen__message', { opacity: 0, y: 15 });
    gsap.set('.success-screen__tap', { opacity: 0 });

    gsap.timeline()
      .to('.success-screen__leaf', { opacity: 0.4, scale: 1, duration: 1.2, ease: 'power2.out' }, 0)
      .to('.success-screen__check', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, 0.2)
      .to('.success-screen__circle', { attr: { 'stroke-dashoffset': 0 }, duration: 0.8, ease: 'power2.inOut' }, 0.4)
      .to('.success-screen__tick', { attr: { 'stroke-dashoffset': 0 }, duration: 0.5, ease: 'power2.out' }, 1.0)
      .to('.success-screen__title', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.2)
      .to('.success-screen__message', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.5)
      .to('.success-screen__tap', { opacity: 1, duration: 1, ease: 'power1.inOut' }, 2.0);

    var autoClose = setTimeout(function () { closeSuccessScreen(); }, 6000);

    function onTap() {
      clearTimeout(autoClose);
      screen.removeEventListener('click', onTap);
      closeSuccessScreen();
    }

    screen.addEventListener('click', onTap);
  }

  function closeSuccessScreen() {
    var screen = document.getElementById('success-screen');
    if (!screen.classList.contains('is-open')) return;

    if (typeof gsap !== 'undefined') {
      gsap.to(screen, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: function () {
          screen.classList.remove('is-open');
          screen.setAttribute('aria-hidden', 'true');
          gsap.set(screen, { clearProps: 'opacity' });
        }
      });
    } else {
      screen.classList.remove('is-open');
      screen.setAttribute('aria-hidden', 'true');
    }
  }

  // ============================
  // LEAFLET MAP — RECEPCIÓN
  // ============================
  var mapRecepcionInit = false;

  document.getElementById('btn-mapa').addEventListener('click', function () {
    if (!mapRecepcionInit) {
      setTimeout(function () {
        var map = L.map('leaflet-map', {
          zoomControl: false
        }).setView([-34.5935606, -70.9626256], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '',
          maxZoom: 19
        }).addTo(map);

        var customIcon = L.icon({
          iconUrl: 'assets/marcador-gps.svg',
          iconSize: [44, 46],
          iconAnchor: [22, 42],
          popupAnchor: [0, -42]
        });

        L.marker([-34.5935606, -70.9626256], { icon: customIcon })
          .addTo(map)
          .on('click', function () {
            window.open('https://www.google.com/maps/dir/?api=1&destination=-34.5935606,-70.9626256&destination_place_id=ChIJneu9TlyQZpYR6t1_TF0YCBAl&travelmode=driving', '_blank');
          });

        setTimeout(function () { map.invalidateSize(); }, 200);
        mapRecepcionInit = true;
      }, 100);
    }
  });

  // LEAFLET MAP — CEREMONIA
  // ============================
  var mapCeremoniaInit = false;

  document.getElementById('btn-mapa-ceremonia').addEventListener('click', function () {
    if (!mapCeremoniaInit) {
      setTimeout(function () {
        var map = L.map('leaflet-map-ceremonia', {
          zoomControl: false
        }).setView([-34.5890144, -70.9993982], 16);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '',
          maxZoom: 19
        }).addTo(map);

        var customIcon = L.icon({
          iconUrl: 'assets/marcador-gps.svg',
          iconSize: [44, 46],
          iconAnchor: [22, 42],
          popupAnchor: [0, -42]
        });

        L.marker([-34.5890144, -70.9993982], { icon: customIcon })
          .addTo(map)
          .on('click', function () {
            window.open('https://www.google.com/maps/dir/?api=1&destination=-34.5890144,-70.9993982&destination_place_id=0x9664901dad22c5f7:0x671b2c9a43b3491e&travelmode=driving', '_blank');
          });

        setTimeout(function () { map.invalidateSize(); }, 200);
        mapCeremoniaInit = true;
      }, 100);
    }
  });

})();
