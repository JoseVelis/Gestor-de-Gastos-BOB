// Funciones principales y navegación

// Declarar las funciones loadSampleData, initClientsPage, initIncomePage, initExpensesPage, initReportsPage
function loadSampleData() {}
function initClientsPage() {}
function initIncomePage() {}
function initExpensesPage() {}
function initReportsPage() {}

// Mock data functions (replace with actual data fetching)
function getClients() {
  // Replace with actual data fetching logic
  const clients = localStorage.getItem("bobClients")
  return clients ? JSON.parse(clients) : []
}

function calculateTotalBalance() {
  // Replace with actual calculation logic
  const incomes = getIncomes()
  const expenses = getExpenses()

  const totalIncome = incomes.reduce((sum, income) => sum + Number.parseFloat(income.amount || 0), 0)
  const totalExpense = expenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount || 0), 0)

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  }
}

function formatCurrency(amount, currency = "USD") {
  // Replace with actual formatting logic
  const symbol = currency === "PEN" ? "S/ " : "$ "
  return symbol + Number.parseFloat(amount || 0).toFixed(2)
}

function calculateClientBalance(clientId) {
  const transactions = getClientTransactions(clientId)

  let totalIncome = 0
  let totalExpense = 0

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalIncome += Number.parseFloat(transaction.amount || 0)
    } else {
      totalExpense += Number.parseFloat(transaction.amount || 0)
    }
  })

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  }
}

function getClientBalances() {
  // Replace with actual data fetching and calculation logic
  const clients = getClients()
  const balances = []

  clients.forEach((client) => {
    const balance = calculateClientBalance(client.id)
    balances.push({
      clientId: client.id,
      clientName: client.name,
      ...balance,
    })
  })

  return balances
}

function getAllTransactions() {
  // Replace with actual data fetching logic
  const incomes = getIncomes()
  const expenses = getExpenses()

  return [...incomes, ...expenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
}

function getClientNameById(clientId) {
  const client = getClientById(clientId)
  return client ? client.name : "Cliente Desconocido"
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos de ejemplo si no existen
  loadSampleData()

  // Inicializar la aplicación
  initNavigation()
  initMobileMenu()
  initModals()

  // Cargar datos iniciales
  updateDashboardStats()

  // Inicializar páginas
  initClientsPage()
  initIncomePage()
  initExpensesPage()
  initReportsPage()
})

// Navegación
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link")

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Remover clase active de todos los enlaces
      navLinks.forEach((l) => l.classList.remove("active"))

      // Agregar clase active al enlace clickeado
      this.classList.add("active")

      // Obtener la página a mostrar
      const page = this.getAttribute("data-page")
      showPage(page)

      // Cerrar menú móvil si está abierto
      document.getElementById("mobile-menu").classList.add("hidden")
    })
  })
}

function showPage(pageId) {
  // Ocultar todas las páginas
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden")
    page.classList.remove("active")
  })

  // Mostrar la página seleccionada
  const selectedPage = document.getElementById(`${pageId}-page`)
  if (selectedPage) {
    selectedPage.classList.remove("hidden")
    selectedPage.classList.add("active")
  }
}

// Menú móvil
function initMobileMenu() {
  const menuButton = document.getElementById("mobile-menu-button")
  const mobileMenu = document.getElementById("mobile-menu")

  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden")
  })
}

// Modales
function initModals() {
  // Cerrar modales
  document.querySelectorAll(".modal-close").forEach((button) => {
    button.addEventListener("click", function () {
      const modalId = this.getAttribute("data-modal")
      closeModal(modalId)
    })
  })

  // Cerrar modal al hacer clic fuera
  document.querySelectorAll('[id$="-modal"]').forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal(this.id)
      }
    })
  })
}

function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("hidden")
    document.body.style.overflow = "hidden" // Evitar scroll en el fondo
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.add("hidden")
    document.body.style.overflow = "" // Restaurar scroll
  }
}

