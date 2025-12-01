import { render, screen, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Products from "../pages/Products"
import userEvent from "@testing-library/user-event"
import { AuthContext } from "../context/AuthContext"
import { products as productsAPI } from "../api/api"

jest.mock("../api/api", () => ({
  products: {
    getAll: jest.fn()
  }
}))

describe("Products page", () => {
  const userValue = { 
    isAdmin: false, 
    isAuthenticated: true,
    user: { email: "test@email.com", role: "client" } 
  }
  
  const mockProducts = [
    {
      _id: "1",
      name: "Producto Test",
      description: "Descripción test",
      price: 100,
      category: "Informatica",
      stock: 10, 
      image: "/assets/test.jpg"
    }
  ]

  beforeEach(() => {
    productsAPI.getAll.mockResolvedValue({ data: mockProducts })
  })

  it("muestra productos reales y el total", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={userValue}>
          <Products />
        </AuthContext.Provider>
      </MemoryRouter>
    )
    expect(await screen.findByText(/Productos/i)).toBeInTheDocument()
    expect(await screen.findByText("Producto Test")).toBeInTheDocument()
  })

  it("agrega producto al carrito y muestra feedback", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AuthContext.Provider value={userValue}>
          <Products />
        </AuthContext.Provider>
      </MemoryRouter>
    )
    
    const buyButtons = await screen.findAllByRole("button", { name: /comprar/i })
    const enabledButtons = buyButtons.filter(btn => !btn.disabled)
    
    expect(enabledButtons.length).toBeGreaterThan(0)
    
    const firstButton = enabledButtons[0]
    
    const card = firstButton.closest('.card') || firstButton.closest('.product-list-card')
    const titleElement = card.querySelector('.card-title') || card.querySelector('h3') || card.querySelector('.product-list-card-name')
    const productName = titleElement.textContent
    
    const spyDispatch = jest.spyOn(window, "dispatchEvent")
    await act(async () => {
      await user.click(firstButton)
    })
    await act(async () => {
      expect(spyDispatch).toHaveBeenCalled()
      expect(await screen.findByText(/Producto agregado/i)).toBeInTheDocument()
      
      expect(localStorage.getItem("carrito")).toContain(productName)
      expect(window.dispatchEvent).toBeDefined()
    })
  })
})
