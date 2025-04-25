// ==========================================
// FUNCIONES DE DATOS Y UTILIDADES
// ==========================================

// Función para generar un ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// Función para formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Función para formatear moneda
function formatCurrency(amount, currency = "PEN") {
  const symbol = currency === "PEN" ? "S/ " : "$ "
  return symbol + Number.parseFloat(amount || 0).toFixed(2)
}

// Clientes
function getClients() {
  const clients = localStorage.getItem("bobClients")
  return clients ? JSON.parse(clients) : []
}

function saveClients(clients) {
  localStorage.setItem("bobClients", JSON.stringify(clients))
}

// Modificar la función addClient para validar DNI y correo duplicados
function addClient(client) {
  const clients = getClients()

  // Verificar si ya existe un cliente con el mismo DNI
  const existingClientWithDNI = clients.find((c) => c.docNumber === client.docNumber)
  if (existingClientWithDNI) {
    return { error: "Ya existe un cliente con este número de documento." }
  }

  // Verificar si ya existe un cliente con el mismo correo
  const existingClientWithEmail = clients.find((c) => c.email.toLowerCase() === client.email.toLowerCase())
  if (existingClientWithEmail) {
    return { error: "Ya existe un cliente con este correo electrónico." }
  }

  client.id = generateId()
  client.createdAt = new Date().toISOString()
  clients.push(client)
  saveClients(clients)
  return client
}

// Modificar la función updateClient para validar DNI y correo duplicados
function updateClient(client) {
  const clients = getClients()
  const index = clients.findIndex((c) => c.id === client.id)

  if (index !== -1) {
    // Verificar si ya existe otro cliente con el mismo DNI
    const existingClientWithDNI = clients.find((c) => c.docNumber === client.docNumber && c.id !== client.id)
    if (existingClientWithDNI) {
      return { error: "Ya existe otro cliente con este número de documento." }
    }

    // Verificar si ya existe otro cliente con el mismo correo
    const existingClientWithEmail = clients.find(
      (c) => c.email.toLowerCase() === client.email.toLowerCase() && c.id !== client.id,
    )
    if (existingClientWithEmail) {
      return { error: "Ya existe otro cliente con este correo electrónico." }
    }

    clients[index] = { ...clients[index], ...client }
    saveClients(clients)
    return clients[index]
  }
  return null
}

// Asegurar que la función deleteClient elimine correctamente todos los datos relacionados
function deleteClient(id) {
  // Eliminar cliente de la lista de clientes
  const clients = getClients()
  const newClients = clients.filter((client) => client.id !== id)
  saveClients(newClients)

  // Eliminar todos los ingresos asociados al cliente
  const incomes = getIncomes()
  const newIncomes = incomes.filter((income) => income.clientId !== id)
  saveIncomes(newIncomes)

  // Eliminar todos los egresos asociados al cliente
  const expenses = getExpenses()
  const newExpenses = expenses.filter((expense) => expense.clientId !== id)
  saveExpenses(newExpenses)

  // Actualizar localStorage para asegurar que los cambios se guarden
  localStorage.setItem("bobClients", JSON.stringify(newClients))
  localStorage.setItem("bobIncomes", JSON.stringify(newIncomes))
  localStorage.setItem("bobExpenses", JSON.stringify(newExpenses))
}

function getClientById(id) {
  const clients = getClients()
  return clients.find((client) => client.id === id) || null
}

function getClientNameById(id) {
  const client = getClientById(id)
  return client ? client.name : "Cliente Desconocido"
}

// Ingresos
function getIncomes() {
  const incomes = localStorage.getItem("bobIncomes")
  return incomes ? JSON.parse(incomes) : []
}

function saveIncomes(incomes) {
  localStorage.setItem("bobIncomes", JSON.stringify(incomes))
}

