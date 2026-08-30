// רז כהן — מאמן אישי | script.js
(function(){
  "use strict";

  // ---- fail-safe: guarantee reveal content becomes visible even if anything below fails ----
  setTimeout(function(){
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }, 1800);

  // ---- mobile nav toggle ----
  try{
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    if(toggle && nav){
      toggle.addEventListener('click', function(){
        var open = toggle.getAttribute('aria-expanded') === 'true';
        var nowOpen = !open;
        toggle.setAttribute('aria-expanded', String(nowOpen));
        nav.classList.toggle('open', nowOpen);
        nav.style.display = nowOpen ? 'flex' : '';
      });
      // close on escape
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && nav.classList.contains('open')){
          nav.classList.remove('open');
          nav.style.display = '';
          toggle.setAttribute('aria-expanded', 'false');
          toggle.focus();
        }
      });
      // close nav when a plain link is clicked (mobile)
      nav.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){
          if(window.innerWidth <= 840){
            nav.classList.remove('open');
            nav.style.display = '';
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  } catch(err){ console.error('nav toggle error', err); }

  // ---- services dropdown (click-toggle for touch/keyboard, hover handled by CSS on desktop) ----
  try{
    var drop = document.querySelector('.nav-drop');
    if(drop){
      var dropBtn = drop.querySelector('button');
      dropBtn.addEventListener('click', function(e){
        e.stopPropagation();
        var isOpen = drop.classList.toggle('open');
        dropBtn.setAttribute('aria-expanded', String(isOpen));
      });
      document.addEventListener('click', function(e){
        if(!drop.contains(e.target)){
          drop.classList.remove('open');
          dropBtn.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape'){
          drop.classList.remove('open');
          dropBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  } catch(err){ console.error('services dropdown error', err); }

  // ---- scroll reveal ----
  try{
    var revealEls = document.querySelectorAll('.reveal');
    if('IntersectionObserver' in window && revealEls.length){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(function(el){ io.observe(el); });
    } else {
      revealEls.forEach(function(el){ el.classList.add('in'); });
    }
  } catch(err){ console.error('reveal error', err); }

  // ---- contact form: friendly submit hint ----
  try{
    var form = document.querySelector('.contact-form');
    if(form){
      form.addEventListener('submit', function(){
        var success = document.querySelector('.form-success');
        if(success){ success.classList.add('show'); }
      });
    }
  } catch(err){ console.error('form error', err); }

  // ---- accessibility widget ----
  try{
    var a11yBtn = document.querySelector('.a11y-btn');
    var a11yPanel = document.querySelector('.a11y-panel');
    var htmlEl = document.documentElement;
    var ZOOM_STEPS = [1, 1.15, 1.3, 1.45];
    var STORAGE_KEY = 'a11y-prefs';

    var toggleClasses = ['a11y-contrast', 'a11y-grayscale', 'a11y-underline', 'a11y-readable', 'a11y-headings', 'a11y-nomotion'];

    function loadPrefs(){
      try{
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch(e){ return {}; }
    }
    function savePrefs(prefs){
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch(e){}
    }
    function applyPrefs(prefs){
      toggleClasses.forEach(function(cls){
        var on = !!prefs[cls];
        htmlEl.classList.toggle(cls, on);
        var btn = document.querySelector('.a11y-option[data-cls="' + cls + '"]');
        if(btn){ btn.setAttribute('aria-pressed', String(on)); }
      });
      var zoomIndex = prefs.zoomIndex || 0;
      htmlEl.style.setProperty('--a11y-zoom', ZOOM_STEPS[zoomIndex] || 1);
      var zoomLabel = document.querySelector('.a11y-zoom-label');
      if(zoomLabel){ zoomLabel.textContent = Math.round((ZOOM_STEPS[zoomIndex] || 1) * 100) + '%'; }
    }

    if(a11yBtn && a11yPanel){
      var prefs = loadPrefs();
      applyPrefs(prefs);

      a11yBtn.addEventListener('click', function(){
        var open = a11yPanel.classList.toggle('open');
        a11yBtn.setAttribute('aria-expanded', String(open));
      });

      document.addEventListener('click', function(e){
        if(a11yPanel.classList.contains('open') && !a11yPanel.contains(e.target) && e.target !== a11yBtn && !a11yBtn.contains(e.target)){
          a11yPanel.classList.remove('open');
          a11yBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && a11yPanel.classList.contains('open')){
          a11yPanel.classList.remove('open');
          a11yBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.querySelectorAll('.a11y-option[data-cls]').forEach(function(btn){
        btn.addEventListener('click', function(){
          var cls = btn.getAttribute('data-cls');
          var p = loadPrefs();
          p[cls] = !p[cls];
          savePrefs(p);
          applyPrefs(p);
        });
      });

      var zoomInBtn = document.querySelector('.a11y-zoom-in');
      var zoomOutBtn = document.querySelector('.a11y-zoom-out');
      if(zoomInBtn){
        zoomInBtn.addEventListener('click', function(){
          var p = loadPrefs();
          var idx = p.zoomIndex || 0;
          idx = Math.min(idx + 1, ZOOM_STEPS.length - 1);
          p.zoomIndex = idx;
          savePrefs(p);
          applyPrefs(p);
        });
      }
      if(zoomOutBtn){
        zoomOutBtn.addEventListener('click', function(){
          var p = loadPrefs();
          var idx = p.zoomIndex || 0;
          idx = Math.max(idx - 1, 0);
          p.zoomIndex = idx;
          savePrefs(p);
          applyPrefs(p);
        });
      }

      var resetBtn = document.querySelector('.a11y-reset');
      if(resetBtn){
        resetBtn.addEventListener('click', function(){
          savePrefs({});
          applyPrefs({});
        });
      }
    }
  } catch(err){ console.error('a11y widget error', err); }

  // ---- scroll progress bar + header shrink ----
  try{
    var progressBar = document.querySelector('.scroll-progress-bar');
    var siteHeader = document.querySelector('.site-header');
    var ticking = false;
    function updateOnScroll(){
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      if(progressBar){ progressBar.style.width = pct + '%'; }
      if(siteHeader){ siteHeader.classList.toggle('scrolled', scrollTop > 40); }
      ticking = false;
    }
    window.addEventListener('scroll', function(){
      if(!ticking){
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    }, { passive: true });
    updateOnScroll();
  } catch(err){ console.error('scroll progress error', err); }

  // ---- cookie consent + Google Analytics ----
  try{
    var GA_ID = 'G-TKRQNX6RC9';
    var CONSENT_KEY = 'cookie-consent';

    function loadGoogleAnalytics(){
      if(window.gaLoaded) return;
      window.gaLoaded = true;
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID);
    }

    var banner = document.querySelector('.cookie-banner');
    var acceptBtn = document.querySelector('.cookie-btn-accept');
    var declineBtn = document.querySelector('.cookie-btn-decline');
    var consent = null;
    try{ consent = localStorage.getItem(CONSENT_KEY); } catch(e){}

    if(consent === 'accepted'){
      loadGoogleAnalytics();
    } else if(consent !== 'declined' && banner){
      banner.classList.add('show');
    }

    if(acceptBtn){
      acceptBtn.addEventListener('click', function(){
        try{ localStorage.setItem(CONSENT_KEY, 'accepted'); } catch(e){}
        if(banner){ banner.classList.remove('show'); }
        loadGoogleAnalytics();
      });
    }
    if(declineBtn){
      declineBtn.addEventListener('click', function(){
        try{ localStorage.setItem(CONSENT_KEY, 'declined'); } catch(e){}
        if(banner){ banner.classList.remove('show'); }
      });
    }
  } catch(err){ console.error('cookie consent error', err); }

  // ---- current year in footer ----
  try{
    var yearEls = document.querySelectorAll('.js-year');
    yearEls.forEach(function(el){ el.textContent = new Date().getFullYear(); });
  } catch(err){ console.error('year error', err); }

})();
