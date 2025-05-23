document.addEventListener('DOMContentLoaded', function() {
            // --- General Setup ---
            const yearSpans = ['currentYearFooter1', 'currentYearFooter2', 'currentYearFooter3', 'currentYearFooterMain', 'currentYearTerms'];
            yearSpans.forEach(id => {
                const span = document.getElementById(id);
                if (span) span.textContent = new Date().getFullYear();
            });

            AOS.init({ duration: 800, once: false });
            window.addEventListener('scroll', () => AOS.refresh());

            // --- Swipers ---
            const swiperHero = new Swiper('.swiper-container-hero', {
                loop: true, autoplay: { delay: 5000, disableOnInteraction: false },
                pagination: { el: '.swiper-container-hero .swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-container-hero .swiper-button-next', prevEl: '.swiper-container-hero .swiper-button-prev' },
            });

            function initializeProjectSwipers() {
                const screenWidth = window.innerWidth;
                document.querySelectorAll('.swiper-container-project').forEach(swiperEl => {
                    if (screenWidth <= 1024) {
                        if (!swiperEl.swiper) {
                            new Swiper(swiperEl, {
                                loop: true, autoplay: { delay: 3000, disableOnInteraction: false },
                                pagination: { el: swiperEl.querySelector('.custom-swiper-pagination'), clickable: true, bulletClass: 'custom-swiper-pagination-bullet', bulletActiveClass: 'custom-swiper-pagination-bullet-active' },
                                navigation: { nextEl: swiperEl.querySelector('.custom-swiper-button-next'), prevEl: swiperEl.querySelector('.custom-swiper-button-prev') },
                            });
                        }
                    } else {
                        if (swiperEl.swiper) swiperEl.swiper.destroy(true, true);
                    }
                });
            }
            initializeProjectSwipers();
            window.addEventListener('resize', initializeProjectSwipers);

            // --- Mobile Menu ---
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            // Removed .mobile-menu-modal a from selector as those menus are gone
            const allMobileMenuLinks = document.querySelectorAll('#mobile-menu a'); 

            if (mobileMenuButton && mobileMenu) {
                mobileMenuButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent click from immediately closing menu via body listener
                    mobileMenu.classList.toggle('hidden');
                    mobileMenu.classList.toggle('active');
                    mobileMenuButton.querySelector('.hamburger').classList.toggle('open');
                });
            }

            // Removed event listeners for .mobile-menu-button-modal as they no longer exist

             function closeActiveMobileMenus() {
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('active');
                    if (mobileMenuButton) mobileMenuButton.querySelector('.hamburger').classList.remove('open');
                }
                // Removed logic for .mobile-menu-modal.active as they no longer exist
            }

            allMobileMenuLinks.forEach(link => {
                if (link.classList.contains('close-menu-link')) { // Standard main mobile menu links
                     link.addEventListener('click', () => { // Arrow function for brevity
                        // Modal closing logic will be handled by the main navigation link logic if a modal is open
                        closeActiveMobileMenus();
                     });
                }
            });

            document.body.addEventListener('click', (event) => {
                // Close main mobile menu if click is outside
                if (mobileMenuButton && mobileMenu && mobileMenu.classList.contains('active') && 
                    !mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
                    closeActiveMobileMenus();
                }
            });


            // --- Modals & History Management ---
            const allModals = document.querySelectorAll('.modal-project, .modal-terms');
            const openModalLinks = document.querySelectorAll('.open-modal, .open-terms');
            // .close-modal-to-main class is no longer on dedicated modal close buttons.
            // It's handled by main header links if a modal is open.
            const closeModalButtons = document.querySelectorAll('.close-modal, .close-terms'); 
            let previousPageHash = window.location.hash || '#inicio'; 

            function openModal(targetModalId, openerLink) {
                const targetModal = document.getElementById(targetModalId);
                if (targetModal) {
                    // Capture the hash *before* opening the modal
                    previousPageHash = window.location.hash || (openerLink && openerLink.dataset.previousSection ? '#' + openerLink.dataset.previousSection : '#inicio');
                    
                    if (targetModalId === 'terms') {
                        const termsModalElement = document.getElementById('terms');
                        const termsBackButton = termsModalElement ? termsModalElement.querySelector('.close-terms') : null;
                        if (termsBackButton && openerLink) {
                            if (openerLink.closest('.modal-project')) {
                                termsBackButton.dataset.targetSection = openerLink.closest('.modal-project').id;
                            } else {
                                termsBackButton.dataset.targetSection = openerLink.dataset.previousSection || 'main-footer';
                            }
                        }
                    }

                    allModals.forEach(m => m.classList.remove('active')); // Ensure only one modal is active
                    targetModal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling of main page
                    // Push state for modal opening
                    history.pushState({ modal: targetModalId, previousHash: previousPageHash }, null, '#' + targetModalId);
                    window.scrollTo(0, 0); // Scroll modal to top
                    AOS.refresh();
                } else {
                    console.error('Modal element not found for ID:', targetModalId);
                }
            }

            function closeModal(currentModal, targetSectionOverride = null, isNavigating = false) {
                if (!currentModal || !currentModal.classList.contains('active')) return;

                currentModal.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling on main page

                const state = history.state;
                let hashToRestore = previousPageHash; // Default to the hash captured before modal opened

                if(targetSectionOverride) {
                    hashToRestore = '#' + targetSectionOverride;
                } else if (state && state.previousHash) {
                    hashToRestore = state.previousHash;
                }
                
                // If navigating via header/mobile menu, new state will be pushed by smooth scroll logic.
                // If closing via "Volver" or browser back, push the restored hash.
                if (!isNavigating || (isNavigating && targetSectionOverride === 'inicio' && hashToRestore === '#inicio')) {
                     history.pushState({ previousHash: hashToRestore }, null, hashToRestore);
                }
                
                // Only scroll if not navigating via header links (which have their own scroll)
                if (!isNavigating && hashToRestore && hashToRestore !== '#') {
                    const sectionElement = document.getElementById(hashToRestore.substring(1));
                    if (sectionElement) {
                         const scrollPaddingTop = parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
                         window.scrollTo({ top: sectionElement.offsetTop - scrollPaddingTop, behavior: 'smooth' });
                    }
                }
                 AOS.refresh();
            }

            openModalLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetModalId = link.getAttribute('href').substring(1);
                    openModal(targetModalId, link);
                });
            });

            closeModalButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const currentModal = button.closest('.modal-project, .modal-terms');
                    const targetSection = button.dataset.targetSection || button.getAttribute('href').substring(1); // Fallback to href if no data-target-section
                    closeModal(currentModal, targetSection, false);
                });
            });
            
            window.addEventListener('popstate', (event) => {
                const activeModal = document.querySelector('.modal-project.active, .modal-terms.active');
                if (event.state && event.state.modal && !activeModal) {
                    // Forward button was pressed to a state where a modal should be open
                    openModal(event.state.modal, document.querySelector(`[href="#${event.state.modal}"]`));
                } else if (!event.state || (!event.state.modal && activeModal)) {
                    // Back button was pressed or state doesn't have modal info, and a modal is active
                    closeModal(activeModal, (event.state && event.state.previousHash) ? event.state.previousHash.substring(1) : 'inicio', false);
                }
                // If no modal is active and state has no modal, it's main page navigation, handled by browser.
            });


            // FAQ Toggle
            document.querySelectorAll('.faq-question').forEach(question => {
                question.addEventListener('click', () => {
                    const answer = question.nextElementSibling;
                    const isActive = answer.classList.contains('active');
                    // Close other active answers
                    document.querySelectorAll('.faq-answer.active').forEach(actAns => { 
                        if (actAns !== answer) actAns.classList.remove('active'); 
                    });
                    answer.classList.toggle('active');
                });
            });

            // Smooth scroll for main page navigation links (in header and mobile menu)
            document.querySelectorAll('#header nav a[href^="#"], #header .flex-shrink-0 a[href^="#"], #mobile-menu a[href^="#"]').forEach(anchor => {
                 anchor.addEventListener('click', function (e) {
                    const activeModal = document.querySelector('.modal-project.active, .modal-terms.active');
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        e.preventDefault(); // Prevent default jump
                        
                        if (activeModal) {
                            // Pass true for isNavigating, and the targetId for section override
                            closeModal(activeModal, targetId, true); 
                        }
                        
                        closeActiveMobileMenus(); // Close mobile menu if open

                        const scrollPaddingTop = parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
                        window.scrollTo({
                            top: targetElement.offsetTop - scrollPaddingTop,
                            behavior: 'smooth'
                        });
                        // Update hash after smooth scroll for main sections
                        if (history.pushState) {
                            history.pushState({ previousHash: '#' + targetId }, null, '#' + targetId);
                        } else {
                            window.location.hash = '#' + targetId;
                        }
                    }
                });
            });

            // Scroll indicator logic
            const scrollIndicator = document.getElementById('scroll-indicator');
            function checkScrollIndicatorVisibility() {
                if (scrollIndicator) { // Check if element exists
                    if (window.innerWidth < 767 && window.scrollY < 50) {
                        scrollIndicator.style.display = 'block';
                    } else {
                        scrollIndicator.style.display = 'none';
                    }
                }
            }
            window.addEventListener('scroll', checkScrollIndicatorVisibility);
            window.addEventListener('resize', checkScrollIndicatorVisibility);
            checkScrollIndicatorVisibility(); // Initial check
        });