function addIncome(income) {
  const incomes = getIncomes()
  income.id = generateId()
  income.createdAt = new Date().toISOString()
  income.type = "income"
  incomes.push(income)
  saveIncomes(incomes)

  // Actualizar la sección de reportes si está visible
  const reportsPage = document.getElementById("reports-page")
  if (reportsPage && !reportsPage.classList.contains("hidden")) {
    loadBalanceTable()

    // Si hay un cliente seleccionado y es el mismo al que se le agregó el ingreso, actualizar su detalle
    const reportClientSelect = document.getElementById("report-client-select")
    if (reportClientSelect) {
      if (reportClientSelect.value === income.clientId) {
        showClientDetail(income.clientId)
      } else if (!reportClientSelect.value) {
        // Si no hay cliente seleccionado, actualizar la tabla de transacciones
        const transactionTypeFilter = document.getElementById("transaction-type-filter")
        const typeFilter = transactionTypeFilter ? transactionTypeFilter.value : "all"
        loadTransactionsTable("", typeFilter)
      }
    }
  }

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

function getIncomeById(id) {
  const incomes = getIncomes()
  return incomes.find((income) => income.id === id) || null
}

// Egresos
function getExpenses() {
  const expenses = localStorage.getItem("bobExpenses")
  return expenses ? JSON.parse(expenses) : []
}

function saveExpenses(expenses) {
  localStorage.setItem("bobExpenses", JSON.stringify(expenses))
}

function addExpense(expense) {
  const expenses = getExpenses()
  expense.id = generateId()
  expense.createdAt = new Date().toISOString()
  expense.type = "expense"
  expenses.push(expense)
  saveExpenses(expenses)

  // Actualizar la sección de reportes si está visible
  const reportsPage = document.getElementById("reports-page")
  if (reportsPage && !reportsPage.classList.contains("hidden")) {
    loadBalanceTable()

    // Si hay un cliente seleccionado y es el mismo al que se le agregó el egreso, actualizar su detalle
    const reportClientSelect = document.getElementById("report-client-select")
    if (reportClientSelect) {
      if (reportClientSelect.value === expense.clientId) {
        showClientDetail(expense.clientId)
      } else if (!reportClientSelect.value) {
        // Si no hay cliente seleccionado, actualizar la tabla de transacciones
        const transactionTypeFilter = document.getElementById("transaction-type-filter")
        const typeFilter = transactionTypeFilter ? transactionTypeFilter.value : "all"
        loadTransactionsTable("", typeFilter)
      }
    }
  }

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

function getExpenseById(id) {
  const expenses = getExpenses()
  return expenses.find((expense) => expense.id === id) || null
}

// Cálculos de balance
// Modificar la función calculateClientBalance para separar por moneda
function calculateClientBalance(clientId) {
  const incomes = getIncomes().filter((income) => income.clientId === clientId)
  const expenses = getExpenses().filter((expense) => expense.clientId === clientId)

  let totalIncomePEN = 0
  let totalIncomeUSD = 0
  let totalExpensePEN = 0
  let totalExpenseUSD = 0

  // Calcular totales separados por moneda
  incomes.forEach((income) => {
    if (income.currency === "PEN") {
      totalIncomePEN += Number.parseFloat(income.amount || 0)
    } else {
      totalIncomeUSD += Number.parseFloat(income.amount || 0)
    }
  })

  expenses.forEach((expense) => {
    if (expense.currency === "PEN") {
      totalExpensePEN += Number.parseFloat(expense.amount || 0)
    } else {
      totalExpenseUSD += Number.parseFloat(expense.amount || 0)
    }
  })

  return {
    totalIncomePEN,
    totalIncomeUSD,
    totalExpensePEN,
    totalExpenseUSD,
    balancePEN: totalIncomePEN - totalExpensePEN,
    balanceUSD: totalIncomeUSD - totalExpenseUSD,
    // Mantener los totales generales para compatibilidad con código existente
    totalIncome: totalIncomePEN + totalIncomeUSD,
    totalExpense: totalExpensePEN + totalExpenseUSD,
    balance: totalIncomePEN - totalExpensePEN + (totalIncomeUSD - totalExpenseUSD),
  }
}

// Modificar la función calculateTotalBalance para separar por moneda
function calculateTotalBalance() {
  const incomes = getIncomes()
  const expenses = getExpenses()

  let totalIncomePEN = 0
  let totalIncomeUSD = 0
  let totalExpensePEN = 0
  let totalExpenseUSD = 0

  // Calcular totales separados por moneda
  incomes.forEach((income) => {
    if (income.currency === "PEN") {
      totalIncomePEN += Number.parseFloat(income.amount || 0)
    } else {
      totalIncomeUSD += Number.parseFloat(income.amount || 0)
    }
  })

  expenses.forEach((expense) => {
    if (expense.currency === "PEN") {
      totalExpensePEN += Number.parseFloat(expense.amount || 0)
    } else {
      totalExpenseUSD += Number.parseFloat(expense.amount || 0)
    }
  })

  return {
    totalIncomePEN,
    totalIncomeUSD,
    totalExpensePEN,
    totalExpenseUSD,
    balancePEN: totalIncomePEN - totalExpensePEN,
    balanceUSD: totalIncomeUSD - totalExpenseUSD,
  }
}

// Modificar la función getClientBalances para incluir monedas separadas
function getClientBalances() {
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

// Obtener todas las transacciones (ingresos y egresos)
function getAllTransactions() {
  const incomes = getIncomes()
  const expenses = getExpenses()

  return [...incomes, ...expenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
}

// Obtener transacciones de un cliente específico
function getClientTransactions(clientId) {
  if (!clientId) return []

  const incomes = getIncomes().filter((income) => income.clientId === clientId)
  const expenses = getExpenses().filter((expense) => expense.clientId === clientId)

  return [...incomes, ...expenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
}

// Cargar datos de ejemplo si no existen
function loadSampleData() {
  // Solo inicializar si no hay datos
  const clients = localStorage.getItem("bobClients")
  const incomes = localStorage.getItem("bobIncomes")
  const expenses = localStorage.getItem("bobExpenses")

  // Si no hay datos, podemos inicializar con algunos datos de ejemplo o dejarlo vacío
  if (!clients) {
    localStorage.setItem("bobClients", JSON.stringify([]))
  }

  if (!incomes) {
    localStorage.setItem("bobIncomes", JSON.stringify([]))
  }

  if (!expenses) {
    localStorage.setItem("bobExpenses", JSON.stringify([]))
  }
}

// ==========================================
// FUNCIONES PRINCIPALES Y NAVEGACIÓN
// ==========================================

// Modificar el evento DOMContentLoaded para cargar la última página visitada
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

  // Cargar la última página visitada o dashboard por defecto
  const lastPage = localStorage.getItem("bobCurrentPage") || "dashboard"
  showPage(lastPage)
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

// Modificar la función showPage para guardar la página actual en localStorage
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

    // Guardar la página actual en localStorage
    localStorage.setItem("bobCurrentPage", pageId)

    // Actualizar la clase active en los enlaces de navegación
    document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
      if (link.getAttribute("data-page") === pageId) {
        link.classList.add("active")
      } else {
        link.classList.remove("active")
      }
    })

    // Si la página es reportes, actualizar los datos
    if (pageId === "reports") {
      loadBalanceTable()

      // Verificar si hay un cliente seleccionado y actualizar su detalle
      const reportClientSelect = document.getElementById("report-client-select")
      if (reportClientSelect && reportClientSelect.value) {
        showClientDetail(reportClientSelect.value)
      } else {
        // Si no hay cliente seleccionado, cargar todas las transacciones
        const transactionTypeFilter = document.getElementById("transaction-type-filter")
        const typeFilter = transactionTypeFilter ? transactionTypeFilter.value : "all"
        loadTransactionsTable("", typeFilter)
      }
    }
  }
}

// Menú móvil
function initMobileMenu() {
  const menuButton = document.getElementById("mobile-menu-button")
  const mobileMenu = document.getElementById("mobile-menu")

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }
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

  if (!toast || !toastMessage || !toastIcon) return

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
// Actualizar la función updateDashboardStats para mostrar totales por moneda
function updateDashboardStats() {
  // Actualizar contadores
  const totalClientsElement = document.getElementById("total-clients")
  const totalIncomePENElement = document.getElementById("total-income-pen")
  const totalIncomeUSDElement = document.getElementById("total-income-usd")
  const totalExpensesPENElement = document.getElementById("total-expenses-pen")
  const totalExpensesUSDElement = document.getElementById("total-expenses-usd")
  const totalBalancePENElement = document.getElementById("total-balance-pen")
  const totalBalanceUSDElement = document.getElementById("total-balance-usd")

  if (totalClientsElement) {
    totalClientsElement.textContent = getClients().length
  }

  const totalBalance = calculateTotalBalance()

  if (totalIncomePENElement) {
    totalIncomePENElement.textContent = formatCurrency(totalBalance.totalIncomePEN, "PEN")
  }

  if (totalIncomeUSDElement) {
    totalIncomeUSDElement.textContent = formatCurrency(totalBalance.totalIncomeUSD, "USD")
  }

  if (totalExpensesPENElement) {
    totalExpensesPENElement.textContent = formatCurrency(totalBalance.totalExpensePEN, "PEN")
  }

  if (totalExpensesUSDElement) {
    totalExpensesUSDElement.textContent = formatCurrency(totalBalance.totalExpenseUSD, "USD")
  }

  if (totalBalancePENElement) {
    totalBalancePENElement.textContent = formatCurrency(totalBalance.balancePEN, "PEN")

    // Cambiar el color según si es positivo o negativo
    if (totalBalance.balancePEN >= 0) {
      totalBalancePENElement.classList.remove("text-red-600")
      totalBalancePENElement.classList.add("text-green-600")
    } else {
      totalBalancePENElement.classList.remove("text-green-600")
      totalBalancePENElement.classList.add("text-red-600")
    }
  }

  if (totalBalanceUSDElement) {
    totalBalanceUSDElement.textContent = formatCurrency(totalBalance.balanceUSD, "USD")

    // Cambiar el color según si es positivo o negativo
    if (totalBalance.balanceUSD >= 0) {
      totalBalanceUSDElement.classList.remove("text-red-600")
      totalBalanceUSDElement.classList.add("text-green-600")
    } else {
      totalBalanceUSDElement.classList.remove("text-green-600")
      totalBalanceUSDElement.classList.add("text-red-600")
    }
  }

  // Actualizar tabla de clientes con mayor balance
  updateTopClientsTable()

  // Actualizar tabla de actividad reciente
  updateRecentActivityTable()
}

// Actualizar la función updateTopClientsTable para mostrar montos en la moneda correcta
function updateTopClientsTable() {
  const balances = getClientBalances()
  const tableBody = document.getElementById("top-clients-table")

  if (!tableBody) return

  // Ordenar por balance total descendente
  balances.sort((a, b) => b.balance - a.balance)

  // Tomar los primeros 5
  const topClients = balances.slice(0, 5)

  tableBody.innerHTML = ""

  if (topClients.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td colspan="6" class="py-4 text-center text-gray-500">No hay clientes registrados</td>
        `
    tableBody.appendChild(row)
    return
  }

  topClients.forEach((client) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td class="py-2 px-4">${client.clientName}</td>
            <td class="py-2 px-4 text-green-600">${formatCurrency(client.totalIncomePEN, "PEN")}</td>
            <td class="py-2 px-4 text-green-600">${formatCurrency(client.totalIncomeUSD, "USD")}</td>
            <td class="py-2 px-4 text-red-600">${formatCurrency(client.totalExpensePEN, "PEN")}</td>
            <td class="py-2 px-4 text-red-600">${formatCurrency(client.totalExpenseUSD, "USD")}</td>
            <td class="py-2 px-4">
                <span class="font-bold ${client.balancePEN >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(client.balancePEN, "PEN")}</span>
                <span class="mx-1">|</span>
                <span class="font-bold ${client.balanceUSD >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(client.balanceUSD, "USD")}</span>
            </td>
        `
    tableBody.appendChild(row)
  })
}

