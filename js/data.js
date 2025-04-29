// Funciones para gestionar los datos en localStorage

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
    return symbol + Number.parseFloat(amount).toFixed(2)
  }
  
  // Clientes
  function getClients() {
    const clients = localStorage.getItem("bobClients")
    return clients ? JSON.parse(clients) : []
  }
  
  function saveClients(clients) {
    localStorage.setItem("bobClients", JSON.stringify(clients))
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
  function calculateClientBalance(clientId) {
    const incomes = getIncomes().filter((income) => income.clientId === clientId)
    const expenses = getExpenses().filter((expense) => expense.clientId === clientId)
  
    const totalIncome = incomes.reduce((sum, income) => sum + Number.parseFloat(income.amount), 0)
    const totalExpense = expenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0)
  
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    }
  }
  
  function calculateTotalBalance() {
    const incomes = getIncomes()
    const expenses = getExpenses()
  
    const totalIncome = incomes.reduce((sum, income) => sum + Number.parseFloat(income.amount), 0)
    const totalExpense = expenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0)
  
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    }
  }
  
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
    const transactions = getAllTransactions()
    return transactions.filter((transaction) => transaction.clientId === clientId)
  }
  
  // Cargar datos de ejemplo si no existen
  function loadSampleData() {
    if (getClients().length === 0) {
      // Clientes de ejemplo
      const sampleClients = [
        {
          id: "client1",
          name: "Empresa ABC S.A.C.",
          docType: "RUC",
          docNumber: "20123456789",
          email: "contacto@empresaabc.com",
          observations: "Cliente frecuente",
          createdAt: new Date().toISOString(),
        },
        {
          id: "client2",
          name: "Juan Pérez",
          docType: "DNI",
          docNumber: "45678912",
          email: "juan.perez@gmail.com",
          observations: "Cliente nuevo",
          createdAt: new Date().toISOString(),
        },
        {
          id: "client3",
          name: "Corporación XYZ",
          docType: "RUC",
          docNumber: "20987654321",
          email: "finanzas@xyz.com",
          observations: "",
          createdAt: new Date().toISOString(),
        },
      ]
      saveClients(sampleClients)
  
      // Ingresos de ejemplo
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)
  
      const sampleIncomes = [
        {
          id: "income1",
          clientId: "client1",
          date: today.toISOString().split("T")[0],
          method: "Transferencia",
          bank: "BCP",
          currency: "PEN",
          amount: 5000,
          concept: "Garantía para subasta de vehículo Toyota Hilux",
          type: "income",
          createdAt: today.toISOString(),
        },
        {
          id: "income2",
          clientId: "client2",
          date: yesterday.toISOString().split("T")[0],
          method: "Depósito",
          bank: "BBVA",
          currency: "USD",
          amount: 1200,
          concept: "Garantía para subasta de vehículo Honda Civic",
          type: "income",
          createdAt: yesterday.toISOString(),
        },
        {
          id: "income3",
          clientId: "client3",
          date: lastWeek.toISOString().split("T")[0],
          method: "Transferencia",
          bank: "Interbank",
          currency: "PEN",
          amount: 8500,
          concept: "Garantía para subasta de camión Volvo",
          type: "income",
          createdAt: lastWeek.toISOString(),
        },
      ]
      saveIncomes(sampleIncomes)
  
      // Egresos de ejemplo
      const sampleExpenses = [
        {
          id: "expense1",
          clientId: "client2",
          date: today.toISOString().split("T")[0],
          method: "Transferencia",
          bank: "BBVA",
          currency: "USD",
          amount: 800,
          concept: "Devolución parcial de garantía",
          type: "expense",
          createdAt: today.toISOString(),
        },
        {
          id: "expense2",
          clientId: "client3",
          date: yesterday.toISOString().split("T")[0],
          method: "Transferencia",
          bank: "Interbank",
          currency: "PEN",
          amount: 8500,
          concept: "Devolución total de garantía por cancelación de subasta",
          type: "expense",
          createdAt: yesterday.toISOString(),
        },
      ]
      saveExpenses(sampleExpenses)
    }
  }
  