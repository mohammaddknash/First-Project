const API_URL = "http://localhost:3000/api/expenses";

const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const highestAmount = document.getElementById("highestAmount");
const highestTitle = document.getElementById("highestTitle");
const errorAlert = document.getElementById("errorAlert");
const loadingSpinner = document.getElementById("loadingSpinner");
const expensesTableBody = document.getElementById("expensesTableBody");
const tableCount = document.getElementById("tableCount");
const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("expenseTitle");
const amountInput = document.getElementById("expenseAmount");
const categoryInput = document.getElementById("expenseCategory");
const dateInput = document.getElementById("expenseDate");
const addButton = document.getElementById("addButton");
const formMessage = document.getElementById("formMessage");
const categoryFilter = document.getElementById("categoryFilter");

let expenses = [];

const editForm = document.getElementById("editForm");
const editFields = document.getElementById("editFields");
const editTitle = document.getElementById("editTitle");
const editAmount = document.getElementById("editAmount");
const editCategory = document.getElementById("editCategory");
const editDate = document.getElementById("editDate");
const editMessage = document.getElementById("editMessage");
const editSpinner = document.getElementById("editSpinner");
const saveEditButton = document.getElementById("saveEditButton");

const editModal = new bootstrap.Modal(
  document.getElementById("editModal"),
  {
    backdrop: "static",
    keyboard: false,
  }
);

let editingExpenseId = null;



function renderSummary(list) {
  let total = 0;
  let highest = null;

  for (const expense of list) {
    total += expense.amount;

    if (highest === null || expense.amount > highest.amount) {
      highest = expense;
    }
  }

  totalAmount.textContent = total.toFixed(2);
  expenseCount.textContent = list.length;

  if (highest !== null) {
    highestAmount.textContent = highest.amount.toFixed(2);
    highestTitle.textContent = highest.title;
  } else {
    highestAmount.textContent = "0.00";
    highestTitle.textContent = "No expenses yet";
  }
}
function openEditModal(expense) {
  editingExpenseId = expense.id;

  editTitle.value = expense.title;
  editAmount.value = expense.amount;
  editCategory.value = expense.category;
  editDate.value = expense.date;

  editMessage.classList.add("d-none");

  editModal.show();
}
function renderTable(list) {
  expensesTableBody.replaceChildren();

  const categoryClasses = {
    Food: "text-bg-success",
    Transport: "text-bg-primary",
    Bills: "text-bg-warning",
    Entertainment: "text-bg-info",
    Other: "text-bg-secondary",
  };

  if (list.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.className = "text-center text-secondary py-4";
    cell.textContent = "No expenses to display.";

    row.append(cell);
    expensesTableBody.append(row);
  }

  for (const expense of list) {
    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    titleCell.className = "expense-title";
    titleCell.textContent = expense.title;

    const amountCell = document.createElement("td");
    amountCell.className = "text-end expense-amount";
    amountCell.textContent = expense.amount.toFixed(2);

    const categoryCell = document.createElement("td");
    const badge = document.createElement("span");

    const categoryClass =
      categoryClasses[expense.category] || "text-bg-secondary";

    badge.className = `badge ${categoryClass}`;
    badge.textContent = expense.category;
    categoryCell.append(badge);

    const dateCell = document.createElement("td");
    dateCell.className = "text-nowrap text-secondary";
    dateCell.textContent = expense.date;

    const actionsCell = document.createElement("td");
    actionsCell.className = "text-nowrap";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-sm btn-theme me-2";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
    openEditModal(expense);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-sm btn-outline-danger";
    deleteButton.textContent = "Delete";
   deleteButton.addEventListener("click", () => {
   deleteExpense(expense.id, deleteButton);
   });

    actionsCell.append(editButton, deleteButton);

    row.append(
      titleCell,
      amountCell,
      categoryCell,
      dateCell,
      actionsCell
    );

    expensesTableBody.append(row);
  }

  tableCount.textContent = `${list.length} expenses`;
}