function updateRecentActivityTable() {
  const transactions = getAllTransactions()
  const tableBody = document.getElementById("recent-activity-table")

  if (!tableBody) return

  // Ordenar por fecha descendente
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date))

  // Tomar las primeras 10
  const recentActivity = transactions.slice(0, 10)

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

// ==========================================
// FUNCIONES PARA LA GESTIÓN DE CLIENTES
// ==========================================

function initClientsPage() {
  // Cargar tabla de clientes
  loadClientsTable()

  // Inicializar búsqueda
  initClientSearch()

  // Inicializar formulario de cliente
  initClientForm()

  // Botón para agregar cliente
  const addClientBtn = document.getElementById("add-client-btn")
  if (addClientBtn) {
    addClientBtn.addEventListener("click", () => {
      openAddClientModal()
    })
  }
}

// Modificar la función loadClientsTable para mostrar el balance en ambas monedas
function loadClientsTable() {
  const clients = getClients()
  const tableBody = document.getElementById("clients-table")
  if (!tableBody) return

  tableBody.innerHTML = ""

  if (clients.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td colspan="7" class="py-4 text-center text-gray-500">No hay clientes registrados</td>
        `
    tableBody.appendChild(row)
    return
  }

  clients.forEach((client) => {
    const balance = calculateClientBalance(client.id)
    const row = document.createElement("tr")

    row.innerHTML = `
            <td class="py-2 px-4">${client.id}</td>
            <td class="py-2 px-4">${client.name}</td>
            <td class="py-2 px-4">${client.docType}</td>
            <td class="py-2 px-4">${client.docNumber}</td>
            <td class="py-2 px-4">${client.email}</td>
            <td class="py-2 px-4">
                <div class="font-bold ${balance.balancePEN >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(balance.balancePEN, "PEN")}</div>
                <div class="font-bold ${balance.balanceUSD >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(balance.balanceUSD, "USD")}</div>
            </td>
            <td class="py-2 px-4">
                <button class="text-blue-600 hover:text-blue-800 mr-2 edit-client" data-id="${client.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800 delete-client" data-id="${client.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `

    tableBody.appendChild(row)
  })

  // Agregar eventos a los botones de editar y eliminar
  document.querySelectorAll(".edit-client").forEach((button) => {
    button.addEventListener("click", function () {
      const clientId = this.getAttribute("data-id")
      openEditClientModal(clientId)
    })
  })

  document.querySelectorAll(".delete-client").forEach((button) => {
    button.addEventListener("click", function () {
      const clientId = this.getAttribute("data-id")
      openDeleteClientModal(clientId)
    })
  })
}

