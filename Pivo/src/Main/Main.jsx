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

const uiText = {
    sortDefault: '\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u043e:',
    sortByRating: '\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u043e \u0440\u0435\u0439\u0442\u0438\u043d\u0433\u0443',
    sortByPrice: '\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u043e \u0446\u0435\u043d\u0435',
    searchPlaceholder: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435',
    searchAlt: '\u041f\u043e\u0438\u0441\u043a',
    ratingOption: '\u0420\u0435\u0439\u0442\u0438\u043d\u0433\u0443',
    priceOption: '\u0426\u0435\u043d\u0435',
    loadingCatalog: '\u041a\u0430\u0442\u0430\u043b\u043e\u0433 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044f...',
    retry: '\u041f\u043e\u043f\u0440\u043e\u0431\u043e\u0432\u0430\u0442\u044c \u0441\u043d\u043e\u0432\u0430',
    loadError: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043a\u0430\u0442\u0430\u043b\u043e\u0433. \u041f\u0440\u043e\u0432\u0435\u0440\u044c \u0441\u0435\u0440\u0432\u0435\u0440 \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0441\u043d\u043e\u0432\u0430.',
    errorLabel: '\u041e\u0448\u0438\u0431\u043a\u0430:',
    rarity: '\u0420\u0435\u0434\u043a\u043e\u0441\u0442\u044c:',
    author: '\u0410\u0432\u0442\u043e\u0440:',
    price: '\u0426\u0435\u043d\u0430:',
    rating: '\u0420\u0435\u0439\u0442\u0438\u043d\u0433:',
    close: '\u0417\u0430\u043a\u0440\u044b\u0442\u044c',
    design: '\u0414\u0438\u0437\u0430\u0439\u043d',
    taste: '\u0412\u043a\u0443\u0441',
    aftertaste: '\u041f\u043e\u0441\u043b\u0435\u0432\u043a\u0443\u0441\u0438\u0435',
    percentage: '\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u0430\u0436',
    reviewer: '\u041e\u0431\u0437\u043e\u0440\u0449\u0438\u043a',
    result: '\u0418\u0442\u043e\u0433:',
    currency: '\u0440\u0430\u0431\u043b\u0441'
}

const starsText = '\u2605\u2605\u2605\u2605\u2605'

