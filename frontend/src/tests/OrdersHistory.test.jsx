import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import OrdersHistory from "../pages/OrdersHistory"
import { AuthProvider } from "../context/AuthContext"
import { orders } from "../api/api"

jest.mock("../api/api", () => ({
  orders: {
    getMine: jest.fn()
  }
}))

describe("OrdersHistory page", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it("muestra lista de pedidos mockeados", async () => {
    const mockOrders = [
      {
        _id: "order-1",
        createdAt: "2023-01-01T12:00:00Z",
        total: 100,
        status: "completed",
        items: []
      }
    ]
    orders.getMine.mockResolvedValue({ data: { orders: mockOrders } })

    render(
      <MemoryRouter>
        <AuthProvider>
          <OrdersHistory />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Cargando historial/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/Mis pedidos/i)).toBeInTheDocument())
    expect(screen.queryByText(/No has realizado pedidos aún/i)).not.toBeInTheDocument()
  })
  
  it("muestra mensaje cuando no hay pedidos", async () => {
    orders.getMine.mockResolvedValue({ data: { orders: [] } })

    render(
      <MemoryRouter>
        <AuthProvider>
          <OrdersHistory />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText(/No has realizado pedidos aún/i)).toBeInTheDocument())
  })
})
