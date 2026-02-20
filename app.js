const STORAGE_KEY = 'todo_app_data';
let _idCounter = 0;
function uid() { return `${Date.now()}-${++_idCounter}`; }

// ── Data helpers ──────────────────────────────────────────────────────────────

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { projects: [], activeProject: null };
  } catch {
    return { projects: [], activeProject: null };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getActiveProject(data) {
  return data.projects.find(p => p.id === data.activeProject) || data.projects[0] || null;
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderProjects(data) {
  const select = document.getElementById('project-select');
  select.innerHTML = '';
  data.projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    if (p.id === data.activeProject) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderTasks(data) {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  const project = getActiveProject(data);
  if (!project) {
    list.innerHTML = '<li class="empty-state">No project selected. Create a project to get started.</li>';
    return;
  }

  if (project.tasks.length === 0) {
    list.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
    return;
  }

  project.tasks.forEach(task => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text' + (task.done ? ' done' : '');
    span.textContent = task.text;

    const del = document.createElement('button');
    del.className = 'delete-task';
    del.textContent = '×';
    del.setAttribute('aria-label', `Delete task "${task.text}"`);
    del.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function render() {
  const data = loadData();
  renderProjects(data);
  renderTasks(data);
}

// ── Actions ───────────────────────────────────────────────────────────────────

function addProject() {
  const name = prompt('Enter project name:');
  if (!name || !name.trim()) return;
  const data = loadData();
  const project = { id: uid(), name: name.trim(), tasks: [] };
  data.projects.push(project);
  data.activeProject = project.id;
  saveData(data);
  render();
}

function deleteProject() {
  const data = loadData();
  const project = getActiveProject(data);
  if (!project) return;
  if (!confirm(`Delete project "${project.name}" and all its tasks?`)) return;
  data.projects = data.projects.filter(p => p.id !== project.id);
  data.activeProject = data.projects.length ? data.projects[0].id : null;
  saveData(data);
  render();
}

function switchProject(id) {
  const data = loadData();
  data.activeProject = id;
  saveData(data);
  renderTasks(data);
}

function addTask() {
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if (!text) return;

  const data = loadData();
  const project = getActiveProject(data);
  if (!project) {
    alert('Please create a project first.');
    return;
  }

  project.tasks.push({ id: uid(), text, done: false });
  saveData(data);
  input.value = '';
  renderTasks(data);
}

function toggleTask(taskId) {
  const data = loadData();
  const project = getActiveProject(data);
  if (!project) return;
  const task = project.tasks.find(t => t.id === taskId);
  if (task) {
    task.done = !task.done;
    saveData(data);
    renderTasks(data);
  }
}

function deleteTask(taskId) {
  const data = loadData();
  const project = getActiveProject(data);
  if (!project) return;
  project.tasks = project.tasks.filter(t => t.id !== taskId);
  saveData(data);
  renderTasks(data);
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.getElementById('add-project-btn').addEventListener('click', addProject);
document.getElementById('delete-project-btn').addEventListener('click', deleteProject);
document.getElementById('add-task-btn').addEventListener('click', addTask);
document.getElementById('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});
document.getElementById('project-select').addEventListener('change', e => {
  switchProject(e.target.value);
});

// ── Init ──────────────────────────────────────────────────────────────────────

render();
