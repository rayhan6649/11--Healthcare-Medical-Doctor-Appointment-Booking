/*
Author       : Dreamstechnologies
Template Name: Doccure - Bootstrap Template
*/
(function () {
    "use strict";

    function initComingSoon() {
        var items = document.querySelectorAll('.coming-soon-item');
        if (items.length === 0) return;

        // Loop through each countdown section
        items.forEach(function (item) {
            // Get HTML elements inside each item
            var day = item.querySelector('.days');
            var hour = item.querySelector('.hours');
            var minute = item.querySelector('.minutes');
            var second = item.querySelector('.seconds');

            function setCountdown() {
                // Get date from data attribute or use default
                var countdownDate = item.getAttribute('data-countdown-date')
                    ? new Date(item.getAttribute('data-countdown-date')).getTime()
                    : new Date('December 30, 2026 16:00:00').getTime();

                // Update every second
                var updateCount = setInterval(function () {
                    var todayDate = new Date().getTime();
                    var distance = countdownDate - todayDate;

                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var secondVal = Math.floor((distance % (1000 * 60)) / 1000);

                    // Update UI
                    if (day) day.textContent = days;
                    if (hour) hour.textContent = hours;
                    if (minute) minute.textContent = minutes;
                    if (second) second.textContent = secondVal;

                    // Expired state
                    if (distance < 0) {
                        clearInterval(updateCount);
                        var parent = item.closest('.comming-soon-pg') || item;
                        parent.innerHTML = '<h1>EXPIRED</h1>';
                    }
                }, 1000);
            }

            setCountdown();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initComingSoon);
    } else {
        initComingSoon();
    }
})();