// Modificar la función initClientSearch para mostrar el balance en ambas monedas
function initClientSearch() {
  const searchInput = document.getElementById("client-search")
  if (!searchInput) return

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase()
    const clients = getClients()
    const filteredClients = clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(searchTerm) ||
        client.docNumber.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm)
      )
    })

    const tableBody = document.getElementById("clients-table")
    if (!tableBody) return

    tableBody.innerHTML = ""

    if (filteredClients.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td colspan="7" class="py-4 text-center text-gray-500">No se encontraron clientes</td>
            `
      tableBody.appendChild(row)
      return
    }

    filteredClients.forEach((client) => {
      const balance = calculateClientBalance(client.id)
      const row = document.createElement("tr")

      row.innerHTML = `
                <td class="py-2 px-4">${client.id}</td>
                <td class="py-2 px-4">${client.name}</td>
                <td class="py-2 px-4">${client.docType}</td>
                <td class="py-2 px-4">${client.docNumber}</td>
                <td class="py-2 px-4">${client.email}</td>
                <td class="py-2 px-4">
                    <div class="font-bold ${balance.balancePEN >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(balance.balancePEN, "PEN")}</div>
                    <div class="font-bold ${balance.balanceUSD >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(balance.balanceUSD, "USD")}</div>
                </td>
                <td class="py-2 px-4">
                    <button class="text-blue-600 hover:text-blue-800 mr-2 edit-client" data-id="${client.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800 delete-client" data-id="${client.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `

      tableBody.appendChild(row)
    })

    // Agregar eventos a los botones de editar y eliminar
    document.querySelectorAll(".edit-client").forEach((button) => {
      button.addEventListener("click", function () {
        const clientId = this.getAttribute("data-id")
        openEditClientModal(clientId)
      })
    })

    document.querySelectorAll(".delete-client").forEach((button) => {
      button.addEventListener("click", function () {
        const clientId = this.getAttribute("data-id")
        openDeleteClientModal(clientId)
      })
    })
  })
}

// Modificar la función initClientForm para manejar errores de validación
function initClientForm() {
  const clientForm = document.getElementById("client-form")
  if (!clientForm) return

  clientForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const clientIdInput = document.getElementById("client-id")
    const clientNameInput = document.getElementById("client-name")
    const clientDocTypeInput = document.getElementById("client-doc-type")
    const clientDocNumberInput = document.getElementById("client-doc-number")
    const clientEmailInput = document.getElementById("client-email")
    const clientObservationsInput = document.getElementById("client-observations")

    if (
      !clientIdInput ||
      !clientNameInput ||
      !clientDocTypeInput ||
      !clientDocNumberInput ||
      !clientEmailInput ||
      !clientObservationsInput
    ) {
      return
    }

    const clientId = clientIdInput.value
    const clientData = {
      name: clientNameInput.value,
      docType: clientDocTypeInput.value,
      docNumber: clientDocNumberInput.value,
      email: clientEmailInput.value,
      observations: clientObservationsInput.value,
    }

    let result

    if (clientId) {
      // Actualizar cliente existente
      clientData.id = clientId
      result = updateClient(clientData)
      if (result && result.error) {
        showToast(result.error, "error")
        return
      }
      showToast("Cliente actualizado correctamente", "success")
    } else {
      // Agregar nuevo cliente
      result = addClient(clientData)
      if (result && result.error) {
        showToast(result.error, "error")
        return
      }
      showToast("Cliente agregado correctamente", "success")
    }

    closeModal("client-modal")
    loadClientsTable()
    updateDashboardStats()

    // Actualizar selectores de clientes en otros formularios
    updateClientSelectors()
  })
}

function openAddClientModal() {
  // Limpiar formulario
  const clientIdInput = document.getElementById("client-id")
  const clientNameInput = document.getElementById("client-name")
  const clientDocTypeInput = document.getElementById("client-doc-type")
  const clientDocNumberInput = document.getElementById("client-doc-number")
  const clientEmailInput = document.getElementById("client-email")
  const clientObservationsInput = document.getElementById("client-observations")
  const clientModalTitle = document.getElementById("client-modal-title")

  if (clientIdInput) clientIdInput.value = ""
  if (clientNameInput) clientNameInput.value = ""
  if (clientDocTypeInput) clientDocTypeInput.value = "DNI"
  if (clientDocNumberInput) clientDocNumberInput.value = ""
  if (clientEmailInput) clientEmailInput.value = ""
  if (clientObservationsInput) clientObservationsInput.value = ""

  // Cambiar título
  if (clientModalTitle) clientModalTitle.textContent = "Nuevo Cliente"

  // Abrir modal
  openModal("client-modal")
}

