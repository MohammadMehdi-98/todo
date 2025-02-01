const addButton = document.getElementById("add-btn");
const listInput = document.getElementById("input");

function addTasks() {
  addButton.addEventListener("click", () => {
    const item = listInput.value.trim();
    if (item) {
      listInput.value = "";
      const todoItems = !localStorage.getItem("todoItems")
        ? []
        : JSON.parse(localStorage.getItem("todoItems"));
      const currentItem = {
        id: Date.now(), // Use a timestamp as a unique identifier
        item: item,
        isCompleted: false
      };
      todoItems.push(currentItem);
      localStorage.setItem("todoItems", JSON.stringify(todoItems));
      console.log(currentItem);
      createToDoElements([currentItem], true); // Add the new task to the list
    }
  });
}
document.addEventListener("DOMContentLoaded", addTasks);

// Check for saved theme in local storage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.classList.add(savedTheme);
  const svg = document.querySelectorAll("#theme svg");
  if (savedTheme === 'dark') {
    svg[0].classList.add("hidden");
    svg[1].classList.remove("hidden");
  } else {
    svg[0].classList.remove("hidden");
    svg[1].classList.add("hidden");
  }
}

// Toggle theme and save preference
document.getElementById('theme').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);

  // Toggle the visibility of the sun/moon icons
  const svg = document.querySelectorAll("#theme svg");
  svg.forEach((svg) => {
    svg.classList.toggle("hidden");
  });
});

// Function to save the state to localStorage
function saveState(span) {
  const isActive = span.classList.contains('bg-green-500');
  localStorage.setItem(span.id, isActive);
}

// Function to load the state from localStorage
function loadState(span) {
  const isActive = localStorage.getItem(span.id) === 'true';
  if (isActive) {
    span.classList.remove('bg-green-100');
    span.classList.add('bg-green-500');
  } else {
    span.classList.remove('bg-green-500');
    span.classList.add('bg-green-100');
  }
}

