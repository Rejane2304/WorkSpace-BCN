import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { act } from "react"
import { AuthProvider, useAuth } from "../context/AuthContext"

function TestConsumer() {
  const { user, token, isAuthenticated, login, logout, loading } = useAuth()
  if (loading) return <div data-testid="loading">loading</div>
  return (
    <div>
      <p data-testid="user">{user?.name ?? "no-user"}</p>
      <p data-testid="token">{token ?? "no-token"}</p>
      <p data-testid="auth">{isAuthenticated ? "authed" : "guest"}</p>
      <button onClick={() => {
        login({ name: "Maria", email: "maria@test.com" }, "fake-token-123")
      }} type="button">login-real</button>
      <button onClick={() => logout()} type="button">logout</button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear()
  })
  it("carga datos guardados en localStorage", async () => {
    localStorage.setItem("token", "saved-token")
    localStorage.setItem("user", JSON.stringify({ name: "Saved User", rol: "cliente" }))

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    expect(await screen.findByTestId("user")).toHaveTextContent("Saved User")
    expect(screen.getByTestId("token")).toHaveTextContent("saved-token")
    expect(screen.getByTestId("auth")).toHaveTextContent("authed")
  })
  it("login actualiza estado y localStorage", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    const loginButton = await screen.findByRole("button", { name: /login/i })
    const user = userEvent.setup()
    await act(async () => {
      await user.click(loginButton)
    })
    expect(screen.getByTestId("user")).not.toHaveTextContent("no-user")
    expect(screen.getByTestId("token")).not.toHaveTextContent("no-token")
    expect(screen.getByTestId("auth")).toHaveTextContent("authed")
    expect(localStorage.getItem("token")).not.toBeNull()
    expect(localStorage.getItem("user")).not.toBeNull()
  })

  it("logout limpia estado y localStorage", async () => {
    localStorage.setItem("token", "tok-123")
    localStorage.setItem("user", JSON.stringify({ name: "Rejane", rol: "admin" }))
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    const logoutButton = await screen.findByRole("button", { name: /logout/i })
    const user = userEvent.setup()
    await act(async () => {
      await user.click(logoutButton)
    })
    expect(screen.getByTestId("user")).toHaveTextContent("no-user")
    expect(screen.getByTestId("token")).toHaveTextContent("no-token")
    expect(screen.getByTestId("auth")).toHaveTextContent("guest")
    expect(localStorage.getItem("token")).toBeNull()
    expect(localStorage.getItem("user")).toBeNull()
  })
})