function openEditClientModal(clientId) {
  const client = getClientById(clientId)

  if (client) {
    // Llenar formulario con datos del cliente
    const clientIdInput = document.getElementById("client-id")
    const clientNameInput = document.getElementById("client-name")
    const clientDocTypeInput = document.getElementById("client-doc-type")
    const clientDocNumberInput = document.getElementById("client-doc-number")
    const clientEmailInput = document.getElementById("client-email")
    const clientObservationsInput = document.getElementById("client-observations")
    const clientModalTitle = document.getElementById("client-modal-title")

    if (clientIdInput) clientIdInput.value = client.id
    if (clientNameInput) clientNameInput.value = client.name
    if (clientDocTypeInput) clientDocTypeInput.value = client.docType
    if (clientDocNumberInput) clientDocNumberInput.value = client.docNumber
    if (clientEmailInput) clientEmailInput.value = client.email
    if (clientObservationsInput) clientObservationsInput.value = client.observations || ""

    // Cambiar título
    if (clientModalTitle) clientModalTitle.textContent = "Editar Cliente"

    // Abrir modal
    openModal("client-modal")
  }
}

// Modificar la función openDeleteClientModal para actualizar todas las vistas después de eliminar un cliente
function openDeleteClientModal(clientId) {
  // Guardar ID del cliente a eliminar
  const confirmDeleteBtn = document.getElementById("confirm-delete")
  if (confirmDeleteBtn) {
    confirmDeleteBtn.setAttribute("data-id", clientId)
    confirmDeleteBtn.setAttribute("data-type", "client")

    // Configurar evento para el botón de confirmar
    confirmDeleteBtn.onclick = function () {
      const id = this.getAttribute("data-id")
      const type = this.getAttribute("data-type")

      if (type === "client") {
        deleteClient(id)
        showToast("Cliente eliminado correctamente", "success")

        // Actualizar todas las vistas para reflejar la eliminación del cliente
        loadClientsTable()
        loadIncomeTable()
        loadExpensesTable()
        loadBalanceTable()
        loadTransactionsTable()
        updateDashboardStats()
        updateClientSelectors()

        // Ocultar el detalle del cliente si está visible
        hideClientDetail()
      }

      closeModal("delete-modal")
    }
  }

  // Abrir modal de confirmación
  openModal("delete-modal")
}

// ==========================================
// FUNCIONES PARA LA GESTIÓN DE INGRESOS
// ==========================================

function initIncomePage() {
  // Cargar tabla de ingresos
  loadIncomeTable()

  // Inicializar búsqueda
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
}

function initIncomeSearch() {
  const searchInput = document.getElementById("income-search")

  if (!searchInput) return

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value
    loadIncomeTable(searchTerm)
  })
}

function loadIncomeTable(searchTerm = "") {
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

// Modificar la función initIncomeForm para actualizar también la sección de reportes
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

    const incomeIdInput = document.getElementById("income-id")
    const incomeClientInput = document.getElementById("income-client")
    const incomeDateInput = document.getElementById("income-date")
    const incomeMethodInput = document.getElementById("income-method")
    const incomeBankInput = document.getElementById("income-bank")
    const incomeCurrencyInput = document.getElementById("income-currency")
    const incomeAmountInput = document.getElementById("income-amount")
    const incomeConceptInput = document.getElementById("income-concept")

    if (
      !incomeIdInput ||
      !incomeClientInput ||
      !incomeDateInput ||
      !incomeMethodInput ||
      !incomeBankInput ||
      !incomeCurrencyInput ||
      !incomeAmountInput ||
      !incomeConceptInput
    ) {
      return
    }

    const incomeId = incomeIdInput.value
    const clientId = incomeClientInput.value
    const incomeData = {
      clientId: clientId,
      date: incomeDateInput.value,
      method: incomeMethodInput.value,
      bank: incomeBankInput.value,
      currency: incomeCurrencyInput.value,
      amount: incomeAmountInput.value,
      concept: incomeConceptInput.value,
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

    // Actualizar la tabla de clientes para reflejar el nuevo balance
    loadClientsTable()

    // Actualizar la sección de reportes si está visible
    const reportsPage = document.getElementById("reports-page")
    if (reportsPage && !reportsPage.classList.contains("hidden")) {
      loadBalanceTable()

      // Si hay un cliente seleccionado y es el mismo al que se le agregó el ingreso, actualizar su detalle
      const reportClientSelect = document.getElementById("report-client-select")
      if (reportClientSelect) {
        if (reportClientSelect.value === clientId) {
          showClientDetail(clientId)
        } else if (!reportClientSelect.value) {
          // Si no hay cliente seleccionado, actualizar la tabla de transacciones
          const transactionTypeFilter = document.getElementById("transaction-type-filter")
          const typeFilter = transactionTypeFilter ? transactionTypeFilter.value : "all"
          loadTransactionsTable("", typeFilter)
        }
      }
    }
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

// Modificar la función openDeleteIncomeModal para actualizar también la sección de reportes
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

        // Actualizar la tabla de clientes para reflejar el nuevo balance
        loadClientsTable()

        // Actualizar la sección de reportes
        loadBalanceTable()

        // Si estamos viendo el detalle de un cliente, actualizar también esa vista
        const reportClientSelect = document.getElementById("report-client-select")
        if (reportClientSelect && reportClientSelect.value) {
          showClientDetail(reportClientSelect.value)
        }
      }

      closeModal("delete-modal")
    }
  }

  // Abrir modal de confirmación
  openModal("delete-modal")
}

// ==========================================
// FUNCIONES PARA LA GESTIÓN DE EGRESOS
// ==========================================

function initExpensesPage() {
  // Cargar tabla de egresos
  loadExpensesTable()

  // Inicializar búsqueda
  initExpenseSearch()

  // Inicializar formulario de egreso
  initExpenseForm()

  // Botón para agregar egreso
  const addExpenseBtn = document.getElementById("add-expense-btn")
  if (addExpenseBtn) {
    addExpenseBtn.addEventListener("click", () => {
      openAddExpenseModal()
    })
  }
}

