import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PaymentsAdmin from "../pages/admin/PaymentsAdmin"
import { AuthProvider } from "../context/AuthContext"
import { MemoryRouter } from "react-router-dom"
import { payments as paymentsAPI } from "../api/api"

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
      return message ? <div data-testid="mock-toast">{message}</div> : null
    }
  }
})

jest.mock("../api/api", () => ({
  payments: {
    getAllAdmin: jest.fn(),
    updateStatusAdmin: jest.fn()
  }
}))

jest.setTimeout(15000)

const mockPayments = [
  {
    _id: "PAY-123",
    estado: "pending",
    monto: 50,
    fechaPago: "2023-01-01T12:00:00Z",
    metodoPago: "tarjeta",
    venta: {
      _id: "SALE-123",
      cliente: { nombre: "Pablo", email: "pablo@test.com" },
      items: []
    }
  }
]

const renderPaymentsAdmin = () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <PaymentsAdmin />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe("PaymentsAdmin page (datos mockeados)", () => {
  beforeEach(() => {
    localStorage.setItem("token", "fake-token")
    localStorage.setItem("user", JSON.stringify({ role: "admin" }))
    paymentsAPI.getAllAdmin.mockResolvedValue({ data: mockPayments })
    paymentsAPI.updateStatusAdmin.mockResolvedValue({})
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it("carga al menos un pago mockeado y muestra las tarjetas con resúmenes", async () => {
    renderPaymentsAdmin()
    const editButtons = await screen.findAllByRole("button", { name: /editar/i })
    expect(editButtons.length).toBeGreaterThan(0)

    expect(screen.getByText(/Pagos filtrados:/i)).toBeInTheDocument()
    expect(screen.getByText(/Ingresos totales:/i)).toBeInTheDocument()
    
    const cards = document.querySelectorAll('.card')
    expect(cards.length).toBeGreaterThan(0)
    
    expect(cards[0]).toHaveTextContent(/ID pago:/i)
  })

  it("permite al admin editar un pago mockeado y recarga la lista", async () => {
    renderPaymentsAdmin()
    const editButtons = await screen.findAllByRole("button", { name: /editar/i })
    expect(editButtons.length).toBeGreaterThan(0)
    const editButton = editButtons[0]
    const user = userEvent.setup()
    await act(async () => {
      await user.click(editButton)
    })
    await act(async () => {
      const modal = screen.getByRole("dialog")
      const modalSelect = within(modal).getByTestId("mock-select")
      
      await user.selectOptions(modalSelect, "processing") 

      const saveButtons = await screen.findAllByRole("button", { name: /Guardar/i })
      expect(saveButtons.length).toBeGreaterThan(0)
      await user.click(saveButtons[0])
      
      await waitFor(() => {
        const toasts = screen.getAllByText(/Estado de pago actualizado correctamente/i)
        expect(toasts.length).toBeGreaterThan(0)
      }, { timeout: 10000 })
      
      expect(paymentsAPI.updateStatusAdmin).toHaveBeenCalledWith("PAY-123", "processing")
    })
  })
})
