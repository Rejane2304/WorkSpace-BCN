import { describe, it, expect } from '@jest/globals'
import { calculateTotals } from '../src/routes/orders.js'

describe('Helpers de lógica interna', () => {
  it('calculateTotals suma correctamente los subtotales', () => {
    const items = [
      { unitPrice: 10, quantity: 2 },
      { unitPrice: 5, quantity: 3 },
      { unitPrice: 7, quantity: 1 },
    ]
    const result = calculateTotals(items)
    expect(result.subtotal).toBe(10*2 + 5*3 + 7*1)
  })

  it('calculateTotals retorna subtotal 0 si array vacío', () => {
    const result = calculateTotals([])
    expect(result.subtotal).toBe(0)
  })
})
