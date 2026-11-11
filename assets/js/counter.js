document.addEventListener('DOMContentLoaded', function() {
    function isElementInViewport(el) {
        if (!el || el.offsetParent === null) return false;
        var rect = el.getBoundingClientRect();
        return (
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom > 0
        );
    }

    function animateCounter(el) {
        if (el.classList.contains('counter-loaded')) return;
        el.classList.add('counter-loaded');

        var originalText = el.textContent.trim();
        var numericString = originalText.replace(/,/g, '');
        var targetValue = parseFloat(numericString);

        if (isNaN(targetValue)) return;

        var hasCommas = originalText.indexOf(',') !== -1;
        var decimalMatches = numericString.match(/\.(\d+)/);
        var decimalPlaces = decimalMatches ? decimalMatches[1].length : 0;

        var startTime = null;
        var duration = 2000;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var ease = 1 - Math.pow(1 - progress, 3);
            var currentVal = targetValue * ease;
            var formattedVal = currentVal.toFixed(decimalPlaces);

            if (hasCommas) {
                var parts = formattedVal.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                formattedVal = parts.join('.');
            }

            el.textContent = formattedVal;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                var finalVal = targetValue.toFixed(decimalPlaces);
                if (hasCommas) {
                    var finalParts = finalVal.split('.');
                    finalParts[0] = finalParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    finalVal = finalParts.join('.');
                }
                el.textContent = finalVal;
            }
        }

        window.requestAnimationFrame(step);
    }

    function checkAndAnimateCounters() {
        var counters = document.querySelectorAll('.count-digit, .counter');
        counters.forEach(function(el) {
            if (!el.classList.contains('counter-loaded') && isElementInViewport(el)) {
                animateCounter(el);
            }
        });
    }

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.count-digit, .counter').forEach(function(el) {
            observer.observe(el);
        });
    } else {
        window.addEventListener('scroll', checkAndAnimateCounters);
        window.addEventListener('resize', checkAndAnimateCounters);
        checkAndAnimateCounters();
    }
});