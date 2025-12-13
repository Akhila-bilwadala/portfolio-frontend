const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://portfolio-backend-z2kz.onrender.com/api';

console.log('Admin Script Loaded. API URL:', API_URL);

// --- AUTH CHECK ---
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// --- DOM ELEMENTS ---
const skillForm = document.getElementById('skill-form');
const skillIdInput = document.getElementById('skill-id');
const skillNameInput = document.getElementById('skill-name');
const skillBtn = document.getElementById('skill-submit-btn');
const skillCancelBtn = document.getElementById('skill-cancel-btn');
const skillsList = document.getElementById('admin-skills-list');

const projectForm = document.getElementById('project-form');
const projectIdInput = document.getElementById('project-id');
const projectNameInput = document.getElementById('project-name');
const projectDescInput = document.getElementById('project-desc');
const projectTechInput = document.getElementById('project-tech');
const projectGithubInput = document.getElementById('project-github');
const projectDemoInput = document.getElementById('project-demo');
const projectBtn = document.getElementById('project-submit-btn');
const projectCancelBtn = document.getElementById('project-cancel-btn');
const projectsList = document.getElementById('admin-projects-list');

const messagesList = document.getElementById('admin-messages-list');

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    loadSkills();
    loadProjects();
    loadMessages();
});

// --- HELPER: AUTH HEADERS ---
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- MESSAGES ---
async function loadMessages() {
    if (!messagesList) return;
    messagesList.innerHTML = '<p>Loading...</p>';
    try {
        const res = await fetch(`${API_URL}/messages`, {
            headers: getAuthHeaders()
        });
        const messages = await res.json();

        if (messages.length === 0) {
            messagesList.innerHTML = '<p style="color:var(--text-muted);">No messages found from visitors.</p>';
            return;
        }

        messagesList.innerHTML = messages.map(msg => `
            <div class="message-card">
                <div class="message-header">
                    <div>
                        <strong style="color:var(--primary); font-size: 1.1rem;">${msg.name}</strong> 
                        <span style="color:var(--text-muted); font-size:0.9rem; margin-left: 8px;">&lt;${msg.email}&gt;</span>
                    </div>
                    <small style="color:var(--text-muted);">${new Date(msg.createdAt).toLocaleString()}</small>
                </div>
                <div style="color: var(--text-main); margin-bottom: 20px; line-height: 1.6; word-break: break-word;">
                    ${msg.message}
                </div>
                <div style="text-align: right; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn btn-danger" onclick="deleteMessage('${msg._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ${(msg.email && msg.email.endsWith('@gmail.com')) ? `
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${msg.email}" target="_blank" class="btn btn-primary" style="text-decoration:none;">
                        <i class="fas fa-reply"></i> Reply
                    </a>` : ''}
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        messagesList.innerHTML = '<p style="color:red;">Error loading messages</p>';
    }
}

window.deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
        await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        loadMessages();
    } catch (err) {
        alert('Error deleting message');
    }
};


// --- SKILLS ---
let currentSkills = []; // Store current skills for duplicate checking

async function loadSkills() {
    skillsList.innerHTML = '<p>Loading...</p>';
    try {
        const res = await fetch(`${API_URL}/skills`);
        const skills = await res.json();
        currentSkills = skills; // Store for duplicate checking

        if (skills.length === 0) {
            skillsList.innerHTML = '<p style="color:#888;">No skills added yet.</p>';
            return;
        }

        skillsList.innerHTML = skills.map(skill => `
            <div class="list-item">
                <div class="list-item-content">
                    <strong>${skill.skill}</strong>
                </div>
                <div class="list-actions">
                    <button class="btn btn-warning" onclick="editSkill('${skill._id}', '${skill.skill}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteSkill('${skill._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        skillsList.innerHTML = '<p>Error loading skills</p>';
    }
}

skillForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = skillIdInput.value;
    const name = skillNameInput.value.trim();

    // Check for duplicate skill (case-insensitive) when adding new
    if (!id) {
        const duplicate = currentSkills.find(
            s => s.skill.toLowerCase() === name.toLowerCase()
        );
        if (duplicate) {
            alert('This skill already exists!');
            return;
        }
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/skills/${id}` : `${API_URL}/skills`;

    try {
        console.log(`Sending ${method} request to ${url} with token: ...${token.substring(token.length - 10)}`);
        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify({ skill: name })
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || res.statusText);
        }

        resetSkillForm();
        loadSkills();
    } catch (err) {
        console.error("Skill Error:", err);
        alert(`Error saving skill: ${err.message}. Ensure you are logged in.`);
    }
});

window.editSkill = (id, name) => {
    skillIdInput.value = id;
    skillNameInput.value = name;
    skillBtn.textContent = 'Update';
    skillCancelBtn.style.display = 'inline-block';
};

window.deleteSkill = async (id) => {
    if (!confirm('Delete this skill?')) return;
    try {
        const res = await fetch(`${API_URL}/skills/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Failed");
        loadSkills();
    } catch (err) {
        alert('Error deleting skill');
    }
};

