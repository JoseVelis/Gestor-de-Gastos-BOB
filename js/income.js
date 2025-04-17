// Funciones para la gestión de ingresos

// Importar funciones y variables necesarias desde otros módulos
import {
    getIncomes,
    getClientNameById,
    formatDate,
    formatCurrency,
    updateClientSelectors,
    addIncome,
    updateIncome,
    deleteIncome,
    showToast,
    openModal,
    closeModal,
    updateDashboardStats,
    getIncomeById,
  } from "./utils.js"
  
  function initIncomePage() {
    // Cargar tabla de ingresos
    loadIncomeTable()
  
    // Inicializar búsqueda y filtros
    initIncomeSearch()
  
    // Inicializar formulario de ingreso
    initIncomeForm()
  
    // Botón para agregar ingreso
    const addIncomeBtn = document.getElementById("add-income-btn")
    if (addIncomeBtn) {
      addIncomeBtn.addEventListener("click", () => {
        openAddIncomeModal()
      })
    }
  
    // Botón para limpiar filtro de fecha
    const clearIncomeFilterBtn = document.getElementById("clear-income-filter")
    if (clearIncomeFilterBtn) {
      clearIncomeFilterBtn.addEventListener("click", () => {
        const dateFilter = document.getElementById("income-date-filter")
        if (dateFilter) dateFilter.value = ""
        loadIncomeTable()
      })
    }
  }
  
  function loadIncomeTable(searchTerm = "", dateFilter = "") {
    let incomes = getIncomes()
  
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      incomes = incomes.filter((income) => {
        const clientName = getClientNameById(income.clientId).toLowerCase()
        return (
          clientName.includes(term) ||
          income.concept.toLowerCase().includes(term) ||
          income.method.toLowerCase().includes(term) ||
          income.bank.toLowerCase().includes(term)
        )
      })
    }
  
    // Aplicar filtro de fecha
    if (dateFilter) {
      incomes = incomes.filter((income) => income.date === dateFilter)
    }
  
    // Ordenar por fecha descendente
    incomes.sort((a, b) => new Date(b.date) - new Date(a.date))
  
    const tableBody = document.getElementById("income-table")
    if (!tableBody) return
  
    tableBody.innerHTML = ""
  
    if (incomes.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = `
              <td colspan="8" class="py-4 text-center text-gray-500">No hay ingresos registrados</td>
          `
      tableBody.appendChild(row)
      return
    }
  
    incomes.forEach((income) => {
      const clientName = getClientNameById(income.clientId)
      const row = document.createElement("tr")
  
      row.innerHTML = `
              <td class="py-2 px-4">${formatDate(income.date)}</td>
              <td class="py-2 px-4">${clientName}</td>
              <td class="py-2 px-4">${income.method}</td>
              <td class="py-2 px-4">${income.bank}</td>
              <td class="py-2 px-4">${income.currency === "PEN" ? "Soles (S/)" : "Dólares ($)"}</td>
              <td class="py-2 px-4 text-green-600 font-bold">${formatCurrency(income.amount, income.currency)}</td>
              <td class="py-2 px-4">${income.concept}</td>
              <td class="py-2 px-4">
                  <button class="text-blue-600 hover:text-blue-800 mr-2 edit-income" data-id="${income.id}">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button class="text-red-600 hover:text-red-800 delete-income" data-id="${income.id}">
                      <i class="fas fa-trash"></i>
                  </button>
              </td>
          `
  
      tableBody.appendChild(row)
    })
  
    // Agregar eventos a los botones de editar y eliminar
    document.querySelectorAll(".edit-income").forEach((button) => {
      button.addEventListener("click", function () {
        const incomeId = this.getAttribute("data-id")
        openEditIncomeModal(incomeId)
      })
    })
  
    document.querySelectorAll(".delete-income").forEach((button) => {
      button.addEventListener("click", function () {
        const incomeId = this.getAttribute("data-id")
        openDeleteIncomeModal(incomeId)
      })
    })
  }
  
  function initIncomeSearch() {
    const searchInput = document.getElementById("income-search")
    const dateFilter = document.getElementById("income-date-filter")
  
    if (!searchInput || !dateFilter) return
  
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value
      const dateValue = dateFilter.value
      loadIncomeTable(searchTerm, dateValue)
    })
  
    dateFilter.addEventListener("change", function () {
      const dateValue = this.value
      const searchTerm = searchInput.value
      loadIncomeTable(searchTerm, dateValue)
    })
  }
  
  function initIncomeForm() {
    // Actualizar selector de clientes
    updateClientSelectors()
  
    // Establecer fecha actual por defecto
    const incomeDateInput = document.getElementById("income-date")
    if (incomeDateInput) incomeDateInput.valueAsDate = new Date()
  
    const incomeForm = document.getElementById("income-form")
    if (!incomeForm) return
  
    incomeForm.addEventListener("submit", (e) => {
      e.preventDefault()
  
      const incomeId = document.getElementById("income-id").value
      const incomeData = {
        clientId: document.getElementById("income-client").value,
        date: document.getElementById("income-date").value,
        method: document.getElementById("income-method").value,
        bank: document.getElementById("income-bank").value,
        currency: document.getElementById("income-currency").value,
        amount: document.getElementById("income-amount").value,
        concept: document.getElementById("income-concept").value,
      }
  
      if (incomeId) {
        // Actualizar ingreso existente
        incomeData.id = incomeId
        updateIncome(incomeData)
        showToast("Ingreso actualizado correctamente", "success")
      } else {
        // Agregar nuevo ingreso
        addIncome(incomeData)
        showToast("Ingreso agregado correctamente", "success")
      }
  
      closeModal("income-modal")
      loadIncomeTable()
      updateDashboardStats()
    })
  }
  
  function openAddIncomeModal() {
    // Limpiar formulario
    const incomeIdInput = document.getElementById("income-id")
    const incomeDateInput = document.getElementById("income-date")
    const incomeClientInput = document.getElementById("income-client")
    const incomeMethodInput = document.getElementById("income-method")
    const incomeBankInput = document.getElementById("income-bank")
    const incomeCurrencyInput = document.getElementById("income-currency")
    const incomeAmountInput = document.getElementById("income-amount")
    const incomeConceptInput = document.getElementById("income-concept")
    const incomeModalTitle = document.getElementById("income-modal-title")
  
    if (incomeIdInput) incomeIdInput.value = ""
    if (incomeDateInput) incomeDateInput.valueAsDate = new Date()
    if (incomeClientInput && incomeClientInput.options.length > 0)
      incomeClientInput.value = incomeClientInput.options[0].value
    if (incomeMethodInput) incomeMethodInput.value = "Transferencia"
    if (incomeBankInput) incomeBankInput.value = "BCP"
    if (incomeCurrencyInput) incomeCurrencyInput.value = "PEN"
    if (incomeAmountInput) incomeAmountInput.value = ""
    if (incomeConceptInput) incomeConceptInput.value = ""
  
    // Cambiar título
    if (incomeModalTitle) incomeModalTitle.textContent = "Nuevo Ingreso"
  
    // Abrir modal
    openModal("income-modal")
  }
  
  function openEditIncomeModal(incomeId) {
    const income = getIncomeById(incomeId)
  
    if (income) {
      // Llenar formulario con datos del ingreso
      const incomeIdInput = document.getElementById("income-id")
      const incomeDateInput = document.getElementById("income-date")
      const incomeClientInput = document.getElementById("income-client")
      const incomeMethodInput = document.getElementById("income-method")
      const incomeBankInput = document.getElementById("income-bank")
      const incomeCurrencyInput = document.getElementById("income-currency")
      const incomeAmountInput = document.getElementById("income-amount")
      const incomeConceptInput = document.getElementById("income-concept")
      const incomeModalTitle = document.getElementById("income-modal-title")
  
      if (incomeIdInput) incomeIdInput.value = income.id
      if (incomeDateInput) incomeDateInput.value = income.date
      if (incomeClientInput) incomeClientInput.value = income.clientId
      if (incomeMethodInput) incomeMethodInput.value = income.method
      if (incomeBankInput) incomeBankInput.value = income.bank
      if (incomeCurrencyInput) incomeCurrencyInput.value = income.currency
      if (incomeAmountInput) incomeAmountInput.value = income.amount
      if (incomeConceptInput) incomeConceptInput.value = income.concept
  
      // Cambiar título
      if (incomeModalTitle) incomeModalTitle.textContent = "Editar Ingreso"
  
      // Abrir modal
      openModal("income-modal")
    }
  }
  
  function openDeleteIncomeModal(incomeId) {
    // Guardar ID del ingreso a eliminar
    const confirmDeleteBtn = document.getElementById("confirm-delete")
    if (confirmDeleteBtn) {
      confirmDeleteBtn.setAttribute("data-id", incomeId)
      confirmDeleteBtn.setAttribute("data-type", "income")
  
      // Configurar evento para el botón de confirmar
      confirmDeleteBtn.onclick = function () {
        const id = this.getAttribute("data-id")
        const type = this.getAttribute("data-type")
  
        if (type === "income") {
          deleteIncome(id)
          showToast("Ingreso eliminado correctamente", "success")
          loadIncomeTable()
          updateDashboardStats()
        }
  
        closeModal("delete-modal")
      }
    }
  
    // Abrir modal de confirmación
    openModal("delete-modal")
  }
  