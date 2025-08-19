// Task Management System with Local Storage
class TaskManager {
  constructor() {
    this.tasks = this.loadTasks();
    this.taskIdCounter = this.getNextTaskId();
    this.initializeEventListeners();
    this.renderTasks();
  }

  // Load tasks from localStorage
  loadTasks() {
    try {
      const savedTasks = localStorage.getItem('todoTasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  // Save tasks to localStorage
  saveTasks() {
    try {
      localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  // Get next available task ID
  getNextTaskId() {
    const savedCounter = localStorage.getItem('taskIdCounter');
    return savedCounter ? parseInt(savedCounter) + 1 : 1;
  }

  // Save task ID counter
  saveTaskIdCounter() {
    localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
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

// Initialize the task manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.taskManager = new TaskManager();
});

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

  .task-content:focus {
    outline: 2px solid rgba(102, 126, 234, 0.5);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .focused {
    transform: scale(1.02);
  }
`;
document.head.appendChild(style);