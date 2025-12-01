import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import CartPage from "../pages/CartPage"
import { AuthProvider } from "../context/AuthContext"

const mockNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}))

const SAMPLE_CART = [
  {
    _id: "p1",
    name: "Silla",
    category: "Oficina",
    price: 20,
    quantity: 2,
    image: "/silla.png",
  },
  {
    _id: "p2",
    name: "Ratón",
    category: "Informática",
    price: 5,
    quantity: 1,
  },
]

const renderCart = () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <CartPage />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe("Cart page", () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  it("muestra vista vacía cuando no hay artículos", async () => {
    localStorage.setItem("carrito", JSON.stringify([]))
    renderCart()

    expect(await screen.findByText(/Tu carrito está vacío/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /vaciar carrito/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /pagar/i })).toBeDisabled()
  })

  it("muestra totales y persiste cambios de cantidad", async () => {
    localStorage.setItem("carrito", JSON.stringify(SAMPLE_CART))
    renderCart()

    expect(await screen.findByText("Silla")).toBeInTheDocument()
    expect(screen.getByText("Ratón")).toBeInTheDocument()
    expect(screen.getAllByText(/Subtotal/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/45,00/)[0]).toBeInTheDocument()

    const spinButtons = screen.getAllByRole("spinbutton")
    expect(spinButtons.length).toBe(2)

    await act(async () => {
      fireEvent.change(spinButtons[0], { target: { value: "3" } })
    })
    await act(async () => {
      await waitFor(() => expect(localStorage.getItem("carrito")).toContain('"quantity":3'))
      expect(screen.getAllByText(/60,00/)[0]).toBeInTheDocument() 
    })
  })

  it("vacía el carrito y muestra un toast", async () => {
    localStorage.setItem("carrito", JSON.stringify(SAMPLE_CART))
    renderCart()

    const clearButton = await screen.findByRole("button", { name: /vaciar carrito/i })
    const user = userEvent.setup()
    await act(async () => {
      await user.click(clearButton)
    })
    await act(async () => {
      expect(localStorage.getItem("carrito")).toBe("[]")
      expect(await screen.findByText(/Carrito vacío|vacío/i)).toBeInTheDocument()
    })

    expect(await screen.findByText(/Carrito limpiado/i)).toBeInTheDocument()
    expect(localStorage.getItem("carrito")).toBe("[]")
  })

  it("obliga a autenticarse antes de pagar", async () => {
    localStorage.setItem("carrito", JSON.stringify(SAMPLE_CART))
    renderCart({ isAuthenticated: false, isAdmin: false })

    const payButton = await screen.findByRole("button", { name: /pagar/i })
    const user = userEvent.setup()
    await act(async () => {
      await user.click(payButton)
    })

    expect(await screen.findByText(/Inicia sesión para continuar/i)).toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith("/login")
  })

  it("navega al checkout cuando el usuario está autenticado", async () => {
    localStorage.setItem("carrito", JSON.stringify(SAMPLE_CART))
    localStorage.setItem("token", "fake-token")
    localStorage.setItem("user", JSON.stringify({ role: "cliente" }))
    renderCart()

    const payButton = await screen.findByRole("button", { name: /pagar/i })
    const user = userEvent.setup()
    await act(async () => {
      await user.click(payButton)
    })

    expect(mockNavigate).toHaveBeenCalledWith("/checkout")
  })
})