function initExpenseSearch() {
  const searchInput = document.getElementById("expense-search")

  if (!searchInput) return

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value
    loadExpensesTable(searchTerm)
  })
}

function loadExpensesTable(searchTerm = "") {
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

  // Ordenar por fecha descendente
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date))

  const tableBody = document.getElementById("expense-table")
  if (!tableBody) return

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

// Modificar la función initExpenseForm para actualizar también la sección de reportes
function initExpenseForm() {
  // Actualizar selector de clientes
  updateClientSelectors()

  // Establecer fecha actual por defecto
  const expenseDateInput = document.getElementById("expense-date")
  if (expenseDateInput) expenseDateInput.valueAsDate = new Date()

  const expenseForm = document.getElementById("expense-form")
  if (!expenseForm) return

  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const expenseIdInput = document.getElementById("expense-id")
    const expenseClientInput = document.getElementById("expense-client")
    const expenseDateInput = document.getElementById("expense-date")
    const expenseMethodInput = document.getElementById("expense-method")
    const expenseBankInput = document.getElementById("expense-bank")
    const expenseCurrencyInput = document.getElementById("expense-currency")
    const expenseAmountInput = document.getElementById("expense-amount")
    const expenseConceptInput = document.getElementById("expense-concept")

    if (
      !expenseIdInput ||
      !expenseClientInput ||
      !expenseDateInput ||
      !expenseMethodInput ||
      !expenseBankInput ||
      !expenseCurrencyInput ||
      !expenseAmountInput ||
      !expenseConceptInput
    ) {
      return
    }

    const expenseId = expenseIdInput.value
    const clientId = expenseClientInput.value
    const expenseData = {
      clientId: clientId,
      date: expenseDateInput.value,
      method: expenseMethodInput.value,
      bank: expenseBankInput.value,
      currency: expenseCurrencyInput.value,
      amount: expenseAmountInput.value,
      concept: expenseConceptInput.value,
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

    // Actualizar la tabla de clientes para reflejar el nuevo balance
    loadClientsTable()

    // Actualizar la sección de reportes si está visible
    const reportsPage = document.getElementById("reports-page")
    if (reportsPage && !reportsPage.classList.contains("hidden")) {
      loadBalanceTable()

      // Si hay un cliente seleccionado y es el mismo al que se le agregó el egreso, actualizar su detalle
      const reportClientSelect = document.getElementById("report-client-select")
      if (reportClientSelect) {
        if (reportClientSelect.value === clientId) {
          showClientDetail(clientId)
        } else if (!reportClientSelect.value) {
          // Si no hay cliente seleccionado, actualizar la tabla de transacciones
          const transactionTypeFilter = document.getElementById("transaction-type-filter")
          const typeFilter = transactionTypeFilter ? transactionTypeFilter.value : "all"
          loadTransactionsTable("", typeFilter)
        }
      }
    }
  })
}

function openAddExpenseModal() {
  // Limpiar formulario
  const expenseIdInput = document.getElementById("expense-id")
  const expenseDateInput = document.getElementById("expense-date")
  const expenseClientInput = document.getElementById("expense-client")
  const expenseMethodInput = document.getElementById("expense-method")
  const expenseBankInput = document.getElementById("expense-bank")
  const expenseCurrencyInput = document.getElementById("expense-currency")
  const expenseAmountInput = document.getElementById("expense-amount")
  const expenseConceptInput = document.getElementById("expense-concept")
  const expenseModalTitle = document.getElementById("expense-modal-title")

  if (expenseIdInput) expenseIdInput.value = ""
  if (expenseDateInput) expenseDateInput.valueAsDate = new Date()
  if (expenseClientInput && expenseClientInput.options.length > 0)
    expenseClientInput.value = expenseClientInput.options[0].value
  if (expenseMethodInput) expenseMethodInput.value = "Transferencia"
  if (expenseBankInput) expenseBankInput.value = "BCP"
  if (expenseCurrencyInput) expenseCurrencyInput.value = "PEN"
  if (expenseAmountInput) expenseAmountInput.value = ""
  if (expenseConceptInput) expenseConceptInput.value = ""

  // Cambiar título
  if (expenseModalTitle) expenseModalTitle.textContent = "Nuevo Egreso"

  // Abrir modal
  openModal("expense-modal")
}

function openEditExpenseModal(expenseId) {
  const expense = getExpenseById(expenseId)

  if (expense) {
    // Llenar formulario con datos del egreso
    const expenseIdInput = document.getElementById("expense-id")
    const expenseDateInput = document.getElementById("expense-date")
    const expenseClientInput = document.getElementById("expense-client")
    const expenseMethodInput = document.getElementById("expense-method")
    const expenseBankInput = document.getElementById("expense-bank")
    const expenseCurrencyInput = document.getElementById("expense-currency")
    const expenseAmountInput = document.getElementById("expense-amount")
    const expenseConceptInput = document.getElementById("expense-concept")
    const expenseModalTitle = document.getElementById("expense-modal-title")

    if (expenseIdInput) expenseIdInput.value = expense.id
    if (expenseDateInput) expenseDateInput.value = expense.date
    if (expenseClientInput) expenseClientInput.value = expense.clientId
    if (expenseMethodInput) expenseMethodInput.value = expense.method
    if (expenseBankInput) expenseBankInput.value = expense.bank
    if (expenseCurrencyInput) expenseCurrencyInput.value = expense.currency
    if (expenseAmountInput) expenseAmountInput.value = expense.amount
    if (expenseConceptInput) expenseConceptInput.value = expense.concept

    // Cambiar título
    if (expenseModalTitle) expenseModalTitle.textContent = "Editar Egreso"

    // Abrir modal
    openModal("expense-modal")
  }
}

