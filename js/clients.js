// Funciones para la gestión de clientes

// Declarar las variables getClients, calculateClientBalance, formatCurrency, updateClient y showToast
// Asumo que estas funciones están definidas en otro archivo y se importan aquí.
// Si no es el caso, se deben definir aquí.
// Para este ejemplo, las declaro como funciones vacías.
const getClients = () => {
    return []
  }
  const calculateClientBalance = (clientId) => {
    return { balance: 0 }
  }
  const formatCurrency = (amount) => {
    return amount.toFixed(2)
  }
  const updateClient = (clientData) => {}
  const showToast = (message, type) => {
    console.log(message, type)
  }
  const addClient = (clientData) => {}
  const deleteClient = (clientId) => {}
  const getClientById = (clientId) => {
    return null
  }
  const openModal = (modalId) => {}
  const closeModal = (modalId) => {}
  const updateDashboardStats = () => {}
  
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
              <td class="py-2 px-4 font-bold ${balance.balance >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(balance.balance)}</td>
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
                  <td class="py-2 px-4 font-bold ${balance.balance >= 0 ? "text-green-600" : "text-red-600"}">${formatCurrency(balance.balance)}</td>
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
  
  function initClientForm() {
    const clientForm = document.getElementById("client-form")
    if (!clientForm) return
  
    clientForm.addEventListener("submit", (e) => {
      e.preventDefault()
  
      const clientId = document.getElementById("client-id").value
      const clientData = {
        name: document.getElementById("client-name").value,
        docType: document.getElementById("client-doc-type").value,
        docNumber: document.getElementById("client-doc-number").value,
        email: document.getElementById("client-email").value,
        observations: document.getElementById("client-observations").value,
      }
  
      if (clientId) {
        // Actualizar cliente existente
        clientData.id = clientId
        updateClient(clientData)
        showToast("Cliente actualizado correctamente", "success")
      } else {
        // Agregar nuevo cliente
        addClient(clientData)
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
          loadClientsTable()
          updateDashboardStats()
          updateClientSelectors()
        }
  
        closeModal("delete-modal")
      }
    }
  
    // Abrir modal de confirmación
    openModal("delete-modal")
  }
  
  // Actualizar selectores de clientes en formularios de ingresos y egresos
  function updateClientSelectors() {
    const clients = getClients()
    const incomeClientSelect = document.getElementById("income-client")
    const expenseClientSelect = document.getElementById("expense-client")
    const reportClientSelect = document.getElementById("report-client-select")
  
    // Limpiar selectores
    incomeClientSelect.innerHTML = ""
    expenseClientSelect.innerHTML = ""
    reportClientSelect.innerHTML = '<option value="">Todos los clientes</option>'
  
    // Agregar opciones de clientes
    clients.forEach((client) => {
      const option = document.createElement("option")
      option.value = client.id
      option.textContent = client.name
  
      incomeClientSelect.appendChild(option.cloneNode(true))
      expenseClientSelect.appendChild(option.cloneNode(true))
      reportClientSelect.appendChild(option.cloneNode(true))
    })
  }
  