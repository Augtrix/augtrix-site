/* ═══════════════════════════════════════════════
   AUGTRIX — Shared Language Switcher
   Works on all pages. Each page defines
   window.PAGE_STRINGS before loading this file.
═══════════════════════════════════════════════ */
(function () {
    document.addEventListener('DOMContentLoaded', function () {

        var STRINGS = window.PAGE_STRINGS || {};
        var translationCache = { en: STRINGS };
        var currentLang = 'en';
        var loadingBar = document.getElementById('langLoading');

        function showLoader() { if (loadingBar) loadingBar.classList.add('active'); }
        function hideLoader() { if (loadingBar) loadingBar.classList.remove('active'); }

        function applyStrings(strings) {
            document.querySelectorAll('[data-translate]').forEach(function (el) {
                var key = el.getAttribute('data-translate');
                if (strings[key] !== undefined) el.textContent = strings[key];
            });
        }

        function translateAll(langCode) {
            if (langCode === 'en') {
                applyStrings(STRINGS);
                document.documentElement.lang = 'en';
                hideLoader();
                return;
            }
            if (translationCache[langCode]) {
                applyStrings(translationCache[langCode]);
                document.documentElement.lang = langCode;
                hideLoader();
                return;
            }
            var keys = Object.keys(STRINGS);
            if (keys.length === 0) { hideLoader(); return; }
            var translated = {};
            var groups = [];
            for (var i = 0; i < keys.length; i += 3) groups.push(keys.slice(i, i + 3));
            var groupsDone = 0;
            groups.forEach(function (group) {
                var combined = group.map(function (k) { return STRINGS[k]; }).join(' ||| ');
                var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(combined) + '&langpair=en|' + langCode;
                fetch(url)
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        var result = (data.responseData && data.responseData.translatedText) || combined;
                        var parts = result.split(' ||| ');
                        group.forEach(function (key, idx) {
                            translated[key] = (parts[idx] || STRINGS[key]).trim();
                        });
                    })
                    .catch(function () {
                        group.forEach(function (key) { translated[key] = STRINGS[key]; });
                    })
                    .finally(function () {
                        groupsDone++;
                        if (groupsDone === groups.length) {
                            translationCache[langCode] = translated;
                            applyStrings(translated);
                            document.documentElement.lang = langCode;
                            hideLoader();
                        }
                    });
            });
        }

        /* Lang switcher UI */
        var switcher     = document.getElementById('langSwitcher');
        var trigger      = document.getElementById('langTrigger');
        var currentLabel = document.getElementById('langCurrent');
        var langOptions  = document.querySelectorAll('.lang-option');

        if (trigger) {
            trigger.addEventListener('click', function (e) {
                e.stopPropagation();
                var isOpen = switcher.classList.toggle('open');
                trigger.setAttribute('aria-expanded', isOpen);
            });
        }
        document.addEventListener('click', function () {
            if (switcher) {
                switcher.classList.remove('open');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            }
        });
        langOptions.forEach(function (opt) {
            opt.addEventListener('click', function () {
                var code  = this.getAttribute('data-lang');
                var label = this.getAttribute('data-label');
                if (code === currentLang) { if (switcher) switcher.classList.remove('open'); return; }
                langOptions.forEach(function (o) { o.classList.remove('active'); });
                this.classList.add('active');
                if (currentLabel) currentLabel.textContent = label;
                currentLang = code;
                if (switcher) switcher.classList.remove('open');
                showLoader();
                translateAll(code);
            });
        });

        /* Hamburger */
        var hamburger = document.getElementById('navHamburger');
        var drawer    = document.getElementById('mobileNavDrawer');
        if (hamburger && drawer) {
            hamburger.addEventListener('click', function (e) {
                e.stopPropagation();
                var isOpen = drawer.classList.toggle('open');
                hamburger.classList.toggle('open', isOpen);
                hamburger.setAttribute('aria-expanded', String(isOpen));
            });
            document.addEventListener('click', function (e) {
                if (!drawer.contains(e.target) && e.target !== hamburger) {
                    drawer.classList.remove('open');
                    hamburger.classList.remove('open');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        }

        /* Social soon */
        document.querySelectorAll('.social-soon').forEach(function (icon) {
            icon.addEventListener('click', function () {
                alert('Coming Soon — Augtrix ' + icon.getAttribute('aria-label') + ' Launching Shortly.');
            });
        });

        /* FAQ accordion (support page) */
        document.querySelectorAll('.faq-item').forEach(function (item) {
            var q = item.querySelector('.faq-question') || item.querySelector('.faq-q');
            if (q) {
                q.addEventListener('click', function () {
                    var wasOpen = item.classList.contains('open');
                    document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
                    if (!wasOpen) item.classList.add('open');
                });
            }
        });

        /* Smooth scroll */
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var target = document.querySelector(link.getAttribute('href'));
                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        });

    });
})();