skillCancelBtn.addEventListener('click', resetSkillForm);

function resetSkillForm() {
    skillIdInput.value = '';
    skillNameInput.value = '';
    skillBtn.textContent = 'Add Skill';
    skillCancelBtn.style.display = 'none';
}


// --- PROJECTS ---
async function loadProjects() {
    projectsList.innerHTML = '<p>Loading...</p>';
    try {
        const res = await fetch(`${API_URL}/projects`);
        const projects = await res.json();

        if (projects.length === 0) {
            projectsList.innerHTML = '<p style="color:#888;">No projects added yet.</p>';
            return;
        }

        projectsList.innerHTML = projects.map(project => `
            <div class="list-item">
                <div class="list-item-content">
                    <h3>${project.name}</h3>
                    <p style="color:#aaa; font-size:0.9rem; margin-top:5px;">${project.description.substring(0, 100)}...</p>
                    <div style="margin-top:5px; font-size:0.8rem; color:var(--primary-color);">
                        ${project.tech.join(', ')}
                    </div>
                </div>
                <div class="list-actions">
                    <button class="btn btn-warning" onclick="editProject('${project._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteProject('${project._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        projectsList.innerHTML = '<p>Error loading projects</p>';
    }
}

projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = projectIdInput.value;
    const githubUrl = projectGithubInput.value.trim();

    // Validate GitHub URL if provided
    if (githubUrl) {
        const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?.*$/i;
        if (!githubRegex.test(githubUrl)) {
            alert('Please provide a valid GitHub URL (e.g., https://github.com/username/repo)');
            return;
        }
    }

    const data = {
        name: projectNameInput.value,
        description: projectDescInput.value,
        tech: projectTechInput.value.split(',').map(t => t.trim()),
        github: githubUrl,
        demo: projectDemoInput.value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;

    try {
        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Failed to save project');
        }

        resetProjectForm();
        loadProjects();
    } catch (err) {
        alert(`Error saving project: ${err.message}`);
    }
});

window.editProject = async (id) => {
    try {
        const res = await fetch(`${API_URL}/projects/${id}`);
        const project = await res.json();

        projectIdInput.value = project._id;
        projectNameInput.value = project.name;
        projectDescInput.value = project.description;
        projectTechInput.value = project.tech.join(', ');
        projectGithubInput.value = project.github || '';
        projectDemoInput.value = project.demo || '';

        projectBtn.textContent = 'Update Project';
        projectCancelBtn.style.display = 'inline-block';

        // Switch to projects tab if not active (optional, but good UX)
        showSection('projects');
        window.scrollTo(0, projectForm.offsetTop);
    } catch (err) {
        alert('Error loading project details');
    }
};

window.deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
        const res = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Failed");
        loadProjects();
    } catch (err) {
        alert('Error deleting project');
    }
};

projectCancelBtn.addEventListener('click', resetProjectForm);

function resetProjectForm() {
    projectIdInput.value = '';
    projectForm.reset();
    projectBtn.textContent = 'Add Project';
    projectCancelBtn.style.display = 'none';
}