// Notificaciones Toast
function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  const toastMessage = document.getElementById("toast-message")
  const toastIcon = document.getElementById("toast-icon")

  // Configurar icono según el tipo
  if (type === "success") {
    toastIcon.className = "fas fa-check-circle text-green-500"
  } else if (type === "error") {
    toastIcon.className = "fas fa-exclamation-circle text-red-500"
  } else if (type === "info") {
    toastIcon.className = "fas fa-info-circle text-blue-500"
  }

  // Establecer mensaje
  toastMessage.textContent = message

  // Mostrar toast
  toast.classList.remove("translate-y-20", "opacity-0")

  // Ocultar después de 3 segundos
  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0")
  }, 3000)
}

// Actualizar estadísticas del dashboard
function updateDashboardStats() {
  // Actualizar contadores
  document.getElementById("total-clients").textContent = getClients().length

  const totalBalance = calculateTotalBalance()
  document.getElementById("total-income").textContent = formatCurrency(totalBalance.totalIncome)
  document.getElementById("total-expenses").textContent = formatCurrency(totalBalance.totalExpense)

  // Actualizar tabla de clientes con mayor balance
  updateTopClientsTable()

  // Actualizar tabla de actividad reciente
  updateRecentActivityTable()
}

function updateTopClientsTable() {
  const balances = getClientBalances()

  // Ordenar por balance descendente
  balances.sort((a, b) => b.balance - a.balance)

  // Tomar los primeros 5
  const topClients = balances.slice(0, 5)

  const tableBody = document.getElementById("top-clients-table")
  tableBody.innerHTML = ""

  if (topClients.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td colspan="4" class="py-4 text-center text-gray-500">No hay clientes registrados</td>
        `
    tableBody.appendChild(row)
    return
  }

  topClients.forEach((client) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td class="py-2 px-4">${client.clientName}</td>
            <td class="py-2 px-4 text-green-600">${formatCurrency(client.totalIncome)}</td>
            <td class="py-2 px-4 text-red-600">${formatCurrency(client.totalExpense)}</td>
            <td class="py-2 px-4 font-bold ${client.balance >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(client.balance)}</td>
        `
    tableBody.appendChild(row)
  })
}