async function deleteExpense(id, button) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this expense?"
  );

  if (!confirmed) {
    return;
  }

  errorAlert.classList.add("d-none");
  button.disabled = true;
  button.textContent = "Deleting...";
  loadingSpinner.classList.remove("d-none");

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to delete expense");
    }

    await refresh();
  } catch (error) {
    errorAlert.textContent =
      error instanceof TypeError
        ? "Cannot connect to the server. Make sure the backend is running."
        : error.message;

    errorAlert.classList.remove("d-none");
    errorAlert.scrollIntoView({ block: "center" });
  } finally {
    button.disabled = false;
    button.textContent = "Delete";
    loadingSpinner.classList.add("d-none");
  }
}
function applyFilter() {
  const selectedCategory = categoryFilter.value;

  let filteredExpenses = expenses;

  if (selectedCategory !== "All") {
    filteredExpenses = expenses.filter((expense) => {
      return expense.category === selectedCategory;
    });
  }

  renderTable(filteredExpenses);

  tableCount.textContent =
    `Showing ${filteredExpenses.length} of ${expenses.length} expenses`;
}
async function refresh() {
  errorAlert.classList.add("d-none");
  loadingSpinner.classList.remove("d-none");

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load expenses");
    }

    expenses = data;

renderSummary(expenses);
applyFilter();
  } catch (error) {
    errorAlert.textContent =
      error instanceof TypeError
        ? "Cannot connect to the server. Make sure the backend is running."
        : error.message;

    errorAlert.classList.remove("d-none");
  } finally {
    loadingSpinner.classList.add("d-none");
  }
}
function showFormMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `alert alert-${type}`;
}

expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  formMessage.className = "alert d-none";

  if (titleInput.value.trim() === "") {
    showFormMessage("Please enter an expense title.", "danger");
    titleInput.focus();
    return;
  }

  if (!expenseForm.checkValidity()) {
    showFormMessage(
      "Complete all fields. Amount must be between 0.01 and 99999999.99, with up to two decimal places.",
      "danger"
    );

    expenseForm.reportValidity();
    return;
  }

  const data = {
    title: titleInput.value.trim(),
    amount: Number(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value,
  };

  addButton.disabled = true;
  addButton.textContent = "Saving...";
  loadingSpinner.classList.remove("d-none");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to add expense");
    }

    expenseForm.reset();

    showFormMessage("Expense added successfully.", "success");

    await refresh();
  } catch (error) {
    showFormMessage(
      error instanceof TypeError
        ? "Cannot connect to the server. Make sure the backend is running."
        : error.message,
      "danger"
    );
  } finally {
    addButton.disabled = false;
    addButton.textContent = "Add expense";
    loadingSpinner.classList.add("d-none");
  }
});
categoryFilter.addEventListener("change", applyFilter);
editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  editMessage.classList.add("d-none");

  if (editTitle.value.trim() === "") {
    editMessage.textContent = "Please enter an expense title.";
    editMessage.classList.remove("d-none");
    editTitle.focus();
    return;
  }

  if (!editForm.checkValidity()) {
    editMessage.textContent =
      "Complete all fields. Amount must be between 0.01 and 99999999.99, with up to two decimal places.";

    editMessage.classList.remove("d-none");
    editForm.reportValidity();
    return;
  }

  const data = {
    title: editTitle.value.trim(),
    amount: Number(editAmount.value),
    category: editCategory.value,
    date: editDate.value,
  };

  editFields.disabled = true;
  saveEditButton.textContent = "Saving...";
  editSpinner.classList.remove("d-none");

  try {
    const response = await fetch(`${API_URL}/${editingExpenseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to update expense");
    }

    editModal.hide();

    await refresh();
  } catch (error) {
    editMessage.textContent =
      error instanceof TypeError
        ? "Cannot connect to the server. Make sure the backend is running."
        : error.message;

    editMessage.classList.remove("d-none");
  } finally {
    editFields.disabled = false;
    saveEditButton.textContent = "Save changes";
    editSpinner.classList.add("d-none");
  }
});
refresh();

