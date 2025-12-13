// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // --- SCROLL ANIMATIONS ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Default fade-up animation
                if (entry.target.classList.contains('hidden-section')) {
                    entry.target.classList.add('show-section');
                }
                // Side animations
                if (entry.target.classList.contains('slide-in-left') || entry.target.classList.contains('slide-in-right')) {
                    entry.target.classList.add('show-side');
                }
                observer.unobserve(entry.target); // Animates only once
            }
        });
    }, observerOptions);

    // Target all sections and cards that should animate
    const hiddenElements = document.querySelectorAll('.hidden-section, .slide-in-left, .slide-in-right');
    hiddenElements.forEach((el) => observer.observe(el));


    // --- MOBILE MENU ---
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (menuIcon) {
        menuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Toggle icon shape
            if (navLinks.classList.contains('active')) {
                menuIcon.textContent = '✕';
            } else {
                menuIcon.textContent = '☰';
            }
        });
    }

    // Close menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuIcon.textContent = '☰';
        });
    });

    // --- SMOOTH SCROLL FOR ANCHOR LINKS (Safari fallback) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    // --- FETCH DATA FROM API ---
    const API_URL = 'https://portfolio-backend-z2kz.onrender.com/api';


    async function loadSkills() {
        try {
            const res = await fetch(`${API_URL}/skills`);
            const skills = await res.json();
            const container = document.getElementById('skills-container');

            if (skills.length === 0) {
                container.innerHTML = '<p>No skills found.</p>';
                return;
            }

            container.innerHTML = skills.map(skill => `
                <div class="skill-pill"><i class="fas fa-code"></i> ${skill.skill}</div>
            `).join('');

        } catch (error) {
            console.error('Error loading skills:', error);
            document.getElementById('skills-container').innerHTML = '<p>Error loading skills.</p>';
        }
    }

    async function loadProjects() {
        try {
            const res = await fetch(`${API_URL}/projects`);
            const projects = await res.json();
            const container = document.getElementById('projects-container');

            if (projects.length === 0) {
                container.innerHTML = '<p>No projects found.</p>';
                return;
            }

            container.innerHTML = projects.map((project, index) => `
                <div class="project-card hidden-section" style="transition-delay: ${index * 100}ms;">
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${project.tech.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                    <div style="margin-top:15px;">
                       ${project.github ? `<a href="${project.github}" target="_blank" style="color:var(--text-color); margin-right:10px;"><i class="fab fa-github"></i> Code</a>` : ''}
                       ${project.demo ? `<a href="${project.demo}" target="_blank" style="color:var(--primary-color);"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                    </div>
                </div>
            `).join('');

            // Re-run observer for new elements
            const newHiddenElements = document.querySelectorAll('.hidden-section');
            newHiddenElements.forEach((el) => observer.observe(el));

        } catch (error) {
            console.error('Error loading projects:', error);
            document.getElementById('projects-container').innerHTML = '<p>Error loading projects.</p>';
        }
    }

    loadSkills();
    loadProjects();

    // --- CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = contactForm.querySelectorAll('input, textarea');
            const data = {
                name: inputs[0].value,
                email: inputs[1].value,
                message: inputs[2].value
            };

            // Validate email format (Gmail only)
            const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            if (!emailRegex.test(data.email)) {
                showToast('Please enter a valid Gmail address (@gmail.com)', 'error');
                return;
            }

            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            try {
                const res = await fetch(`${API_URL}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if (res.ok) {
                    showToast('Message sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    showToast(result.message || 'Failed to send message.', 'error');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                showToast('Error sending message.', 'error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }
});

// --- TOAST NOTIFICATION HELPER ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 400);
    }, 3000);
}

