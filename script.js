document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Sticky Header Effect ---
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 2. Smooth Scrolling for Nav Links ---
    // Specifically targeting the floating geometric nav nodes and top nav
    const scrollLinks = document.querySelectorAll('.nav-node, .center-nav a');

    scrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // If link points to another page or external site, let the browser handle it
            if (targetId && !targetId.startsWith('#')) return;

            e.preventDefault();
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Account for fixed header height
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 3. Scroll Reveal Animations (Intersection Observer) ---
    // Adds a premium feel as elements enter the viewport

    const revealElements = document.querySelectorAll('.resume-item, .research-card, .blog-post, .link-card');

    // Initial state: slightly lower and transparent
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Fade in and slide up
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- 4. Secret Clinical Portal Triggers ---

    // Trigger A: Double click on the Header Logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('dblclick', () => {
            window.location.href = 'portal.html';
        });
        logo.style.cursor = 'default';
        logo.style.userSelect = 'none';
    }

    // Trigger B: Keyboard shortcut typing "doc" in sequence
    let keysTyped = '';
    window.addEventListener('keydown', (e) => {
        // Ignore if user is currently typing in a form input or textarea
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            return;
        }
        // Prevent buffer bloat, only capture alphanumeric keys
        if (e.key.length === 1) {
            keysTyped += e.key.toLowerCase();
            keysTyped = keysTyped.slice(-3);
            if (keysTyped === 'doc') {
                window.location.href = 'portal.html';
            }
        }
    });

    // --- 5. Masked Email Copy to Clipboard on Click ---
    const maskedEmail = document.querySelector('.masked-email');
    if (maskedEmail) {
        maskedEmail.addEventListener('click', function (e) {
            e.preventDefault();

            // 1. Get the scrambled string and decode it on the fly
            const obfuscatedData = this.getAttribute('data-secure');
            if (!obfuscatedData) return;

            const decodedEmail = atob(obfuscatedData);

            // 2. Copy the email to the clipboard
            navigator.clipboard.writeText(decodedEmail).then(() => {
                // 3. Visual feedback: Change the text to "Copied!"
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fa-solid fa-check" style="color: #009984; margin-right: 5px;"></i> Copied!';

                // 4. Reset the text back to normal after 2 seconds
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy email: ', err);
            });
        });
    }

    // --- 6. Contact Form Handler (AJAX + Mailto Fallback) ---
    const contactForm = document.querySelector('.footer-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Honeypot bot check: if _gotcha is filled, silently reject
            const honeypot = this.querySelector('input[name="_gotcha"]');
            if (honeypot && honeypot.value !== '') {
                return; // Silent discard — bot filled the hidden field
            }

            const formAction = this.getAttribute('action');
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Check if Formspree action is still the default template placeholder
            if (formAction.includes('your-form-id')) {
                // Instantly operational mailto fallback!
                const subject = `Portfolio Inquiry from ${name}`;
                const body = `Hello Dr. Diego Medina,\n\n${message}\n\n---\nFrom: ${name} (${email})`;
                const mailtoUrl = `mailto:diegonapoleon.dm@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                window.location.href = mailtoUrl;
                return;
            }

            // Seamless AJAX fetch if a valid Formspree ID is set
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = "SENDING...";

            const formData = new FormData(this);
            fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        // Modern inline success message animation
                        const formContainer = document.querySelector('.footer-form');
                        formContainer.style.transition = 'opacity 0.5s ease';
                        formContainer.style.opacity = '0';
                        setTimeout(() => {
                            formContainer.innerHTML = `
                            <div style="text-align: center; padding: 40px; background: rgba(0, 245, 212, 0.05); border: 1px solid var(--clr-accent); border-radius: 8px; box-shadow: 0 0 20px rgba(0, 245, 212, 0.05); transition: opacity 0.5s ease;">
                                <i class="fa-regular fa-paper-plane" style="font-size: 3rem; color: var(--clr-accent); margin-bottom: 20px; display: inline-block;"></i>
                                <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: #fff; margin-bottom: 10px;">Message Sent!</h3>
                                <p style="color: #aaa; font-size: 0.95rem; line-height: 1.6;">Thank you for reaching out, Dr. Medina. Your message has been sent successfully and he will get back to you shortly.</p>
                            </div>
                        `;
                            formContainer.style.opacity = '1';
                        }, 500);
                    } else {
                        throw new Error('Server error');
                    }
                })
                .catch(error => {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;
                    alert("Submission failed. Please verify your internet connection or email directly at diegonapoleon.dm@gmail.com.");
                });
        });
    }

});

