"use client"

import { useState, useEffect } from "react"
import { orders } from "../api/api"

import OrderCard from "../components/OrderCard"


function OrdersHistory() {
  const [ordersHistory, setOrdersHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchOrders() {
      try {
      const response = await orders.getMine()
        setOrdersHistory(response.data.orders)
      } catch (err) {
        setError("No se pudo cargar el historial.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="container">
        <p>Cargando historial...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <p className="text-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="container ordershistory-padding-y-2">
      <h1 className="page-title">Mis pedidos</h1>
      {ordersHistory.length === 0 ? (
        <p>No has realizado pedidos aún.</p>
      ) : (
        <div className="orders-history-grid">
          {ordersHistory.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersHistory
