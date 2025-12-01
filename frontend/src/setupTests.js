import "@testing-library/jest-dom"

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = function () {};
}

const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].startsWith("⚠️ React Router Future Flag Warning")
  ) {
    return
  }
  originalWarn(...args)
}

jest.mock("socket.io-client", () => {
  return {
    io: () => ({
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connect: jest.fn(),
    }),
  }
})