// Modificar la función openDeleteExpenseModal para actualizar también la sección de reportes
function openDeleteExpenseModal(expenseId) {
  // Guardar ID del egreso a eliminar
  const confirmDeleteBtn = document.getElementById("confirm-delete")
  if (confirmDeleteBtn) {
    confirmDeleteBtn.setAttribute("data-id", expenseId)
    confirmDeleteBtn.setAttribute("data-type", "expense")

    // Configurar evento para el botón de confirmar
    confirmDeleteBtn.onclick = function () {
      const id = this.getAttribute("data-id")
      const type = this.getAttribute("data-type")

      if (type === "expense") {
        deleteExpense(id)
        showToast("Egreso eliminado correctamente", "success")
        loadExpensesTable()
        updateDashboardStats()

        // Actualizar la tabla de clientes para reflejar el nuevo balance
        loadClientsTable()

        // Actualizar la sección de reportes
        loadBalanceTable()

        // Si estamos viendo el detalle de un cliente, actualizar también esa vista
        const reportClientSelect = document.getElementById("report-client-select")
        if (reportClientSelect && reportClientSelect.value) {
          showClientDetail(reportClientSelect.value)
        }
      }

      closeModal("delete-modal")
    }
  }

  // Abrir modal de confirmación
  openModal("delete-modal")
}

// ==========================================
// FUNCIONES PARA LA GESTIÓN DE REPORTES
// ==========================================

function initReportsPage() {
  // Cargar tabla de balance
  loadBalanceTable()

  // Inicializar filtros
  initReportFilters()

  // Actualizar selector de clientes
  updateClientSelectors()

  // Verificar si hay un cliente seleccionado y actualizar su detalle
  const reportClientSelect = document.getElementById("report-client-select")
  if (reportClientSelect && reportClientSelect.value) {
    showClientDetail(reportClientSelect.value)
  } else {
    // Si no hay cliente seleccionado, cargar todas las transacciones
    const transactionTypeFilter = document.getElementById("transaction-type-filter")
    const typeFilter = transactionTypeFilter ? transactionTypeFilter.value : "all"
    loadTransactionsTable("", typeFilter)
  }
}

