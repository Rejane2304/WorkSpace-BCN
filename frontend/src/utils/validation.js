const normalizePhone = (value = "") => value.trim().replace(/\s+/g, " ")

const isValidPhone = (value = "") => {
  const normalized = normalizePhone(value)
  const phoneRegex = /^\+?[0-9 ]{7,20}$/
  return normalized === "" || phoneRegex.test(normalized)
}

const hasValue = (value) => value !== null && value !== undefined && String(value).trim().length > 0

export { normalizePhone, isValidPhone, hasValue }
