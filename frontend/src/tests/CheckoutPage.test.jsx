import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CheckoutPage from "../pages/CheckoutPage"
import { AuthProvider } from "../context/AuthContext"
import { MemoryRouter } from "react-router-dom"
import { customers, orders, payments } from "../api/api"

jest.mock("../api/api", () => ({
  customers: {
    getProfile: jest.fn(),
  },
  orders: {
    create: jest.fn(),
    cancel: jest.fn(),
  },
  payments: {
    create: jest.fn(),
  },
}))

const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}))

const clienteSeed = {
  _id: "seed-user-id",
  nombre: "María Rodriguez",
  email: "maria.rodriguez@email.com",
  role: "cliente"
}

const renderCheckout = async (customProfileData = null) => {
  localStorage.setItem("token", "token-seed-usuario")
  localStorage.setItem("user", JSON.stringify(clienteSeed))
  localStorage.setItem("carrito", JSON.stringify([
    { _id: "p1", nombre: "Silla Premium", precio: 99.99, cantidad: 1 }
  ]))

  customers.getProfile.mockResolvedValue({
    data: customProfileData || {
      direccion: "Calle Falsa 123",
      ciudad: "Barcelona",
      codigoPostal: "08001",
      pais: "España",
      telefono: "600123456"
    }
  })

  orders.create.mockResolvedValue({
    data: {
      order: { _id: "order-123", sale: { _id: "sale-123" } },
      saleId: "sale-123"
    }
  })

  payments.create.mockResolvedValue({
    data: { success: true }
  })

  await act(async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CheckoutPage />
        </AuthProvider>
      </MemoryRouter>
    )
  })
}

describe("Checkout page (flujo real)", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it("muestra error cuando faltan campos al confirmar", async () => {
    await renderCheckout({}) 
    
    const confirmButton = await screen.findByRole("button", { name: /confirmar pedido/i })
    const user = userEvent.setup()
    await act(async () => {
      await user.click(confirmButton)
    })
    expect(await screen.findByText(/Completa todos los campos de envío antes de continuar/i)).toBeInTheDocument()
  })

  it("procesa pago real y navega al resumen", async () => {
    await renderCheckout()
    const user = userEvent.setup()
    
    const confirmButton = await screen.findByRole("button", { name: /confirmar pedido/i })
    await act(async () => {
      await user.click(confirmButton)
    })
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/orders/success/order-123", { replace: true })
    })
    
    expect(localStorage.getItem("carrito")).toBeNull()
  })
})
  