// Function to create to-do elements
function createToDoElements(todoArray, isNew = false) {
  if (!todoArray) {
    return null;
  }
  todoArray.forEach((item, index) => {
    const list = document.getElementById('list');
    const div = document.createElement('div');
    const check = document.createElement('span');
    const tasks = document.createElement('li');
    const deleteBtn = document.createElement('button');
    const editBtn = document.createElement('button'); // Create edit button

    list.classList.add('bg-red-200', 'p-8', 'rounded-xl', 'shadow-lg', 'w-full', 'md:w-3/4', 'lg:w-3/4', 'dark:text-white', 'dark:bg-darkMode', 'dark:border-x-4', 'flex', 'flex-col', 'text-lg');
    div.classList.add('flex', 'items-center', 'mb-3', 'gap-1', 'pb-2', 'border-b', 'border-gray-700', 'dark:border-gray-100');
    div.setAttribute('draggable', 'true'); // Make the div draggable
    check.classList.add('mr-2', 'cursor-pointer', 'size-4', 'md:size-5', 'lg:size-6', 'rounded-full', 'bg-green-100', 'inline-block');
    tasks.classList.add('text-sm', 'md:text-lg', 'cursor-grabbing', 'select-none');
    deleteBtn.classList.add('ml-2', 'text-black', 'dark:text-white', 'cursor-pointer', 'text-2xl');
    editBtn.classList.add('ml-auto', 'text-black', 'dark:text-white', 'cursor-pointer', 'text-xl'); // Style edit button

    // Set the text content of the tasks element
    tasks.textContent = item.item;
    deleteBtn.textContent = 'x';
    editBtn.textContent = '✏️'; // Set edit button icon

    // Assign a unique ID to each span using the task's unique identifier
    check.id = `span-${item.id}`;

    // Load the state from localStorage if not a new task
    if (!isNew) {
      loadState(check);
      if (check.classList.contains('bg-green-500')) {
        tasks.classList.add('line-through', 'opacity-50');
      }
    }

    // Toggle classes and save state on click
    check.addEventListener('click', () => {
      check.classList.toggle('bg-green-100');
      check.classList.toggle('bg-green-500');
      tasks.classList.toggle('line-through');
      tasks.classList.toggle('opacity-50');
      saveState(check);
    });

    // Edit task on click
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent default behavior
      const editForm = document.createElement('div');
      editForm.classList.add('fixed', 'inset-0', 'bg-gray-600', 'bg-opacity-50', 'flex', 'justify-center', 'items-center');
      editForm.innerHTML = `
        <div class="bg-gradient-to-r from-blue-400 to-purple-500 dark:from-gray-700 dark:to-gray-900 p-6 rounded-lg shadow-lg w-3/4 md:w-1/2 lg:w-1/3">
          <h2 class="text-xl mb-4">Edit your task</h2>
          <input type="text" id="edit-input" class="w-full p-2 border rounded" value="${tasks.textContent}">
          <div class="flex justify-end mt-4">
            <button id="cancel-edit" class="bg-red-500 text-white px-4 py-2 rounded mr-2">Close</button>
            <button id="save-edit" class="bg-green-500 text-white px-4 py-2 rounded">Save</button>
          </div>
        </div>
      `;
      document.body.appendChild(editForm);

      const editInput = document.getElementById('edit-input');
      // Function to close the form
    const closeEditForm = () => {
      document.body.removeChild(editForm);
      document.removeEventListener("keydown", escKeyListener); // Remove Esc key listener when form closes
  };
      const saveEdit = () => {
        const newTask = editInput.value.trim();
        if (newTask) {
          tasks.textContent = newTask;
          const todoItems = JSON.parse(localStorage.getItem("todoItems"));
          const updatedItems = todoItems.map(todo => {
            if (todo.id === item.id) {
              todo.item = newTask;
            }
            return todo;
          });
          localStorage.setItem("todoItems", JSON.stringify(updatedItems));
          saveOrder(); // Save the new order
          document.body.removeChild(editForm); // Close the form after saving
        } else {
          alert('You need to write something!');
        }
      };

      const cancelEdit = () => {
        document.body.removeChild(editForm);
      };
      // Function to handle Escape key
    const escKeyListener = (e) => {
      if (e.key === "Escape") {
          closeEditForm();
      }
  };

  // Listen for Escape key globally
  document.addEventListener("keydown", escKeyListener);

  document.getElementById("cancel-edit").addEventListener("click", closeEditForm);
  document.getElementById("save-edit").addEventListener("click", saveEdit);
      document.getElementById('cancel-edit').addEventListener('click', cancelEdit);

      document.getElementById('save-edit').addEventListener('click', saveEdit);

      // Save changes when Enter key is pressed
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveEdit();
        }
      });

      // Close the form when clicking outside of it
      editForm.addEventListener('click', (e) => {
        if (e.target === editForm) {
          cancelEdit();
        }
      });
    });

    // Delete task on click
    deleteBtn.addEventListener('click', () => {
      Swal.fire({
        title: 'Delete Task',
        html: `Are you sure you want to delete this task?<br><strong>${tasks.innerHTML}</strong>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
          confirmButton: 'bg-red-500 text-white',
          cancelButton: 'bg-gray-300 text-black'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const todoItems = JSON.parse(localStorage.getItem("todoItems"));
          const updatedItems = todoItems.filter(todo => todo.id !== item.id);
          localStorage.setItem("todoItems", JSON.stringify(updatedItems));
          list.removeChild(div);
          Swal.fire(
            'Deleted!',
            'Your task has been deleted.',
            'success'
          );
        }
      });
    });

    // Append elements to their respective parents
    list.appendChild(div);
    div.appendChild(check);
    div.appendChild(tasks);
    div.appendChild(editBtn); // Append edit button
    div.appendChild(deleteBtn);
  });
}

// Load to-do items from localStorage and create elements
createToDoElements(JSON.parse(localStorage.getItem("todoItems")));

// Function to show only checked items
function showCheckedItems() {
  const todoItems = JSON.parse(localStorage.getItem("todoItems"));
  const checkedItems = todoItems.filter(item => {
    const isActive = localStorage.getItem(`span-${item.id}`) === 'true';
    return isActive;
  });
  document.getElementById('list').innerHTML = '';
  createToDoElements(checkedItems);
}

// Function to show only in-progress items
function showInProgressItems() {
  const todoItems = JSON.parse(localStorage.getItem("todoItems"));
  const inProgressItems = todoItems.filter(item => {
    const isActive = localStorage.getItem(`span-${item.id}`) === 'true';
    return !isActive;
  });
  document.getElementById('list').innerHTML = '';
  createToDoElements(inProgressItems);
}

// Function to show all items
function showAllItems() {
  const todoItems = JSON.parse(localStorage.getItem("todoItems"));
  document.getElementById('list').innerHTML = '';
  createToDoElements(todoItems);
}

// Function to delete active items
function deleteActiveItems() {
  let todoItems = JSON.parse(localStorage.getItem("todoItems"));
  todoItems = todoItems.filter(item => {
    const isActive = localStorage.getItem(`span-${item.id}`) === 'true';
    return !isActive;
  });
  localStorage.setItem("todoItems", JSON.stringify(todoItems));
  document.getElementById('list').innerHTML = '';
  createToDoElements(todoItems);
}

// Add functionality for footer buttons
document.getElementById('all-btn').addEventListener('click', showAllItems);
document.getElementById('active-btn').addEventListener('click', showCheckedItems);
document.getElementById('in-progress-btn').addEventListener('click', showInProgressItems);
document.getElementById('delete-active-btn').addEventListener('click', function() {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteActiveItems();
            Swal.fire(
                'Deleted!',
                'Your completed tasks have been deleted.',
                'success'
            );
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("list");
    
    taskList.addEventListener("dragstart", (e) => {
        e.target.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move"; // Set the effect to move
    });

    taskList.addEventListener("dragend", (e) => {
        e.target.classList.remove("dragging");
        saveOrder(); // Save order to local storage
    });

    taskList.addEventListener("dragover", (e) => {
        e.preventDefault(); // Prevent default to allow drop
        const draggingItem = document.querySelector(".dragging");
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggingItem);
        } else {
            taskList.insertBefore(draggingItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const elements = [...container.querySelectorAll("div:not(.dragging)")];
        return elements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function saveOrder() {
        const items = [...taskList.children].map(item => {
            const taskText = item.querySelector('li').textContent;
            const taskId = item.querySelector('span').id.split('-')[1];
            return { id: taskId, text: taskText };
        });
        localStorage.setItem("taskOrder", JSON.stringify(items));
    }

    function loadOrder() {
        const savedOrder = JSON.parse(localStorage.getItem("taskOrder"));
        if (savedOrder) {
            taskList.innerHTML = "";
            savedOrder.forEach(task => {
                const todoItems = JSON.parse(localStorage.getItem("todoItems"));
                const currentItem = todoItems.find(item => item.id == task.id);
                createToDoElements([currentItem]);
            });
        }
    }

    loadOrder();
});

