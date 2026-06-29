(function () {
    'use strict';

    // ── Standard HTTP error messages ──
    var HTTP_ERRORS = {
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        413: 'Payload Too Large',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout'
    };

    // ── Default descriptions (used when theme.json doesn't provide one) ──
    var DEFAULT_DESCRIPTIONS = {
        400: 'The request could not be understood. Please check your input and try again.',
        401: 'Authentication is required to access this resource. Please sign in to continue.',
        402: 'Payment is required to access this content.',
        403: 'Access to this resource is restricted. You don\'t have permission to view this page.',
        404: 'The page you\'re looking for could not be found.',
        405: 'The requested method is not supported for this resource.',
        406: 'The server cannot provide a response in the format you requested.',
        408: 'Your request took too long to complete. Please try again.',
        409: 'There\'s a conflict with the current state of the resource.',
        410: 'This resource is permanently gone and will not return.',
        413: 'The request payload exceeds the maximum size allowed.',
        429: 'You\'ve made too many requests. Please slow down and try again later.',
        500: 'An unexpected error occurred on our end. We\'re working to fix it.',
        502: 'The gateway received an invalid response. Please try again shortly.',
        503: 'The service is temporarily unavailable. Please check back soon.',
        504: 'The gateway timed out waiting for a response. Please try again.'
    };

    // ── Parse URL ──
    var pathMatch = window.location.pathname.match(/\/fairer-pages\/([^/]+)\/(\d+)\.html$/);
    var themeName = pathMatch ? pathMatch[1] : null;
    var errorCode = pathMatch ? parseInt(pathMatch[2]) : 404;

    if (!themeName) {
        console.error('[fairer-pages] Could not parse theme name from URL');
        document.body.classList.remove('fp-loading');
        document.body.classList.add('fp-ready');
        return;
    }

    // ── Go Back Navigation (iframe-aware) ──
    window.fpGoBack = function () {
        var nav = (window.self !== window.top) ? window.top : window;
        var urlParams = new URLSearchParams(window.location.search);
        var refUrl = urlParams.get('ref');

        if (refUrl && refUrl !== '/') {
            nav.location.href = decodeURIComponent(refUrl);
        } else if (nav.history.length > 1) {
            nav.history.back();
        } else {
            nav.location.href = '/';
        }
    };

    // ── Helper functions ──
    function setText(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function show(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = '';
    }

    function hide(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }

    // ── Get theme string for an error code, falling back through keys ──
    function getThemeText(obj, code, fallback) {
        if (!obj) return fallback || '';
        return obj[String(code)] || obj[code] || obj['default'] || fallback || '';
    }

    // ── Populate HTML content from theme config ──
    function populateContent(theme) {
        var code = String(errorCode);
        var httpMessage = HTTP_ERRORS[errorCode] || 'Unknown Error';
        var layout = theme.layout || 'card';

        // Set data-layout on body for CSS targeting
        document.body.setAttribute('data-layout', layout);

        // Page title
        document.title = errorCode + ' - ' + httpMessage;
        if (theme.name) document.title += ' | ' + theme.name;

        // Title
        var title = getThemeText(theme.titles, code, httpMessage);
        setText('title', title);

        // Error code
        setText('error-code', errorCode);

        // Error message
        var message = getThemeText(theme.messages, code, httpMessage);
        setText('error-message', message);

        // Description
        var desc = getThemeText(theme.descriptions, code, DEFAULT_DESCRIPTIONS[errorCode] || '');
        setText('description', desc);
        if (!desc) hide('description');

        // Badge
        if (theme.badge) {
            setText('badge', theme.badge);
            show('badge');
        }

        // Image — background or inline depending on layout
        if (theme.image) {
            var imgSrc = '/fairer-pages/' + themeName + '/' + theme.image;
            var imgAlt = theme.imageAlt || theme.name || '';

            if (layout === 'card-bg' || layout === 'full-bleed') {
                var bgImg = document.getElementById('bg-image');
                if (bgImg) {
                    bgImg.src = imgSrc;
                    bgImg.alt = imgAlt;
                    show('bg-image');
                }
                show('overlay');
            } else if (layout === 'card-image') {
                var inlineImg = document.getElementById('inline-image');
                if (inlineImg) {
                    inlineImg.src = imgSrc;
                    inlineImg.alt = imgAlt;
                    show('inline-image');
                }
            }
        }

        // Buttons
        if (theme.buttons) {
            if (theme.buttons.home) setText('btn-home', theme.buttons.home);
            if (theme.buttons.back) setText('btn-back', theme.buttons.back);
        }

        // Footer — can be a string or per-code object
        var footer = null;
        if (typeof theme.footer === 'string') {
            footer = theme.footer;
        } else if (typeof theme.footers === 'object' && theme.footers) {
            footer = getThemeText(theme.footers, code, '');
        }
        if (footer) {
            setText('footer', footer);
            show('footer');
        }

        // Quote (optional)
        if (theme.quote) {
            if (theme.quote.text) {
                setText('quote-text', theme.quote.text);
                show('quote');
            }
            if (theme.quote.author) {
                setText('quote-author', '\u2014 ' + theme.quote.author);
            }
        }

        // Particles
        if (theme.particles && theme.particles.enabled) {
            generateParticles(theme.particles);
        }

        // Maintenance mode (query params for now; SSI in Phase 6)
        var urlParams = new URLSearchParams(window.location.search);
        var maintenance = urlParams.get('maintenance');
        if (maintenance === 'true') {
            var serviceName = urlParams.get('service') || '';
            var maintenanceMsg = urlParams.get('message') || 'This service is undergoing planned maintenance.';
            if (serviceName) setText('service-name', serviceName);
            setText('maintenance-message', maintenanceMsg);
            show('maintenance-info');
        }

        // Status widget (query param for now; SSI in Phase 6)
        var statusUrl = urlParams.get('status_url');
        if (statusUrl) {
            fetchStatus(statusUrl);
        }
    }

    // ── Particle Generator ──
    function generateParticles(config) {
        var container = document.getElementById('particles');
        if (!container) return;

        var count = config.count || 30;
        var color = config.color || null;

        for (var i = 0; i < count; i++) {
            var particle = document.createElement('div');
            particle.className = 'fp-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 12 + 's';
            particle.style.animationDuration = (Math.random() * 5 + 10) + 's';
            var size = Math.random() * 3 + 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            if (color) {
                particle.style.background = color;
                particle.style.boxShadow = '0 0 5px ' + color;
            }
            container.appendChild(particle);
        }
        show('particles');
    }

    // ── Status Widget (Phase 7) ──
    function fetchStatus(url) {
        fetch(url)
            .then(function (response) {
                if (!response.ok) return null;
                return response.json();
            })
            .then(function (data) {
                if (!data) return;
                var widget = document.getElementById('status-widget');
                if (!widget) return;

                var emoji = data.status === 'operational' ? '\u2705' : '\u26A0\uFE0F';
                var period = data.period || '30d';

                var html = '<div class="fp-status-header">Service Status</div>';
                if (data.uptime_percent !== undefined) {
                    html += '<div class="fp-status-uptime">' + emoji + ' ' + data.uptime_percent + '% uptime (' + period + ')</div>';
                }
                if (data.last_incident) {
                    var date = new Date(data.last_incident);
                    var diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
                    var timeAgo = diff === 0 ? 'today' : diff === 1 ? 'yesterday' : diff + ' days ago';
                    html += '<div class="fp-status-incident">Last incident: ' + timeAgo + '</div>';
                }
                widget.innerHTML = html;
                show('status-widget');
            })
            .catch(function () {
                // Status widget is optional — fail silently
            });
    }

    // ── Load Theme ──
    function loadTheme() {
        // Load theme.css first (can start rendering before JSON is ready)
        var cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = '/fairer-pages/' + themeName + '/theme.css';
        document.head.appendChild(cssLink);

        // Fetch theme.json
        fetch('/fairer-pages/' + themeName + '/theme.json')
            .then(function (response) {
                if (!response.ok) throw new Error('theme.json ' + response.status);
                return response.json();
            })
            .then(function (theme) {
                // Load Google Fonts if specified
                if (theme.fonts) {
                    var preconnect1 = document.createElement('link');
                    preconnect1.rel = 'preconnect';
                    preconnect1.href = 'https://fonts.googleapis.com';
                    document.head.insertBefore(preconnect1, document.head.firstChild);

                    var preconnect2 = document.createElement('link');
                    preconnect2.rel = 'preconnect';
                    preconnect2.href = 'https://fonts.gstatic.com';
                    preconnect2.crossOrigin = '';
                    document.head.insertBefore(preconnect2, preconnect1.nextSibling);

                    var fontLink = document.createElement('link');
                    fontLink.rel = 'stylesheet';
                    fontLink.href = theme.fonts;
                    document.head.appendChild(fontLink);
                }

                populateContent(theme);
                revealPage();
            })
            .catch(function (err) {
                console.error('[fairer-pages] Theme load error:', err);
                // Populate with defaults so the page isn't blank
                populateContent({});
                revealPage();
            });
    }

    // ── Best-fit scaling — zoom container to fit viewport ──
    function fitToViewport() {
        var container = document.querySelector('.fp-container');
        if (!container) return;
        container.style.zoom = '';
        var available = document.body.clientHeight;
        // offsetHeight = the card's laid-out box (in-flow content only). scrollHeight
        // would also count absolutely-positioned, animating decoration (shimmer
        // ::before, badge) whose extent changes per frame -> over-shrink + flicker.
        var contentHeight = container.offsetHeight;
        if (contentHeight > available) {
            container.style.zoom = (available / contentHeight) * 0.97;
        }
    }

    function revealPage() {
        requestAnimationFrame(function () {
            document.body.classList.remove('fp-loading');
            document.body.classList.add('fp-ready');
            fitToViewport();
            setTimeout(fitToViewport, 200);
            setTimeout(fitToViewport, 600);
            setTimeout(fitToViewport, 1500);
            setTimeout(fitToViewport, 3000);
            window.addEventListener('resize', fitToViewport);
        });
    }

    // ── Initialize ──
    loadTheme();

})();
