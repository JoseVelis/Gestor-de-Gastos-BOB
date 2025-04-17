// Funciones para la gestión de reportes y balance

// Import or declare missing variables
function updateClientSelectors() {
    // Placeholder function - replace with actual implementation
    console.warn("updateClientSelectors function is a placeholder.")
  }
  
  function getClientBalances() {
    // Placeholder function - replace with actual implementation
    console.warn("getClientBalances function is a placeholder.")
    return [] // Return an empty array to avoid errors
  }
  
  function formatCurrency(amount, currency = "PEN") {
    // Placeholder function - replace with actual implementation
    const formatter = new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency,
    })
    return formatter.format(amount)
  }
  
  function getClientById(clientId) {
    // Placeholder function - replace with actual implementation
    console.warn("getClientById function is a placeholder.")
    return null // Return null to avoid errors
  }
  
  function calculateClientBalance(clientId) {
    // Placeholder function - replace with actual implementation
    console.warn("calculateClientBalance function is a placeholder.")
    return { totalIncome: 0, totalExpense: 0, balance: 0 } // Return a default balance object
  }
  
  function getAllTransactions() {
    console.warn("getAllTransactions function is a placeholder.")
    return []
  }
  
  function getClientTransactions(clientId) {
    console.warn("getClientTransactions function is a placeholder.")
    return []
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0") // Month is 0-indexed
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  
  function initReportsPage() {
    // Cargar tabla de balance
    loadBalanceTable()
  
    // Inicializar filtros
    initReportFilters()
  
    // Actualizar selector de clientes
    updateClientSelectors()
  }
  
  function loadBalanceTable(clientId = "") {
    let balances = getClientBalances()
  
    // Filtrar por cliente si se especifica
    if (clientId) {
      balances = balances.filter((balance) => balance.clientId === clientId)
    }
  
    // Ordenar por balance descendente
    balances.sort((a, b) => b.balance - a.balance)
  
    const tableBody = document.getElementById("balance-table")
    tableBody.innerHTML = ""
  
    if (balances.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = `
              <td colspan="5" class="py-4 text-center text-gray-500">No hay datos de balance disponibles</td>
          `
      tableBody.appendChild(row)
      return
    }
  
    balances.forEach((balance) => {
      const row = document.createElement("tr")
  
      row.innerHTML = `
              <td class="py-2 px-4">${balance.clientName}</td>
              <td class="py-2 px-4 text-green-600">${formatCurrency(balance.totalIncome)}</td>
              <td class="py-2 px-4 text-red-600">${formatCurrency(balance.totalExpense)}</td>
              <td class="py-2 px-4 font-bold ${balance.balance >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(balance.balance)}</td>
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
  
  function initReportFilters() {
    const clientSelect = document.getElementById("report-client-select")
    const transactionTypeFilter = document.getElementById("transaction-type-filter")
    const transactionDateFilter = document.getElementById("transaction-date-filter")
    const clearTransactionFilter = document.getElementById("clear-transaction-filter")
  
    clientSelect.addEventListener("change", function () {
      const clientId = this.value
      loadBalanceTable(clientId)
  
      if (clientId) {
        showClientDetail(clientId)
      } else {
        hideClientDetail()
        loadTransactionsTable()
      }
    })
  
    transactionTypeFilter.addEventListener("change", function () {
      const typeFilter = this.value
      const dateFilter = transactionDateFilter.value
      const clientId = clientSelect.value
  
      loadTransactionsTable(clientId, typeFilter, dateFilter)
    })
  
    transactionDateFilter.addEventListener("change", function () {
      const dateFilter = this.value
      const typeFilter = transactionTypeFilter.value
      const clientId = clientSelect.value
  
      loadTransactionsTable(clientId, typeFilter, dateFilter)
    })
  
    clearTransactionFilter.addEventListener("click", () => {
      transactionDateFilter.value = ""
      const typeFilter = transactionTypeFilter.value
      const clientId = clientSelect.value
  
      loadTransactionsTable(clientId, typeFilter, "")
    })
  }
  
  function showClientDetail(clientId) {
    const client = getClientById(clientId)
    const balance = calculateClientBalance(clientId)
  
    if (client) {
      // Mostrar contenedor de detalle
      document.getElementById("client-detail-container").classList.remove("hidden")
  
      // Actualizar datos
      document.getElementById("detail-client-name").textContent = client.name
      document.getElementById("detail-total-income").textContent = formatCurrency(balance.totalIncome)
      document.getElementById("detail-total-expenses").textContent = formatCurrency(balance.totalExpense)
  
      const balanceElement = document.getElementById("detail-balance")
      balanceElement.textContent = formatCurrency(balance.balance)
      balanceElement.className = `text-lg font-bold ${balance.balance >= 0 ? "text-green-600" : "text-red-600"}`
  
      // Cargar transacciones del cliente
      loadTransactionsTable(clientId)
    }
  }
  
  function hideClientDetail() {
    document.getElementById("client-detail-container").classList.add("hidden")
  }
  
  function loadTransactionsTable(clientId = "", typeFilter = "all", dateFilter = "") {
    let transactions = []
  
    if (clientId) {
      transactions = getClientTransactions(clientId)
    } else {
      transactions = getAllTransactions()
    }
  
    // Aplicar filtro de tipo
    if (typeFilter !== "all") {
      transactions = transactions.filter((transaction) => transaction.type === typeFilter)
    }
  
    // Aplicar filtro de fecha
    if (dateFilter) {
      transactions = transactions.filter((transaction) => transaction.date === dateFilter)
    }
  
    // Ordenar por fecha descendente
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
  
    const tableBody = document.getElementById("transactions-table")
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
  