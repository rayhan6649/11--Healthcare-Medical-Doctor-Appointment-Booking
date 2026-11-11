/* Fancybox - Pure Vanilla JavaScript Lightbox (jQuery-less replacement for jquery.fancybox) */
(function () {
	"use strict";

	var CLOSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 10.6L6.6 5.2 5.2 6.6l5.4 5.4-5.4 5.4 1.4 1.4 5.4-5.4 5.4 5.4 1.4-1.4-5.4-5.4 5.4-5.4-1.4-1.4-5.4 5.4z"/></svg>';
	var PREV_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.28 15.7l-1.34 1.37L5 12l4.94-5.07 1.34 1.38-2.68 2.72H19v1.94H8.6z"/></svg>';
	var NEXT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.4 12.97l-2.68 2.72 1.34 1.38L19 12l-4.94-5.07-1.34 1.38 2.68 2.72H5v1.94z"/></svg>';

	var YOUTUBE_RE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/i;
	var VIMEO_RE = /(?:vimeo\.com\/(?:video\/)?)(\d+)/i;
	var VIDEO_EXT_RE = /\.(mp4|webm|ogv|mov)($|\?)/i;

	var container = null;
	var group = [];
	var groupIndex = 0;
	var lastFocused = null;

	function ensureStyles() {
		if (document.getElementById('fancybox-vanilla-styles')) return;
		var style = document.createElement('style');
		style.id = 'fancybox-vanilla-styles';
		style.textContent =
			'.fancybox-container{position:fixed !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important;z-index:999999 !important;outline:none !important;box-sizing:border-box !important;-webkit-tap-highlight-color:transparent;}' +
			'.fancybox-bg{position:absolute !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;background:#1e1e1e !important;opacity:0.9 !important;transition:opacity 0.3s cubic-bezier(0.22,0.61,0.36,1) !important;}' +
			'.fancybox-inner,.fancybox-stage{position:absolute !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;overflow:hidden !important;}' +
			'.fancybox-slide{position:absolute !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important;padding:44px !important;box-sizing:border-box !important;display:flex !important;align-items:center !important;justify-content:center !important;margin:0 !important;outline:none !important;text-align:center !important;}' +
			'.fancybox-content{position:relative !important;top:auto !important;left:auto !important;margin:auto !important;max-width:90vw !important;max-height:85vh !important;display:flex !important;align-items:center !important;justify-content:center !important;background:transparent !important;padding:0 !important;box-sizing:border-box !important;animation:fancybox-zoomIn 0.25s ease-out !important;}' +
			'@keyframes fancybox-zoomIn{from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}}' +
			'.fancybox-image{position:static !important;top:auto !important;left:auto !important;margin:0 auto !important;max-width:90vw !important;max-height:85vh !important;width:auto !important;height:auto !important;display:block !important;object-fit:contain !important;user-select:none !important;border-radius:2px !important;box-shadow:0 10px 30px rgba(0,0,0,0.5);}' +
			'.fancybox-iframe{position:static !important;width:80vw !important;height:45vw !important;max-height:80vh !important;border:0 !important;}' +
			'.fancybox-toolbar{position:absolute !important;top:0 !important;right:0 !important;z-index:99997 !important;display:flex !important;opacity:1 !important;visibility:visible !important;}' +
			'.fancybox-button{background:rgba(30,30,30,0.6) !important;border:0 !important;border-radius:0 !important;box-shadow:none !important;cursor:pointer !important;display:inline-block !important;height:44px !important;width:44px !important;margin:0 !important;padding:10px !important;position:relative !important;transition:color 0.2s,background 0.2s !important;vertical-align:top !important;visibility:visible !important;opacity:1 !important;color:#ccc !important;}' +
			'.fancybox-button:hover{color:#fff !important;background:rgba(0,0,0,0.8) !important;}' +
			'.fancybox-button svg{display:block !important;height:100% !important;width:100% !important;overflow:visible !important;}' +
			'.fancybox-button svg path{fill:currentColor !important;}' +
			'.fancybox-navigation .fancybox-button{position:absolute !important;top:calc(50% - 25px) !important;width:50px !important;height:50px !important;padding:13px !important;opacity:1 !important;visibility:visible !important;z-index:99997 !important;}' +
			'.fancybox-navigation .fancybox-button--arrow_left{left:0 !important;}' +
			'.fancybox-navigation .fancybox-button--arrow_right{right:0 !important;}' +
			'.fancybox-infobar{position:absolute !important;top:0 !important;left:0 !important;z-index:99997 !important;height:44px !important;line-height:44px !important;padding:0 16px !important;color:#ccc !important;font-size:14px !important;font-weight:500 !important;font-family:inherit !important;pointer-events:none !important;user-select:none !important;opacity:1 !important;visibility:visible !important;}' +
			'.fancybox-caption{position:absolute !important;bottom:0 !important;left:0 !important;right:0 !important;padding:16px 24px !important;background:linear-gradient(0deg,rgba(0,0,0,0.85) 0,rgba(0,0,0,0.3) 50%,transparent) !important;color:#eee !important;font-size:14px !important;line-height:1.5 !important;text-align:center !important;z-index:99996 !important;pointer-events:none !important;opacity:1 !important;visibility:visible !important;}';
		document.head.appendChild(style);
	}

	function cssEscape(value) {
		return window.CSS && CSS.escape ? CSS.escape(value) : value.replace(/(["\\])/g, '\\$1');
	}

	function getGroupItems(el) {
		var name = el.getAttribute('data-fancybox');
		if (!name || name === 'true' || name === '') return [el];
		var items = Array.prototype.slice.call(
			document.querySelectorAll('[data-fancybox="' + cssEscape(name) + '"]')
		);
		return items.length ? items : [el];
	}

	function getItemData(item) {
		if (typeof item === 'string') {
			return { src: item, caption: '', type: '', el: null };
		}
		if (item instanceof HTMLElement) {
			var href = item.getAttribute('data-src') || item.getAttribute('href') || '';
			var caption = item.getAttribute('data-caption') || item.getAttribute('title') || '';
			if (!caption) {
				var innerImg = item.querySelector('img');
				if (innerImg) caption = innerImg.getAttribute('alt') || '';
			}
			var type = item.getAttribute('data-type') || '';
			return { src: href, caption: caption, type: type, el: item };
		}
		if (item && typeof item === 'object') {
			return {
				src: item.src || item.href || '',
				caption: item.caption || (item.opts && item.opts.caption) || '',
				type: item.type || (item.opts && item.opts.type) || '',
				el: item.el || null
			};
		}
		return { src: '', caption: '', type: '', el: null };
	}

	function buildSlideContent(item) {
		var data = getItemData(item);
		var src = data.src;
		var type = data.type;

		var ytMatch = src.match(YOUTUBE_RE);
		var vimeoMatch = src.match(VIMEO_RE);

		if (type === 'iframe' || ytMatch || vimeoMatch) {
			var iframe = document.createElement('iframe');
			iframe.className = 'fancybox-iframe';
			iframe.setAttribute('allowfullscreen', 'allowfullscreen');
			iframe.setAttribute('allow', 'autoplay; fullscreen');
			if (ytMatch) {
				iframe.src = 'https://www.youtube.com/embed/' + ytMatch[1] + '?autoplay=1';
			} else if (vimeoMatch) {
				iframe.src = 'https://player.vimeo.com/video/' + vimeoMatch[1] + '?autoplay=1';
			} else {
				iframe.src = src;
			}
			return iframe;
		}

		if (type === 'video' || VIDEO_EXT_RE.test(src)) {
			var video = document.createElement('video');
			video.className = 'fancybox-video';
			video.setAttribute('controls', 'controls');
			video.setAttribute('autoplay', 'autoplay');
			video.style.maxWidth = '90vw';
			video.style.maxHeight = '80vh';
			var source = document.createElement('source');
			source.src = src;
			video.appendChild(source);
			return video;
		}

		if (type === 'inline' || (src.charAt(0) === '#' && src.length > 1)) {
			var inlineTarget = document.querySelector(src);
			if (inlineTarget) {
				var clone = inlineTarget.cloneNode(true);
				clone.style.display = 'block';
				return clone;
			}
		}

		var img = document.createElement('img');
		img.className = 'fancybox-image';
		img.src = src;
		img.alt = data.caption || '';
		return img;
	}

	function render() {
		if (!container) return;
		var stage = container.querySelector('.fancybox-stage');
		if (!stage) return;
		stage.innerHTML = '';

		var currentItem = group[groupIndex];
		var data = getItemData(currentItem);

		var slide = document.createElement('div');
		slide.className = 'fancybox-slide fancybox-slide--current fancybox-slide--image';

		var content = document.createElement('div');
		content.className = 'fancybox-content';
		content.appendChild(buildSlideContent(currentItem));

		slide.appendChild(content);
		stage.appendChild(slide);

		var indexEl = container.querySelector('[data-fancybox-index]');
		var countEl = container.querySelector('[data-fancybox-count]');
		if (indexEl) indexEl.textContent = String(groupIndex + 1);
		if (countEl) countEl.textContent = String(group.length);

		var nav = container.querySelector('.fancybox-navigation');
		if (nav) nav.style.display = group.length > 1 ? '' : 'none';

		var infobar = container.querySelector('.fancybox-infobar');
		if (infobar) infobar.style.display = group.length > 1 ? '' : 'none';

		var captionEl = container.querySelector('.fancybox-caption');
		if (data.caption) {
			if (!captionEl) {
				captionEl = document.createElement('div');
				captionEl.className = 'fancybox-caption';
				captionEl.innerHTML = '<div class="fancybox-caption__body"></div>';
				container.querySelector('.fancybox-inner').appendChild(captionEl);
			}
			var bodyEl = captionEl.querySelector('.fancybox-caption__body');
			if (bodyEl) bodyEl.textContent = data.caption;
			captionEl.style.display = '';
		} else if (captionEl) {
			captionEl.style.display = 'none';
		}
	}

	function createContainer() {
		if (container) return;
		container = document.createElement('div');
		container.className = 'fancybox-container fancybox-show-toolbar fancybox-show-nav fancybox-show-infobar fancybox-show-caption';
		container.setAttribute('role', 'dialog');
		container.setAttribute('tabindex', '-1');
		container.innerHTML =
			'<div class="fancybox-bg"></div>' +
			'<div class="fancybox-inner">' +
			'<div class="fancybox-infobar"><span data-fancybox-index>1</span>&nbsp;/&nbsp;<span data-fancybox-count>1</span></div>' +
			'<div class="fancybox-toolbar">' +
			'<button data-fancybox-close type="button" class="fancybox-button fancybox-button--close" title="Close">' + CLOSE_SVG + '</button>' +
			'</div>' +
			'<div class="fancybox-navigation">' +
			'<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="Previous"><div>' + PREV_SVG + '</div></button>' +
			'<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="Next"><div>' + NEXT_SVG + '</div></button>' +
			'</div>' +
			'<div class="fancybox-stage"></div>' +
			'<div class="fancybox-caption" style="display:none;"><div class="fancybox-caption__body"></div></div>' +
			'</div>';
		document.body.appendChild(container);

		container.addEventListener('click', function (e) {
			if (
				e.target.closest('[data-fancybox-close]') ||
				e.target === container ||
				e.target.classList.contains('fancybox-bg') ||
				e.target.classList.contains('fancybox-slide') ||
				e.target.classList.contains('fancybox-stage')
			) {
				close();
			} else if (e.target.closest('[data-fancybox-prev]')) {
				prev();
			} else if (e.target.closest('[data-fancybox-next]')) {
				next();
			}
		});

		var touchStartX = 0;
		var touchStartY = 0;
		container.addEventListener('touchstart', function (e) {
			if (e.touches && e.touches.length === 1) {
				touchStartX = e.touches[0].clientX;
				touchStartY = e.touches[0].clientY;
			}
		}, { passive: true });

		container.addEventListener('touchend', function (e) {
			if (e.changedTouches && e.changedTouches.length === 1) {
				var diffX = e.changedTouches[0].clientX - touchStartX;
				var diffY = e.changedTouches[0].clientY - touchStartY;
				if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
					if (diffX < 0) {
						next();
					} else {
						prev();
					}
				}
			}
		}, { passive: true });
	}

	function open(target, opts) {
		ensureStyles();
		createContainer();

		if (target instanceof HTMLElement) {
			group = getGroupItems(target);
			groupIndex = Math.max(0, group.indexOf(target));
		} else if (Array.isArray(target)) {
			group = target;
			groupIndex = (opts && typeof opts.index === 'number') ? opts.index : 0;
		} else if (typeof target === 'string') {
			group = [{ src: target }];
			groupIndex = 0;
		} else if (target && typeof target === 'object') {
			group = [target];
			groupIndex = 0;
		} else {
			return;
		}

		lastFocused = document.activeElement;
		document.body.classList.add('fancybox-active', 'compensate-for-scrollbar');
		container.classList.add('fancybox-is-open');
		container.style.display = 'block';
		render();
		container.focus();

		document.addEventListener('keydown', onKeydown);
	}

	function close() {
		if (!container) return;
		container.classList.remove('fancybox-is-open');
		container.style.display = 'none';
		document.body.classList.remove('fancybox-active', 'compensate-for-scrollbar');
		document.removeEventListener('keydown', onKeydown);
		if (lastFocused && lastFocused.focus) lastFocused.focus();
	}

	function prev() {
		if (group.length < 2) return;
		groupIndex = (groupIndex - 1 + group.length) % group.length;
		render();
	}

	function next() {
		if (group.length < 2) return;
		groupIndex = (groupIndex + 1) % group.length;
		render();
	}

	function onKeydown(e) {
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowLeft') prev();
		else if (e.key === 'ArrowRight') next();
	}

	// Global event delegation for all [data-fancybox] elements
	document.addEventListener('click', function (e) {
		var trigger = e.target.closest('[data-fancybox]');
		if (trigger) {
			e.preventDefault();
			open(trigger);
		}
	});

	// Expose global Fancybox API
	window.Fancybox = {
		open: open,
		close: close,
		next: next,
		prev: prev,
		getInstance: function () {
			return container && container.classList.contains('fancybox-is-open') ? {
				close: close,
				next: next,
				prev: prev,
				currIndex: groupIndex,
				group: group
			} : null;
		}
	};

	if (typeof window.$ !== 'undefined') {
		window.$.fancybox = window.Fancybox;
	}
})();