// Modificar la función loadBalanceTable para mostrar montos en ambas monedas
function loadBalanceTable(clientId = "") {
  let balances = getClientBalances()

  // Filtrar por cliente si se especifica
  if (clientId) {
    balances = balances.filter((balance) => balance.clientId === clientId)
  }

  // Ordenar por balance total descendente
  balances.sort((a, b) => b.balance - a.balance)

  const tableBody = document.getElementById("balance-table")
  if (!tableBody) return

  tableBody.innerHTML = ""

  if (balances.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td colspan="8" class="py-4 text-center text-gray-500">No hay datos de balance disponibles</td>
        `
    tableBody.appendChild(row)
    return
  }

  balances.forEach((balance) => {
    const row = document.createElement("tr")

    row.innerHTML = `
            <td class="py-2 px-4">${balance.clientName}</td>
            <td class="py-2 px-4 text-green-600">${formatCurrency(balance.totalIncomePEN, "PEN")}</td>
            <td class="py-2 px-4 text-green-600">${formatCurrency(balance.totalIncomeUSD, "USD")}</td>
            <td class="py-2 px-4 text-red-600">${formatCurrency(balance.totalExpensePEN, "PEN")}</td>
            <td class="py-2 px-4 text-red-600">${formatCurrency(balance.totalExpenseUSD, "USD")}</td>
            <td class="py-2 px-4 font-bold ${balance.balancePEN >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(balance.balancePEN, "PEN")}</td>
            <td class="py-2 px-4 font-bold ${balance.balanceUSD >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(balance.balanceUSD, "USD")}</td>
            <td class="py-2 px-4">
                <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-sm view-client-detail" data-id="${balance.clientId}">
                    Ver Detalle
                </button>
            </td>
        `

    tableBody.appendChild(row)
  })

  // Agregar eventos a los botones de ver detalle
  document.querySelectorAll(".view-client-detail").forEach((button) => {
    button.addEventListener("click", function () {
      const clientId = this.getAttribute("data-id")
      showClientDetail(clientId)
    })
  })
}

// Modificar la función initReportFilters para eliminar el filtro de fecha
function initReportFilters() {
  const clientSelect = document.getElementById("report-client-select")
  const transactionTypeFilter = document.getElementById("transaction-type-filter")

  if (!clientSelect || !transactionTypeFilter) return

  // Actualizar la vista cuando se cambia el cliente seleccionado
  clientSelect.addEventListener("change", function () {
    const clientId = this.value
    loadBalanceTable(clientId)

    if (clientId) {
      showClientDetail(clientId)
    } else {
      hideClientDetail()
      loadTransactionsTable("", transactionTypeFilter.value)
    }
  })

  // Actualizar la vista cuando se cambia el tipo de transacción
  transactionTypeFilter.addEventListener("change", function () {
    const typeFilter = this.value
    const clientId = clientSelect.value

    // Si hay un cliente seleccionado en el detalle, usar ese ID en lugar del selector
    const clientDetailContainer = document.getElementById("client-detail-container")
    const clientDetailName = document.getElementById("detail-client-name")

    if (clientDetailContainer && !clientDetailContainer.classList.contains("hidden") && clientDetailName) {
      // Buscar el cliente por nombre para obtener su ID
      const clients = getClients()
      const clientName = clientDetailName.textContent
      const client = clients.find((c) => c.name === clientName)

      if (client) {
        // Usar el ID del cliente que se está mostrando en el detalle
        loadTransactionsTable(client.id, typeFilter)
        return
      }
    }

    // Si no hay detalle visible o no se encontró el cliente, usar el selector
    if (clientId) {
      loadTransactionsTable(clientId, typeFilter)
    } else {
      loadTransactionsTable("", typeFilter)
    }
  })
}

// Modificar la función showClientDetail para mostrar montos en ambas monedas
function showClientDetail(clientId) {
  const client = getClientById(clientId)
  const balance = calculateClientBalance(clientId)

  if (client) {
    // Mostrar contenedor de detalle
    const clientDetailContainer = document.getElementById("client-detail-container")
    if (clientDetailContainer) clientDetailContainer.classList.remove("hidden")

    // Actualizar datos
    const detailClientName = document.getElementById("detail-client-name")
    const detailTotalIncomePEN = document.getElementById("detail-total-income-pen")
    const detailTotalIncomeUSD = document.getElementById("detail-total-income-usd")
    const detailTotalExpensesPEN = document.getElementById("detail-total-expenses-pen")
    const detailTotalExpensesUSD = document.getElementById("detail-total-expenses-usd")
    const detailBalancePEN = document.getElementById("detail-balance-pen")
    const detailBalanceUSD = document.getElementById("detail-balance-usd")

    if (detailClientName) detailClientName.textContent = client.name
    // Guardar el ID del cliente como atributo de datos para referencia
    if (clientDetailContainer) clientDetailContainer.setAttribute("data-client-id", clientId)

    if (detailTotalIncomePEN) detailTotalIncomePEN.textContent = formatCurrency(balance.totalIncomePEN, "PEN")
    if (detailTotalIncomeUSD) detailTotalIncomeUSD.textContent = formatCurrency(balance.totalIncomeUSD, "USD")

    if (detailTotalExpensesPEN) detailTotalExpensesPEN.textContent = formatCurrency(balance.totalExpensePEN, "PEN")
    if (detailTotalExpensesUSD) detailTotalExpensesUSD.textContent = formatCurrency(balance.totalExpenseUSD, "USD")

    if (detailBalancePEN) {
      detailBalancePEN.textContent = formatCurrency(balance.balancePEN, "PEN")
      detailBalancePEN.className = `text-lg font-bold ${balance.balancePEN >= 0 ? "text-green-600" : "text-red-600"}`
    }

    if (detailBalanceUSD) {
      detailBalanceUSD.textContent = formatCurrency(balance.balanceUSD, "USD")
      detailBalanceUSD.className = `text-lg font-bold ${balance.balanceUSD >= 0 ? "text-green-600" : "text-red-600"}`
    }

    // Obtener el filtro de tipo actual
    const transactionTypeFilter = document.getElementById("transaction-type-filter")
    const typeFilter = transactionTypeFilter ? transactionTypeFilter.value : "all"

    // Cargar transacciones del cliente con el filtro de tipo actual
    // Asegurarse de que solo se muestren las transacciones de este cliente
    loadTransactionsTable(clientId, typeFilter)
  }
}

// Modificar la función loadTransactionsTable para filtrar correctamente por cliente y tipo
function loadTransactionsTable(clientId = "", typeFilter = "all") {
  // Si estamos en la vista de detalle de cliente, asegurarse de usar ese ID
  if (!clientId) {
    const clientDetailContainer = document.getElementById("client-detail-container")
    if (clientDetailContainer && !clientDetailContainer.classList.contains("hidden")) {
      const detailClientId = clientDetailContainer.getAttribute("data-client-id")
      if (detailClientId) {
        clientId = detailClientId
      }
    }
  }

  let transactions = []

  // Primero filtrar por cliente si se especifica
  if (clientId) {
    // Obtener solo las transacciones del cliente especificado
    const clientIncomes = getIncomes().filter((income) => income.clientId === clientId)
    const clientExpenses = getExpenses().filter((expense) => expense.clientId === clientId)

    transactions = [...clientIncomes, ...clientExpenses]
  } else {
    transactions = getAllTransactions()
  }

  // Luego aplicar filtro de tipo
  if (typeFilter !== "all") {
    transactions = transactions.filter((transaction) => transaction.type === typeFilter)
  }

  // Ordenar por fecha descendente
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date))

  const tableBody = document.getElementById("transactions-table")
  if (!tableBody) return

  tableBody.innerHTML = ""

  if (transactions.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td colspan="7" class="py-4 text-center text-gray-500">No hay transacciones disponibles</td>
        `
    tableBody.appendChild(row)
    return
  }

  transactions.forEach((transaction) => {
    const isIncome = transaction.type === "income"
    const row = document.createElement("tr")

    row.innerHTML = `
            <td class="py-2 px-4">${formatDate(transaction.date)}</td>
            <td class="py-2 px-4">
                <span class="px-2 py-1 rounded-full text-xs ${isIncome ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}">
                    ${isIncome ? "Ingreso" : "Egreso"}
                </span>
            </td>
            <td class="py-2 px-4">${transaction.method}</td>
            <td class="py-2 px-4">${transaction.bank}</td>
            <td class="py-2 px-4">${transaction.currency === "PEN" ? "Soles (S/)" : "Dólares ($)"}</td>
            <td class="py-2 px-4 ${isIncome ? "text-green-600" : "text-red-600"} font-bold">${formatCurrency(transaction.amount, transaction.currency)}</td>
            <td class="py-2 px-4">${transaction.concept}</td>
        `

    tableBody.appendChild(row)
  })
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
      incomeClientSelect.appendChild(option)
    })
  }

  if (expenseClientSelect) {
    expenseClientSelect.innerHTML = ""
    clients.forEach((client) => {
      const option = document.createElement("option")
      option.value = client.id
      option.textContent = client.name
      expenseClientSelect.appendChild(option)
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

function hideClientDetail() {
  const clientDetailContainer = document.getElementById("client-detail-container")
  if (clientDetailContainer) {
    clientDetailContainer.classList.add("hidden")
  }
}
