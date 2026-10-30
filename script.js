// Well2Be — interactions du site.
// Sans JavaScript, le site reste complet : les témoignages s'affichent en grille
// et l'en-tête reste un en-tête classique.
(function () {
  'use strict';

  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduit = mq('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------
   * Ressort (inspiré des ressorts d'Apple : amortissement + réponse).
   * amortissement 1 = pas de rebond ; < 1 = léger dépassement.
   * reponse = rapidité en secondes (ce n'est pas une durée fixe).
   * Le ressort repart toujours de la position et de la vitesse actuelles,
   * donc il peut être interrompu et relancé à tout moment sans à-coup.
   * ------------------------------------------------------------------ */
  function Ressort(appliquer) {
    this.x = 0;          // position affichée
    this.v = 0;          // vitesse (px/s)
    this.cible = 0;
    this.k = 0;
    this.c = 0;
    this.raf = 0;
    this.appliquer = appliquer;
  }
  Ressort.prototype.vers = function (cible, options) {
    var o = options || {};
    var amortissement = o.amortissement == null ? 1 : o.amortissement;
    var reponse = o.reponse || 0.4;
    if (o.vitesse != null) this.v = o.vitesse;
    this.cible = cible;
    this.k = Math.pow(2 * Math.PI / reponse, 2);
    this.c = 4 * Math.PI * amortissement / reponse;
    if (!this.raf) {
      var self = this;
      var avant = performance.now();
      var pas = function (maintenant) {
        var dt = Math.min((maintenant - avant) / 1000, 1 / 30);
        avant = maintenant;
        // intégration par petits pas pour rester stable
        for (var i = 0; i < 4; i++) {
          var h = dt / 4;
          var a = -self.k * (self.x - self.cible) - self.c * self.v;
          self.v += a * h;
          self.x += self.v * h;
        }
        if (Math.abs(self.v) < 2 && Math.abs(self.x - self.cible) < 0.3) {
          self.x = self.cible; self.v = 0; self.raf = 0;
          self.appliquer(self.x);
          return;
        }
        self.appliquer(self.x);
        self.raf = requestAnimationFrame(pas);
      };
      this.raf = requestAnimationFrame(pas);
    }
  };
  Ressort.prototype.stop = function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  };
  Ressort.prototype.placer = function (x) {
    this.stop(); this.x = x; this.v = 0; this.cible = x; this.appliquer(x);
  };

  // Projection de l'élan, comme le défilement d'un iPhone qui ralentit.
  function projeter(vitesse, deceleration) {
    var d = deceleration || 0.99;
    return (vitesse / 1000) * d / (1 - d);
  }
  // Résistance progressive au-delà des bords, plutôt qu'un arrêt sec.
  function elastique(depassement, dimension) {
    var c = 0.55;
    return (depassement * dimension * c) / (dimension + c * Math.abs(depassement));
  }

  /* ------------------------------------------------------------------
   * Carrousels des témoignages (un par partie : coaching, deep tissue,
   * madérothérapie…) : glissables au doigt ou à la souris, flèches,
   * points, flèches du clavier, défilement automatique.
   * Un bloc avec un seul avis reste une simple carte.
   * ------------------------------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll('.temoignages'), function (bloc) {
    var piste = bloc.querySelector('.temoins-piste');
    var slides = Array.prototype.slice.call(bloc.querySelectorAll('.temoin'));
    var pointsBox = bloc.querySelector('.temoins-points');
    if (slides.length < 2) return;

    var DELAI = 7000;
    var ECART = 24;
    var n = slides.length;
    var actuel = 0;
    var minuteur = null;
    var enPause = false;
    var points = [];

    var rail = document.createElement('div');
    rail.className = 'temoins-rail';
    slides.forEach(function (s) { rail.appendChild(s); });
    piste.appendChild(rail);
    bloc.classList.add('js-actif');

    var ressort = new Ressort(function (x) {
      rail.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    });
    function pasSlide() { return piste.clientWidth + ECART; }
    function position(i) { return -i * pasSlide(); }

    slides.forEach(function (slide, i) {
      slide.setAttribute('aria-label', (i + 1) + ' sur ' + n);
      var point = document.createElement('button');
      point.type = 'button';
      point.className = 'temoins-point';
      point.setAttribute('aria-label', 'Afficher le témoignage ' + (i + 1));
      point.addEventListener('click', function () { aller(i, true); });
      pointsBox.appendChild(point);
      points.push(point);
    });

    function marquer() {
      slides.forEach(function (slide, i) {
        var visible = i === actuel;
        slide.setAttribute('aria-hidden', visible ? 'false' : 'true');
        if (visible) slide.removeAttribute('inert'); else slide.setAttribute('inert', '');
      });
      points.forEach(function (p, i) { p.setAttribute('aria-current', i === actuel ? 'true' : 'false'); });
    }

    function aller(index, parUtilisateur, options) {
      actuel = Math.max(0, Math.min(n - 1, (index + n) % n));
      marquer();
      if (reduit) {
        // Mouvement réduit : simple fondu, pas de glissement.
        piste.classList.remove('fondu'); void piste.offsetWidth; piste.classList.add('fondu');
        ressort.placer(position(actuel));
      } else {
        ressort.vers(position(actuel), options || { amortissement: 1, reponse: 0.45 });
      }
      if (parUtilisateur) { piste.setAttribute('aria-live', 'polite'); relancer(); }
    }

    function relancer() {
      clearInterval(minuteur);
      if (reduit || enPause) return;
      minuteur = setInterval(function () { aller(actuel + 1, false); }, DELAI);
    }
    function pause() { enPause = true; clearInterval(minuteur); }
    function reprise() { enPause = false; relancer(); }

    Array.prototype.forEach.call(bloc.querySelectorAll('.temoins-fleche'), function (fleche) {
      fleche.addEventListener('click', function () {
        aller(actuel + parseInt(fleche.getAttribute('data-dir'), 10), true);
      });
    });

    bloc.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { aller(actuel + 1, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { aller(actuel - 1, true); e.preventDefault(); }
    });

    bloc.addEventListener('mouseenter', pause);
    bloc.addEventListener('mouseleave', function () { if (!glisse) reprise(); });
    bloc.addEventListener('focusin', pause);
    bloc.addEventListener('focusout', function (e) { if (!bloc.contains(e.relatedTarget)) reprise(); });

    // --- Glisser : suit le doigt 1:1, puis le ressort prend le relais à la même vitesse.
    var glisse = false, engage = false, id = null;
    var x0 = 0, y0 = 0, depart = 0, historique = [];

    piste.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      id = e.pointerId;
      x0 = e.clientX; y0 = e.clientY;
      ressort.stop();                 // on attrape le rail là où il est, même en plein mouvement
      depart = ressort.x;
      historique = [{ x: depart, t: e.timeStamp }];
      glisse = true; engage = false;
      pause();
    });

    piste.addEventListener('pointermove', function (e) {
      if (!glisse || e.pointerId !== id) return;
      var dx = e.clientX - x0, dy = e.clientY - y0;
      if (!engage) {
        // petit seuil avant de décider : glisser horizontal ou défilement vertical
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) { glisse = false; reprise(); return; }
        engage = true;
        piste.setPointerCapture(id);
        piste.classList.add('en-glisse');
      }
      var x = depart + dx;
      var min = position(n - 1), max = 0;
      if (x > max) x = max + elastique(x - max, piste.clientWidth);
      if (x < min) x = min - elastique(min - x, piste.clientWidth);
      ressort.placer(x);
      historique.push({ x: x, t: e.timeStamp });
      if (historique.length > 6) historique.shift();
    });

    function lacher(e) {
      if (!glisse || (e && e.pointerId !== id)) return;
      glisse = false;
      piste.classList.remove('en-glisse');
      if (!engage) { reprise(); return; }
      // vitesse de relâchement sur les ~100 dernières ms
      var dernier = historique[historique.length - 1], premier = historique[0];
      for (var i = historique.length - 1; i >= 0; i--) {
        if (dernier.t - historique[i].t > 100) break;
        premier = historique[i];
      }
      var dt = (dernier.t - premier.t) / 1000;
      var vitesse = dt > 0 ? (dernier.x - premier.x) / dt : 0;
      // un geste vif décide par son sens ; sinon on vise là où l'élan emmènerait le rail
      var cibleIndex;
      if (Math.abs(vitesse) > 300) {
        cibleIndex = actuel + (vitesse < 0 ? 1 : -1);
      } else {
        var projete = ressort.x + projeter(vitesse, 0.998);
        cibleIndex = Math.round(-projete / pasSlide());
      }
      cibleIndex = Math.max(actuel - 1, Math.min(actuel + 1, cibleIndex));
      cibleIndex = Math.max(0, Math.min(n - 1, cibleIndex));
      ressort.v = vitesse;
      aller(cibleIndex, true, { amortissement: Math.abs(vitesse) > 400 ? 0.85 : 1, reponse: 0.4 });
      if (!bloc.matches(':hover')) reprise();
    }
    piste.addEventListener('pointerup', lacher);
    piste.addEventListener('pointercancel', lacher);
    piste.addEventListener('lostpointercapture', lacher);

    window.addEventListener('resize', function () { ressort.placer(position(actuel)); });

    marquer();
    ressort.placer(0);
    relancer();
  });

  /* ------------------------------------------------------------------
   * En-tête : ombre légère seulement quand du contenu passe dessous,
   * et lien du menu qui indique la section en cours.
   * ------------------------------------------------------------------ */
  (function () {
    var barre = document.querySelector('.entete-barre');
    if (!barre || !('IntersectionObserver' in window)) return;

    var sentinelle = document.createElement('div');
    sentinelle.className = 'entete-sentinelle';
    sentinelle.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(sentinelle, document.body.firstChild);
    new IntersectionObserver(function (entrees) {
      barre.classList.toggle('flottante', !entrees[0].isIntersecting);
    }).observe(sentinelle);

    var liens = Array.prototype.slice.call(barre.querySelectorAll('.nav a[href^="#"]'));
    var sections = liens.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var visibles = new Map();
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { visibles.set(en.target, en.isIntersecting ? en.intersectionRatio : 0); });
      var meilleure = null, ratio = 0;
      visibles.forEach(function (r, s) { if (r > ratio) { ratio = r; meilleure = s; } });
      liens.forEach(function (a) {
        var actif = meilleure && a.getAttribute('href') === '#' + meilleure.id;
        if (actif) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.5, 1] });
    sections.forEach(function (s) { obs.observe(s); });
  })();
})();