function updateRecentActivityTable() {
  const transactions = getAllTransactions()

  // Ordenar por fecha descendente
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date))

  // Tomar las primeras 10
  const recentActivity = transactions.slice(0, 10)

  const tableBody = document.getElementById("recent-activity-table")
  tableBody.innerHTML = ""

  if (recentActivity.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td colspan="5" class="py-4 text-center text-gray-500">No hay actividad reciente</td>
        `
    tableBody.appendChild(row)
    return
  }

  recentActivity.forEach((transaction) => {
    const row = document.createElement("tr")
    const clientName = getClientNameById(transaction.clientId)
    const isIncome = transaction.type === "income"

    row.innerHTML = `
            <td class="py-2 px-4">${formatDate(transaction.date)}</td>
            <td class="py-2 px-4">${clientName}</td>
            <td class="py-2 px-4">
                <span class="px-2 py-1 rounded-full text-xs ${isIncome ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}">
                    ${isIncome ? "Ingreso" : "Egreso"}
                </span>
            </td>
            <td class="py-2 px-4 ${isIncome ? "text-green-600" : "text-red-600"}">${formatCurrency(transaction.amount, transaction.currency)}</td>
            <td class="py-2 px-4">${transaction.concept}</td>
        `
    tableBody.appendChild(row)
  })
}

// Funciones para gestionar los datos
function getIncomes() {
  const incomes = localStorage.getItem("bobIncomes")
  return incomes ? JSON.parse(incomes) : []
}

function getExpenses() {
  const expenses = localStorage.getItem("bobExpenses")
  return expenses ? JSON.parse(expenses) : []
}

function getClientById(id) {
  const clients = getClients()
  return clients.find((client) => client.id === id) || null
}

function getClientTransactions(clientId) {
  const transactions = getAllTransactions()
  return transactions.filter((transaction) => transaction.clientId === clientId)
}

function addClient(client) {
  const clients = getClients()
  client.id = generateId()
  client.createdAt = new Date().toISOString()
  clients.push(client)
  saveClients(clients)
  return client
}

function updateClient(client) {
  const clients = getClients()
  const index = clients.findIndex((c) => c.id === client.id)
  if (index !== -1) {
    clients[index] = { ...clients[index], ...client }
    saveClients(clients)
    return clients[index]
  }
  return null
}

function deleteClient(id) {
  const clients = getClients()
  const newClients = clients.filter((client) => client.id !== id)
  saveClients(newClients)

  // También eliminar ingresos y egresos asociados
  const incomes = getIncomes().filter((income) => income.clientId !== id)
  saveIncomes(incomes)

  const expenses = getExpenses().filter((expense) => expense.clientId !== id)
  saveExpenses(expenses)
}

function saveClients(clients) {
  localStorage.setItem("bobClients", JSON.stringify(clients))
}

function addIncome(income) {
  const incomes = getIncomes()
  income.id = generateId()
  income.createdAt = new Date().toISOString()
  income.type = "income"
  incomes.push(income)
  saveIncomes(incomes)
  return income
}

function updateIncome(income) {
  const incomes = getIncomes()
  const index = incomes.findIndex((i) => i.id === income.id)
  if (index !== -1) {
    incomes[index] = { ...incomes[index], ...income }
    saveIncomes(incomes)
    return incomes[index]
  }
  return null
}

function deleteIncome(id) {
  const incomes = getIncomes()
  const newIncomes = incomes.filter((income) => income.id !== id)
  saveIncomes(newIncomes)
}

function saveIncomes(incomes) {
  localStorage.setItem("bobIncomes", JSON.stringify(incomes))
}

function getIncomeById(id) {
  const incomes = getIncomes()
  return incomes.find((income) => income.id === id) || null
}

function addExpense(expense) {
  const expenses = getExpenses()
  expense.id = generateId()
  expense.createdAt = new Date().toISOString()
  expense.type = "expense"
  expenses.push(expense)
  saveExpenses(expenses)
  return expense
}

function updateExpense(expense) {
  const expenses = getExpenses()
  const index = expenses.findIndex((e) => e.id === expense.id)
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...expense }
    saveExpenses(expenses)
    return expenses[index]
  }
  return null
}

function deleteExpense(id) {
  const expenses = getExpenses()
  const newExpenses = expenses.filter((expense) => expense.id !== id)
  saveExpenses(newExpenses)
}

function saveExpenses(expenses) {
  localStorage.setItem("bobExpenses", JSON.stringify(expenses))
}

function getExpenseById(id) {
  const expenses = getExpenses()
  return expenses.find((expense) => expense.id === id) || null
}

// Generar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// Actualizar selectores de clientes en formularios
function updateClientSelectors() {
  const clients = getClients()
  const incomeClientSelect = document.getElementById("income-client")
  const expenseClientSelect = document.getElementById("expense-client")
  const reportClientSelect = document.getElementById("report-client-select")

  // Verificar que los elementos existen antes de manipularlos
  if (incomeClientSelect) {
    incomeClientSelect.innerHTML = ""
    clients.forEach((client) => {
      const option = document.createElement("option")
      option.value = client.id
      option.textContent = client.name
      incomeClientSelect.appendChild(option.cloneNode(true))
    })
  }

  if (expenseClientSelect) {
    expenseClientSelect.innerHTML = ""
    clients.forEach((client) => {
      const option = document.createElement("option")
      option.value = client.id
      option.textContent = client.name
      expenseClientSelect.appendChild(option.cloneNode(true))
    })
  }

  if (reportClientSelect) {
    reportClientSelect.innerHTML = '<option value="">Todos los clientes</option>'
    clients.forEach((client) => {
      const option = document.createElement("option")
      option.value = client.id
      option.textContent = client.name
      reportClientSelect.appendChild(option)
    })
  }
}
