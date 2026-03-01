import { useEffect, useRef, useState } from "react";
import "./Main.css";

const emptyForm = {
  name: "",
  price: "",
  rating: "",
  rarity: "",
  design: "",
  taste: "",
  aftertaste: "",
  alcoholPercent: "",
  description: "",
};

const sortOptions = [
  { value: "default", label: "Без сортировки" },
  { value: "asc", label: "От меньшего к большему" },
  { value: "desc", label: "От большего к меньшему" },
];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .split(/[^a-zA-Zа-яА-ЯёЁ0-9]+/)
    .filter(Boolean);
}

function parseRatingValue(value) {
  const text = String(value ?? "").trim().replace(",", ".");

  if (!text) {
    return 0;
  }

  if (text.includes("/")) {
    const [left, right] = text.split("/").map((part) => Number(part.trim()));

    if (Number.isFinite(left) && Number.isFinite(right) && right > 0) {
      return (left / right) * 10;
    }
  }

  return Number(text) || 0;
}

export function Main({ searchQuery }) {
  const [catalog, setCatalog] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingSort, setRatingSort] = useState("default");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [password, setPassword] = useState("");
  const [editorPassword, setEditorPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditorAuthorized, setIsEditorAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const sortRef = useRef(null);

  const loadCatalog = async () => {
    setCatalogError("");

    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to load catalog");
      }

      const products = await response.json();
      setCatalog(Array.isArray(products) ? products : []);
    } catch (error) {
      setCatalogError(
        error instanceof Error ? error.message : "Failed to load catalog",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    if (!isSortOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!sortRef.current?.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsSortOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isSortOpen]);

  const searchTokens = tokenize(searchQuery);
  const filteredCatalog =
    searchTokens.length === 0
      ? catalog
      : catalog.filter((product) => {
          const titleTokens = tokenize(product.name);
          return searchTokens.some((token) => titleTokens.includes(token));
        });
  const visibleCatalog = [...filteredCatalog].sort((left, right) => {
    if (ratingSort === "asc") {
      return parseRatingValue(left.ratingLabel || left.rating) -
        parseRatingValue(right.ratingLabel || right.rating);
    }

    if (ratingSort === "desc") {
      return parseRatingValue(right.ratingLabel || right.rating) -
        parseRatingValue(left.ratingLabel || left.rating);
    }

    return 0;
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setSubmitError("");

    if (!file) {
      setImagePreview("");
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetEditorForm = () => {
    setFormData(emptyForm);
    setImageFile(null);

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      if (!imageFile) {
        throw new Error("Select an image");
      }

      const imageDataUrl = await readFileAsDataUrl(imageFile);
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-catalog-password": editorPassword,
        },
        body: JSON.stringify({
          ...formData,
          imageDataUrl,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || "Failed to save product");
      }

      const createdProduct = await response.json();
      setCatalog((current) => [createdProduct, ...current]);
      resetEditorForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save product",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorToggle = () => {
    setIsEditorOpen((current) => !current);
    setPasswordError("");
    setSubmitError("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("Wrong password");
      }

      setEditorPassword(password);
      setPassword("");
      setIsEditorAuthorized(true);
      setIsEditorOpen(true);
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Wrong password",
      );
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const activeSortLabel =
    sortOptions.find((option) => option.value === ratingSort)?.label ??
    sortOptions[0].label;

  useEffect(() => {
    if (!selectedProduct) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedProduct(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedProduct]);

  return (
    <main className="main">
      <section className="main__panel">
        <div className="main__heading">
          <div className="main__heading-title">
            <h2 className="main__title">Обзоры</h2>
          </div>
          <div className="main__heading-actions">
            <div className="main__sort" ref={sortRef}>
              <span className="main__sort-label">Рейтинг</span>
              <button
                className={`main__sort-trigger${isSortOpen ? " main__sort-trigger--open" : ""}`}
                type="button"
                onClick={() => setIsSortOpen((current) => !current)}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <span>{activeSortLabel}</span>
                <span className="main__sort-chevron" aria-hidden="true" />
              </button>
              {isSortOpen && (
                <div className="main__sort-menu" role="listbox" aria-label="Сортировка рейтинга">
                  {sortOptions.map((option) => {
                    const isActive = option.value === ratingSort;

                    return (
                      <button
                        key={option.value}
                        className={`main__sort-option${isActive ? " main__sort-option--active" : ""}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          setRatingSort(option.value);
                          setIsSortOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              className="main__editor-toggle"
              onClick={handleEditorToggle}
              type="button"
            >
              {isEditorOpen ? "Скрыть редактор" : "Добавить обзор"}
            </button>
          </div>
        </div>

        {isEditorOpen && !isEditorAuthorized && (
          <section className="main__composer" aria-label="Catalog access">
            <div className="main__composer-copy">
              <h3 className="main__composer-title">
                Редактор (доступ только для администраторов)
              </h3>
              <p className="main__composer-text">
                Пароль проверяется на сервере. После этого можно добавлять
                товары и загружать изображения.
              </p>
            </div>
            <form className="main__auth" onSubmit={handlePasswordSubmit}>
              <label className="main__field">
                <span>Пароль</span>
                <input
                  className="main__input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <button className="main__submit" type="submit">
                Разблокировать редактор
              </button>
            </form>
            {passwordError && <p className="main__error">{passwordError}</p>}
          </section>
        )}

        {isEditorOpen && isEditorAuthorized && (
          <section className="main__composer" aria-label="Add product">
            <div className="main__composer-copy">
              <h3 className="main__composer-title">Редактор каталога</h3>
              <p className="main__composer-text">
                Новый товар отправляется на сервер, а изображение сохраняется в
                общей папке `uploads/`.
              </p>
            </div>
            <form className="main__form" onSubmit={handleSubmit}>
              <label className="main__field">
                <span>Название</span>
                <input
                  className="main__input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="main__field">
                <span>Цена</span>
                <input
                  className="main__input"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="main__field">
                <span>Рейтинг</span>
                <input
                  className="main__input"
                  name="rating"
                  type="text"
                  inputMode="decimal"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="main__field">
                <span>Редкость</span>
                <input
                  className="main__input"
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="main__field">
                <span>Дизайн</span>
                <input
                  className="main__input"
                  name="design"
                  value={formData.design}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="main__field">
                <span>Вкус</span>
                <input
                  className="main__input"
                  name="taste"
                  value={formData.taste}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="main__field">
                <span>Послевкусие</span>
                <input
                  className="main__input"
                  name="aftertaste"
                  value={formData.aftertaste}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="main__field">
                <span>Процентаж</span>
                <input
                  className="main__input"
                  name="alcoholPercent"
                  value={formData.alcoholPercent}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="main__field">
                <span>Изображение</span>
                <input
                  className="main__input main__input--file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageChange}
                  required
                />
              </label>
              <label className="main__field main__field--wide">
                <span>Итоговое описание</span>
                <textarea
                  className="main__input main__input--textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </label>
              {imagePreview && (
                <div className="main__preview">
                  <span className="main__preview-label">Превью изображения</span>
                  <img
                    className="main__preview-image"
                    src={imagePreview}
                    alt="Предпросмотр товара"
                  />
                </div>
              )}
              <button
                className="main__submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Сохранение..." : "Добавить в каталог"}
              </button>
            </form>
            {submitError && <p className="main__error">{submitError}</p>}
          </section>
        )}

        {catalogError && <p className="main__error">{catalogError}</p>}

        <ul className="main__list">
          {!isLoading && catalog.length === 0 && (
            <li className="main__empty">
              Каталог пуст. Используйте кнопку "Добавить обзор", чтобы создать
              товар.
            </li>
          )}
          {!isLoading && catalog.length > 0 && visibleCatalog.length === 0 && (
            <li className="main__empty">
              По вашему запросу ничего не найдено.
            </li>
          )}
          {isLoading && <li className="main__empty">Загрузка каталога...</li>}
          {visibleCatalog.map((product) => (
            <li key={product.id} className="main__item">
              <button
                className="main__card-button"
                type="button"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="main__card-head">
                  <p className="main__name">{product.name}</p>
                </div>
                <div className="main__image">
                  {product.imageUrl ? (
                    <img
                      className="main__product-image"
                      src={product.imageUrl}
                      alt={product.name}
                    />
                  ) : (
                    <span>IMG</span>
                  )}
                </div>
                <dl className="main__meta main__meta--compact">
                  <div className="main__meta-item">
                    <dt>Цена</dt>
                    <dd>{product.price ? `${product.price} руб.` : "-"}</dd>
                  </div>
                  <div className="main__meta-item">
                    <dt>Процентаж</dt>
                    <dd>{product.alcoholPercent || "-"}</dd>
                  </div>
                  <div className="main__meta-item">
                    <dt>Редкость</dt>
                    <dd>{product.rarity || "-"}</dd>
                  </div>
                  <div className="main__meta-item">
                    <dt>Рейтинг</dt>
                    <dd>{product.ratingLabel || product.rating}</dd>
                  </div>
                </dl>
              </button>
            </li>
          ))}
        </ul>

        {selectedProduct && (
          <div className="main__modal-backdrop" onClick={closeModal}>
            <section
              className="main__modal"
              role="dialog"
              aria-modal="true"
              aria-label={selectedProduct.name}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="main__modal-close"
                type="button"
                onClick={closeModal}
              >
                Закрыть
              </button>
              <div className="main__modal-media">
                {selectedProduct.imageUrl ? (
                  <img
                    className="main__modal-image"
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                  />
                ) : (
                  <div className="main__image">IMG</div>
                )}
              </div>
              <div className="main__modal-content">
                <h3 className="main__modal-title">{selectedProduct.name}</h3>
                <p className="main__modal-price">
                  {selectedProduct.price ? `${selectedProduct.price} руб.` : "-"}
                </p>
                <dl className="main__hover-meta">
                  <div className="main__meta-item">
                    <dt>Редкость</dt>
                    <dd>{selectedProduct.rarity || "-"}</dd>
                  </div>
                  <div className="main__meta-item">
                    <dt>Дизайн</dt>
                    <dd>{selectedProduct.design || "-"}</dd>
                  </div>
                  <div className="main__meta-item">
                    <dt>Вкус</dt>
                    <dd>{selectedProduct.taste || "-"}</dd>
                  </div>
                  <div className="main__meta-item">
                    <dt>Послевкусие</dt>
                    <dd>{selectedProduct.aftertaste || "-"}</dd>
                  </div>
                  <div className="main__meta-item">
                    <dt>Процентаж</dt>
                    <dd>{selectedProduct.alcoholPercent || "-"}</dd>
                  </div>
                  <div className="main__meta-item">
                    <dt>Рейтинг</dt>
                    <dd>{selectedProduct.ratingLabel || selectedProduct.rating}</dd>
                  </div>
                </dl>
                <div className="main__meta-item">
                  <dt>Итог</dt>
                  <dd className="main__description">{selectedProduct.description}</dd>
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
