/*
Author       : Dreamstechnologies
Template Name: Doccure - Bootstrap Template
Version      : 1.3
Pure Vanilla JavaScript Edition
*/

(function () {
	"use strict";

	// Vanilla DOM Ready Helper
	function ready(fn) {
		if (document.readyState !== 'loading') {
			fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	}

	// Slide Up / Down / Toggle helpers
	function slideUp(target, duration = 350) {
		if (!target) return;
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.boxSizing = 'border-box';
		target.style.height = (target.scrollHeight || target.offsetHeight) + 'px';
		target.offsetHeight; // force reflow
		target.style.overflow = 'hidden';
		target.style.height = '0px';
		target.style.paddingTop = '0px';
		target.style.paddingBottom = '0px';
		target.style.marginTop = '0px';
		target.style.marginBottom = '0px';
		window.setTimeout(() => {
			target.style.display = 'none';
			target.style.removeProperty('height');
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
		}, duration);
	}

	function slideDown(target, duration = 350) {
		if (!target) return;
		target.style.display = 'block';
		target.style.removeProperty('height');
		target.style.removeProperty('overflow');
		let height = target.scrollHeight || target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = '0px';
		target.style.paddingTop = '0px';
		target.style.paddingBottom = '0px';
		target.style.marginTop = '0px';
		target.style.marginBottom = '0px';
		target.offsetHeight; // force reflow
		target.style.boxSizing = 'border-box';
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		window.setTimeout(() => {
			target.style.display = 'block';
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
		}, duration);
	}

	function slideToggle(target, duration = 350) {
		if (!target) return;
		if (window.getComputedStyle(target).display === 'none') {
			return slideDown(target, duration);
		} else {
			return slideUp(target, duration);
		}
	}

	// Fade Toggle helper
	function fadeToggle(target, duration = 300) {
		if (!target) return;
		if (window.getComputedStyle(target).display === 'none') {
			target.style.opacity = 0;
			target.style.display = 'block';
			target.style.transition = `opacity ${duration}ms`;
			setTimeout(() => { target.style.opacity = 1; }, 10);
		} else {
			target.style.transition = `opacity ${duration}ms`;
			target.style.opacity = 0;
			setTimeout(() => {
				target.style.display = 'none';
				target.style.removeProperty('transition');
			}, duration);
		}
	}

	// Pure Vanilla Carousel / Slider Engine
	class VanillaSlider {
		constructor(element, options = {}) {
			this.container = typeof element === 'string' ? document.querySelector(element) : element;
			if (!this.container || this.container._vanillaSlider) return;
			this.container._vanillaSlider = this;

			this.options = Object.assign({
				items: 1,
				margin: 0,
				loop: true,
				centerMode: false,
				vertical: false,
				autoplay: false,
				autoplayTimeout: 5000,
				smartSpeed: 500,
				fade: false,
				dots: true,
				nav: true,
				navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
				responsive: {}
			}, options);

			this.init();
		}

		init() {
			this.originalItems = Array.from(this.container.children).filter(c => !c.classList.contains('slider-nav') && !c.classList.contains('slider-dots'));
			if (this.originalItems.length === 0) return;

			this.totalItems = this.originalItems.length;
			this.currentIndex = 0;
			this.updateResponsive();

			// Structure container
			const existingPos = window.getComputedStyle(this.container).position;
			this.container.style.position = (existingPos === 'absolute' || existingPos === 'fixed') ? existingPos : 'relative';
			this.container.style.overflow = 'hidden';
			this.container.style.display = 'block';
			this.container.classList.add('slick-slider', 'slick-initialized', 'slick-list');

			this.track = document.createElement('div');
			this.track.className = 'vanilla-slider-track slick-track';
			this.track.style.display = 'flex';
			if (this.options.vertical) {
				this.track.style.flexDirection = 'column';
				this.track.style.width = '100%';
			} else {
				this.track.style.width = 'max-content';
			}
			this.track.style.alignItems = 'stretch';
			this.track.style.transition = `transform ${this.options.smartSpeed}ms ease`;

			if (this.options.fade) {
				this.isInfinite = false;
				this.originalItems.forEach((item, idx) => {
					item.classList.add('slick-slide');
					item.style.position = 'absolute';
					item.style.top = '0';
					item.style.left = '0';
					item.style.width = '100%';
					item.style.height = '100%';
					item.style.opacity = idx === 0 ? '1' : '0';
					item.style.transition = `opacity ${this.options.smartSpeed}ms ease`;
					item.style.zIndex = idx === 0 ? '1' : '0';
					this.track.appendChild(item);
				});
				this.track.style.width = '100%';
				this.track.style.height = '100%';
				this.track.style.position = 'relative';
				this.virtualIndex = 0;

				this.container.appendChild(this.track);
				this.allItems = Array.from(this.track.children);

				if (this.options.nav) this.createNav();
				if (this.options.dots) this.createDots();
				if (this.options.autoplay) this.startAutoplay();

				window.addEventListener('resize', () => this.updateResponsive());

				this.updateClasses();
				return;
			}

			// If centerMode or infinite loop with cloning
			if (this.options.centerMode || this.options.infinite || (this.options.loop && this.options.infinite !== false)) {
				this.isInfinite = true;
				this.cloneCount = Math.max(this.totalItems * 2, 6);

				// Prepend clones
				for (let i = 0; i < this.cloneCount; i++) {
					const orig = this.originalItems[(this.totalItems - (this.cloneCount - i) % this.totalItems) % this.totalItems];
					const clone = orig.cloneNode(true);
					clone.classList.add('slick-cloned', 'slick-slide');
					clone.style.flexShrink = '0';
					clone.style.boxSizing = 'border-box';
					this.track.appendChild(clone);
				}

				// Real items
				this.originalItems.forEach(item => {
					item.style.flexShrink = '0';
					item.style.boxSizing = 'border-box';
					item.classList.add('slick-slide');
					this.track.appendChild(item);
				});

				// Append clones
				for (let i = 0; i < this.cloneCount; i++) {
					const orig = this.originalItems[i % this.totalItems];
					const clone = orig.cloneNode(true);
					clone.classList.add('slick-cloned', 'slick-slide');
					clone.style.flexShrink = '0';
					clone.style.boxSizing = 'border-box';
					this.track.appendChild(clone);
				}

				this.virtualIndex = this.cloneCount;
			} else {
				this.isInfinite = false;
				this.originalItems.forEach(item => {
					item.style.flexShrink = '0';
					item.style.boxSizing = 'border-box';
					item.classList.add('slick-slide');
					this.track.appendChild(item);
				});
				this.virtualIndex = 0;
			}

			this.container.appendChild(this.track);
			this.allItems = Array.from(this.track.children);

			this.updateItemWidths();

			if (this.options.nav) {
				this.createNav();
			}
			if (this.options.dots) {
				this.createDots();
			}

			if (this.options.autoplay) {
				this.startAutoplay();
			}

			// Touch / Drag Support
			this.initTouch();

			// Listen for transition end to reset infinite buffer seamlessly
			this.track.addEventListener('transitionend', () => {
				this.checkInfiniteBoundary();
			});

			window.addEventListener('resize', () => {
				this.updateResponsive();
				this.updateItemWidths();
				this.goToVirtual(this.virtualIndex, false);
			});

			this.goToVirtual(this.virtualIndex, false);
		}

		updateResponsive() {
			const width = window.innerWidth;
			let items = this.options.items;
			let margin = this.options.margin;

			if (this.options.responsive) {
				const breakpoints = Object.keys(this.options.responsive).map(Number).sort((a, b) => a - b);
				for (let bp of breakpoints) {
					if (width >= bp) {
						if (this.options.responsive[bp].items !== undefined) {
							items = this.options.responsive[bp].items;
						}
						if (this.options.responsive[bp].margin !== undefined) {
							margin = this.options.responsive[bp].margin;
						}
					}
				}
			}
			this.currentItems = items;
			this.currentMargin = margin;
		}

		updateItemWidths() {
			if (this.options.vertical) {
				this.allItems.forEach((item) => {
					item.style.width = '100%';
					item.style.flexShrink = '0';
					item.style.boxSizing = 'border-box';
					item.style.marginLeft = '0px';
					item.style.marginRight = '0px';
					item.style.marginTop = '0px';
					item.style.marginBottom = this.currentMargin + 'px';
				});
				this.updateVerticalHeight();
				return;
			}

			const containerWidth = this.container.offsetWidth;
			if (containerWidth === 0) return;

			let itemWidth;
			if (this.options.centerMode) {
				if (this.currentItems <= 1) {
					itemWidth = Math.min(containerWidth, 480);
				} else {
					const totalMargins = this.currentMargin * (this.currentItems - 1);
					itemWidth = (containerWidth - totalMargins) / this.currentItems;
				}
			} else {
				const totalMargins = this.currentMargin * (this.currentItems - 1);
				itemWidth = (containerWidth - totalMargins) / this.currentItems;
			}
			this.itemWidth = itemWidth;

			const halfMargin = this.currentMargin / 2;
			this.allItems.forEach((item) => {
				item.style.width = itemWidth + 'px';
				item.style.flexShrink = '0';
				item.style.boxSizing = 'border-box';
				if (this.options.centerMode) {
					item.style.marginLeft = halfMargin + 'px';
					item.style.marginRight = halfMargin + 'px';
				} else {
					item.style.marginLeft = '0px';
					item.style.marginRight = this.currentMargin + 'px';
				}
			});
		}

		updateVerticalHeight() {
			const count = Math.max(1, Math.floor(this.currentItems));
			let total = 0;
			for (let i = 0; i < count; i++) {
				const item = this.allItems[this.virtualIndex + i];
				if (!item) break;
				total += item.offsetHeight;
				if (i < count - 1) total += this.currentMargin;
			}
			if (total > 0) this.container.style.height = total + 'px';
		}

		getOffset(vIndex) {
			const targetSlide = this.allItems[vIndex];
			if (!targetSlide) return 0;
			if (this.options.vertical) {
				return -targetSlide.offsetTop;
			}
			const containerWidth = this.container.offsetWidth;
			if (this.options.centerMode) {
				const slideCenter = targetSlide.offsetLeft + (targetSlide.offsetWidth / 2);
				return (containerWidth / 2) - slideCenter;
			} else {
				return -targetSlide.offsetLeft;
			}
		}

		applyTransform(offset) {
			this.track.style.transform = this.options.vertical ? `translateY(${offset}px)` : `translateX(${offset}px)`;
		}

		createNav() {
			if (this.options.navButtons) {
				const prevEls = document.querySelectorAll(this.options.navButtons.prev);
				const nextEls = document.querySelectorAll(this.options.navButtons.next);
				if (prevEls.length && nextEls.length) {
					prevEls.forEach(el => el.addEventListener('click', (e) => {
						e.preventDefault();
						this.prev();
					}));
					nextEls.forEach(el => el.addEventListener('click', (e) => {
						e.preventDefault();
						this.next();
					}));
					return;
				}
			}

			let navContainer = this.container;
			if (this.options.navContainer) {
				const external = document.querySelector(this.options.navContainer);
				if (external) navContainer = external;
			}

			const prevBtn = document.createElement('button');
			prevBtn.className = 'owl-prev slick-prev slider-prev-btn';
			prevBtn.setAttribute('type', 'button');
			prevBtn.setAttribute('aria-label', 'Previous');
			prevBtn.innerHTML = this.options.navText[0] || '<i class="fas fa-chevron-left"></i>';
			prevBtn.addEventListener('click', (e) => {
				e.preventDefault();
				this.prev();
			});

			const nextBtn = document.createElement('button');
			nextBtn.className = 'owl-next slick-next slider-next-btn';
			nextBtn.setAttribute('type', 'button');
			nextBtn.setAttribute('aria-label', 'Next');
			nextBtn.innerHTML = this.options.navText[1] || '<i class="fas fa-chevron-right"></i>';
			nextBtn.addEventListener('click', (e) => {
				e.preventDefault();
				this.next();
			});

			if (navContainer === this.container) {
				const navWrap = document.createElement('div');
				navWrap.className = 'slider-nav owl-nav';
				navWrap.appendChild(prevBtn);
				navWrap.appendChild(nextBtn);
				this.container.appendChild(navWrap);
			} else {
				navContainer.appendChild(prevBtn);
				navContainer.appendChild(nextBtn);
			}
		}

		createDots() {
			this.dotsWrap = document.createElement('ul');
			this.dotsWrap.className = 'slider-dots owl-dots slick-dots';
			const numDots = this.options.centerMode ? this.totalItems : Math.max(1, this.totalItems - Math.floor(this.currentItems) + 1);

			for (let i = 0; i < numDots; i++) {
				const li = document.createElement('li');
				li.className = 'owl-dot' + (i === 0 ? ' active slick-active' : '');
				const dot = document.createElement('button');
				dot.setAttribute('type', 'button');
				dot.setAttribute('aria-label', `Slide ${i + 1}`);
				dot.innerHTML = '<span></span>';
				dot.addEventListener('click', () => this.goTo(i));
				li.appendChild(dot);
				this.dotsWrap.appendChild(li);
			}
			this.container.appendChild(this.dotsWrap);
		}

		updateDots() {
			if (!this.dotsWrap) return;
			const realIndex = this.isInfinite
				? ((this.virtualIndex - this.cloneCount) % this.totalItems + this.totalItems) % this.totalItems
				: this.virtualIndex;
			const dots = Array.from(this.dotsWrap.children);
			dots.forEach((dot, index) => {
				dot.classList.toggle('active', index === realIndex);
				dot.classList.toggle('slick-active', index === realIndex);
			});
		}

		updateClasses() {
			const realIndex = this.isInfinite
				? ((this.virtualIndex - this.cloneCount) % this.totalItems + this.totalItems) % this.totalItems
				: this.virtualIndex;

			this.allItems.forEach((item, idx) => {
				const isCenter = (idx === this.virtualIndex);
				item.classList.toggle('slick-center', isCenter);
				item.classList.toggle('slick-current', isCenter);
				item.classList.toggle('slick-active', Math.abs(idx - this.virtualIndex) <= Math.floor(this.currentItems / 2));
			});

			if (this.options.onChange) this.options.onChange(realIndex);
			this.updateDots();
		}

		checkInfiniteBoundary() {
			if (!this.isInfinite) return;
			let reset = false;
			if (this.virtualIndex >= this.cloneCount + this.totalItems) {
				this.virtualIndex -= this.totalItems;
				reset = true;
			} else if (this.virtualIndex < this.cloneCount) {
				this.virtualIndex += this.totalItems;
				reset = true;
			}
			if (reset) {
				this.track.style.transition = 'none';
				this.updateClasses();
				this.applyTransform(this.getOffset(this.virtualIndex));
				this.track.offsetHeight;
			}
		}

		goToVirtual(index, animate = true) {
			if (this.options.fade) {
				const total = this.totalItems;
				index = ((index % total) + total) % total;
				this.virtualIndex = index;
				this.allItems.forEach((item, idx) => {
					item.style.opacity = idx === index ? '1' : '0';
					item.style.zIndex = idx === index ? '1' : '0';
				});
				this.updateClasses();
				return;
			}
			if (!this.isInfinite) {
				const maxIndex = Math.max(0, this.totalItems - Math.floor(this.currentItems));
				if (this.options.loop) {
					if (index > maxIndex) index = 0;
					if (index < 0) index = maxIndex;
				} else {
					index = Math.max(0, Math.min(index, maxIndex));
				}
			}

			this.virtualIndex = index;
			this.updateClasses();
			if (this.options.vertical) this.updateVerticalHeight();

			const offset = this.getOffset(index);
			this.track.style.transition = animate ? `transform ${this.options.smartSpeed}ms ease` : 'none';
			this.applyTransform(offset);
			if (!animate) {
				this.track.offsetHeight;
			}
		}

		goTo(realIndex) {
			if (this.isInfinite) {
				const currentReal = ((this.virtualIndex - this.cloneCount) % this.totalItems + this.totalItems) % this.totalItems;
				const diff = realIndex - currentReal;
				this.goToVirtual(this.virtualIndex + diff, true);
			} else {
				this.goToVirtual(realIndex, true);
			}
		}

		next() {
			this.goToVirtual(this.virtualIndex + 1, true);
		}

		prev() {
			this.goToVirtual(this.virtualIndex - 1, true);
		}

		startAutoplay() {
			this.stopAutoplay();
			this.autoplayTimer = setInterval(() => {
				this.next();
			}, this.options.autoplayTimeout || 5000);
		}

		stopAutoplay() {
			if (this.autoplayTimer) {
				clearInterval(this.autoplayTimer);
			}
		}

		initTouch() {
			let startX = 0;
			let currentX = 0;
			let isTouching = false;
			let startOffset = 0;
			let isDragging = false;
			const axis = (e) => this.options.vertical ? e.clientY : e.clientX;
			const touchAxis = (t) => this.options.vertical ? t.clientY : t.clientX;

			const onStart = (clientX) => {
				startX = clientX;
				currentX = clientX;
				isTouching = true;
				isDragging = false;
				this.updateItemWidths();
				startOffset = this.getOffset(this.virtualIndex);
				this.track.style.transition = 'none';
				this.stopAutoplay();
			};

			const onMove = (clientX) => {
				if (!isTouching) return;
				currentX = clientX;
				const diff = currentX - startX;
				if (Math.abs(diff) > 3) isDragging = true;
				this.applyTransform(startOffset + diff);
			};

			const onEnd = () => {
				if (!isTouching) return;
				isTouching = false;
				const diff = startX - currentX;
				this.track.style.transition = `transform ${this.options.smartSpeed}ms ease`;
				if (Math.abs(diff) > 40) {
					if (diff > 0) {
						this.next();
					} else {
						this.prev();
					}
				} else {
					this.goToVirtual(this.virtualIndex, true);
				}
				if (this.options.autoplay) {
					this.startAutoplay();
				}
			};

			this.container.addEventListener('touchstart', (e) => {
				onStart(touchAxis(e.touches[0]));
			}, { passive: true });

			this.container.addEventListener('touchmove', (e) => {
				onMove(touchAxis(e.touches[0]));
			}, { passive: true });

			this.container.addEventListener('touchend', onEnd);

			this.container.addEventListener('mousedown', (e) => {
				if (e.button !== 0) return;
				e.preventDefault();
				onStart(axis(e));

				const onMouseMove = (e) => {
					onMove(axis(e));
				};
				const onMouseUp = () => {
					onEnd();
					document.removeEventListener('mousemove', onMouseMove);
					document.removeEventListener('mouseup', onMouseUp);
					if (isDragging) {
						const preventClick = (ev) => {
							ev.preventDefault();
							ev.stopPropagation();
							this.container.removeEventListener('click', preventClick, true);
						};
						this.container.addEventListener('click', preventClick, true);
					}
				};

				document.addEventListener('mousemove', onMouseMove);
				document.addEventListener('mouseup', onMouseUp);
			});
		}
	}

	// Main Application Initialization
	ready(function () {

		// Horizontal / Vertical Marquee Slider - ensure content is duplicated for seamless CSS -50% loop
		document.querySelectorAll('.horizontal-slide .slide-list, .vertical-slide .slide-list').forEach(function (list) {
			if (list.dataset.marqueeInit) return;
			list.dataset.marqueeInit = 'true';

			const children = Array.from(list.children);
			if (children.length === 0) return;

			let alreadyDoubled = false;
			if (children.length % 2 === 0) {
				const half = children.length / 2;
				alreadyDoubled = true;
				for (let i = 0; i < half; i++) {
					if (children[i].outerHTML !== children[i + half].outerHTML) {
						alreadyDoubled = false;
						break;
					}
				}
			}

			if (!alreadyDoubled) {
				children.forEach(function (child) {
					list.appendChild(child.cloneNode(true));
				});
			}
		});

		// Animated Circular Text Buttons
		document.querySelectorAll('.animate-button, .animate-button2').forEach(function (btn) {
			const textEl = btn.querySelector('.button-text, .button-text2');
			if (!textEl || textEl.dataset.circleInit) return;
			textEl.dataset.circleInit = 'true';

			const text = btn.getAttribute('data-text') || '';
			const chars = Array.from(text);
			if (chars.length === 0) return;

			textEl.style.setProperty('--angle', (360 / chars.length).toFixed(4));
			textEl.innerHTML = '';
			chars.forEach(function (char, i) {
				const span = document.createElement('span');
				span.style.setProperty('--index', i);
				span.textContent = char;
				textEl.appendChild(span);
			});
		});

		// Stick Sidebar
		if (window.innerWidth > 991) {
			const stickySidebars = document.querySelectorAll('.theiaStickySidebar');
			stickySidebars.forEach(sidebar => {
				sidebar.style.position = 'sticky';
				sidebar.style.top = '30px';
			});
		}

		// Collapse any expanded mobile submenus back to closed state, so the
		// drawer always starts fresh next time it's opened.
		function resetMobileSubmenus() {
			document.querySelectorAll('.main-nav a.submenu').forEach(function (link) {
				link.classList.remove('submenu');
				const subUl = link.parentElement.querySelector(':scope > ul');
				if (subUl) {
					subUl.style.display = 'none';
					subUl.style.removeProperty('height');
					subUl.style.removeProperty('overflow');
					subUl.style.removeProperty('padding-top');
					subUl.style.removeProperty('padding-bottom');
					subUl.style.removeProperty('margin-top');
					subUl.style.removeProperty('margin-bottom');
				}
			});
		}

		// Sidebar Mobile Navigation — only apply on mobile
		document.addEventListener('click', function (e) {
			// Only handle submenu toggles on mobile view
			if (window.innerWidth > 991) return;

			const link = e.target.closest('.main-nav a');
			if (!link) return;
			const parentLi = link.parentElement;
			if (parentLi && parentLi.classList.contains('has-submenu')) {
				e.preventDefault();
				// Use :scope > ul so we only get direct child submenu
				const subUl = parentLi.querySelector(':scope > ul');
				if (!subUl) return;

				const isOpen = link.classList.contains('submenu');
				const parentUl = link.closest('ul');

				if (!isOpen) {
					// Close all open siblings first
					if (parentUl) {
						Array.from(parentUl.children).forEach(siblingLi => {
							if (siblingLi !== parentLi && siblingLi.classList.contains('has-submenu')) {
								const siblingLink = siblingLi.querySelector(':scope > a');
								const siblingSub = siblingLi.querySelector(':scope > ul');
								if (siblingLink) siblingLink.classList.remove('submenu');
								if (siblingSub && window.getComputedStyle(siblingSub).display !== 'none') {
									slideUp(siblingSub, 350);
								}
							}
						});
					}
					slideDown(subUl, 350);
					link.classList.add('submenu');
				} else {
					link.classList.remove('submenu');
					slideUp(subUl, 350);
				}
			}
		});

		// Mobile menu sidebar overlay
		if (!document.querySelector('.sidebar-overlay')) {
			const overlay = document.createElement('div');
			overlay.className = 'sidebar-overlay';
			document.body.appendChild(overlay);
		}

		document.addEventListener('click', function (e) {
			const mobileBtn = e.target.closest('#mobile_btn, .mobile_btn');
			if (mobileBtn) {
				e.preventDefault();
				const mainWrapper = document.querySelector('.main-wrapper') || document.querySelector('main-wrapper');
				const sidebarOverlay = document.querySelector('.sidebar-overlay');
				/*if (mainWrapper) mainWrapper.classList.toggle('slide-nav');*/
				if (sidebarOverlay) sidebarOverlay.classList.toggle('opened');
				document.documentElement.classList.toggle('menu-opened');
				if (!isOpening) resetMobileSubmenus();
				return;
			}

			const menuClose = e.target.closest('#menu_close, .menu-close');
			if (menuClose) {
				e.preventDefault();
				const mainWrapper = document.querySelector('.main-wrapper') || document.querySelector('main-wrapper');
				const sidebarOverlay = document.querySelector('.sidebar-overlay');
				document.documentElement.classList.remove('menu-opened');
				if (sidebarOverlay) sidebarOverlay.classList.remove('opened');
				if (mainWrapper) mainWrapper.classList.remove('slide-nav');
				resetMobileSubmenus();
				return;
			}

			const sidebarOverlay = e.target.closest('.sidebar-overlay');
			if (sidebarOverlay && sidebarOverlay.classList.contains('opened')) {
				const mainWrapper = document.querySelector('.main-wrapper') || document.querySelector('main-wrapper');
				document.documentElement.classList.remove('menu-opened');
				sidebarOverlay.classList.remove('opened');
				if (mainWrapper) mainWrapper.classList.remove('slide-nav');
				resetMobileSubmenus();
				return;
			}
		});

		// Textarea Character Count
		const reviewDesc = document.getElementById('review_desc');
		const chars = document.getElementById('chars');
		if (reviewDesc && chars) {
			const maxLength = 100;
			const updateCount = () => {
				const length = reviewDesc.value.length;
				chars.textContent = Math.max(0, maxLength - length);
			};
			reviewDesc.addEventListener('keyup', updateCount);
			reviewDesc.addEventListener('change', updateCount);
			reviewDesc.addEventListener('input', updateCount);
		}

		// Consultation types
		const consultationTypes = document.querySelectorAll('.consultation-types');
		consultationTypes.forEach(btn => {
			btn.addEventListener('click', function () {
				consultationTypes.forEach(b => b.classList.remove('active'));
				this.classList.add('active');
			});
		});

		// AOS Animation
		if (document.querySelector('.main-wrapper .aos') && typeof AOS !== 'undefined') {
			AOS.init({
				duration: 1200,
				once: true,
			});
		}

		// Floating Label
		const floatings = document.querySelectorAll('.floating');
		floatings.forEach(input => {
			const handleFocusBlur = (e) => {
				const formFocus = input.closest('.form-focus');
				if (formFocus) {
					formFocus.classList.toggle('focused', e.type === 'focus' || input.value.length > 0);
				}
			};
			input.addEventListener('focus', handleFocusBlur);
			input.addEventListener('blur', handleFocusBlur);
			handleFocusBlur({ type: 'blur' });
		});

		// Bootstrap Tooltips
		if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
			const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
			tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
		}

		// Bootstrap Popovers
		if (typeof bootstrap !== 'undefined' && bootstrap.Popover) {
			const popoverTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
			popoverTriggerList.forEach(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
		}

		// Dynamic Hours Info Add / Remove
		document.addEventListener('click', function (e) {
			const trash = e.target.closest('.hours-info .trash');
			if (trash) {
				e.preventDefault();
				const cont = trash.closest('.hours-cont');
				if (cont) cont.remove();
				return;
			}

			const addHours = e.target.closest('.add-hours');
			if (addHours) {
				e.preventDefault();
				const hoursInfo = document.querySelector('.hours-info');
				if (hoursInfo) {
					const div = document.createElement('div');
					div.className = 'row hours-cont';
					div.innerHTML = '<div class="col-12 col-md-10">' +
						'<div class="row">' +
						'<div class="col-12 col-md-6"><div class="mb-3"><label>Start Time</label><select class="form-select form-control"><option>-</option><option>12.00 am</option><option>12.30 am</option><option>1.00 am</option><option>1.30 am</option></select></div></div>' +
						'<div class="col-12 col-md-6"><div class="mb-3"><label>End Time</label><select class="form-select form-control"><option>-</option><option>12.00 am</option><option>12.30 am</option><option>1.00 am</option><option>1.30 am</option></select></div></div>' +
						'</div></div>' +
						'<div class="col-12 col-md-2"><label class="d-md-block d-sm-none d-none">&nbsp;</label><a href="#" class="btn btn-danger trash"><i class="far fa-trash-alt"></i></a></div>';
					hoursInfo.appendChild(div);
				}
				return;
			}
		});

		// Content Min Height
		function resizeInnerDiv() {
			const content = document.querySelector('.content');
			if (!content) return;
			const windowHeight = window.innerHeight;
			const header = document.querySelector('.header');
			const footer = document.querySelector('.footer');
			const headerHeight = header ? header.offsetHeight : 0;
			const footerHeight = footer ? footer.offsetHeight : 0;
			content.style.minHeight = (windowHeight - headerHeight - footerHeight) + 'px';
		}
		resizeInnerDiv();
		window.addEventListener('resize', resizeInnerDiv);

		// Quantity Increment / Decrement
		function setupQuantityButtons(plusSelector, minusSelector, inputId) {
			const plus = document.querySelector(plusSelector);
			const minus = document.querySelector(minusSelector);
			const input = document.getElementById(inputId);
			if (plus && input) {
				plus.addEventListener('click', function (e) {
					e.preventDefault();
					let val = parseInt(input.value) || 0;
					input.value = val + 1;
				});
			}
			if (minus && input) {
				minus.addEventListener('click', function (e) {
					e.preventDefault();
					let val = parseInt(input.value) || 0;
					if (val > 0) input.value = val - 1;
				});
			}
		}
		setupQuantityButtons('.quantity-right-plus', '.quantity-left-minus', 'quantity');
		setupQuantityButtons('.quantity-right-plus2', '.quantity-left-minus2', 'quantity2');
		setupQuantityButtons('.quantity-right-plus3', '.quantity-left-minus3', 'quantity3');
		setupQuantityButtons('.quantity-right-plus4', '.quantity-left-minus4', 'quantity4');
		setupQuantityButtons('.quantity-right-plus5', '.quantity-left-minus5', 'quantity5');

		// Cart Click
		const cartBtn = document.getElementById('cart');
		const shoppingCart = document.querySelector('.shopping-cart');
		if (cartBtn && shoppingCart) {
			cartBtn.addEventListener('click', function (e) {
				e.preventDefault();
				fadeToggle(shoppingCart);
				shoppingCart.classList.toggle('show-cart');
			});
		}

		// Loader fadeOut
		const loader = document.getElementById('loader');
		if (loader) {
			setTimeout(() => {
				loader.style.transition = 'opacity 350ms';
				loader.style.opacity = 0;
				setTimeout(() => {
					loader.style.display = 'none';
					document.body.style.overflow = 'visible';
				}, 350);
			}, 350);
		}

		// Header scroll behavior
		window.addEventListener('scroll', function () {
			const scroll = window.pageYOffset || document.documentElement.scrollTop;

			const headerTrans = document.querySelectorAll('.header-trans.custom');
			headerTrans.forEach(h => {
				h.style.background = scroll > 95 ? '#2b6ccb' : 'transparent';
			});

			const headerOne = document.querySelectorAll('.header-one');
			headerOne.forEach(h => {
				h.classList.toggle('header-space', scroll > 35);
			});

			const innerHeader = document.querySelectorAll('.inner-header');
			innerHeader.forEach(h => {
				h.classList.toggle('fixed', scroll > 35);
			});

			const mainHeader = document.querySelectorAll('header');
			mainHeader.forEach(h => {
				h.classList.toggle('fixed', scroll > 35);
			});

			const headers = document.querySelectorAll('.header');
			headers.forEach(h => {
				h.classList.toggle('pharmacy-header', scroll >= 150);
			});
		});

		// Apex Charts (if containers exist and ApexCharts is loaded)
		if (typeof ApexCharts !== 'undefined') {
			const bmiEl = document.querySelector("#bmi-status");
			if (bmiEl) {
				new ApexCharts(bmiEl, {
					series: [{ name: "BMI", data: [10, 41, 35, 51, 49, 62, 69, 91, 148] }],
					chart: { height: 350, type: "line", zoom: { enabled: false } },
					dataLabels: { enabled: false },
					stroke: { curve: "straight" },
					grid: { row: { colors: ["#f3f3f3", "transparent"], opacity: 0.5 } },
					xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"] }
				}).render();
			}

			const heartEl = document.querySelector("#heartrate-status");
			if (heartEl) {
				new ApexCharts(heartEl, {
					series: [{ name: "HeartRate", data: [4, 3, 10, 9, 29, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5] }],
					chart: { height: 350, type: "line" },
					stroke: { width: 7, curve: "smooth" },
					xaxis: {
						type: "datetime",
						categories: ["1/11/2000", "2/11/2000", "3/11/2000", "4/11/2000", "5/11/2000", "6/11/2000", "7/11/2000", "8/11/2000", "9/11/2000", "10/11/2000", "11/11/2000", "12/11/2000", "1/11/2001", "2/11/2001", "3/11/2001", "4/11/2001", "5/11/2001", "6/11/2001"],
						tickAmount: 10
					},
					fill: { type: "gradient", gradient: { shade: "dark", gradientToColors: ["#0de0fe"], shadeIntensity: 1, type: "horizontal", opacityFrom: 1, opacityTo: 1, stops: [0, 100] } },
					markers: { size: 4, colors: ["#15558d"], strokeColors: "#fff", strokeWidth: 2, hover: { size: 7 } },
					yaxis: { min: -10, max: 40 }
				}).render();
			}

			const fbcEl = document.querySelector("#fbc-status");
			if (fbcEl) {
				new ApexCharts(fbcEl, {
					series: [{ name: "FBC", data: [2.3, 3.1, 4, 10.1, 4, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2] }],
					chart: { height: 350, type: "bar" },
					plotOptions: { bar: { borderRadius: 10, dataLabels: { position: "top" } } },
					dataLabels: { enabled: true, formatter: (val) => val + "%", offsetY: -20, style: { fontSize: "12px", colors: ["#304758"] } },
					xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], position: "top", axisBorder: { show: false }, axisTicks: { show: false } },
					yaxis: { axisBorder: { show: false }, axisTicks: { show: false }, labels: { show: false } }
				}).render();
			}

			const weightEl = document.querySelector("#weight-status");
			if (weightEl) {
				new ApexCharts(weightEl, {
					series: [{ name: "Weight", data: [34, 44, 54, 21, 12, 43, 33, 23, 66, 66, 58] }],
					chart: { type: "line", height: 350 },
					stroke: { curve: "stepline" },
					dataLabels: { enabled: false }
				}).render();
			}
		}

		// Circular report chart (e.g. "Overall Report" percent ring on the patient dashboard)
		if (typeof CircleProgress !== 'undefined') {
			document.querySelectorAll('.circle-graph3[data-percent]').forEach(function (el) {
				const percent = parseFloat(el.getAttribute('data-percent')) || 0;
				new CircleProgress(el, {
					value: percent / 100,
					size: 120,
					thickness: 10,
					lineCap: 'round',
					fill: { gradient: ['#0da8e5', '#00d0c1'] },
					emptyFill: 'rgba(0, 0, 0, .06)'
				});
			});
		}

		// Profile image file reader preview
		const profileImageInput = document.getElementById('profile_image');
		const profAvatar = document.getElementById('prof-avatar');
		if (profileImageInput && profAvatar) {
			profileImageInput.addEventListener('change', function () {
				if (this.files && this.files[0]) {
					const reader = new FileReader();
					reader.onload = function (e) {
						profAvatar.src = e.target.result;
					};
					reader.readAsDataURL(this.files[0]);
				}
			});
		}

		// More View Read More Toggles
		function setupMoreView(btnId, targetId) {
			const btn = document.getElementById(btnId);
			const target = document.getElementById(targetId);
			if (!btn || !target) return;
			let isCollapsed = true;
			btn.addEventListener('click', function (e) {
				e.preventDefault();
				if (isCollapsed) {
					isCollapsed = false;
					target.style.height = 'auto';
					btn.innerHTML = 'Show less <i class="feather-chevrons-right ms-1"></i>';
				} else {
					isCollapsed = true;
					target.style.height = '100px';
					btn.innerHTML = 'Show more <i class="feather-chevrons-right ms-1"></i>';
				}
			});
		}
		setupMoreView('more-view', 'fill-more');
		setupMoreView('more-view1', 'fill-more1');
		setupMoreView('more-view2', 'fill-more2');

		// Password toggles
		document.addEventListener('click', function (e) {
			const togglePass = e.target.closest('.toggle-password');
			if (togglePass) {
				togglePass.classList.toggle('feather-eye');
				const input = togglePass.closest('.input-block, .form-group, .form-wrap')?.querySelector('.pass-input') || document.querySelector('.pass-input');
				if (input) {
					input.type = input.type === 'password' ? 'text' : 'password';
				}
			}

			const togglePassSub = e.target.closest('.toggle-password-sub');
			if (togglePassSub) {
				togglePassSub.classList.toggle('feather-eye');
				const input = togglePassSub.closest('.input-block, .form-group, .form-wrap')?.querySelector('.pass-input-sub') || document.querySelector('.pass-input-sub');
				if (input) {
					input.type = input.type === 'password' ? 'text' : 'password';
				}
			}

			// Favourites
			const favIcon = e.target.closest('.favourite-icon');
			if (favIcon) {
				favIcon.classList.toggle('favourite');
			}
			const favIconTwo = e.target.closest('.favourite-icon-two');
			if (favIconTwo) {
				favIconTwo.classList.toggle('favourite-two');
			}
			const favItem = e.target.closest('.fav-item, .fav-icon');
			if (favItem && !favItem.classList.contains('favourite-icon')) {
				favItem.classList.toggle('selected');
			}

			// Dynamic row deletions
			const deleteBtn = e.target.closest('.delete_schedule, .btn-icon');
			if (deleteBtn && !deleteBtn.classList.contains('trash')) {
				const p = deleteBtn.parentElement;
				if (p) p.style.display = 'none';
			}
		});

		// OTP Digit group auto tab
		const digitInputs = document.querySelectorAll('.digit-group input');
		digitInputs.forEach(input => {
			input.setAttribute('maxlength', 1);
			input.addEventListener('keyup', function (e) {
				const parent = this.parentElement;
				if (!parent) return;
				if (this.value !== '') {
					this.classList.add('active');
				} else {
					this.classList.remove('active');
				}

				if (e.keyCode === 8 || e.keyCode === 37) {
					const prevId = this.getAttribute('data-previous');
					const prevInput = prevId ? parent.querySelector('#' + prevId) : this.previousElementSibling;
					if (prevInput) prevInput.focus();
				} else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 39) {
					const nextId = this.getAttribute('data-next');
					const nextInput = nextId ? parent.querySelector('#' + nextId) : this.nextElementSibling;
					if (nextInput) nextInput.focus();
				}
			});
		});

		// Call Controls: Mute & Video & Maximize
		const muteBtn = document.querySelector('.mute-bt');
		if (muteBtn) {
			muteBtn.addEventListener('click', function () {
				const icon = this.querySelector('i');
				if (this.classList.contains('stop')) {
					this.classList.remove('stop');
					if (icon) { icon.classList.remove('feather-mic-off'); icon.classList.add('feather-mic'); }
				} else {
					this.classList.add('stop');
					if (icon) { icon.classList.remove('feather-mic'); icon.classList.add('feather-mic-off'); }
				}
			});
		}

		const muteVideo = document.querySelector('.mute-video');
		if (muteVideo) {
			muteVideo.addEventListener('click', function () {
				const icon = this.querySelector('i');
				if (this.classList.contains('stop')) {
					this.classList.remove('stop');
					if (icon) { icon.classList.remove('feather-video-off'); icon.classList.add('feather-video'); }
				} else {
					this.classList.add('stop');
					if (icon) { icon.classList.remove('feather-video'); icon.classList.add('feather-video-off'); }
				}
			});
		}

		const winMaximize = document.querySelector('.win-maximize');
		if (winMaximize) {
			winMaximize.addEventListener('click', function () {
				if (!document.fullscreenElement) {
					document.documentElement.requestFullscreen();
				} else {
					if (document.exitFullscreen) document.exitFullscreen();
				}
			});
		}

		// Wizard Step Navigation
		document.addEventListener('click', function (e) {
			const nextBtn = e.target.closest('.next_btn');
			if (nextBtn) {
				e.preventDefault();
				const currentFieldset = nextBtn.closest('fieldset') || nextBtn.parentElement.parentElement;
				const nextFieldset = currentFieldset?.nextElementSibling;
				if (nextFieldset) {
					currentFieldset.style.display = 'none';
					nextFieldset.style.display = 'block';
					const activeProgress = document.querySelector('.progress-active');
					if (activeProgress) {
						activeProgress.classList.remove('progress-active');
						activeProgress.classList.add('progress-activated');
						const nextProgress = activeProgress.nextElementSibling;
						if (nextProgress) nextProgress.classList.add('progress-active');
					}
				}
				return;
			}

			const prevBtn = e.target.closest('.prev_btn');
			if (prevBtn) {
				e.preventDefault();
				const currentFieldset = prevBtn.closest('fieldset') || prevBtn.parentElement.parentElement;
				const prevFieldset = currentFieldset?.previousElementSibling;
				if (prevFieldset) {
					currentFieldset.style.display = 'none';
					prevFieldset.style.display = 'block';
					const activeProgress = document.querySelector('.progress-active');
					if (activeProgress) {
						activeProgress.classList.remove('progress-active');
						const prevProgress = activeProgress.previousElementSibling;
						if (prevProgress) {
							prevProgress.classList.remove('progress-activated');
							prevProgress.classList.add('progress-active');
						}
					}
				}
				return;
			}
		});

		// Dynamic Table Item additions
		document.addEventListener('click', function (e) {
			const addItems = e.target.closest('.add-items');
			if (addItems) {
				e.preventDefault();
				const table = document.querySelector('.add-table-items');
				if (table) {
					const tr = document.createElement('tr');
					tr.className = 'test';
					tr.innerHTML = '<td><input type="text" class="form-control"></td><td><input type="text" class="form-control"></td><td><a href="javascript:void(0)" class="btn bg-danger-light trash remove-btn"><i class="far fa-trash-alt"></i></a></td>';
					table.appendChild(tr);
				}
				return;
			}

			const addPrescription = e.target.closest('.add-prescription');
			if (addPrescription) {
				e.preventDefault();
				const table = document.querySelector('.add-table-prescription');
				if (table) {
					const tr = document.createElement('tr');
					tr.className = 'test';
					tr.innerHTML = '<td><input class="form-control" type="text"></td><td><input class="form-control" type="text"></td><td><input class="form-control" type="text"></td><td><div class="form-check form-check-inline"><label class="form-check-label"><input class="form-check-input" type="checkbox"> Morning</label></div><div class="form-check form-check-inline"><label class="form-check-label"><input class="form-check-input" type="checkbox"> Afternoon</label></div><div class="form-check form-check-inline"><label class="form-check-label"><input class="form-check-input" type="checkbox"> Evening</label></div><div class="form-check form-check-inline"><label class="form-check-label"><input class="form-check-input" type="checkbox"> Night</label></div></td><td><a href="#" class="btn bg-danger-light trash"><i class="far fa-trash-alt"></i></a></td>';
					table.appendChild(tr);
				}
				return;
			}

			const addMedical = e.target.closest('.add-medical');
			if (addMedical) {
				e.preventDefault();
				const row = document.querySelector('.meditation-row');
				if (row) {
					const div = document.createElement('div');
					div.className = 'col-md-12';
					div.innerHTML = '<div class="d-flex flex-wrap medication-wrap align-items-center"><div class="input-block input-block-new"><label class="form-label">Name</label><input type="text" class="form-control"></div><div class="input-block input-block-new"><label class="form-label">Type</label><select class="form-select form-control"><option>Select</option><option>Direct Visit</option><option>Video Call</option></select></div><div class="input-block input-block-new"><label class="form-label">Dosage</label><input type="text" class="form-control"></div><div class="input-block input-block-new"><label class="form-label">Duration</label><input type="text" class="form-control" placeholder="1-0-0"></div><div class="input-block input-block-new"><label class="form-label">Duration</label><select class="form-select form-control"><option>Select</option><option>Not Available</option></select></div><div class="input-block input-block-new"><label class="form-label">Instruction</label><input type="text" class="form-control"></div><div class="delete-row"><a href="#" class="delete-btn delete-medication trash text-danger"><i class="fa-solid fa-trash-can"></i></a></div></div>';
					row.appendChild(div);
				}
				return;
			}

			const addSocialMedia = e.target.closest('.add-social-media');
			if (addSocialMedia) {
				e.preventDefault();
				const form = document.querySelector('.social-media-form');
				if (form) {
					const div = document.createElement('div');
					div.className = 'social-media-links d-flex align-items-center mb-3';
					div.innerHTML = '<div class="input-block input-block-new select-social-link me-2"><select class="form-select form-control"><option selected>Facebook</option><option>Linkedin</option><option>Twitter</option><option>Instagram</option></select></div><div class="input-block input-block-new flex-fill"><input type="text" class="form-control" placeholder="Add Url"></div>';
					form.appendChild(div);
				}
				return;
			}

			// Table and row deletions
			const removeBtn = e.target.closest('.remove-btn, .trash, .delete-medication');
			if (removeBtn) {
				const row = removeBtn.closest('.add-row, .test, .medication-wrap');
				if (row) {
					e.preventDefault();
					row.remove();
					return;
				}
			}
		});

		// Search toggle in header
		const searchbarLink = document.querySelector('.searchbar a');
		const togglesearch = document.querySelector('.togglesearch');
		const topSearch = document.querySelector('.top-search');
		if (searchbarLink && togglesearch) {
			searchbarLink.addEventListener('click', function (e) {
				e.preventDefault();
				slideToggle(togglesearch);
				if (topSearch) topSearch.focus();
			});
		}

		// Table filter dropdown
		const tableFilter = document.getElementById('table-filter');
		const formSorts = document.querySelector('.form-sorts');
		if (tableFilter && formSorts) {
			tableFilter.addEventListener('click', function (e) {
				e.stopPropagation();
				formSorts.classList.toggle('table-filter-show');
			});
			document.addEventListener('click', function (e) {
				if (!e.target.closest('.form-sorts')) {
					formSorts.classList.remove('table-filter-show');
				}
			});
		}

		// Treatment Video Play / Pause
		const treatmentVideoLinks = document.querySelectorAll('.treatment-video a');
		treatmentVideoLinks.forEach(link => {
			link.addEventListener('click', function (e) {
				e.preventDefault();
				const parent = this.parentElement;
				const video = parent ? parent.querySelector('.doctor-treatment-video') : null;
				const allVideos = document.querySelectorAll('.doctor-treatment-video');
				allVideos.forEach(v => {
					if (v !== video) v.pause();
				});
				if (video) {
					video.classList.toggle('active');
					this.classList.toggle('active');
					if (video.paused) video.play();
					else video.pause();
				}
			});
		});

		// Custom Mouse Cursor Follower
		const cursorInner = document.querySelector('.cursor-inner');
		const cursorOuter = document.querySelector('.cursor-outer');
		if (cursorInner && cursorOuter && document.querySelector('.mouse-cursor')) {
			window.addEventListener('mousemove', function (e) {
				cursorOuter.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
				cursorInner.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
			});
			document.body.addEventListener('mouseover', function (e) {
				if (e.target.closest('a, button, .cursor-pointer, .btn')) {
					cursorInner.classList.add('cursor-hover');
					cursorOuter.classList.add('cursor-hover');
				} else {
					cursorInner.classList.remove('cursor-hover');
					cursorOuter.classList.remove('cursor-hover');
				}
			});
			cursorInner.style.visibility = 'visible';
			cursorOuter.style.visibility = 'visible';
		}

		// Initialize all sliders across all templates
		const isIndexHomeOne = /(^|\/)index\.html$/.test(window.location.pathname) || /\/$/.test(window.location.pathname);
		const sliderConfigs = [
			{ selector: '.service-slider', options: { loop: true, margin: 24, dots: false, nav: true, navContainer: '.service-slider-wrap', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1200: { items: 3 } } } },
			{ selector: '.testimonial-slider-four', options: { loop: true, centerMode: true, margin: 24, dots: true, nav: false, responsive: { 0: { items: 1 } } } },
			{ selector: '.partner-slider-four', options: { loop: true, margin: 0, dots: false, nav: false, autoplay: true, responsive: { 0: { items: 2 }, 500: { items: 3 }, 768: { items: 4 }, 1000: { items: 5 }, 1200: { items: 7 } } } },
			{ selector: '.partner-slider-seven', options: { loop: true, margin: 0, dots: false, nav: false, autoplay: true, responsive: { 0: { items: 2 }, 500: { items: 3 }, 768: { items: 4 }, 1000: { items: 5 }, 1200: { items: 6 } } } },
			{ selector: '.testimonial-slider-seven', options: { loop: true, margin: 24, dots: false, nav: true, vertical: true, navButtons: { prev: '.testimonial-prev', next: '.testimonial-next' }, responsive: { 0: { items: 2 } } } },
			{ selector: '.spciality-slider', options: { loop: true, margin: 24, dots: false, nav: true, navButtons: { prev: '.spciality-prev', next: '.spciality-next' }, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 6 } } } },
			{ selector: '.banner-slider-five', options: { loop: true, margin: 0, dots: false, nav: true, navButtons: { prev: '.ban-prev', next: '.ban-next' }, responsive: { 0: { items: 1 } } } },
			{ selector: '.testimonial-slider-five', options: { loop: true, margin: 24, dots: false, nav: true, navButtons: { prev: '.testimonial-prev', next: '.testimonial-next' }, responsive: { 0: { items: 1 }, 768: { items: 2 }, 992: { items: 2 } } } },
			{ selector: '.service-slider-eight', options: { loop: true, margin: 24, dots: false, nav: true, navButtons: { prev: '.services-prev', next: '.services-next' }, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 } } } },
			{ selector: '.blog-slider-eight', options: { loop: true, margin: 24, dots: false, nav: true, navButtons: { prev: '.blogs-prev', next: '.blogs-next' }, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 2 } } } },
			{ selector: '.banner-slider-fourteen', options: { loop: true, margin: 0, dots: false, nav: true, navButtons: { prev: '.ban-prev', next: '.ban-next' }, responsive: { 0: { items: 1 } } } },
			{ selector: '.testimonial-slider-fourteen', options: { loop: true, margin: 24, dots: false, nav: true, navButtons: { prev: '.testimonial-prev', next: '.testimonial-next' }, responsive: { 0: { items: 1 }, 768: { items: 2 } } } },
			{ selector: '.doctors-slider', options: { loop: true, margin: 24, dots: false, nav: !isIndexHomeOne, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1200: { items: 4 } } } },
			{ selector: '.testimonials-slider', options: { loop: true, margin: 24, dots: true, nav: false, responsive: { 0: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 } } } },
			{ selector: '.company-slider-thirteen', options: { loop: true, margin: 0, dots: false, nav: false, autoplay: true, responsive: { 0: { items: 2 }, 550: { items: 3 }, 700: { items: 4 }, 1000: { items: 6 } } } },
			{ selector: '.company-slider', options: { loop: true, margin: 24, dots: false, nav: !isIndexHomeOne, autoplay: true, responsive: { 0: { items: 2 }, 550: { items: 3 }, 700: { items: 4 }, 1000: { items: 6 } } } },
			{ selector: '.specialities-slider', options: { loop: true, margin: 20, dots: true, nav: false, responsive: { 0: { items: 2 }, 567: { items: 2 }, 776: { items: 3 }, 991: { items: 3 }, 1199: { items: 5 } } } },
			{ selector: '.doctor-slider', options: { loop: true, margin: 20, dots: false, nav: true, responsive: { 0: { items: 1 }, 567: { items: 1 }, 776: { items: 2 }, 992: { items: 3 } } } },
			{ selector: '.features-slider', options: { loop: true, margin: 20, dots: true, nav: false, responsive: { 0: { items: 1 }, 992: { items: 3 } } } },
			{ selector: '.clinic-slider', options: { loop: true, margin: 20, dots: false, nav: true, responsive: { 0: { items: 1 }, 567: { items: 1 }, 776: { items: 3 }, 992: { items: 4 } } } },
			{ selector: '.browse-slider', options: { loop: true, margin: 20, dots: false, nav: true, responsive: { 0: { items: 1 }, 567: { items: 1 }, 776: { items: 3 }, 992: { items: 4 } } } },
			{ selector: '.book-slider', options: { loop: true, margin: 20, dots: false, nav: true, responsive: { 0: { items: 1 }, 567: { items: 1 }, 776: { items: 2 }, 992: { items: 4 } } } },
			{ selector: '.aval-slider', options: { loop: true, margin: 20, dots: false, nav: true, responsive: { 0: { items: 1 }, 567: { items: 1 }, 776: { items: 2 }, 992: { items: 3 } } } },
			{ selector: '.owl-carousel.special', options: { loop: true, margin: 15, dots: true, nav: false, responsive: { 0: { items: 1 }, 500: { items: 2 }, 768: { items: 3 }, 1000: { items: 4 }, 1300: { items: 4 } } } },
			{ selector: '.owl-carousel.eye-clinic', options: { loop: true, margin: 15, dots: true, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 992: { items: 3 }, 1200: { items: 4 } } } },
			{ selector: '.owl-carousel.eye-blogslider', options: { loop: true, margin: 15, dots: true, nav: false, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 4 } } } },
			{ selector: '.owl-carousel.eye-testislider', options: { loop: true, margin: 15, dots: false, nav: true, navContainer: '.slide-11', responsive: { 0: { items: 1 }, 1300: { items: 1 } } } },
			{ selector: '.owl-carousel.patient-review-slider', options: { loop: true, margin: 15, dots: true, nav: false, responsive: { 0: { items: 1 }, 1300: { items: 1 } } } },
			{ selector: '.owl-carousel.specialities-slider-one', options: { loop: true, margin: 24, dots: false, nav: true, navContainer: '.slide-nav-1', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 6 } } } },
			{ selector: '.owl-carousel.features-slider-sixteen', options: { loop: true, margin: 24, dots: true, nav: false, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 3 } } } },
			{ selector: '.owl-carousel.blog-slider-twelve', options: { loop: true, margin: 24, dots: false, nav: true, navContainer: '.slide-nav-16', responsive: { 0: { items: 1 }, 500: { items: 1 }, 575: { items: 2 }, 768: { items: 2 }, 1000: { items: 4 }, 1300: { items: 4 } } } },
			{ selector: '.owl-carousel.our-slider-thirteen', options: { loop: true, margin: 24, dots: true, nav: false, responsive: { 0: { items: 1 }, 500: { items: 1 }, 575: { items: 2 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 3 } } } },
			{ selector: '.owl-carousel.doctor-slider-fifteen', options: { loop: true, margin: 24, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 575: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 3 } } } },
			{ selector: '.owl-carousel.client-says-thirteen', options: { loop: true, margin: 24, dots: true, nav: false, responsive: { 0: { items: 1 }, 500: { items: 1 }, 575: { items: 1 }, 768: { items: 1 }, 1000: { items: 1 }, 1300: { items: 1 } } } },
			{ selector: '.owl-carousel.pharmacy-slider-fifteen', options: { loop: true, margin: 24, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 575: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 3 } } } },
			{ selector: '.date-slider', options: { loop: true, margin: 15, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 3 }, 992: { items: 3 }, 1024: { items: 3 }, 1400: { items: 5 } } } },
			{ selector: '.testimonial-slider', options: { loop: true, margin: 15, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 1 }, 992: { items: 1 }, 1024: { items: 1 } } } },
			{ selector: '.owl-carousel.partners-slider', options: { loop: true, margin: 24, nav: true, dots: false, autoplay: true, responsive: { 0: { items: 1 }, 550: { items: 1 }, 700: { items: 4 }, 1000: { items: 6 } } } },
			{ selector: '.owl-carousel.doctor-slider-one', options: { loop: true, margin: 24, dots: false, nav: true, navContainer: '.slide-nav-2', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 4 } } } },
			{ selector: '.owl-carousel.frequent-slider-fifteen', options: { loop: true, margin: 24, dots: true, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 3 } } } },
			{ selector: '.owl-carousel.team-fourteen-slider', options: { loop: true, margin: 24, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 4 } } } },
			{ selector: '.owl-carousel.blog-slider-fourteen', options: { loop: true, margin: 24, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 575: { items: 2 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 3 } } } },
			{ selector: '.owl-carousel.discover-slider', options: { loop: true, margin: 10, dots: true, nav: false, responsive: { 0: { items: 1 }, 500: { items: 1 }, 575: { items: 2 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 5 } } } },
			{ selector: '.owl-carousel.treatment-sixteen-slider', options: { loop: true, margin: 24, dots: true, nav: false, responsive: { 0: { items: 1 }, 500: { items: 1 }, 575: { items: 2 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 4 } } } },
			{ selector: '.owl-carousel.clinics', options: { loop: true, margin: 15, dots: false, nav: true, navContainer: '.slide-nav-1', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 3 }, 1000: { items: 4 }, 1300: { items: 6 } } } },
			{ selector: '.owl-carousel.our-doctors', options: { loop: true, margin: 15, dots: false, nav: true, navContainer: '.slide-nav-2', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1200: { items: 4 } } } },
			{ selector: '.owl-carousel.clinic-feature', options: { loop: true, margin: 15, dots: false, nav: true, navContainer: '.slide-nav-3', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 3 }, 1000: { items: 4 }, 1300: { items: 5 } } } },
			{ selector: '.blogs-three .blogs, .owl-carousel.blogs', options: { loop: true, margin: 15, dots: false, nav: true, navContainer: '.slide-nav-4', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 4 } } } },
			{ selector: '.appointment-calender-slider', options: { loop: true, margin: 5, dots: false, nav: true, navContainer: '.slide-nav', responsive: { 0: { items: 2 }, 500: { items: 2 }, 768: { items: 5 }, 1000: { items: 4 }, 1300: { items: 5 } } } },
			{ selector: '.past-appointments-slider', options: { loop: true, margin: 5, dots: false, nav: true, navContainer: '.slide-nav2', responsive: { 0: { items: 1 }, 500: { items: 1 }, 1300: { items: 1 } } } },
			{ selector: '.owl-carousel.slider-service', options: { loop: true, margin: 24, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 } } } },
			{ selector: '.owl-carousel.doctor-slider-ten', options: { loop: true, margin: 24, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 3 }, 1400: { items: 4 } } } },
			{ selector: '.owl-carousel.testimonial-sliders', options: { loop: true, margin: 24, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 } } } },
			{ selector: '.owl-carousel.blog-slider', options: { loop: true, margin: 24, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 } } } },
			{ selector: '.owl-carousel.fertility-slider', options: { loop: true, margin: 24, dots: false, nav: true, responsive: { 0: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1300: { items: 3 } } } },
			{ selector: '.owl-carousel.insurence-logo-slider', options: { loop: false, margin: 24, dots: false, nav: true, navContainer: '.slide-1', responsive: { 0: { items: 2 }, 768: { items: 3 }, 1000: { items: 5 }, 1300: { items: 6 } } } },
			{ selector: '.owl-carousel.treatment-slider', options: { loop: true, margin: 24, dots: false, nav: true, navContainer: '.slide-nav-02', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 1 }, 1200: { items: 2 }, 1300: { items: 2 } } } },
			{ selector: '.owl-carousel.availability-slots-slider', options: { loop: false, margin: 24, dots: false, nav: true, navContainer: '.slide-2', responsive: { 0: { items: 2 }, 768: { items: 3 }, 1000: { items: 5 }, 1300: { items: 6 }, 1400: { items: 7 } } } },
			{ selector: '.owl-carousel.awards-slider', options: { loop: false, margin: 24, dots: false, nav: true, navContainer: '.slide-3', responsive: { 0: { items: 1 }, 768: { items: 1 }, 1000: { items: 2 }, 1300: { items: 4 }, 1400: { items: 4 } } } },
			{ selector: '.dentist-slider', options: { loop: true, margin: 24, dots: false, nav: true, navContainer: '.blog-nav', responsive: { 0: { items: 1 }, 768: { items: 1 }, 1000: { items: 2 }, 1300: { items: 3 }, 1400: { items: 3 } } } },
			{ selector: '.customer-slider', options: { loop: true, margin: 24, dots: false, nav: true, navContainer: '.customer-nav', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 992: { items: 3 }, 1200: { items: 3 } } } },
			{ selector: '.doctor-consulting-slider', options: { loop: false, margin: 15, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 1300: { items: 1 } } } },
			{ selector: '.booking-lab-test-slider', options: { loop: false, margin: 15, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 2 }, 1200: { items: 3 } } } },
			{ selector: '.popular-choice-slider', options: { loop: false, margin: 15, dots: false, nav: true, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1200: { items: 4 } } } },
			{ selector: '.blog-slide-fourteen', options: { loop: true, margin: 24, dots: false, nav: true, navContainer: '.blog-slide-nav', responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1200: { items: 3 } } } },
			{ selector: '.various-logo-slider', options: { loop: true, margin: 24, dots: false, nav: false, autoplay: true, responsive: { 0: { items: 1 }, 500: { items: 2 }, 768: { items: 3 }, 1000: { items: 5 }, 1200: { items: 6 } } } },
			{ selector: '.services-twelve-slider', options: { loop: true, margin: 24, dots: false, nav: false, responsive: { 0: { items: 1 }, 567: { items: 1 }, 776: { items: 2 }, 992: { items: 3 } } } },
			{ selector: '.team-slider-nine', options: { loop: true, dots: false, nav: false, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1200: { items: 4 } } } },
			{ selector: '.deals-slider-thirteen', options: { loop: true, dots: false, nav: false, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 } } } },
			{ selector: '.testimonial-slider-thirteen', options: { loop: true, centerMode: true, dots: false, nav: false, autoplay: true, autoplayTimeout: 4000, smartSpeed: 500, responsive: { 0: { items: 1 }, 576: { items: 1.2 }, 768: { items: 2 }, 992: { items: 3 } } } },
			{ selector: '.testimonials-slider-thirteen', options: { loop: true, centerMode: true, dots: false, nav: false, autoplay: true, autoplayTimeout: 4000, smartSpeed: 500, responsive: { 0: { items: 1 }, 576: { items: 1.2 }, 768: { items: 2 }, 992: { items: 3 } } } },
			{ selector: '.company-slider-fourteen', options: { loop: true, margin: 24, dots: false, nav: false, autoplay: true, responsive: { 0: { items: 2 }, 550: { items: 3 }, 700: { items: 4 }, 1000: { items: 6 } } } },
			{ selector: '.hero-slider-fifteen', options: { loop: true, margin: 0, dots: true, nav: false, fade: true, autoplay: true, autoplayTimeout: 5000, smartSpeed: 800, responsive: { 0: { items: 1 } } } },
			{ selector: '.team-slider-sixteen', options: { loop: true, centerMode: true, margin: 24, dots: false, nav: false, responsive: { 0: { items: 1 }, 500: { items: 1 }, 768: { items: 2 }, 1000: { items: 3 }, 1200: { items: 4 } } } },
			{ selector: '.service-slider-seventeen', options: { loop: true, centerMode: true, margin: 24, dots: false, nav: false, autoplay: true, autoplayTimeout: 4000, smartSpeed: 2000, responsive: { 0: { items: 1 }, 769: { items: 2.3 }, 1201: { items: 3.3 } } } },
			{ selector: '.testimonial-slider-seventeen', options: { loop: true, centerMode: true, margin: 24, dots: false, nav: false, autoplay: true, autoplayTimeout: 4000, smartSpeed: 2000, responsive: { 0: { items: 1 }, 769: { items: 2 }, 1201: { items: 3 }, 1401: { items: 4 } } } },
			{ selector: '.company-slider-two', options: { loop: true, margin: 24, dots: false, nav: false, autoplay: true, responsive: { 0: { items: 2 }, 550: { items: 3 }, 700: { items: 4 }, 1000: { items: 6 } } } },
			{ selector: '.testimonial-slider-two', options: { loop: true, infinite: true, centerMode: true, margin: 24, dots: true, nav: false, autoplay: true, autoplayTimeout: 4000, smartSpeed: 500, responsive: { 0: { items: 1, margin: 16 }, 576: { items: 1.2, margin: 20 }, 768: { items: 2, margin: 24 }, 992: { items: 3, margin: 24 }, 1200: { items: 3, margin: 24 } } } },
			{ selector: '.categories-slider', options: { loop: true, margin: 0, dots: true, nav: false, autoplay: true, autoplayTimeout: 4000, smartSpeed: 500, responsive: { 0: { items: 1 }, 576: { items: 2 }, 768: { items: 2 }, 992: { items: 3 }, 1200: { items: 4 }, 1400: { items: 5 } } } },
			{ selector: '.hospital-slider-four', options: { loop: true, margin: 24, dots: false, nav: false, autoplay: true, autoplayTimeout: 3000, smartSpeed: 500, responsive: { 0: { items: 2 }, 500: { items: 3 }, 768: { items: 4 }, 1000: { items: 4 }, 1200: { items: 5 } } } },
			{ selector: '.testimonial-slider-ten', options: { loop: true, margin: 24, dots: true, nav: false, vertical: true, autoplay: true, autoplayTimeout: 4000, smartSpeed: 500, responsive: { 0: { items: 1 }, 576: { items: 2 }, 992: { items: 3 } } } },
			{ selector: '.partner-slider-ten', options: { loop: true, margin: 24, dots: false, nav: false, autoplay: true, responsive: { 0: { items: 2 }, 500: { items: 3 }, 768: { items: 4 }, 1000: { items: 5 }, 1200: { items: 6 } } } }
		];

		sliderConfigs.forEach(cfg => {
			const elements = document.querySelectorAll(cfg.selector);
			elements.forEach(el => new VanillaSlider(el, cfg.options));
		});

		// Synced testimonial sliders: main content slider (.slider-for) paired with a thumbnail strip (.slider-nav)
		document.querySelectorAll('.slider-for').forEach(forEl => {
			if (forEl._vanillaSlider) return;
			const wrap = forEl.closest('.testimonial-slider-sixteen, .testimonials-slider-twelve') || forEl.parentElement;
			const navEl = wrap ? wrap.querySelector('.slider-nav') : null;
			const rawNavItems = navEl ? Array.from(navEl.children) : [];

			// Wrap each thumbnail in a .slick-slide, matching slick.js's own markup so the
			// existing "slick-current .author-img" SCSS rules (enlarge + border) apply.
			let navTrack = null;
			const navSlides = [];
			if (navEl && rawNavItems.length) {
				navEl.style.overflow = 'hidden';
				navEl.style.position = 'relative';
				navTrack = document.createElement('div');
				navTrack.className = 'slick-track';
				navTrack.style.transition = 'transform 400ms ease';

				const makeSlide = (item, isClone) => {
					const slide = document.createElement('div');
					slide.className = 'slick-slide slick-active' + (isClone ? ' slick-cloned' : '');
					slide.appendChild(isClone ? item.cloneNode(true) : item);
					return slide;
				};

				// Pad both ends with clones of the real set so the active thumbnail always
				// has real avatars around it to center against, instead of blank space.
				rawNavItems.forEach(item => navTrack.appendChild(makeSlide(item, true)));
				rawNavItems.forEach(item => {
					const slide = makeSlide(item, false);
					navTrack.appendChild(slide);
					navSlides.push(slide);
				});
				rawNavItems.forEach(item => navTrack.appendChild(makeSlide(item, true)));

				navEl.appendChild(navTrack);

				// Cap the visible strip to ~5 avatars (matching the reference design) instead
				// of stretching to the column's full width; extra avatars stay clipped by overflow.
				// One of the 5 is always the enlarged active avatar (76px vs 60px, per SCSS),
				// so the strip must be wide enough for 4 normal + 1 active avatar, or the
				// outer edges get clipped by overflow:hidden.
				const visibleCount = 5;
				const gapPx = 12;
				const sampleItem = navSlides[1] || navSlides[0];
				const itemW = sampleItem ? sampleItem.getBoundingClientRect().width : 60;
				const activeExtra = 16;
				navEl.style.width = (itemW * (visibleCount - 1) + (itemW + activeExtra) + gapPx * (visibleCount - 1)) + 'px';
				navEl.style.maxWidth = '100%';
			}

			const centerNavSlide = (i) => {
				if (!navTrack || !navSlides[i] || !navEl) return;
				const slide = navSlides[i];
				const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
				const containerCenter = navEl.offsetWidth / 2;
				navTrack.style.transform = `translateX(${containerCenter - slideCenter}px)`;
			};

			const hasDesignedNav = document.querySelector('.testimonial-prev-btn') && document.querySelector('.testimonial-next-btn');
			const isCenterModeSlider = wrap && wrap.classList.contains('testimonials-slider-twelve');

			const forSlider = new VanillaSlider(forEl, {
				loop: true, margin: isCenterModeSlider ? 24 : 0, dots: false, nav: !!hasDesignedNav,
				centerMode: isCenterModeSlider,
				navButtons: { prev: '.testimonial-prev-btn', next: '.testimonial-next-btn' },
				responsive: isCenterModeSlider
					? { 0: { items: 1 }, 768: { items: 1.2 }, 1200: { items: 1.4 } }
					: { 0: { items: 1 } },
				onChange: (index) => {
					if (!navSlides.length) return;
					const navIndex = Math.min(index, navSlides.length - 1);
					navSlides.forEach((slide, i) => slide.classList.toggle('slick-current', i === navIndex));
					centerNavSlide(navIndex);
				}
			});

			navSlides.forEach((slide, i) => {
				slide.addEventListener('click', () => {
					forSlider.goTo(Math.min(i, forSlider.totalItems - 1));
				});
			});

			if (navSlides.length) {
				navSlides[0].classList.add('slick-current');
				centerNavSlide(0);
			}

			if (navEl) {
				window.addEventListener('resize', () => {
					const activeIndex = navSlides.findIndex(slide => slide.classList.contains('slick-current'));
					if (activeIndex >= 0) centerNavSlide(activeIndex);
				});
			}
		});

		// Fallback for any other .owl-carousel or .slick elements that weren't caught
		document.querySelectorAll('.owl-carousel:not(._vanillaSlider), .slick:not(._vanillaSlider)').forEach(el => {
			if (!el._vanillaSlider) {
				new VanillaSlider(el, { loop: true, margin: 20, dots: true, nav: true });
			}
		});

		// Swiper Sliders
		if (typeof Swiper !== 'undefined') {
			if (document.querySelector('.pharmacy-home-slider .swiper-container')) {
				new Swiper('.pharmacy-home-slider .swiper-container', {
					loop: true,
					speed: 1000,
					pagination: { el: '.pharmacy-home-slider .swiper-pagination', dynamicBullets: true, clickable: true },
					navigation: { nextEl: '.pharmacy-home-slider .swiper-button-next', prevEl: '.pharmacy-home-slider .swiper-button-prev' }
				});
			}

			if (document.querySelector('.swiper-slider-banner')) {
				new Swiper('.swiper-slider-banner', {
					effect: 'cards',
					grabCursor: true,
					initialSlide: 2,
					loop: false,
					rotate: true,
					mousewheel: { invert: false }
				});
			}

			if (document.querySelector('.top-online-contacts .swiper-container')) {
				new Swiper('.top-online-contacts .swiper-container', {
					slidesPerView: 5,
					spaceBetween: 15
				});
			}
		}

		// GSAP Animations (Spotlight / Mouse follow / Trail Content)
		if (typeof gsap !== 'undefined') {
			// Health Section Trail Content GSAP Image Animation
			const trailSections = document.querySelectorAll('.trail-content');
			trailSections.forEach(section => {
				const originalImages = Array.from(section.querySelectorAll('.content-img'));
				if (!originalImages.length) return;

				// Expand pool for a continuous, silky-smooth trail
				const parent = originalImages[0].parentElement || section;
				const pool = [...originalImages];
				if (originalImages.length <= 4) {
					for (let i = 0; i < 6; i++) {
						const clone = originalImages[i % originalImages.length].cloneNode(true);
						parent.appendChild(clone);
						pool.push(clone);
					}
				}

				let poolIndex = 0;
				let lastX = 0;
				let lastY = 0;
				let lastTime = Date.now();
				let zIndex = 10;
				const threshold = 45;
				let isInside = false;
				let rect = section.getBoundingClientRect();

				const updateRect = () => {
					rect = section.getBoundingClientRect();
				};

				pool.forEach(img => {
					gsap.set(img, {
						position: 'absolute',
						top: 0,
						left: 0,
						opacity: 0,
						scale: 0.6,
						pointerEvents: 'none',
						transformOrigin: '50% 50%',
						force3D: true,
						willChange: 'transform, opacity'
					});
				});

				const handlePointerMove = (clientX, clientY) => {
					if (!rect) updateRect();
					const currentX = clientX - rect.left;
					const currentY = clientY - rect.top;
					const now = Date.now();
					const dt = Math.max(1, now - lastTime);

					const dx = currentX - lastX;
					const dy = currentY - lastY;
					const distance = Math.hypot(dx, dy);

					if (distance > threshold) {
						const vx = dx / dt;
						const vy = dy / dt;
						lastX = currentX;
						lastY = currentY;
						lastTime = now;

						const img = pool[poolIndex % pool.length];
						poolIndex++;
						zIndex++;

						const imgWidth = img.offsetWidth || 120;
						const imgHeight = img.offsetHeight || 108;
						const targetX = currentX - imgWidth / 2;
						const targetY = currentY - imgHeight / 2;
						const tilt = Math.max(-14, Math.min(14, vx * 8));

						gsap.killTweensOf(img);
						gsap.set(img, {
							x: targetX,
							y: targetY,
							zIndex: zIndex,
							rotation: tilt * 0.6,
							scale: 0.7,
							opacity: 0,
							force3D: true
						});

						const tl = gsap.timeline();
						tl.to(img, {
							opacity: 1,
							scale: 1,
							rotation: tilt,
							duration: 0.3,
							ease: 'power2.out'
						}).to(img, {
							opacity: 0,
							scale: 0.8,
							y: targetY - 12,
							duration: 0.55,
							ease: 'power2.inOut',
							delay: 0.1
						});
					}
				};

				section.addEventListener('mouseenter', function (e) {
					isInside = true;
					updateRect();
					lastX = e.clientX - rect.left;
					lastY = e.clientY - rect.top;
					lastTime = Date.now();
				});

				section.addEventListener('mousemove', function (e) {
					if (!isInside) {
						isInside = true;
						updateRect();
					}
					handlePointerMove(e.clientX, e.clientY);
				});

				section.addEventListener('touchmove', function (e) {
					if (e.touches && e.touches[0]) {
						if (!isInside) {
							isInside = true;
							updateRect();
						}
						handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
					}
				}, { passive: true });

				section.addEventListener('mouseleave', function () {
					isInside = false;
					pool.forEach(img => {
						gsap.to(img, {
							opacity: 0,
							scale: 0.5,
							duration: 0.35,
							ease: 'power2.in'
						});
					});
					lastX = 0;
					lastY = 0;
				});

				window.addEventListener('scroll', updateRect, { passive: true });
				window.addEventListener('resize', updateRect);
			});

			// Health Section Backgrounds subtle continuous float
			if (document.querySelector('.health-bg-01')) {
				gsap.to('.health-bg-01', {
					y: 15,
					duration: 3,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
			}
			if (document.querySelector('.health-bg-02')) {
				gsap.to('.health-bg-02', {
					rotation: 360,
					duration: 25,
					repeat: -1,
					ease: 'none'
				});
			}

			// Ready Section Cursor Follow
			const readyContent = document.querySelector('.ready-conetnt, .ready-content');
			const readyLink = readyContent ? readyContent.querySelector('.ready-link') : null;
			if (readyContent && readyLink) {
				gsap.set(readyLink, {
					position: 'absolute',
					left: 0,
					top: 0,
					xPercent: 0,
					yPercent: 0,
					margin: 0,
					inset: 'auto',
					opacity: 0,
					scale: 0.8,
					display: 'none',
					pointerEvents: 'none',
					visibility: 'visible'
				});

				let isHovering = false;
				let rect = readyContent.getBoundingClientRect();
				let linkWidth = readyLink.offsetWidth;
				let linkHeight = readyLink.offsetHeight;

				const updateDimensions = () => {
					rect = readyContent.getBoundingClientRect();
					linkWidth = readyLink.offsetWidth;
					linkHeight = readyLink.offsetHeight;
				};

				readyContent.addEventListener('mouseenter', function (e) {
					isHovering = true;
					updateDimensions();
					gsap.killTweensOf(readyLink);
					gsap.set(readyLink, { display: 'flex' });
					const mouseX = e.clientX - rect.left;
					const mouseY = e.clientY - rect.top;
					gsap.set(readyLink, {
						x: Math.max(0, Math.min(rect.width - linkWidth, mouseX - linkWidth / 2)),
						y: Math.max(0, Math.min(rect.height - linkHeight, mouseY - linkHeight / 2))
					});
					gsap.to(readyLink, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' });
				});

				readyContent.addEventListener('mousemove', function (e) {
					if (!isHovering) return;
					if (!rect) updateDimensions();
					const mouseX = e.clientX - rect.left;
					const mouseY = e.clientY - rect.top;
					gsap.to(readyLink, {
						x: Math.max(0, Math.min(rect.width - linkWidth, mouseX - linkWidth / 2)),
						y: Math.max(0, Math.min(rect.height - linkHeight, mouseY - linkHeight / 2)),
						duration: 0.3,
						ease: 'power2.out',
						overwrite: 'auto'
					});
				});

				readyContent.addEventListener('mouseleave', function () {
					isHovering = false;
					gsap.killTweensOf(readyLink);
					gsap.to(readyLink, {
						opacity: 0,
						scale: 0.8,
						pointerEvents: 'none',
						duration: 0.4,
						ease: 'power2.out',
						onComplete: () => { gsap.set(readyLink, { display: 'none' }); }
					});
				});
			}

			// Spotlight Banner Reveal
			const bannerImgWrap = document.querySelector('.banner-img-wrap');
			const revealImg = bannerImgWrap ? bannerImgWrap.querySelector('.banner-img-reveal') : null;
			if (bannerImgWrap && revealImg) {
				let bRect = null;
				const radius = 150;
				const updateBRect = () => { bRect = bannerImgWrap.getBoundingClientRect(); };

				bannerImgWrap.addEventListener('mouseenter', function (e) {
					updateBRect();
					const mouseX = e.clientX - bRect.left;
					const mouseY = e.clientY - bRect.top;
					gsap.killTweensOf(revealImg);
					gsap.to(revealImg, { clipPath: `circle(${radius}px at ${mouseX}px ${mouseY}px)`, duration: 0.5, ease: 'power2.out' });
				});

				bannerImgWrap.addEventListener('mousemove', function (e) {
					if (!bRect) updateBRect();
					const mouseX = e.clientX - bRect.left;
					const mouseY = e.clientY - bRect.top;
					gsap.to(revealImg, { clipPath: `circle(${radius}px at ${mouseX}px ${mouseY}px)`, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
				});

				bannerImgWrap.addEventListener('mouseleave', function () {
					if (!bRect) updateBRect();
					const mouseX = e.clientX - bRect.left;
					const mouseY = e.clientY - bRect.top;
					gsap.killTweensOf(revealImg);
					gsap.to(revealImg, { clipPath: `circle(0px at ${mouseX}px ${mouseY}px)`, duration: 0.5, ease: 'power2.out' });
				});
			}
		}

		// Before / After Image Comparison Scroller (.about-img-three in index-3)
		document.querySelectorAll('.about-img-three').forEach(container => {
			const wrapper = container.querySelector('.wrapper');
			if (!wrapper) return;
			const afterEl = wrapper.querySelector('.after');
			const scroller = wrapper.querySelector('.scroller');
			if (!afterEl || !scroller) return;

			wrapper.style.position = 'relative';
			wrapper.style.height = '100%';
			wrapper.style.minHeight = '480px';
			wrapper.style.overflow = 'hidden';

			const images = wrapper.querySelectorAll('.content-image');
			let active = false;
			let animated = false;

			const updateDimensions = () => {
				const width = wrapper.offsetWidth || container.offsetWidth;
				if (width > 0) {
					images.forEach(img => {
						img.style.width = `${width}px`;
						img.style.maxWidth = 'none';
					});
				}
			};

			const setPosition = (x) => {
				const width = wrapper.offsetWidth || container.offsetWidth;
				if (width <= 0) return;
				const clampedX = Math.max(0, Math.min(x, width));
				const percentage = (clampedX / width) * 100;
				afterEl.style.width = `${percentage}%`;
				scroller.style.left = `calc(${percentage}% - 25px)`;
			};

			updateDimensions();
			setPosition(wrapper.offsetWidth ? wrapper.offsetWidth * 0.5 : 250);

			window.addEventListener('resize', () => {
				updateDimensions();
				const currentPercent = parseFloat(afterEl.style.width) || 50;
				setPosition((wrapper.offsetWidth * currentPercent) / 100);
			});

			// Smooth demonstration intro animation
			const runIntroAnimation = () => {
				if (animated) return;
				animated = true;
				updateDimensions();
				const width = wrapper.offsetWidth || 500;
				if (typeof gsap !== 'undefined') {
					const state = { progress: 0.5 };
					gsap.timeline({ delay: 0.2 })
						.to(state, {
							progress: 0.8,
							duration: 0.9,
							ease: 'power2.inOut',
							onUpdate: () => setPosition(width * state.progress)
						})
						.to(state, {
							progress: 0.2,
							duration: 1.1,
							ease: 'power2.inOut',
							onUpdate: () => setPosition(width * state.progress)
						})
						.to(state, {
							progress: 0.5,
							duration: 0.8,
							ease: 'power2.out',
							onUpdate: () => setPosition(width * state.progress)
						});
				} else {
					let startTime = null;
					const duration = 2500;
					function step(time) {
						if (!startTime) startTime = time;
						const diff = time - startTime;
						const p = diff / duration;
						if (p < 1) {
							const progress = 0.5 + 0.3 * Math.sin(p * Math.PI * 2);
							setPosition(width * progress);
							window.requestAnimationFrame(step);
						} else {
							setPosition(width * 0.5);
						}
					}
					window.requestAnimationFrame(step);
				}
			};

			if ('IntersectionObserver' in window) {
				const observer = new IntersectionObserver((entries) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							updateDimensions();
							runIntroAnimation();
							observer.unobserve(entry.target);
						}
					});
				}, { threshold: 0.15 });
				observer.observe(container);
			} else {
				setTimeout(runIntroAnimation, 400);
			}

			// Interaction handlers
			const onPointerMove = (clientX) => {
				const rect = wrapper.getBoundingClientRect();
				const x = clientX - rect.left;
				setPosition(x);
			};

			// Mouse drag & move
			wrapper.addEventListener('mousedown', (e) => {
				active = true;
				scroller.classList.add('scrolling');
				onPointerMove(e.clientX);
			});

			window.addEventListener('mouseup', () => {
				if (active) {
					active = false;
					scroller.classList.remove('scrolling');
				}
			});

			window.addEventListener('mousemove', (e) => {
				if (!active) return;
				onPointerMove(e.clientX);
			});

			// Touch drag
			wrapper.addEventListener('touchstart', (e) => {
				active = true;
				scroller.classList.add('scrolling');
				if (e.touches && e.touches[0]) {
					onPointerMove(e.touches[0].clientX);
				}
			}, { passive: true });

			window.addEventListener('touchend', () => {
				if (active) {
					active = false;
					scroller.classList.remove('scrolling');
				}
			});

			window.addEventListener('touchmove', (e) => {
				if (!active) return;
				if (e.touches && e.touches[0]) {
					onPointerMove(e.touches[0].clientX);
				}
			}, { passive: true });
		});

		// Testimonial Intersection Observer Reveal
		const testimonialSection = document.querySelector('.testimonial-details-fifteen');
		const testimonialItems = document.querySelectorAll('.testimonial-item-fifteen');
		if (testimonialSection && testimonialItems.length > 0 && 'IntersectionObserver' in window) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						testimonialItems.forEach((item, index) => {
							setTimeout(() => { item.classList.add('is-visible'); }, index * 190);
						});
						observer.unobserve(entry.target);
					}
				});
			}, { threshold: 0.1 });
			observer.observe(testimonialSection);
		}

		// IntlTelInput if available
		if (typeof window.intlTelInput !== 'undefined') {
			const phone1 = document.querySelector("#phone");
			if (phone1) window.intlTelInput(phone1, { utilsScript: "assets/plugins/intltelinput/js/utils.js" });
			const phone2 = document.querySelector("#phone-number");
			if (phone2) window.intlTelInput(phone2, { utilsScript: "assets/plugins/intltelinput/js/utils.js" });
		}

		// Pure Vanilla Datetimepicker Initializer
		function initDatetimepickers() {
			const dateInputs = document.querySelectorAll('.datetimepicker');
			if (!dateInputs.length) return;
			const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

			dateInputs.forEach(input => {
				if (input.dataset.pickerInitialized === 'true') return;
				input.dataset.pickerInitialized = 'true';
				input.setAttribute('autocomplete', 'off');

				let widget = document.createElement('div');
				widget.className = 'bootstrap-datetimepicker-widget dropdown-menu usetwentyfour bottom';
				widget.style.display = 'none';
				widget.style.position = 'absolute';
				widget.style.zIndex = '99999';
				document.body.appendChild(widget);

				function parseInputValue(val) {
					if (!val) return new Date();
					const parts = val.split(/[-/]/);
					if (parts.length === 3) {
						const day = parseInt(parts[0], 10);
						const month = parseInt(parts[1], 10) - 1;
						const year = parseInt(parts[2], 10);
						if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
							return new Date(year, month, day);
						}
					}
					return new Date();
				}

				let viewDate = parseInputValue(input.value);
				let viewYear = viewDate.getFullYear();
				let viewMonth = viewDate.getMonth();
				let currentView = 'days';

				function renderCalendar() {
					const selectedDate = parseInputValue(input.value);
					const today = new Date();

					if (currentView === 'days') {
						const firstDay = new Date(viewYear, viewMonth, 1).getDay();
						const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
						const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

						let html = '<div class="datepicker"><div class="datepicker-days"><table class="table-condensed"><thead><tr>';
						html += '<th class="prev" data-action="previous"><i class="fa fa-chevron-left"></i></th>';
						html += '<th colspan="5" class="picker-switch" data-action="pickerSwitch">' + monthNames[viewMonth] + ' ' + viewYear + '</th>';
						html += '<th class="next" data-action="next"><i class="fa fa-chevron-right"></i></th>';
						html += '</tr><tr>';
						for (let d = 0; d < 7; d++) {
							html += '<th class="dow">' + dayNames[d] + '</th>';
						}
						html += '</tr></thead><tbody><tr>';

						let dayCount = 0;
						for (let p = firstDay - 1; p >= 0; p--) {
							const pDay = daysInPrevMonth - p;
							html += '<td class="day old" data-day="' + pDay + '" data-month="' + (viewMonth - 1) + '" data-year="' + viewYear + '">' + pDay + '</td>';
							dayCount++;
						}

						for (let i = 1; i <= daysInMonth; i++) {
							if (dayCount > 0 && dayCount % 7 === 0) {
								html += '</tr><tr>';
							}
							const isToday = (today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === i);
							const isSelected = (selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === i && input.value);
							let classes = 'day';
							if (isToday) classes += ' today';
							if (isSelected) classes += ' active';

							html += '<td class="' + classes + '" data-day="' + i + '" data-month="' + viewMonth + '" data-year="' + viewYear + '">' + i + '</td>';
							dayCount++;
						}

						let nextDay = 1;
						while (dayCount % 7 !== 0) {
							html += '<td class="day new" data-day="' + nextDay + '" data-month="' + (viewMonth + 1) + '" data-year="' + viewYear + '">' + nextDay + '</td>';
							nextDay++;
							dayCount++;
						}

						html += '</tr></tbody></table></div></div>';
						widget.innerHTML = html;

						widget.querySelector('[data-action="previous"]')?.addEventListener('click', (e) => {
							e.stopPropagation();
							viewMonth--;
							if (viewMonth < 0) {
								viewMonth = 11;
								viewYear--;
							}
							renderCalendar();
						});

						widget.querySelector('[data-action="next"]')?.addEventListener('click', (e) => {
							e.stopPropagation();
							viewMonth++;
							if (viewMonth > 11) {
								viewMonth = 0;
								viewYear++;
							}
							renderCalendar();
						});

						widget.querySelector('[data-action="pickerSwitch"]')?.addEventListener('click', (e) => {
							e.stopPropagation();
							currentView = 'months';
							renderCalendar();
						});

						widget.querySelectorAll('td.day').forEach(td => {
							td.addEventListener('click', (e) => {
								e.stopPropagation();
								const d = parseInt(td.dataset.day, 10);
								const m = parseInt(td.dataset.month, 10);
								const y = parseInt(td.dataset.year, 10);

								const chosen = new Date(y, m, d);
								const dd = String(chosen.getDate()).padStart(2, '0');
								const mm = String(chosen.getMonth() + 1).padStart(2, '0');
								const yyyy = chosen.getFullYear();

								const sep = (input.value.indexOf('-') > -1 || (input.placeholder && input.placeholder.indexOf('-') > -1)) ? '-' : '/';
								input.value = dd + sep + mm + sep + yyyy;

								input.dispatchEvent(new Event('change', { bubbles: true }));
								input.dispatchEvent(new Event('input', { bubbles: true }));
								hidePicker();
							});
						});
					} else if (currentView === 'months') {
						let html = '<div class="datepicker"><div class="datepicker-months"><table class="table-condensed"><thead><tr>';
						html += '<th class="prev" data-action="previous"><i class="fa fa-chevron-left"></i></th>';
						html += '<th colspan="5" class="picker-switch" data-action="pickerSwitch">' + viewYear + '</th>';
						html += '<th class="next" data-action="next"><i class="fa fa-chevron-right"></i></th>';
						html += '</tr></thead><tbody><tr><td colspan="7">';
						const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
						shortMonths.forEach((m, idx) => {
							const isSelected = (selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === idx);
							html += '<span class="month' + (isSelected ? ' active' : '') + '" data-month="' + idx + '">' + m + '</span>';
						});
						html += '</td></tr></tbody></table></div></div>';
						widget.innerHTML = html;

						widget.querySelector('[data-action="previous"]')?.addEventListener('click', (e) => {
							e.stopPropagation();
							viewYear--;
							renderCalendar();
						});
						widget.querySelector('[data-action="next"]')?.addEventListener('click', (e) => {
							e.stopPropagation();
							viewYear++;
							renderCalendar();
						});
						widget.querySelector('[data-action="pickerSwitch"]')?.addEventListener('click', (e) => {
							e.stopPropagation();
							currentView = 'years';
							renderCalendar();
						});
						widget.querySelectorAll('span.month').forEach(span => {
							span.addEventListener('click', (e) => {
								e.stopPropagation();
								viewMonth = parseInt(span.dataset.month, 10);
								currentView = 'days';
								renderCalendar();
							});
						});
					} else if (currentView === 'years') {
						const startYear = viewYear - (viewYear % 10);
						let html = '<div class="datepicker"><div class="datepicker-years"><table class="table-condensed"><thead><tr>';
						html += '<th class="prev" data-action="previous"><i class="fa fa-chevron-left"></i></th>';
						html += '<th colspan="5" class="picker-switch">' + startYear + '-' + (startYear + 9) + '</th>';
						html += '<th class="next" data-action="next"><i class="fa fa-chevron-right"></i></th>';
						html += '</tr></thead><tbody><tr><td colspan="7">';
						for (let y = startYear - 1; y <= startYear + 10; y++) {
							const isSelected = (selectedDate.getFullYear() === y);
							const isOld = (y < startYear);
							const isNew = (y > startYear + 9);
							let cls = 'year';
							if (isSelected) cls += ' active';
							if (isOld) cls += ' old';
							if (isNew) cls += ' new';
							html += '<span class="' + cls + '" data-year="' + y + '">' + y + '</span>';
						}
						html += '</td></tr></tbody></table></div></div>';
						widget.innerHTML = html;

						widget.querySelector('[data-action="previous"]')?.addEventListener('click', (e) => {
							e.stopPropagation();
							viewYear -= 10;
							renderCalendar();
						});
						widget.querySelector('[data-action="next"]')?.addEventListener('click', (e) => {
							e.stopPropagation();
							viewYear += 10;
							renderCalendar();
						});
						widget.querySelectorAll('span.year').forEach(span => {
							span.addEventListener('click', (e) => {
								e.stopPropagation();
								viewYear = parseInt(span.dataset.year, 10);
								currentView = 'months';
								renderCalendar();
							});
						});
					}
				}

				function showPicker() {
					document.querySelectorAll('.bootstrap-datetimepicker-widget').forEach(w => {
						if (w !== widget) w.style.display = 'none';
					});

					viewDate = parseInputValue(input.value);
					viewYear = viewDate.getFullYear();
					viewMonth = viewDate.getMonth();
					currentView = 'days';
					renderCalendar();

					const rect = input.getBoundingClientRect();
					const top = rect.bottom + (window.pageYOffset || document.documentElement.scrollTop || 0);
					const left = rect.left + (window.pageXOffset || document.documentElement.scrollLeft || 0);
					widget.style.top = top + 'px';
					widget.style.left = left + 'px';
					widget.style.display = 'block';
				}

				function hidePicker() {
					widget.style.display = 'none';
				}

				input.addEventListener('click', (e) => {
					e.stopPropagation();
					showPicker();
				});

				input.addEventListener('focus', () => {
					showPicker();
				});

				const parent = input.closest('.form-icon, .input-group, .form-wrap');
				if (parent) {
					const icon = parent.querySelector('.icon, .input-group-text, .input-group-addon');
					if (icon) {
						icon.style.cursor = 'pointer';
						icon.addEventListener('click', (e) => {
							e.stopPropagation();
							showPicker();
						});
					}
				}

				document.addEventListener('click', (e) => {
					if (!widget.contains(e.target) && e.target !== input && (!parent || !parent.contains(e.target))) {
						hidePicker();
					}
				});
			});
		}

		// Pure Vanilla Timepicker Initializer
		function initTimepickers() {
			const timeInputs = document.querySelectorAll('.timepicker1, .timepicker');
			if (!timeInputs.length) return;

			timeInputs.forEach(input => {
				if (input.dataset.pickerInitialized === 'true') return;
				input.dataset.pickerInitialized = 'true';
				input.setAttribute('autocomplete', 'off');

				let widget = document.createElement('div');
				widget.className = 'bootstrap-datetimepicker-widget dropdown-menu usetwentyfour bottom';
				widget.style.display = 'none';
				widget.style.position = 'absolute';
				widget.style.zIndex = '99999';
				widget.style.width = '200px';
				document.body.appendChild(widget);

				function parseTimeValue(val) {
					let hours = 1;
					let minutes = 0;
					let period = 'PM';

					if (val) {
						const match = val.match(/(\d{1,2})[:.](\d{2})(?:\s*([AaPp][Mm]))?/);
						if (match) {
							hours = parseInt(match[1], 10);
							minutes = parseInt(match[2], 10);
							if (match[3]) {
								period = match[3].toUpperCase();
							}
						}
					}
					if (hours > 12) {
						hours = hours - 12;
						period = 'PM';
					}
					if (hours === 0) hours = 12;
					return { hours, minutes, period };
				}

				let timeState = parseTimeValue(input.value || input.placeholder || '01:00 PM');

				function updateInputValue() {
					const hh = String(timeState.hours).padStart(2, '0');
					const mm = String(timeState.minutes).padStart(2, '0');
					input.value = `${hh}:${mm} ${timeState.period}`;
					input.dispatchEvent(new Event('change', { bubbles: true }));
					input.dispatchEvent(new Event('input', { bubbles: true }));
				}

				function renderTimepicker() {
					const hh = String(timeState.hours).padStart(2, '0');
					const mm = String(timeState.minutes).padStart(2, '0');

					let html = '<div class="timepicker"><div class="timepicker-picker"><table class="table-condensed" style="margin:auto;"><tbody>';
					html += '<tr>';
					html += '<td><a href="#" class="btn btn-sm" data-action="incrementHours"><i class="fa fa-chevron-up"></i></a></td>';
					html += '<td class="separator"></td>';
					html += '<td><a href="#" class="btn btn-sm" data-action="incrementMinutes"><i class="fa fa-chevron-up"></i></a></td>';
					html += '<td class="separator"></td>';
					html += '<td><a href="#" class="btn btn-sm" data-action="togglePeriod"><i class="fa fa-chevron-up"></i></a></td>';
					html += '</tr>';

					html += '<tr>';
					html += '<td><span class="timepicker-hour" data-time-component="hours" style="font-weight:600;font-size:16px;">' + hh + '</span></td>';
					html += '<td class="separator" style="font-weight:600;">:</td>';
					html += '<td><span class="timepicker-minute" data-time-component="minutes" style="font-weight:600;font-size:16px;">' + mm + '</span></td>';
					html += '<td class="separator"></td>';
					html += '<td><button type="button" class="btn btn-primary btn-sm" data-action="togglePeriod" style="padding:2px 8px;font-size:12px;min-width:40px;">' + timeState.period + '</button></td>';
					html += '</tr>';

					html += '<tr>';
					html += '<td><a href="#" class="btn btn-sm" data-action="decrementHours"><i class="fa fa-chevron-down"></i></a></td>';
					html += '<td class="separator"></td>';
					html += '<td><a href="#" class="btn btn-sm" data-action="decrementMinutes"><i class="fa fa-chevron-down"></i></a></td>';
					html += '<td class="separator"></td>';
					html += '<td><a href="#" class="btn btn-sm" data-action="togglePeriod"><i class="fa fa-chevron-down"></i></a></td>';
					html += '</tr>';
					html += '</tbody></table>';

					html += '<div class="p-2 border-top text-center"><button type="button" class="btn btn-primary btn-sm w-100 btn-done">Done</button></div>';
					html += '</div></div>';

					widget.innerHTML = html;

					widget.querySelectorAll('[data-action="incrementHours"]').forEach(b => {
						b.addEventListener('click', (e) => {
							e.preventDefault();
							e.stopPropagation();
							timeState.hours = timeState.hours >= 12 ? 1 : timeState.hours + 1;
							updateInputValue();
							renderTimepicker();
						});
					});

					widget.querySelectorAll('[data-action="decrementHours"]').forEach(b => {
						b.addEventListener('click', (e) => {
							e.preventDefault();
							e.stopPropagation();
							timeState.hours = timeState.hours <= 1 ? 12 : timeState.hours - 1;
							updateInputValue();
							renderTimepicker();
						});
					});

					widget.querySelectorAll('[data-action="incrementMinutes"]').forEach(b => {
						b.addEventListener('click', (e) => {
							e.preventDefault();
							e.stopPropagation();
							timeState.minutes = (timeState.minutes + 15) % 60;
							updateInputValue();
							renderTimepicker();
						});
					});

					widget.querySelectorAll('[data-action="decrementMinutes"]').forEach(b => {
						b.addEventListener('click', (e) => {
							e.preventDefault();
							e.stopPropagation();
							timeState.minutes = timeState.minutes <= 0 ? 45 : timeState.minutes - 15;
							updateInputValue();
							renderTimepicker();
						});
					});

					widget.querySelectorAll('[data-action="togglePeriod"]').forEach(b => {
						b.addEventListener('click', (e) => {
							e.preventDefault();
							e.stopPropagation();
							timeState.period = timeState.period === 'AM' ? 'PM' : 'AM';
							updateInputValue();
							renderTimepicker();
						});
					});

					widget.querySelector('.btn-done')?.addEventListener('click', (e) => {
						e.preventDefault();
						e.stopPropagation();
						updateInputValue();
						hidePicker();
					});
				}

				function showPicker() {
					document.querySelectorAll('.bootstrap-datetimepicker-widget').forEach(w => {
						if (w !== widget) w.style.display = 'none';
					});

					timeState = parseTimeValue(input.value || input.placeholder || '01:00 PM');
					renderTimepicker();

					const rect = input.getBoundingClientRect();
					const top = rect.bottom + (window.pageYOffset || document.documentElement.scrollTop || 0);
					const left = rect.left + (window.pageXOffset || document.documentElement.scrollLeft || 0);
					widget.style.top = top + 'px';
					widget.style.left = left + 'px';
					widget.style.display = 'block';
				}

				function hidePicker() {
					widget.style.display = 'none';
				}

				input.addEventListener('click', (e) => {
					e.stopPropagation();
					showPicker();
				});

				input.addEventListener('focus', () => {
					showPicker();
				});

				const parent = input.closest('.form-icon, .input-group, .form-wrap');
				if (parent) {
					const icon = parent.querySelector('.icon, .input-group-text, .input-group-addon');
					if (icon) {
						icon.style.cursor = 'pointer';
						icon.addEventListener('click', (e) => {
							e.stopPropagation();
							showPicker();
						});
					}
				}

				document.addEventListener('click', (e) => {
					if (!widget.contains(e.target) && e.target !== input && (!parent || !parent.contains(e.target))) {
						hidePicker();
					}
				});
			});
		}

		// Banner Five & General Counter Animation
		function initCounters() {
			const counterElements = document.querySelectorAll('.banner-five-counter .count, .counter-item .count');
			if (!counterElements.length) return;

			const startCounter = (el) => {
				if (el.dataset.counterStarted === 'true') return;
				el.dataset.counterStarted = 'true';
				const target = parseInt(el.textContent.trim(), 10);
				if (isNaN(target)) return;
				const duration = 1500;
				const start = 0;
				const startTime = performance.now();

				const update = (currentTime) => {
					const elapsed = currentTime - startTime;
					const progress = Math.min(elapsed / duration, 1);
					const easeProgress = 1 - Math.pow(1 - progress, 3);
					el.textContent = Math.floor(start + (target - start) * easeProgress);
					if (progress < 1) {
						requestAnimationFrame(update);
					} else {
						el.textContent = target;
					}
				};
				requestAnimationFrame(update);
			};

			if ('IntersectionObserver' in window) {
				const observer = new IntersectionObserver((entries) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							startCounter(entry.target);
							observer.unobserve(entry.target);
						}
					});
				}, { threshold: 0.2 });
				counterElements.forEach(el => observer.observe(el));
			} else {
				counterElements.forEach(el => startCounter(el));
			}
		}

		// Pure Vanilla Circle Progress Graph (replaces jquery-circle-progress)
		function initCircleGraphs() {
			const graphs = document.querySelectorAll('.circle-graph1, .circle-graph2, .circle-graph3');
			if (!graphs.length) return;

			const colors = {
				'circle-graph1': '#da3f81',
				'circle-graph2': '#68dda9',
				'circle-graph3': '#1b5a90'
			};

			graphs.forEach(el => {
				if (el.dataset.graphInitialized === 'true') return;
				el.dataset.graphInitialized = 'true';

				const percent = Math.max(0, Math.min(100, parseFloat(el.getAttribute('data-percent')) || 0));
				const colorKey = Object.keys(colors).find(cls => el.classList.contains(cls));
				const color = colors[colorKey] || '#1b5a90';

				const size = 140;
				const thickness = 10;
				const radius = (size - thickness) / 2;
				const circumference = 2 * Math.PI * radius;
				const offset = circumference * (1 - percent / 100);

				const svgNS = 'http://www.w3.org/2000/svg';
				const svg = document.createElementNS(svgNS, 'svg');
				svg.setAttribute('width', size);
				svg.setAttribute('height', size);
				svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
				svg.classList.add('circle-graph-svg');

				const track = document.createElementNS(svgNS, 'circle');
				track.setAttribute('cx', size / 2);
				track.setAttribute('cy', size / 2);
				track.setAttribute('r', radius);
				track.setAttribute('fill', 'none');
				track.setAttribute('stroke', 'rgba(0,0,0,0.08)');
				track.setAttribute('stroke-width', thickness);

				const bar = document.createElementNS(svgNS, 'circle');
				bar.setAttribute('cx', size / 2);
				bar.setAttribute('cy', size / 2);
				bar.setAttribute('r', radius);
				bar.setAttribute('fill', 'none');
				bar.setAttribute('stroke', color);
				bar.setAttribute('stroke-width', thickness);
				bar.setAttribute('stroke-linecap', 'round');
				bar.setAttribute('stroke-dasharray', circumference);
				bar.setAttribute('stroke-dashoffset', circumference);
				bar.style.transformOrigin = '50% 50%';
				bar.style.transform = 'rotate(-90deg)';
				bar.style.transition = 'stroke-dashoffset 1s ease';

				svg.appendChild(track);
				svg.appendChild(bar);
				el.insertBefore(svg, el.firstChild);

				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						bar.setAttribute('stroke-dashoffset', offset);
					});
				});
			});
		}

		// Pure Vanilla Date Range Picker Initializer (replaces jQuery daterangepicker plugin)
		function initDateRangePickers() {
			const inputs = document.querySelectorAll('.date-range.bookingrange, .daterange');
			if (!inputs.length) return;

			const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

			function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
			function sameDay(a, b) { return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
			function fmt(d) { return String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + '/' + d.getFullYear(); }
			function parseFmt(str) {
				const m = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
				if (!m) return null;
				const d = new Date(parseInt(m[3], 10), parseInt(m[1], 10) - 1, parseInt(m[2], 10));
				return isNaN(d.getTime()) ? null : d;
			}

			const today = startOfDay(new Date());

			inputs.forEach(input => {
				if (input.dataset.pickerInitialized === 'true') return;
				input.dataset.pickerInitialized = 'true';
				input.setAttribute('autocomplete', 'off');

				let startDate = null, endDate = null;
				const existingParts = input.value ? input.value.split(/\s*-\s*/) : [];
				if (existingParts.length === 2) {
					const s = parseFmt(existingParts[0]);
					const e = parseFmt(existingParts[1]);
					if (s && e) { startDate = s; endDate = e; }
				}

				let pendingStart = startDate, pendingEnd = endDate, hoverDate = null;
				let leftMonth = new Date((startDate || today).getFullYear(), (startDate || today).getMonth(), 1);
				let rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);

				const ranges = [
					['Today', () => [today, today]],
					['Yesterday', () => { const y = new Date(today); y.setDate(y.getDate() - 1); return [y, y]; }],
					['Last 7 Days', () => { const s = new Date(today); s.setDate(s.getDate() - 6); return [s, today]; }],
					['Last 30 Days', () => { const s = new Date(today); s.setDate(s.getDate() - 29); return [s, today]; }],
					['This Month', () => [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)]],
					['Last Month', () => [new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0)]]
				];

				const widget = document.createElement('div');
				widget.className = 'daterangepicker ltr show-calendar show-ranges';
				widget.style.display = 'none';
				widget.style.position = 'absolute';
				widget.style.zIndex = '99999';
				document.body.appendChild(widget);

				function cellTd(cellDate, off) {
					const cls = [];
					if (off) cls.push('off', 'ends');
					if (sameDay(cellDate, today)) cls.push('today');
					const dow = cellDate.getDay();
					if (dow === 0 || dow === 6) cls.push('weekend');
					if (pendingStart && sameDay(cellDate, pendingStart)) cls.push('active', 'start-date');
					if (pendingEnd && sameDay(cellDate, pendingEnd)) cls.push('active', 'end-date');
					if (pendingStart && pendingEnd && cellDate > pendingStart && cellDate < pendingEnd) {
						cls.push('in-range');
					} else if (pendingStart && !pendingEnd && hoverDate) {
						const lo = hoverDate < pendingStart ? hoverDate : pendingStart;
						const hi = hoverDate < pendingStart ? pendingStart : hoverDate;
						if (cellDate > lo && cellDate < hi) cls.push('in-range');
					}
					return '<td class="' + cls.join(' ') + '" data-ts="' + cellDate.getTime() + '">' + cellDate.getDate() + '</td>';
				}

				function buildCalendarTable(monthDate, side) {
					const year = monthDate.getFullYear(), month = monthDate.getMonth();
					const firstDay = new Date(year, month, 1).getDay();
					const daysInMonth = new Date(year, month + 1, 0).getDate();
					const daysInPrevMonth = new Date(year, month, 0).getDate();

					let html = '<div class="calendar-table"><table class="table-condensed"><thead><tr>';
					html += side === 'left' ? '<th class="prev available"><span></span></th>' : '<th></th>';
					html += '<th colspan="5" class="month">' + monthNames[month] + ' ' + year + '</th>';
					html += side === 'right' ? '<th class="next available"><span></span></th>' : '<th></th>';
					html += '</tr><tr>';
					dayNames.forEach(d => { html += '<th>' + d + '</th>'; });
					html += '</tr></thead><tbody><tr>';

					let dayCount = 0;
					for (let p = firstDay - 1; p >= 0; p--) {
						html += cellTd(new Date(year, month - 1, daysInPrevMonth - p), true);
						dayCount++;
					}
					for (let i = 1; i <= daysInMonth; i++) {
						if (dayCount > 0 && dayCount % 7 === 0) html += '</tr><tr>';
						html += cellTd(new Date(year, month, i), false);
						dayCount++;
					}
					let n = 1;
					while (dayCount % 7 !== 0) {
						html += cellTd(new Date(year, month + 1, n), true);
						n++; dayCount++;
					}
					html += '</tr></tbody></table></div>';
					return html;
				}

				function render() {
					let html = '<div class="ranges"><ul>';
					ranges.forEach(([label]) => { html += '<li data-range="' + label + '">' + label + '</li>'; });
					html += '<li data-range="Custom Range" class="active">Custom Range</li>';
					html += '</ul></div>';
					html += '<div class="drp-calendar left">' + buildCalendarTable(leftMonth, 'left') + '</div>';
					html += '<div class="drp-calendar right">' + buildCalendarTable(rightMonth, 'right') + '</div>';
					html += '<div class="drp-buttons">';
					html += '<span class="drp-selected">' + (pendingStart ? fmt(pendingStart) : '') + (pendingStart && pendingEnd ? ' - ' + fmt(pendingEnd) : '') + '</span>';
					html += '<button type="button" class="cancelBtn btn btn-sm btn-light">Cancel</button>';
					html += '<button type="button" class="applyBtn btn btn-sm btn-primary"' + (pendingStart && pendingEnd ? '' : ' disabled') + '>Apply</button>';
					html += '</div>';
					widget.innerHTML = html;
					attachEvents();
				}

				function attachEvents() {
					widget.querySelector('.drp-calendar.left .prev')?.addEventListener('click', e => {
						e.stopPropagation();
						leftMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() - 1, 1);
						rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);
						render();
					});
					widget.querySelector('.drp-calendar.right .next')?.addEventListener('click', e => {
						e.stopPropagation();
						rightMonth = new Date(rightMonth.getFullYear(), rightMonth.getMonth() + 1, 1);
						leftMonth = new Date(rightMonth.getFullYear(), rightMonth.getMonth() - 1, 1);
						render();
					});

					widget.querySelectorAll('td[data-ts]').forEach(td => {
						td.addEventListener('click', e => {
							e.stopPropagation();
							const d = new Date(parseInt(td.dataset.ts, 10));
							if (!pendingStart || (pendingStart && pendingEnd)) {
								pendingStart = d; pendingEnd = null;
							} else if (d < pendingStart) {
								pendingEnd = pendingStart; pendingStart = d;
							} else {
								pendingEnd = d;
							}
							hoverDate = null;
							widget.querySelectorAll('.ranges li').forEach(l => l.classList.remove('active'));
							widget.querySelector('[data-range="Custom Range"]')?.classList.add('active');
							render();
						});
						td.addEventListener('mouseenter', () => {
							if (pendingStart && !pendingEnd) {
								hoverDate = new Date(parseInt(td.dataset.ts, 10));
								render();
							}
						});
					});

					widget.querySelectorAll('.ranges li').forEach(li => {
						li.addEventListener('click', e => {
							e.stopPropagation();
							const key = li.dataset.range;
							const preset = ranges.find(r => r[0] === key);
							widget.querySelectorAll('.ranges li').forEach(l => l.classList.remove('active'));
							li.classList.add('active');
							if (preset) {
								const [s, eD] = preset[1]();
								pendingStart = startOfDay(s);
								pendingEnd = startOfDay(eD);
								leftMonth = new Date(pendingStart.getFullYear(), pendingStart.getMonth(), 1);
								rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);
							}
							render();
						});
					});

					widget.querySelector('.cancelBtn')?.addEventListener('click', e => {
						e.stopPropagation();
						hidePicker();
					});
					widget.querySelector('.applyBtn')?.addEventListener('click', e => {
						e.stopPropagation();
						if (pendingStart && pendingEnd) {
							startDate = pendingStart;
							endDate = pendingEnd;
							input.value = fmt(startDate) + ' - ' + fmt(endDate);
							input.dispatchEvent(new Event('change', { bubbles: true }));
							input.dispatchEvent(new Event('input', { bubbles: true }));
						}
						hidePicker();
					});
				}

				function showPicker() {
					document.querySelectorAll('.daterangepicker, .bootstrap-datetimepicker-widget').forEach(w => {
						if (w !== widget) w.style.display = 'none';
					});

					pendingStart = startDate; pendingEnd = endDate; hoverDate = null;
					if (pendingStart) {
						leftMonth = new Date(pendingStart.getFullYear(), pendingStart.getMonth(), 1);
						rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);
					}
					render();

					const rect = input.getBoundingClientRect();
					const top = rect.bottom + (window.pageYOffset || document.documentElement.scrollTop || 0);
					const left = rect.left + (window.pageXOffset || document.documentElement.scrollLeft || 0);
					widget.style.top = top + 'px';
					widget.style.left = left + 'px';
					widget.style.display = 'block';
				}

				function hidePicker() {
					widget.style.display = 'none';
				}

				input.addEventListener('click', e => {
					e.stopPropagation();
					showPicker();
				});
				input.addEventListener('focus', () => showPicker());

				const wrap = input.closest('.daterange-wraper, .form-icon, .input-group, .form-wrap');
				if (wrap) {
					const icon = wrap.querySelector(':scope > i, .icon, .input-group-text, .input-group-addon');
					if (icon) {
						icon.style.cursor = 'pointer';
						icon.addEventListener('click', e => {
							e.stopPropagation();
							showPicker();
						});
					}
				}

				document.addEventListener('click', e => {
					if (!widget.contains(e.target) && e.target !== input && (!wrap || !wrap.contains(e.target))) {
						hidePicker();
					}
				});
			});
		}

		initDatetimepickers();
		initTimepickers();
		initCounters();
		initCircleGraphs();
		initDateRangePickers();
	});

	// Img slide 
	// --- Minimal safe fix (declares active + guards missing elements) ---
	// Use querySelectorAll to find all instances
	const wrappers = document.querySelectorAll('.wrapper');

	wrappers.forEach((wrapper) => {
	// Scope these to the current wrapper instance
	const scroller = wrapper.querySelector('.scroller');
	const after = wrapper.querySelector('.after');

	if (!scroller || !after) {
		console.warn('Init aborted: .scroller or .after element missing in a wrapper.');
		return;
	}

	let active = false;

	const startScrolling = () => {
		active = true;
		scroller.classList.add('scrolling');
	};

	const stopScrolling = () => {
		active = false;
		scroller.classList.remove('scrolling');
	};

	// Helper to calculate position relative to THIS specific wrapper
	function scrollIt(x) {
		const rect = wrapper.getBoundingClientRect();
		const relativeX = x - rect.left;
		const transform = Math.max(0, Math.min(relativeX, wrapper.offsetWidth));
		after.style.width = transform + "px";
		scroller.style.left = (transform - 25) + "px";
	}

	// Event Listeners
	scroller.addEventListener('mousedown', startScrolling);
	scroller.addEventListener('touchstart', startScrolling);

	// Global listeners for mouse/touch movement while active
	window.addEventListener('mouseup', stopScrolling);
	window.addEventListener('mouseleave', stopScrolling);
	window.addEventListener('touchend', stopScrolling);
	window.addEventListener('touchcancel', stopScrolling);

	window.addEventListener('mousemove', (e) => {
		if (!active) return;
		scrollIt(e.pageX);
	});

	window.addEventListener('touchmove', (e) => {
		if (!active) return;
		const t = e.touches && e.touches[0];
		if (t) scrollIt(t.pageX);
	}, { passive: true });

	const setInitialPosition = () => {
		// Get the current width of THIS specific slider
		const sliderWidth = wrapper.offsetWidth;
		const halfWay = sliderWidth / 2.07;
		
		// We need to pass the absolute page coordinate to scrollIt
		const rect = wrapper.getBoundingClientRect();
		scrollIt(rect.left + halfWay);
	};

	// Run it immediately
	setInitialPosition();

	// Optional: Recalculate if the window is resized so it stays centered
	window.addEventListener('resize', setInitialPosition);
	});

})();
