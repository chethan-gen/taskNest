// Authentication System
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.initializeAuth();
  }

  initializeAuth() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.showDashboard();
    } else {
      this.showLandingPage();
    }

    this.initializeAuthEventListeners();
  }

  initializeAuthEventListeners() {
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignup();
      });
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
  }

  handleSignup() {
    const submitBtn = document.querySelector('#signup-form .auth-button');
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Clear previous errors
    this.clearFormErrors('signup-form');

    // Validation
    let hasErrors = false;

    if (!name) {
      this.showFieldError('signup-name', 'Name is required');
      hasErrors = true;
    }

    if (!email) {
      this.showFieldError('signup-email', 'Email is required');
      hasErrors = true;
    } else if (!this.isValidEmail(email)) {
      this.showFieldError('signup-email', 'Please enter a valid email address');
      hasErrors = true;
    }

    if (!password) {
      this.showFieldError('signup-password', 'Password is required');
      hasErrors = true;
    } else if (password.length < 6) {
      this.showFieldError('signup-password', 'Password must be at least 6 characters long');
      hasErrors = true;
    }

    if (!confirmPassword) {
      this.showFieldError('signup-confirm-password', 'Please confirm your password');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      this.showFieldError('signup-confirm-password', 'Passwords do not match');
      hasErrors = true;
    }

    if (hasErrors) return;

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate async operation
    setTimeout(() => {
      // Check if user already exists
      const existingUsers = this.getUsers();
      if (existingUsers.find(user => user.email === email)) {
        this.showFieldError('signup-email', 'An account with this email already exists');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: this.hashPassword(password),
        createdAt: new Date().toISOString()
      };

      // Save user
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      // Log in the user
      this.currentUser = { id: newUser.id, name: newUser.name, email: newUser.email };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      this.showSuccess('Account created successfully!');
      setTimeout(() => {
        this.showDashboard();
      }, 1500);
    }, 1000);
  }

  handleLogin() {
    const submitBtn = document.querySelector('#login-form .auth-button');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Clear previous errors
    this.clearFormErrors('login-form');

    let hasErrors = false;

    if (!email) {
      this.showFieldError('login-email', 'Email is required');
      hasErrors = true;
    }

    if (!password) {
      this.showFieldError('login-password', 'Password is required');
      hasErrors = true;
    }

    if (hasErrors) return;

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate async operation
    setTimeout(() => {
      const users = this.getUsers();
      const user = users.find(u => u.email === email);

      if (!user || user.password !== this.hashPassword(password)) {
        this.showFieldError('login-email', 'Invalid email or password');
        this.showFieldError('login-password', 'Invalid email or password');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        return;
      }

      // Log in the user
      this.currentUser = { id: user.id, name: user.name, email: user.email };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      this.showSuccess('Welcome back!');
      setTimeout(() => {
        this.showDashboard();
      }, 1500);
    }, 800);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.showLandingPage();
  }

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem('users')) || [];
    } catch {
      return [];
    }
  }

  hashPassword(password) {
    // Simple hash function for demo purposes
    // In production, use proper hashing like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      ${type === 'error' ? 'background: #f44336;' : 'background: #4CAF50;'}
    `;

    document.body.appendChild(messageEl);

    // Remove after 3 seconds
    setTimeout(() => {
      messageEl.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }, 3000);
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');

    formGroup.classList.add('error');

    let errorEl = formGroup.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      formGroup.appendChild(errorEl);
    }

    errorEl.textContent = message;
  }

  clearFormErrors(formId) {
    const form = document.getElementById(formId);
    const errorGroups = form.querySelectorAll('.form-group.error');

    errorGroups.forEach(group => {
      group.classList.remove('error');
      const errorMsg = group.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    });
  }

  showLandingPage() {
    this.showPage('landing');
  }

  showDashboard() {
    this.showPage('dashboard');
    if (this.currentUser) {
      const userNameEl = document.getElementById('user-name');
      if (userNameEl) {
        userNameEl.textContent = `Welcome, ${this.currentUser.name}`;
      }
    }
    // Initialize task manager for the logged-in user
    if (window.taskManager) {
      window.taskManager.setUser(this.currentUser);
    } else {
      window.taskManager = new TaskManager(this.currentUser);
    }
  }

  showPage(pageId) {
    const currentPage = document.querySelector('.page:not([style*="display: none"])');
    const targetPage = document.getElementById(`${pageId}-page`);

    if (!targetPage) return;

    // If there's a current page, fade it out first
    if (currentPage && currentPage !== targetPage) {
      currentPage.classList.add('fade-out');

      setTimeout(() => {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
          page.style.display = 'none';
          page.classList.remove('fade-out');
        });

        // Show target page with fade in
        targetPage.style.display = 'block';

        // Trigger reflow to ensure the transition works
        targetPage.offsetHeight;

        // Clear any forms when switching pages
        if (pageId === 'signup' || pageId === 'login') {
          this.clearFormErrors(pageId + '-form');
          const form = document.getElementById(pageId + '-form');
          if (form) form.reset();
        }
      }, 250);
    } else {
      // No current page, just show the target
      const pages = document.querySelectorAll('.page');
      pages.forEach(page => {
        page.style.display = 'none';
      });
      targetPage.style.display = 'block';
    }
  }
}

// Page Navigation Functions
function showPage(pageId) {
  if (window.authManager) {
    window.authManager.showPage(pageId);
  }
}

function logout() {
  if (window.authManager) {
    window.authManager.logout();
  }
}

// Task Management System with Local Storage
class TaskManager {
  constructor(user = null) {
    this.user = user;
    this.tasks = this.loadTasks();
    this.taskIdCounter = this.getNextTaskId();
    this.initializeEventListeners();
    this.renderTasks();
  }

  setUser(user) {
    this.user = user;
    this.tasks = this.loadTasks();
    this.renderTasks();
  }

  // Load tasks from localStorage (user-specific)
  loadTasks() {
    if (!this.user) return [];

    try {
      const userTasksKey = `todoTasks_${this.user.id}`;
      const savedTasks = localStorage.getItem(userTasksKey);
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  // Save tasks to localStorage (user-specific)
  saveTasks() {
    if (!this.user) return;

    try {
      const userTasksKey = `todoTasks_${this.user.id}`;
      localStorage.setItem(userTasksKey, JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  // Get next available task ID (user-specific)
  getNextTaskId() {
    if (!this.user) return 1;

    const userCounterKey = `taskIdCounter_${this.user.id}`;
    const savedCounter = localStorage.getItem(userCounterKey);
    return savedCounter ? parseInt(savedCounter) + 1 : 1;
  }

  // Save task ID counter (user-specific)
  saveTaskIdCounter() {
    if (!this.user) return;

    const userCounterKey = `taskIdCounter_${this.user.id}`;
    localStorage.setItem(userCounterKey, this.taskIdCounter.toString());
  }

  // Initialize event listeners
  initializeEventListeners() {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');

    // Handle form submission
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // Handle Enter key in input
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addTask();
      }
    });

    // Add smooth focus effects
    taskInput.addEventListener('focus', () => {
      taskInput.parentElement.classList.add('focused');
    });

    taskInput.addEventListener('blur', () => {
      taskInput.parentElement.classList.remove('focused');
    });
  }

  // Add a new task
  addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();

    if (!taskText) {
      this.showInputError('Please enter a task!');
      return;
    }

    // Create new task object
    const newTask = {
      id: this.taskIdCounter++,
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add task to array
    this.tasks.unshift(newTask); // Add to beginning for newest first

    // Save to localStorage
    this.saveTasks();
    this.saveTaskIdCounter();

    // Clear input with smooth animation
    this.clearInput(taskInput);

    // Render tasks with animation
    this.renderTasks();

    // Show success feedback
    this.showSuccessFeedback();
  }

  // Clear input with smooth animation
  clearInput(input) {
    input.style.transform = 'scale(0.98)';
    setTimeout(() => {
      input.value = '';
      input.style.transform = 'scale(1)';
      input.focus();
    }, 150);
  }

  // Show input error
  showInputError(message) {
    const taskInput = document.getElementById('task-input');
    const originalPlaceholder = taskInput.placeholder;

    taskInput.style.borderColor = '#f44336';
    taskInput.placeholder = message;
    taskInput.style.animation = 'shake 0.5s ease-in-out';

    setTimeout(() => {
      taskInput.style.borderColor = '';
      taskInput.placeholder = originalPlaceholder;
      taskInput.style.animation = '';
      taskInput.focus();
    }, 2000);
  }

  // Show success feedback
  showSuccessFeedback() {
    const button = document.querySelector('.gradient-button');
    const originalText = button.textContent;

    button.textContent = '✓ Added!';
    button.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 1000);
  }

  // Render all tasks
  renderTasks() {
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');

    // Clear existing tasks
    taskList.innerHTML = '';

    if (this.tasks.length === 0) {
      // Show empty state
      emptyState.hidden = false;
      taskList.hidden = true;
    } else {
      // Hide empty state and show tasks
      emptyState.hidden = true;
      taskList.hidden = false;

      // Render each task
      this.tasks.forEach((task, index) => {
        const taskElement = this.createTaskElement(task, index);
        taskList.appendChild(taskElement);
      });
    }
  }

  // Create a task element
  createTaskElement(task, index) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.style.animationDelay = `${index * 0.1}s`;

    li.innerHTML = `
      <div class="task-content" ${task.completed ? '' : 'contenteditable="true"'}>
        ${this.escapeHtml(task.text)}
      </div>
      <div class="task-actions">
        <button class="task-btn complete-btn" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}" data-id="${task.id}">
          ${task.completed ? '↶' : '✓'}
        </button>
        <button class="task-btn edit-btn" title="Edit task" data-id="${task.id}">
          ✎
        </button>
        <button class="task-btn delete-btn" title="Delete task" data-id="${task.id}">
          ✕
        </button>
      </div>
    `;

    // Add event listeners for task actions
    this.addTaskEventListeners(li, task);

    return li;
  }

  // Add event listeners to task element
  addTaskEventListeners(taskElement, task) {
    const completeBtn = taskElement.querySelector('.complete-btn');
    const editBtn = taskElement.querySelector('.edit-btn');
    const deleteBtn = taskElement.querySelector('.delete-btn');
    const taskContent = taskElement.querySelector('.task-content');

    // Complete/Incomplete toggle
    completeBtn.addEventListener('click', () => {
      this.toggleTaskComplete(task.id);
    });

    // Edit task
    editBtn.addEventListener('click', () => {
      this.editTask(task.id, taskContent);
    });

    // Delete task
    deleteBtn.addEventListener('click', () => {
      this.deleteTask(task.id, taskElement);
    });

    // Handle content editing
    if (!task.completed) {
      taskContent.addEventListener('blur', () => {
        this.updateTaskText(task.id, taskContent.textContent.trim());
      });

      taskContent.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          taskContent.blur();
        }
      });
    }
  }

  // Toggle task completion
  toggleTaskComplete(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.updatedAt = new Date().toISOString();
      this.saveTasks();
      this.renderTasks();
    }
  }

  // Edit task
  editTask(taskId, contentElement) {
    if (contentElement.contentEditable === 'true') {
      contentElement.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(contentElement);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  // Update task text
  updateTaskText(taskId, newText) {
    if (!newText) return;

    const task = this.tasks.find(t => t.id === taskId);
    if (task && task.text !== newText) {
      task.text = newText;
      task.updatedAt = new Date().toISOString();
      this.saveTasks();
    }
  }

  // Delete task with animation
  deleteTask(taskId, taskElement) {
    // Add delete animation
    taskElement.style.animation = 'slideOutRight 0.3s ease-in-out';
    taskElement.style.transform = 'translateX(100%)';
    taskElement.style.opacity = '0';

    setTimeout(() => {
      // Remove from array
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveTasks();
      this.renderTasks();
    }, 300);
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Clear all tasks (utility method)
  clearAllTasks() {
    if (confirm('Are you sure you want to delete all tasks?')) {
      this.tasks = [];
      this.saveTasks();
      this.renderTasks();
    }
  }

  // Export tasks (utility method)
  exportTasks() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tasks.json';
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Show loading screen initially
  showLoadingScreen();

  // Initialize authentication manager after a brief delay
  setTimeout(() => {
    window.authManager = new AuthManager();
    hideLoadingScreen();
  }, 2000); // Show loading for 2 seconds
});

// Loading screen functions
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    // Remove from DOM after transition
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// Add CSS animations for smooth interactions
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .task-content:focus {
    outline: 2px solid rgba(102, 126, 234, 0.5);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .focused {
    transform: scale(1.02);
  }

  .auth-message {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;
document.head.appendChild(style);