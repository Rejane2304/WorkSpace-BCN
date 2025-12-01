import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SalesAdmin from "../pages/admin/SalesAdmin"
import { AuthProvider } from "../context/AuthContext"
import { MemoryRouter } from "react-router-dom"
import { sales as salesAPI } from "../api/api"

jest.mock("../components/FilterSelect", () => ({ value, onChange, options, dataTestId }) => (
  <select 
    data-testid={dataTestId || "mock-select"}
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="mock-select"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
))

jest.mock("../components/Toast", () => {
  return {
    __esModule: true,
    default: ({ message }) => {
      return <div data-testid="mock-toast">{message || "NO MESSAGE"}</div>
    }
  }
})

jest.mock("../api/api", () => ({
  sales: {
    getAll: jest.fn(),
    updateStatus: jest.fn()
  }
}))

jest.setTimeout(20000)

const mockSales = [
  {
    _id: "SALE-123",
    status: "pending",
    total: 100,
    saleDate: "2023-01-01T12:00:00Z",
    customer: { name: "Pablo", email: "pablo@test.com" },
    shippingAddress: { street: "Calle Falsa 123", city: "Barcelona", postalCode: "08001" },
    items: []
  }
]

const renderSalesAdmin = () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <SalesAdmin />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe("SalesAdmin page (datos mockeados)", () => {
  beforeEach(() => {
    localStorage.setItem("token", "fake-token")
    localStorage.setItem("user", JSON.stringify({ role: "admin" }))
    salesAPI.getAll.mockResolvedValue({ 
      data: { 
        sales: mockSales, 
        summary: { totalOrders: 1, totalRevenue: 100 } 
      } 
    })
    salesAPI.updateStatus.mockResolvedValue({ data: { success: true } })
  })

  it("muestra al menos una venta mockeada, resumen y alertas", async () => {
    renderSalesAdmin()
    await screen.findAllByText(/ID venta:/i, {}, { timeout: 10000 })
    
    expect(screen.getByText(/Total de ventas:/i)).toBeInTheDocument()
    expect(screen.getByText(/Ventas filtradas:/i)).toBeInTheDocument()
    expect(screen.getByText(/Ingresos totales:/i)).toBeInTheDocument()
    
    const cards = document.querySelectorAll('.sales-admin-summary-card')
    expect(cards.length).toBeGreaterThan(0)
    expect(cards[0]).toHaveTextContent(/ID venta:/i)
  })

  it("filtros por texto y estado funcionan con datos mockeados", async () => {
    const user = userEvent.setup()
    renderSalesAdmin()
    await screen.findAllByText(/ID venta:/i, {}, { timeout: 10000 })
    const searchInput = screen.getByPlaceholderText(/Buscar por ID, nombre o email/i)
    await act(async () => {
      await user.clear(searchInput)
      await user.type(searchInput, "pablo")
    })
    await waitFor(() => {
      const pablos = screen.getAllByText(/pablo/i)
      expect(pablos.length).toBeGreaterThan(0)
    }, { timeout: 10000 })

    const selects = screen.getAllByTestId("mock-select")
    const statusSelect = selects[0]
    
    await act(async () => {
      await user.selectOptions(statusSelect, "pending")
    })
    
    await waitFor(() => {
      const estados = screen.getAllByText(/pendiente/i)
      expect(estados.length).toBeGreaterThan(0)
    }, { timeout: 10000 })
  })

  it("abre el modal de editar y permite cambiar estado mockeado", async () => {
    const user = userEvent.setup()
    renderSalesAdmin()
    await screen.findAllByText(/ID venta:/i, {}, { timeout: 10000 })
    
    const editButtons = await screen.findAllByRole("button", { name: /Editar/i })
    expect(editButtons.length).toBeGreaterThan(0)
    const editButton = editButtons[0]
    await act(async () => {
      await user.click(editButton)
    })
    
    expect(await screen.findByText(/Modificar estado de venta/i)).toBeInTheDocument()
    
    const modal = screen.getByRole("dialog")
    const modalSelect = within(modal).getByTestId("mock-select")
    
    await act(async () => {
      await user.selectOptions(modalSelect, "processing")
    })

    const saveButton = screen.getByRole("button", { name: /Guardar/i })
    await act(async () => {
      await user.click(saveButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/Estado actualizado correctamente/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    // Esperar a que se recarguen las ventas para evitar warnings de act()
    await waitFor(() => {
      expect(salesAPI.getAll).toHaveBeenCalledTimes(2)
    })

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    }, { timeout: 10000 })
    
    expect(salesAPI.updateStatus).toHaveBeenCalledWith("SALE-123", "processing")
  })
})
