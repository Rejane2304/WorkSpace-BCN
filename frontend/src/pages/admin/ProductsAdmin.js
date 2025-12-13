import React, { useState, useEffect, useRef } from "react";
import { socket } from "../../utils/socket";
import { products as productsAPI } from "../../api/api";
import Modal from "../../components/Modal.js";
import Toast from "../../components/Toast";
import FilterSelect from "../../components/FilterSelect";
import { formatCurrency } from "../../utils/format";
import { devLog, devError } from "../../utils/devlog";
const CATEGORY_FILTER_OPTIONS = [
  { value: "todas", label: "Todas Categorías" },
  { value: "informatica", label: "Informática" },
  { value: "oficina", label: "Oficina" },
  { value: "audiovisual", label: "Audiovisual" },
];

function ProductsAdmin() {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      image: '',
      price: '',
      category: '',
      stock: '',
      minStock: '',
      maxStock: ''
    });
    const [toast, setToast] = useState({ type: '', message: '' });
    const [modalConfig, setModalConfig] = useState({
      isOpen: false,
      title: '',
      message: '',
      confirmLabel: '',
      cancelLabel: '',
      onConfirm: null,
      onCancel: null
    });
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [viewMode, setViewMode] = useState('grid');
    const formRef = useRef(null);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleImageSelect(e) {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function uploadImageToCloudinary() {
    if (!imageFile) return formData.image

    setIsUploadingImage(true)
    try {
      const response = await productsAPI.uploadImage(imageFile, formData.category)
      devLog(" Imagen subida exitosamente a Cloudinary")
      return response.data.url
    } catch (error) {
      devError(" Error al subir imagen:", error)
      setToast({
        type: "error",
        message: "Error al subir imagen: " + (error.response?.data?.mensaje || "Error desconocido"),
      })
      return formData.image
    } finally {
      setIsUploadingImage(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.category || formData.category === "todas") {
      setToast({ type: "error", message: "Selecciona una categoría válida para el producto." });
      return;
    }
    try {
      let imagenUrl = formData.image;
      if (imageFile) {
        imagenUrl = await uploadImageToCloudinary();
      }

      const datos = {};
      if (formData.name && formData.name.trim() !== "") datos.name = formData.name.trim();
      if (formData.description && formData.description.trim() !== "") datos.description = formData.description.trim();
      if (formData.category && formData.category !== "todas") {
        const catObj = CATEGORY_FILTER_OPTIONS.find(opt => opt.value === formData.category);
        if (catObj) datos.category = catObj.label;
      }
      if (imagenUrl && imagenUrl.trim() !== "") datos.image = imagenUrl.trim();
      if (formData.price !== "" && !isNaN(Number(formData.price))) datos.price = Number(formData.price);
      if (formData.stock !== "" && !isNaN(Number(formData.stock))) datos.stock = Number(formData.stock);
      if (formData.minStock !== "" && !isNaN(Number(formData.minStock))) datos.minStock = Number(formData.minStock);
      if (formData.maxStock !== "" && !isNaN(Number(formData.maxStock))) datos.maxStock = Number(formData.maxStock);

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, datos);
        setToast({ type: "success", message: "El producto se ha actualizado correctamente." });
      } else {
        await productsAPI.create(datos);
        setToast({ type: "success", message: "El producto se ha creado correctamente." });
      }

      setShowForm(false);
      loadProducts();
    } catch (error) {
      setToast({
        type: "error",
        message: "Error al guardar producto: " + (error.response?.data?.mensaje || "Error desconocido"),
      });
    }
  }

  async function loadProducts() {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      setToast({
        type: "error",
        message: "Error al cargar productos: " + (error.response?.data?.mensaje || "Error desconocido"),
      });
    }
  }

  useEffect(() => {
    loadProducts();
    socket.on("productsUpdated", loadProducts);
    return () => {
      socket.off("productsUpdated", loadProducts);
    };
    // eslint-disable-next-line
  }, []);

  async function deleteProduct(id) {
      const product = products.find((p) => p._id === id)

    setModalConfig({
      isOpen: true,
      title: "Eliminar producto",
        message: `¿Estás seguro de eliminar el producto "${product?.name || ""}"?`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: async () => {
        try {
          await productsAPI.delete(id)
          setProducts((prev) => prev.filter((p) => p._id !== id))
          setToast({ type: "success", message: "El producto se ha eliminado correctamente." })
        } catch (error) {
          setToast({ type: "error", message: "No se pudo eliminar el producto. Intenta de nuevo." })
        }
      },
      onCancel: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
    })
  }

  const filteredProducts = [...products]
    .filter((product) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (product.name || '').toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term)
      );
    })
    .filter((product) => {
      if (selectedCategory === "todas") return true;
      
      const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      
      const prodCat = normalize(product.category || '');
      const selCat = normalize(selectedCategory || '');
      
      return prodCat === selCat;
    })
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  function openForm(product = null) {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        image: product.image || '',
        price: product.price || '',
        category: product.category || '',
        stock: product.stock || '',
        minStock: product.minStock || '',
        maxStock: product.maxStock || ''
      });
      setImagePreview(product.image || null);
      setImageFile(null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        price: '',
        category: '',
        stock: '',
        minStock: '',
        maxStock: ''
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setShowForm(true);
  }

  useEffect(() => {
    if (!showForm) {
      setEditingProduct(null);
    }
  }, [showForm]);

  return (
    <div className="container productsadmin-padding-y-2">
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
      />
      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
      <Modal
        isOpen={showForm}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        confirmLabel={null}
        cancelLabel={null}
        onConfirm={null}
        onCancel={() => setShowForm(false)}
      >
        <div ref={formRef}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="textarea" />
            </div>

            <div className="form-group">
              <label className="label">Imagen del Producto</label>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="input" />
              {imagePreview && (
                <div className="productsadmin-margin-top-1">
                  <img
                    src={imagePreview}
                    alt="Previsualización"
                    className="productsadmin-img-preview"
                  />
                </div>
              )}
              {isUploadingImage && (
                <p className="productsadmin-text-accent productsadmin-margin-top-0-5">Subiendo imagen...</p>
              )}
            </div>

            <div className="flex gap-2">
              <div className="form-group productsadmin-flex-1">
                <label className="label">Precio (€)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

            <div className="form-group productsadmin-flex-1">
              <label className="label">Categoría</label>
                <FilterSelect
                  value={formData.category}
                  onChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  options={CATEGORY_FILTER_OPTIONS}
                  placeholder="Selecciona una categoría"
                />
            </div>
            </div>

            <div className="flex gap-2">
              <div className="form-group productsadmin-flex-1">
                <label className="label">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div className="form-group productsadmin-flex-1">
                <label className="label">Stock Mínimo</label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="form-group productsadmin-flex-1">
                <label className="label">Stock Máximo</label>
                <input
                  type="number"
                  name="maxStock"
                  value={formData.maxStock}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast((prev) => ({ ...prev, message: "" }))}
            />

            <div className="flex gap-2 mt-2 productsadmin-mt-2">
              <button type="submit" className="btn btn-primary" disabled={isUploadingImage}>
                {isUploadingImage ? "Subiendo..." : editingProduct ? "Actualizar" : "Crear"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
                disabled={isUploadingImage}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <div className="productsadmin-header card productsadmin-header-card">
        <div className="products-header productsadmin-mb-1-5">
          <h1 className="page-title">Gestión de Productos</h1>
        </div>
        <span className="text-small products-meta productsadmin-meta-block">
          Mostrando {filteredProducts.length} de {products.length} productos disponibles.
        </span>
        <button
          onClick={() => openForm()}
          className="btn btn-primary productsadmin-btn-add productsadmin-btn-create"
        >
          + Agregar Producto
        </button>
        <div className="products-barra-superior productsadmin-top-bar">
          <div className="flex gap-3 fila-filtros-productos productsadmin-flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-filtro products-input-w products-search-bar"
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
          <div className="product-view-toggle productsadmin-view-toggle">
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
      </div>

      {viewMode === "grid" ? (
        <div className="card-grid">
          {filteredProducts.map((product) => (
            <div key={product._id} className="card productsadmin-card-minh">
              <img
                src={product.image}
                alt={product.name}
                className="card-image productsadmin-img-contain"
              />
              <div className="card-body productsadmin-card-body-flex">
                <h3 className="card-title productsadmin-card-title">{product.name}</h3>
                <p className="products-card-desc productsadmin-desc-minh">{product.description?.slice(0, 60)}{product.description?.length > 60 ? '...' : ''}</p>
                <div className="productsadmin-mt-auto">
                  <div className="products-card-meta productsadmin-card-meta">
                    <span className="products-card-category productsadmin-category-text">{product.category}</span>
                    <span className="products-card-price productsadmin-price-text">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="products-card-stock productsadmin-mb-12">
                    <span className={product.stock <= (product.minStock || 2) ? "products-stock-low" : "products-stock-ok"}>
                      Stock: {product.stock}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2 products-card-actions">
                    <button onClick={() => openForm(product)} className="btn btn-secondary">
                      Editar
                    </button>
                    <button onClick={() => deleteProduct(product._id)} className="btn btn-outline">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="product-list-card-list">
          {filteredProducts.map((product) => {
            const imgSrc = product.image || "/assets/no-image.png";
            const prodName = product.name || "Producto";
            return (
              <div className="product-list-card" key={product._id}>
                <div className="product-list-card-img">
                  <img src={imgSrc} alt={prodName} />
                </div>
                <div className="product-list-card-info">
                  <div className="product-list-card-row product-list-card-name">{product.name}</div>
                  <div className="product-list-card-row productsadmin-category-text">{product.category}</div>
                  <div className="product-list-card-row product-list-card-price">{formatCurrency(product.price)}</div>
                  <div className="product-list-card-row">Stock: {product.stock}</div>
                </div>
                <div className="product-list-card-actions">
                  <button
                    className="btn btn-secondary btn-ms"
                    onClick={() => openForm(product)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-outline btn-ms"
                    onClick={() => deleteProduct(product._id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductsAdmin
