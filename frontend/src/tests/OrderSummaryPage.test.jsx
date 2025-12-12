import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import OrderSummaryPage from "../pages/OrderSummaryPage"
import { AuthProvider } from "../context/AuthContext"
import { orders } from "../api/api"

jest.mock("../api/api", () => ({
  orders: {
    getById: jest.fn()
  }
}))

const mockPrint = jest.fn()
const mockClose = jest.fn()
const mockWrite = jest.fn()

const clienteSeed = {
  _id: "seed-user-id",
  nombre: "María Rodriguez",
  email: "maria.rodriguez@email.com",
  role: "cliente"
}

const mockOrder = {
  _id: "order-1",
  total: 120,
  shippingCost: 10,
  createdAt: "2023-01-01T12:00:00Z",
  status: "completed",
  payment: { status: "completed", method: "card" },
  items: [
    {
      _id: "item-1",
      name: "Producto Test",
      price: 100,
      quantity: 1,
      producto: { _id: "prod-1", name: "Producto Test", images: ["img.jpg"] }
    }
  ],
  shippingAddress: {
    street: "Calle Test 123",
    city: "Barcelona",
    postalCode: "08001",
    country: "Spain",
    phone: "666777888"
  }
}

describe("OrderSummary page (mocked)", () => {
  beforeEach(() => {
    localStorage.setItem("token", "fake-token")
    localStorage.setItem("user", JSON.stringify(clienteSeed))
    orders.getById.mockResolvedValue({ data: { order: mockOrder } })
    
    window.print = jest.fn()
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  const renderWithRouter = () => {
    render(
      <MemoryRouter initialEntries={[`/orders/order-1`]}>
        <AuthProvider>
          <Routes>
            <Route path="/orders/:orderId" element={<OrderSummaryPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )
  }

  it("renderiza el resumen de la orden correctamente", async () => {
    renderWithRouter()
    
    expect(screen.getByText(/Cargando orden/i)).toBeInTheDocument()
    
    await waitFor(() => expect(screen.getAllByText(/Gracias por tu compra/i)[0]).toBeInTheDocument())
    expect(screen.getByText(/Nº pedido:/i)).toBeInTheDocument()
    expect(screen.getByText("order-1")).toBeInTheDocument()
    
    expect(screen.getAllByText("Producto Test")[0]).toBeInTheDocument()
    expect(screen.getByText(/1 x/)).toBeInTheDocument()
    
    expect(screen.getAllByText("120,00 €")[0]).toBeInTheDocument() 
    
    const printButton = screen.getByRole("button", { name: /Imprimir resumen/i })
    await userEvent.click(printButton)
    expect(window.print).toHaveBeenCalled()
  })
})
