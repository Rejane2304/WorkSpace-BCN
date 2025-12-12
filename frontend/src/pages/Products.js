"use client"

import { useState, useEffect } from "react"
import { socket } from "../utils/socket"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { products as productsAPI } from "../api/api"
import ProductCard from "../components/ProductCard.js"
import FilterSelect from "../components/FilterSelect"
import Modal from "../components/Modal.js"

function normalizeText(text) {
  return text
    ? text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    : ""
}

function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const CATEGORY_FILTER_OPTIONS = [
    { value: "todas", label: "Todas Categorías" },
    { value: "informatica", label: "Informática" },
    { value: "Oficina", label: "Oficina" },
    { value: "Audiovisual", label: "Audiovisual" },
  ]
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: null,
    cancelLabel: null,
    onConfirm: null,
    onCancel: null,
    onClose: null,
  });
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    function fetchProducts() {
      setIsLoading(true);
      productsAPI
        .getAll()
        .then((res) => {
          setProducts(Array.isArray(res.data) ? res.data : []);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          setModalConfig({
            isOpen: true,
            title: "Error",
            message: "No se pudieron cargar los productos.",
            confirmLabel: "Cerrar",
            cancelLabel: null,
            onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
            onCancel: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
            onClose: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
          });
        });
    }
    fetchProducts();
    socket.on("productsUpdated", fetchProducts);
    return () => {
      socket.off("productsUpdated", fetchProducts);
    };
  }, []);

  useEffect(() => {
    let results = Array.isArray(products) ? products : [];
    const normalizedSearch = normalizeText(search);
    if (search) {
      results = results.filter((product) => {
        const name = normalizeText(product.name);
        const description = normalizeText(product.description);
        return name.includes(normalizedSearch) || description.includes(normalizedSearch);
      });
    }
    if (selectedCategory !== "todas") {
      const normalizedCategory = normalizeText(selectedCategory);
      console.log("[Filtro] selectedCategory:", selectedCategory, "normalized:", normalizedCategory);
      results = results.filter((product) => {
        const prodCat = product.categoria || product.category || "";
        const prodCatNorm = normalizeText(prodCat);
        const match = prodCatNorm === normalizedCategory;
        if (!match) {
          console.log("[Filtro] No match:", { prodCat, prodCatNorm, normalizedCategory });
        }
        return match;
      });
    }
    setFilteredProducts(Array.isArray(results) ? results : []);
  }, [search, selectedCategory, products]);

  function addToCart(product) {
    const currentCart = JSON.parse(localStorage.getItem("carrito") || "[]");
    const existingProduct = currentCart.find((item) => item._id === product._id);
    if (existingProduct) {
      existingProduct.cantidad += 1;
    } else {
      currentCart.push({ ...product, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));
    setModalConfig({
      isOpen: true,
      title: "Producto agregado",
      message: `"${product.nombre || product.name}" se ha añadido al carrito.`,
      confirmLabel: "Seguir comprando",
      cancelLabel: "Ir al carrito",
      onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
      onCancel: () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        window.location.href = "/carrito";
      },
      onClose: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
    });
  }

    if (isLoading) {
      return (
        <div className="container text-center products-py-4">
          Cargando productos...
        </div>
      )
    }
  
    return (
      <div className="container">
        <Modal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmLabel={modalConfig.confirmLabel}
          cancelLabel={modalConfig.cancelLabel}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
          onClose={modalConfig.onClose}
        />
        <div className="hero-white-container products-my-25">
          <div className="products-panel card products-panel-transparent">
            <div className="products-header products-mb-25">
              <h1 className="page-title">Nuestros productos</h1>
              <p className="text-small products-meta">
                Mostrando {filteredProducts.length} de {products.length} productos disponibles
              </p>
            </div>
            <p className="text-small products-description products-mb-25">
              Colecciones seleccionadas para equipar oficinas, estudios y espacios creativos en Barcelona.
            </p>
            <div className="products-top-bar products-top-bar-flex">
              <div className="flex gap-3 products-filter-row products-flex-1">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input input-filter products-input-w products-search-bar"
                  aria-label="Buscar productos"
                />
                <div className="products-category-bar">
                  <FilterSelect
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={CATEGORY_FILTER_OPTIONS}
                    placeholder="Categoría"
                    dataTestId="products-category-filter"
                  />
                </div>
              </div>
              <div className="product-view-toggle products-view-toggle-flex">
                <button
                  type="button"
                  className={"btn btn-secondary " + (viewMode === "grid" ? "active" : "")}
                  onClick={() => setViewMode("grid")}
                  disabled={viewMode === "grid"}
                >
                  Vista en tarjetas
                </button>
                <button
                  type="button"
                  className={"btn btn-secondary " + (viewMode === "list" ? "active" : "")}
                  onClick={() => setViewMode("list")}
                  disabled={viewMode === "list"}
                >
                  Vista en lista
                </button>
              </div>
            </div>
            {viewMode === "grid" ? (
              <div className="product-grid">
                {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} onAddToCart={addToCart} isAdmin={isAdmin} />
                ))}
              </div>
            ) : (
              <div className="product-list-card-container">
                {Array.isArray(filteredProducts) && filteredProducts.map((product) => {
                  const prod = product || product.producto || {};
                  const imgSrc = prod.image || prod.imagen || "/assets/no-image.png";
                  const prodName = prod.name || prod.nombre || "Producto";
                  const isAvailable = product.stock > 0;
                  const canPurchase = isAvailable && !isAdmin;
                  return (
                    <div className="product-list-card" key={product._id}>
                      <div className="product-list-card-img">
                        <img src={imgSrc} alt={prodName} />
                      </div>
                      <div className="product-list-card-info">
                        <div className="product-list-card-row product-list-card-name">{product.nombre || product.name}</div>
                        <div className="product-list-card-row text-success">{product.categoria || product.category}</div>
                        <div className="product-list-card-row product-list-card-price">{(product.precio || product.price) + ' €'}</div>
                      </div>
                      <div className="product-list-card-actions">
                        <button
                          className={`btn btn-primary btn-ms ${canPurchase ? "products-cursor-pointer" : "products-cursor-not-allowed"}`}
                          onClick={() => { if (canPurchase) addToCart(product); }}
                          disabled={!canPurchase}
                        >
                          Comprar
                        </button>
                        <Link to={`/productos/${product._id}`} className="btn btn-outline btn-ms">
                          Ver detalles
                        </Link>
                        {isAdmin && (
                          <div className="clients-only-notice">
                            Solo clientes pueden comprar
                          </div>
                        )}
                        {!isAvailable && (
                          <p className="text-secondary text-center products-mt-05">
                            Producto sin stock
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  export default Products; 