export function Main () {
    const modalRef = useRef(null)
    const [inputValue, setInputValue] = useState("")
    const [debouncedInputValue, setDebouncedInputValue] = useState("")
    const [products, setProducts] = useState([])
    const [error, setError] = useState("")
    const [isDropdownClicked, setIsDropdownClicked] = useState(false)
    const [selected, setSelected] = useState(uiText.sortDefault)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)

    const filteredProducts = products.filter((product) => {
        const normalizedQuery = debouncedInputValue.trim().toLowerCase()

        if (!normalizedQuery) {
            return true
        }

        return product.name.toLowerCase().includes(normalizedQuery)
    })

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (selected === uiText.sortByRating) {
            return Number(b.rating) - Number(a.rating)
        }

        if (selected === uiText.sortByPrice) {
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
            console.log(uiText.errorLabel, error)
            setProducts([])
            setError(uiText.loadError)
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

    useEffect(() => {
        const handleResize = () => {
            setViewportWidth(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        if (!selectedProduct || !modalRef.current) {
            return
        }

        modalRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        })
    }, [selectedProduct])

    const getGridColumns = () => {
        if (viewportWidth <= 640) {
            return 1
        }

        if (viewportWidth <= 900) {
            return 2
        }

        if (viewportWidth <= 1200) {
            return 3
        }

        return 4
    }

    const gridColumns = getGridColumns()

    return (
        <>
            <div className='top_section'>
                <div className='Finder'>
                    <input
                        className="Input"
                        placeholder={uiText.searchPlaceholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />

                    <button className='finder_button' onClick={handleSearchClick}>
                        <img className='finder_icon' src={findLogo} alt={uiText.searchAlt} />
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
                                                setSelected(uiText.sortByRating)
                                            }}
                                        >
                                            {uiText.ratingOption}
                                        </button>
                                        <button
                                            className='dropdown_button3'
                                            onClick={() => {
                                                setIsDropdownClicked(false)
                                                setSelected(uiText.sortByPrice)
                                            }}
                                        >
                                            {uiText.priceOption}
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
                            <span>{uiText.loadingCatalog}</span>
                            <div className='loader_icon'>
                                <LottieAnimation animationData={lottieflow} loop />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="loader loader_error">
                            <span>{error}</span>
                            <button className='loader_retry' onClick={getProducts}>
                                {uiText.retry}
                            </button>
                        </div>
                    ) : (
                        sortedProducts.map((product, index) => {
                            const isSelected = selectedProduct?.id === product.id
                            const columnIndex = index % gridColumns
                            const modalPositionClass = gridColumns <= 2
                                ? 'modal_anchor_bottom'
                                : columnIndex >= Math.ceil(gridColumns / 2)
                                    ? 'modal_anchor_left'
                                    : 'modal_anchor_right'

                            return (
                                <div
                                    className={`product_slot${isSelected ? ' product_slot_selected' : ''}`}
                                    key={product.id}
                                >
                                    <div className="product" onClick={() => setSelectedProduct(product)}>
                                        <section className='product_name'>
                                            {product.name}
                                        </section>
                                        <div className='product_image'>
                                            <img src={`${API_URL}${product.image}`} alt={product.name} />
                                        </div>
                                        <div className="divider"></div>
                                        <section className='product_card_description'>
                                            <section className='product_meta_row product_rarity'>
                                                <span className='product_meta_label'>{uiText.rarity}</span>
                                                <span className='product_meta_value'>{product.rarity}</span>
                                            </section>
                                            <section className='product_meta_row product_author'>
                                                <span className='product_meta_label'>{uiText.author}</span>
                                                <span className='product_meta_value'>{product.author}</span>
                                            </section>
                                            <section className='product_meta_row product_price'>
                                                <span className='product_meta_label'>{uiText.price}</span>
                                                <span className='product_meta_value'>{product.price} {uiText.currency}</span>
                                            </section>
                                            <section className='product_meta_row product_rating'>
                                                <span className='product_meta_label'>{uiText.rating}</span>
                                                <span className='product_meta_value'>{product.rating}</span>
                                                <span className="stars">
                                                    <span className="stars-empty">{starsText}</span>
                                                    <span className="stars-filled" style={{ width: getStarWidth(product.rating) }}>{starsText}</span>
                                                </span>
                                            </section>
                                        </section>
                                    </div>
                                    {isSelected && (
                                        <div className={`modal ${modalPositionClass}`} ref={modalRef}>
                                            <section className='modal_header'>
                                                <h3 className='modal_header_text'>{selectedProduct.name}</h3>
                                                <img src={`${API_URL}${selectedProduct.image}`} alt={selectedProduct.name} className='modal_image' />
                                            </section>
                                            <section className='modal_desc'>
                                                <button onClick={() => setSelectedProduct(null)} className='close_button'>
                                                    <img src={closeIcon} className='close_logo' alt={uiText.close} />
                                                </button>
                                                <section className='modal_design modal_desc_header_text'>
                                                    <section>
                                                        {uiText.design}: {selectedProduct.design_rate}
                                                    </section>
                                                    <section className='modal_desc_text'>
                                                        {selectedProduct.design}
                                                    </section>
                                                </section>

                                                <div className='modal_divider'></div>

                                                <section className='modal_taste'>
                                                    <section className='modal_desc_header_text'>
                                                        {uiText.taste}: {selectedProduct.taste_rate}
                                                    </section>
                                                    <section className='modal_desc_text'>
                                                        {selectedProduct.taste}
                                                    </section>
                                                </section>

                                                <div className='modal_divider'></div>

                                                <section className='modal_aftertaste'>
                                                    <section className='modal_desc_header_text'>
                                                        {uiText.aftertaste}: {selectedProduct.aftertaste_rate}
                                                    </section>
                                                    <section className='modal_desc_text'>
                                                        {selectedProduct.aftertaste}
                                                    </section>
                                                </section>

                                                <div className='modal_divider'></div>

                                                <section className='modal_percentage modal_desc_header_text'>
                                                    {uiText.percentage}: {selectedProduct.percentage}%
                                                </section>

                                                <div className='modal_divider'></div>

                                                <section className='modal_price modal_desc_header_text'>
                                                    {uiText.price} {selectedProduct.price} {uiText.currency}
                                                </section>

                                                <div className='modal_divider'></div>

                                                <section className='modal_author modal_desc_header_text'>
                                                    {uiText.reviewer}: {selectedProduct.author}
                                                </section>
                                            </section>
                                            <section className='modal_full_desc'>
                                                <span className='modal_desc_header_text'>{uiText.result}</span>{' '}
                                                <span className='modal_desc_text'>{selectedProduct.rating} - {selectedProduct.description}</span>
                                            </section>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </section>
            </div>
        </>
    )
}
