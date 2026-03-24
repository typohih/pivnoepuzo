import './Main.css'
import { useState, useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import { API_URL } from '../config'
import findLogo from '../../images/find_logo.svg'
import closeIcon from '../../images/close_icon.svg'
import lottieflow from '../../images/lottieflow-loading-04-2-000000-easey.json'
import beer2977173 from '../../images/free-icon-beer-2977173.png'

function LottieAnimation ({ animationData, loop = true }) {
    const containerRef = useRef(null)

    useEffect(() => {
        if (!containerRef.current) {
            return
        }

        const animation = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: true,
            animationData
        })

        return () => {
            animation.destroy()
        }
    }, [animationData, loop])

    return <div ref={containerRef} style={{ width: 120, height: 120 }} />
}

export function Main () {
    const [inputValue, setInputValue] = useState("")
    const [debouncedInputValue, setDebouncedInputValue] = useState("")
    const [products, setProducts] = useState([])
    const [error, setError] = useState("")
    const [isDropdownClicked, setIsDropdownClicked] = useState(false)
    const [selected, setSelected] = useState("Сортировать по:")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    const filteredProducts = products.filter((product) => {
        const normalizedQuery = debouncedInputValue.trim().toLowerCase()

        if (!normalizedQuery) {
            return true
        }

        return product.name.toLowerCase().includes(normalizedQuery)
    })

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (selected === "Сортировка по рейтингу") {
            return Number(b.rating) - Number(a.rating)
        }

        if (selected === "Сортировка по цене") {
            return Number(a.price) - Number(b.price)
        }

        return 0
    })

    const getStarWidth = (rating) => {
        const numericRating = Math.max(0, Math.min(5, Number(rating)))
        return `${(numericRating / 5) * 100}%`
    }

    const getProducts = async () => {
        const loadingStartedAt = Date.now()

        try {
            setLoading(true)
            setError("")

            const response = await fetch(`${API_URL}/products`, {
                method: "GET"
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setProducts(data)
        } catch (error) {
            console.log("Ошибка:", error)
            setProducts([])
            setError("Не удалось загрузить каталог. Проверь сервер и попробуй снова.")
        } finally {
            const elapsed = Date.now() - loadingStartedAt
            const minimumLoadingTime = 700

            if (elapsed < minimumLoadingTime) {
                await new Promise((resolve) => setTimeout(resolve, minimumLoadingTime - elapsed))
            }

            setLoading(false)
        }
    }

    const handleSearchClick = () => {
        setDebouncedInputValue(inputValue)
    }

    useEffect(() => {
        getProducts()
    }, [])

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedInputValue(inputValue)
        }, 500)

        return () => {
            clearTimeout(timerId)
        }
    }, [inputValue])

    return (
        <>
            <div className='top_section'>
                <div className='Finder'>
                    <input
                        className="Input"
                        placeholder="Введите название"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />

                    <button className='finder_button' onClick={handleSearchClick}>
                        <img className='finder_icon' src={findLogo} alt="Поиск" />
                    </button>
                </div>
            </div>
            <div className='main_section' id="catalog">
                <div className='catalog_toolbar'>
                    <div className='catalog_toolbar_left'>
                        <img src={beer2977173} alt="Beer icon" className='catalog_toolbar_beer' />
                    </div>
                    <div className='catalog_toolbar_right'>
                        <div className='dropdown'>
                            <button
                                className='dropdown_button'
                                onClick={() => setIsDropdownClicked(true)}
                            >
                                {selected}
                            </button>

                            <div className='dropdown_menu'>
                                {isDropdownClicked && (
                                    <>
                                        <button
                                            className='dropdown_button2'
                                            onClick={() => {
                                                setIsDropdownClicked(false)
                                                setSelected("Сортировка по рейтингу")
                                            }}
                                        >
                                            Рейтингу
                                        </button>
                                        <button
                                            className='dropdown_button3'
                                            onClick={() => {
                                                setIsDropdownClicked(false)
                                                setSelected("Сортировка по цене")
                                            }}
                                        >
                                            Цене
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <section className="container">
                    {loading ? (
                        <div className="loader">
                            <span>Каталог загружается...</span>
                            <div className='loader_icon'>
                                <LottieAnimation animationData={lottieflow} loop />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="loader loader_error">
                            <span>{error}</span>
                            <button className='loader_retry' onClick={getProducts}>
                                Попробовать снова
                            </button>
                        </div>
                    ) : (
                        sortedProducts.map((product) => (
                            <div className="product" key={product.id} onClick={() => setSelectedProduct(product)}>
                                <section className='product_name'>
                                    {product.name}
                                </section>
                                <div className='product_image'>
                                    <img src={`${API_URL}${product.image}`} alt={product.name} />
                                </div>
                                <div className="divider"></div>
                                <section className='product_card_description'>
                                    <section className='product_rarity'>
                                        Редкость: {product.rarity}
                                    </section>
                                    <section className='product_rating'>
                                        Рейтинг: {product.rating}
                                        <span className="stars">
                                            <span className="stars-empty">★★★★★</span>
                                            <span className="stars-filled" style={{ width: getStarWidth(product.rating) }}>★★★★★</span>
                                        </span>
                                        <section></section>
                                    </section>
                                </section>
                            </div>
                        ))
                    )}
                    {selectedProduct && (
                        <div className='modal'>
                            <section className='modal_header'>
                                <h3 className='modal_header_text'>{selectedProduct.name}</h3>
                                <img src={`${API_URL}${selectedProduct.image}`} alt={selectedProduct.name} className='modal_image' />
                            </section>
                            <section className='modal_desc'>
                                <button onClick={() => setSelectedProduct(null)} className='close_button'>
                                    <img src={closeIcon} className='close_logo' alt="Закрыть" />
                                </button>
                                <section className='modal_design modal_desc_header_text'>
                                    <section>
                                        Дизайн: {selectedProduct.design_rate}
                                    </section>
                                    <section className='modal_desc_text'>
                                        {selectedProduct.design}
                                    </section>
                                </section>

                                <div className='modal_divider'></div>

                                <section className='modal_taste'>
                                    <section className='modal_desc_header_text'>
                                        Вкус: {selectedProduct.taste_rate}
                                    </section>
                                    <section className='modal_desc_text'>
                                        {selectedProduct.taste}
                                    </section>
                                </section>

                                <div className='modal_divider'></div>

                                <section className='modal_aftertaste'>
                                    <section className='modal_desc_header_text'>
                                        Послевкусие: {selectedProduct.aftertaste_rate}
                                    </section>
                                    <section className='modal_desc_text'>
                                        {selectedProduct.aftertaste}
                                    </section>
                                </section>

                                <div className='modal_divider'></div>

                                <section className='modal_percentage modal_desc_header_text'>
                                    Процентаж: {selectedProduct.percentage}%
                                </section>

                                <div className='modal_divider'></div>

                                <section className='modal_price modal_desc_header_text'>
                                    Цена: {selectedProduct.price} раблс
                                </section>

                                <div className='modal_divider'></div>

                                <section className='modal_author modal_desc_header_text'>
                                    Обзорщик: {selectedProduct.author}
                                </section>
                            </section>
                            <section className='modal_full_desc'>
                                <span className='modal_desc_header_text'>Итог:</span>{' '}
                                <span className='modal_desc_text'>{selectedProduct.rating} - {selectedProduct.description}</span>
                            </section>
                        </div>
                    )}
                </section>
            </div>
        </>
    )
}
