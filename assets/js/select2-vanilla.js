/* Select2 - Vanilla JS single-select dropdown (replaces select2 jQuery plugin) */
(function () {
	"use strict";

	function closeAll() {
		document.querySelectorAll('.select2-container--open').forEach(function (c) {
			var dropdown = c.querySelector('.select2-dropdown');
			if (dropdown) dropdown.remove();
			c.classList.remove('select2-container--open');
			var selection = c.querySelector('.select2-selection');
			if (selection) selection.setAttribute('aria-expanded', 'false');
		});
	}

	function buildOptionsList(selectEl, container, onPick) {
		var withImage = selectEl.classList.contains('select-img');
		var dropdown = document.createElement('span');
		dropdown.className = 'select2-dropdown select2-dropdown--below';

		var results = document.createElement('span');
		results.className = 'select2-results';

		var ul = document.createElement('ul');
		ul.className = 'select2-results__options';
		ul.setAttribute('role', 'listbox');

		Array.prototype.forEach.call(selectEl.options, function (opt, index) {
			var li = document.createElement('li');
			li.className = 'select2-results__option';
			li.setAttribute('role', 'option');
			if (withImage && opt.dataset.image) {
				var img = document.createElement('img');
				img.src = opt.dataset.image;
				img.className = 'clinic-img';
				img.width = 32;
				li.appendChild(img);
				li.appendChild(document.createTextNode(' ' + opt.textContent));
			} else {
				li.textContent = opt.textContent;
			}
			if (opt.selected) {
				li.setAttribute('aria-selected', 'true');
				li.classList.add('select2-results__option--highlighted');
			}
			li.addEventListener('mouseenter', function () {
				ul.querySelectorAll('.select2-results__option--highlighted').forEach(function (el) {
					el.classList.remove('select2-results__option--highlighted');
				});
				li.classList.add('select2-results__option--highlighted');
			});
			li.addEventListener('click', function () {
				onPick(opt, index);
			});
			ul.appendChild(li);
		});

		results.appendChild(ul);
		dropdown.appendChild(results);
		container.appendChild(dropdown);
		return dropdown;
	}

	function updateRendered(container, selectEl) {
		var rendered = container.querySelector('.select2-selection__rendered');
		var selectedOption = selectEl.options[selectEl.selectedIndex];
		var text = selectedOption ? selectedOption.textContent : '';
		rendered.textContent = '';
		if (selectEl.classList.contains('select-img') && selectedOption && selectedOption.dataset.image) {
			var img = document.createElement('img');
			img.src = selectedOption.dataset.image;
			img.className = 'clinic-img';
			img.width = 32;
			rendered.appendChild(img);
			rendered.appendChild(document.createTextNode(' ' + text));
		} else {
			rendered.textContent = text;
		}
		rendered.setAttribute('title', text);
	}

	function initSelect(selectEl) {
		if (selectEl.dataset.select2Init) return;
		selectEl.dataset.select2Init = 'true';

		selectEl.style.display = 'none';
		selectEl.setAttribute('aria-hidden', 'true');

		var container = document.createElement('span');
		container.className = 'select2 select2-container select2-container--default select2-container--below';
		container.setAttribute('dir', 'ltr');
		container.style.width = '100%';

		var selectionWrap = document.createElement('span');
		selectionWrap.className = 'selection';

		var selection = document.createElement('span');
		selection.className = 'select2-selection select2-selection--single';
		selection.setAttribute('role', 'combobox');
		selection.setAttribute('tabindex', '0');
		selection.setAttribute('aria-expanded', 'false');
		selection.setAttribute('aria-haspopup', 'true');

		var rendered = document.createElement('span');
		rendered.className = 'select2-selection__rendered';

		var arrow = document.createElement('span');
		arrow.className = 'select2-selection__arrow';
		arrow.setAttribute('role', 'presentation');
		arrow.innerHTML = '<b role="presentation"></b>';

		selection.appendChild(rendered);
		selection.appendChild(arrow);
		selectionWrap.appendChild(selection);
		container.appendChild(selectionWrap);

		selectEl.parentNode.insertBefore(container, selectEl);

		updateRendered(container, selectEl);

		function open() {
			if (container.classList.contains('select2-container--open')) return;
			closeAll();
			container.classList.add('select2-container--open');
			selection.setAttribute('aria-expanded', 'true');
			buildOptionsList(selectEl, container, function (opt, index) {
				selectEl.selectedIndex = index;
				updateRendered(container, selectEl);
				var event = new Event('change', { bubbles: true });
				selectEl.dispatchEvent(event);
				closeAll();
			});
		}

		selection.addEventListener('click', function (e) {
			e.stopPropagation();
			if (container.classList.contains('select2-container--open')) {
				closeAll();
			} else {
				open();
			}
		});

		selection.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				if (container.classList.contains('select2-container--open')) {
					closeAll();
				} else {
					open();
				}
			} else if (e.key === 'Escape') {
				closeAll();
			}
		});
	}

	document.addEventListener('click', closeAll);

	function init() {
		document.querySelectorAll('select.select, select.select-img').forEach(initSelect);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
