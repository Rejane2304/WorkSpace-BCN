export function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return ""
  }

  const formatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(Number(value))
}

export function formatNumber(value, decimals = 0) {
  if (value == null || Number.isNaN(Number(value))) {
    return "0"
  }

  const formatter = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return formatter.format(Number(value))
}
