(function() {
    "use strict";

    document.addEventListener('DOMContentLoaded', function() {
        // Theme switch if present
        var switchEl = document.querySelector('.switch');
        if (switchEl) {
            switchEl.addEventListener('click', function() {
                if (document.body.classList.contains('light')) {
                    document.body.classList.remove('light');
                    switchEl.classList.remove('switched');
                } else {
                    document.body.classList.add('light');
                    switchEl.classList.add('switched');
                }
            });
        }

        // Progress Wrap (Back to top)
        var progressPath = document.querySelector('.progress-wrap path');
        var progressWrap = document.querySelector('.progress-wrap');

        if (progressPath && progressWrap) {
            var pathLength = progressPath.getTotalLength();
            progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
            progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
            progressPath.style.strokeDashoffset = pathLength;
            progressPath.getBoundingClientRect();
            progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

            var updateProgress = function() {
                var scroll = window.pageYOffset || document.documentElement.scrollTop;
                var height = document.documentElement.scrollHeight - window.innerHeight;
                if (height > 0) {
                    var progress = pathLength - (scroll * pathLength / height);
                    progressPath.style.strokeDashoffset = progress;
                }
            };

            updateProgress();
            window.addEventListener('scroll', function() {
                updateProgress();
                var scroll = window.pageYOffset || document.documentElement.scrollTop;
                if (scroll > 50) {
                    progressWrap.classList.add('active-progress');
                } else {
                    progressWrap.classList.remove('active-progress');
                }
            });

            progressWrap.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    });
})();