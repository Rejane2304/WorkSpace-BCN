export const sortProductsByName = (products = []) => {
  return [...(products || [])].sort((a, b) => {
    const aName = (a?.nombre || a?.name || "").trim()
    const bName = (b?.nombre || b?.name || "").trim()
    return aName.localeCompare(bName, "es", { sensitivity: "base" })
  })
}
