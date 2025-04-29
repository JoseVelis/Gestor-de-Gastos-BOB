// Funciones para la gestión de egresos

// Import necessary functions and variables
import {
    getExpenses,
    getClientNameById,
    formatDate,
    formatCurrency,
    updateClientSelectors,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
  } from "./utils.js"
  import { openModal, closeModal, showToast, updateDashboardStats } from "./helpers.js"
  
  function initExpensesPage() {
    // Cargar tabla de egresos
    loadExpensesTable()
  
    // Inicializar búsqueda y filtros
    initExpenseSearch()
  
    // Inicializar formulario de egreso
    initExpenseForm()
  
    // Botón para agregar egreso
    document.getElementById("add-expense-btn").addEventListener("click", () => {
      openAddExpenseModal()
    })
  
    // Botón para limpiar filtro de fecha
    document.getElementById("clear-expense-filter").addEventListener("click", () => {
      document.getElementById("expense-date-filter").value = ""
      loadExpensesTable()
    })
  }
  
  function loadExpensesTable(searchTerm = "", dateFilter = "") {
    let expenses = getExpenses()
  
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      expenses = expenses.filter((expense) => {
        const clientName = getClientNameById(expense.clientId).toLowerCase()
        return (
          clientName.includes(term) ||
          expense.concept.toLowerCase().includes(term) ||
          expense.method.toLowerCase().includes(term) ||
          expense.bank.toLowerCase().includes(term)
        )
      })
    }
  
    // Aplicar filtro de fecha
    if (dateFilter) {
      expenses = expenses.filter((expense) => expense.date === dateFilter)
    }
  
    // Ordenar por fecha descendente
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date))
  
    const tableBody = document.getElementById("expense-table")
    tableBody.innerHTML = ""
  
    if (expenses.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = `
              <td colspan="8" class="py-4 text-center text-gray-500">No hay egresos registrados</td>
          `
      tableBody.appendChild(row)
      return
    }
  
    expenses.forEach((expense) => {
      const clientName = getClientNameById(expense.clientId)
      const row = document.createElement("tr")
  
      row.innerHTML = `
              <td class="py-2 px-4">${formatDate(expense.date)}</td>
              <td class="py-2 px-4">${clientName}</td>
              <td class="py-2 px-4">${expense.method}</td>
              <td class="py-2 px-4">${expense.bank}</td>
              <td class="py-2 px-4">${expense.currency === "PEN" ? "Soles (S/)" : "Dólares ($)"}</td>
              <td class="py-2 px-4 text-red-600 font-bold">${formatCurrency(expense.amount, expense.currency)}</td>
              <td class="py-2 px-4">${expense.concept}</td>
              <td class="py-2 px-4">
                  <button class="text-blue-600 hover:text-blue-800 mr-2 edit-expense" data-id="${expense.id}">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button class="text-red-600 hover:text-red-800 delete-expense" data-id="${expense.id}">
                      <i class="fas fa-trash"></i>
                  </button>
              </td>
          `
  
      tableBody.appendChild(row)
    })
  
    // Agregar eventos a los botones de editar y eliminar
    document.querySelectorAll(".edit-expense").forEach((button) => {
      button.addEventListener("click", function () {
        const expenseId = this.getAttribute("data-id")
        openEditExpenseModal(expenseId)
      })
    })
  
    document.querySelectorAll(".delete-expense").forEach((button) => {
      button.addEventListener("click", function () {
        const expenseId = this.getAttribute("data-id")
        openDeleteExpenseModal(expenseId)
      })
    })
  }
  
  function initExpenseSearch() {
    const searchInput = document.getElementById("expense-search")
    const dateFilter = document.getElementById("expense-date-filter")
  
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value
      const dateValue = dateFilter.value
      loadExpensesTable(searchTerm, dateValue)
    })
  
    dateFilter.addEventListener("change", function () {
      const dateValue = this.value
      const searchTerm = searchInput.value
      loadExpensesTable(searchTerm, dateValue)
    })
  }
  
  function initExpenseForm() {
    // Actualizar selector de clientes
    updateClientSelectors()
  
    // Establecer fecha actual por defecto
    document.getElementById("expense-date").valueAsDate = new Date()
  
    const expenseForm = document.getElementById("expense-form")
  
    expenseForm.addEventListener("submit", (e) => {
      e.preventDefault()
  
      const expenseId = document.getElementById("expense-id").value
      const expenseData = {
        clientId: document.getElementById("expense-client").value,
        date: document.getElementById("expense-date").value,
        method: document.getElementById("expense-method").value,
        bank: document.getElementById("expense-bank").value,
        currency: document.getElementById("expense-currency").value,
        amount: document.getElementById("expense-amount").value,
        concept: document.getElementById("expense-concept").value,
      }
  
      if (expenseId) {
        // Actualizar egreso existente
        expenseData.id = expenseId
        updateExpense(expenseData)
        showToast("Egreso actualizado correctamente", "success")
      } else {
        // Agregar nuevo egreso
        addExpense(expenseData)
        showToast("Egreso agregado correctamente", "success")
      }
  
      closeModal("expense-modal")
      loadExpensesTable()
      updateDashboardStats()
    })
  }
  
  function openAddExpenseModal() {
    // Limpiar formulario
    document.getElementById("expense-id").value = ""
    document.getElementById("expense-date").valueAsDate = new Date()
    document.getElementById("expense-client").value = document.getElementById("expense-client").options[0]?.value || ""
    document.getElementById("expense-method").value = "Transferencia"
    document.getElementById("expense-bank").value = "BCP"
    document.getElementById("expense-currency").value = "PEN"
    document.getElementById("expense-amount").value = ""
    document.getElementById("expense-concept").value = ""
  
    // Cambiar título
    document.getElementById("expense-modal-title").textContent = "Nuevo Egreso"
  
    // Abrir modal
    openModal("expense-modal")
  }
  
  function openEditExpenseModal(expenseId) {
    const expense = getExpenseById(expenseId)
  
    if (expense) {
      // Llenar formulario con datos del egreso
      document.getElementById("expense-id").value = expense.id
      document.getElementById("expense-date").value = expense.date
      document.getElementById("expense-client").value = expense.clientId
      document.getElementById("expense-method").value = expense.method
      document.getElementById("expense-bank").value = expense.bank
      document.getElementById("expense-currency").value = expense.currency
      document.getElementById("expense-amount").value = expense.amount
      document.getElementById("expense-concept").value = expense.concept
  
      // Cambiar título
      document.getElementById("expense-modal-title").textContent = "Editar Egreso"
  
      // Abrir modal
      openModal("expense-modal")
    }
  }
  
  function openDeleteExpenseModal(expenseId) {
    // Guardar ID del egreso a eliminar
    document.getElementById("confirm-delete").setAttribute("data-id", expenseId)
    document.getElementById("confirm-delete").setAttribute("data-type", "expense")
  
    // Abrir modal de confirmación
    openModal("delete-modal")
  
    // Configurar evento para el botón de confirmar
    document.getElementById("confirm-delete").onclick = function () {
      const id = this.getAttribute("data-id")
      const type = this.getAttribute("data-type")
  
      if (type === "expense") {
        deleteExpense(id)
        showToast("Egreso eliminado correctamente", "success")
        loadExpensesTable()
        updateDashboardStats()
      }
  
      closeModal("delete-modal")
    }
  }
  