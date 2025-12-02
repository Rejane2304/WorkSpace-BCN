import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PaymentMethodSelect from "../components/PaymentMethodSelect"

describe("PaymentMethodSelect", () => {
  it("muestra el método por defecto y no expande el menú inicialmente", () => {
    render(<PaymentMethodSelect value="tarjeta" onChange={() => {}} />)

    const control = screen.getByRole("button", { name: /Tarjeta/i })
    expect(control).toBeInTheDocument()
    expect(screen.queryByText(/PayPal/i)).not.toBeInTheDocument()
  })

  it("abre el menú, cambia el método de pago y lo cierra", async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<PaymentMethodSelect value="tarjeta" onChange={onChange} />)

    const control = screen.getByRole("button", { name: /Tarjeta/i })
    await act(async () => {
      await user.click(control)
    })

    const paypalOption = screen.getByText(/PayPal/i, { selector: "button.select-custom-option" })
    expect(paypalOption).toBeInTheDocument()

    await act(async () => {
      await user.click(paypalOption)
    })
    expect(onChange).toHaveBeenCalledWith("paypal")
    expect(screen.queryByRole("button", { name: /PayPal/i })).not.toBeInTheDocument()
  })

  it("cierra el menú al hacer click fuera", async () => {
    const user = userEvent.setup()
    render(<PaymentMethodSelect value="paypal" onChange={() => {}} />)

    const control = screen.getByRole("button", { name: /PayPal/i })
    await act(async () => {
      await user.click(control)
    })

    const paypalOption = screen.getByText(/PayPal/i, { selector: "button.select-custom-option" })
    expect(paypalOption).toBeInTheDocument()

    await act(async () => {
      await user.pointer({ keys: "[MouseLeft]", target: document.body })
    })
    expect(screen.queryByText(/PayPal/i, { selector: "button.select-custom-option" })).not.toBeInTheDocument()
  })
})
