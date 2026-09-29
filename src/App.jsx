import { useEffect, useMemo, useState } from "react";
import productsData from "./products";
import "./App.css";

const PRODUCTS_KEY = "campusCartProducts";
const CART_KEY = "campusCartCart";
const WISHLIST_KEY = "campusCartWishlist";
const THEME_KEY = "campusCartTheme";

function getProductImage(product) {
    if (product.id >= 1 && product.id <= 8) {
        return `${import.meta.env.BASE_URL}images/Generated image ${product.id}.png`;
    }

    return product.image;
}

function App() {
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem(PRODUCTS_KEY);

        if (!saved) {
            return productsData;
        }

        try {
            const savedProducts = JSON.parse(saved);

            return savedProducts.map((product) => ({
                ...product,
                image: getProductImage(product),
            }));
        } catch {
            return productsData;
        }
    });

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem(CART_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem(WISHLIST_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem(THEME_KEY) || "light";
    });

    const [page, setPage] = useState("dashboard");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("default");

    const [showCart, setShowCart] = useState(false);
    const [showWishlist, setShowWishlist] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [toast, setToast] = useState("");

    /* CONTACT FORM STATE */

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [formErrors, setFormErrors] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [formSubmitted, setFormSubmitted] = useState(false);

    /* USE EFFECT */

    useEffect(() => {
        localStorage.setItem(
            PRODUCTS_KEY,
            JSON.stringify(products)
        );
    }, [products]);

    useEffect(() => {
        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );
    }, [cart]);

    useEffect(() => {
        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(wishlist)
        );
    }, [wishlist]);

    useEffect(() => {
        localStorage.setItem(THEME_KEY, theme);

        document.body.classList.toggle(
            "dark",
            theme === "dark"
        );
    }, [theme]);

    /* SUCCESS MESSAGE */

    const showSuccess = (message) => {
        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 2200);
    };

    /* FORM HANDLING */

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));

        setFormErrors((current) => ({
            ...current,
            [name]: ""
        }));

        setFormSubmitted(false);
    };

    /* CLIENT-SIDE FORM VALIDATION */

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = "Name is required.";
        } else if (formData.name.trim().length < 2) {
            errors.name =
                "Name must be at least 2 characters.";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email
            )
        ) {
            errors.email =
                "Please enter a valid email address.";
        }

        if (!formData.message.trim()) {
            errors.message = "Message is required.";
        } else if (
            formData.message.trim().length < 10
        ) {
            errors.message =
                "Message must be at least 10 characters.";
        }

        setFormErrors({
            name: errors.name || "",
            email: errors.email || "",
            message: errors.message || ""
        });

        return Object.keys(errors).length === 0;
    };

    /* FORM SUBMIT */

    const handleFormSubmit = (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setFormSubmitted(true);

        setFormData({
            name: "",
            email: "",
            message: ""
        });

        setFormErrors({
            name: "",
            email: "",
            message: ""
        });

        showSuccess(
            "Message submitted successfully"
        );
    };

    /* PAGE CHANGE */

    const changePage = (newPage) => {
        setPage(newPage);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    /* CATEGORIES */

    const categories = [
        "All",
        "Stationery",
        "Electronics",
        "Bags",
        "Accessories"
    ];

    /* SEARCH, FILTER AND SORT */

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (search.trim()) {
            const text = search.toLowerCase();

            result = result.filter(
                (product) =>
                    product.name
                        .toLowerCase()
                        .includes(text) ||
                    product.category
                        .toLowerCase()
                        .includes(text)
            );
        }

        if (category !== "All") {
            result = result.filter(
                (product) =>
                    product.category === category
            );
        }

        if (sort === "low") {
            result.sort(
                (a, b) => a.price - b.price
            );
        }

        if (sort === "high") {
            result.sort(
                (a, b) => b.price - a.price
            );
        }

        if (sort === "name") {
            result.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        }

        return result;
    }, [
        products,
        search,
        category,
        sort
    ]);

    /* CART */

    const addToCart = (product) => {
        setCart((currentCart) => {
            const existing = currentCart.find(
                (item) => item.id === product.id
            );

            if (existing) {
                return currentCart.map((item) =>
                    item.id === product.id
                        ? {
                            ...item,
                            quantity:
                                item.quantity + 1
                        }
                        : item
                );
            }

            return [
                ...currentCart,
                {
                    ...product,
                    image: getProductImage(product),
                    quantity: 1
                }
            ];
        });

        showSuccess(
            `${product.name} added to cart`
        );
    };

    const increaseQuantity = (id) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity:
                            item.quantity + 1
                    }
                    : item
            )
        );
    };

    const decreaseQuantity = (id) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            quantity:
                                item.quantity - 1
                        }
                        : item
                )
                .filter(
                    (item) => item.quantity > 0
                )
        );
    };

    const removeFromCart = (id) => {
        setCart((currentCart) =>
            currentCart.filter(
                (item) => item.id !== id
            )
        );

        showSuccess(
            "Item removed from cart"
        );
    };

    const clearCart = () => {
        setCart([]);
        showSuccess("Cart cleared");
    };

    const cartCount = cart.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );

    const cartTotal = cart.reduce(
        (total, item) =>
            total +
            item.price * item.quantity,
        0
    );

    /* WISHLIST */

    const toggleWishlist = (product) => {
        const exists = wishlist.some(
            (item) => item.id === product.id
        );

        if (exists) {
            setWishlist((current) =>
                current.filter(
                    (item) =>
                        item.id !== product.id
                )
            );

            showSuccess(
                "Removed from wishlist"
            );
        } else {
            setWishlist((current) => [
                ...current,
                {
                    ...product,
                    image: getProductImage(product)
                }
            ]);

            showSuccess(
                "Added to wishlist"
            );
        }
    };

    /* PRODUCT CARD */

    function ProductCard({ product }) {
        const isWishlisted =
            wishlist.some(
                (item) =>
                    item.id === product.id
            );

        const isInCart =
            cart.some(
                (item) =>
                    item.id === product.id
            );

        return (
            <div className="product-card">
                <div className="product-image-wrap">
                    <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="product-image"
                    />

                    <button
                        className={`wishlist-btn ${isWishlisted
                            ? "active"
                            : ""
                            }`}
                        onClick={() =>
                            toggleWishlist(product)
                        }
                        title="Wishlist"
                    >
                        {isWishlisted
                            ? "♥"
                            : "♡"}
                    </button>
                </div>

                <div className="product-info">
                    <div className="product-category">
                        {product.category}
                    </div>

                    <h3 className="product-name">
                        {product.name}
                    </h3>

                    <div className="product-bottom">
                        <div className="product-price">
                            ₹{product.price}
                        </div>

                        <button
                            className={`add-cart-btn ${isInCart
                                ? "added"
                                : ""
                                }`}
                            onClick={() =>
                                addToCart(product)
                            }
                        >
                            {isInCart
                                ? "✓ Added"
                                : "Add to Cart"}
                        </button>
                    </div>

                    <button
                        className="details-btn"
                        onClick={() =>
                            setSelectedProduct(
                                product
                            )
                        }
                    >
                        View Details
                    </button>
                </div>
            </div>
        );
    }

    /* DASHBOARD */

    function Dashboard() {
        const averagePrice =
            products.length > 0
                ? Math.round(
                    products.reduce(
                        (sum, product) =>
                            sum +
                            product.price,
                        0
                    ) / products.length
                )
                : 0;

        return (
            <>
                <section className="hero">
                    <div className="hero-content">
                        <div className="hero-eyebrow">
                            CAMPUSCART • STUDENT STORE
                        </div>

                        <h1>
                            Everything you
                            <span>
                                need, made simple.
                            </span>
                        </h1>

                        <p className="hero-description">
                            Discover affordable
                            essentials for your
                            campus life. Browse
                            products, search by
                            category, manage your
                            cart, and save your
                            favorite items.
                        </p>

                        <div className="hero-actions">
                            <button
                                className="primary-btn"
                                onClick={() =>
                                    changePage(
                                        "products"
                                    )
                                }
                            >
                                Explore Products
                            </button>

                            <button
                                className="secondary-btn"
                                onClick={() =>
                                    setShowWishlist(
                                        true
                                    )
                                }
                            >
                                View Wishlist
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-circle">
                            🛒
                        </div>

                        <div className="hero-tag top">
                            ✦ Affordable Essentials
                        </div>

                        <div className="hero-tag bottom">
                            🎓 Made for Students
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="section-header">
                        <div>
                            <div className="section-label">
                                OVERVIEW
                            </div>

                            <h2 className="section-title">
                                CampusCart at a glance
                            </h2>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">
                                TOTAL PRODUCTS
                            </div>

                            <div className="stat-value">
                                {products.length}
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                CATEGORIES
                            </div>

                            <div className="stat-value">
                                {categories.length -
                                    1}
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                CART ITEMS
                            </div>

                            <div className="stat-value">
                                {cartCount}
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                AVERAGE PRICE
                            </div>

                            <div className="stat-value">
                                ₹{averagePrice}
                            </div>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    /* PRODUCTS */

    function ProductsPage() {
        return (
            <section className="products-page">
                <div className="section-header">
                    <div>
                        <div className="section-label">
                            COLLECTION
                        </div>

                        <h1 className="section-title">
                            Student Essentials
                        </h1>
                    </div>

                    <button
                        className="view-all"
                        onClick={() => {
                            setSearch("");
                            setCategory("All");
                            setSort("default");
                        }}
                    >
                        Reset Filters
                    </button>
                </div>

                <div className="products-controls">
                    <input
                        type="text"
                        className="search-box"
                        placeholder="🔍 Search for products..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    <select
                        className="filter-select"
                        value={category}
                        onChange={(event) =>
                            setCategory(
                                event.target.value
                            )
                        }
                    >
                        {categories.map((item) => (
                            <option
                                value={item}
                                key={item}
                            >
                                {item}
                            </option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={sort}
                        onChange={(event) =>
                            setSort(
                                event.target.value
                            )
                        }
                    >
                        <option value="default">
                            Sort by
                        </option>

                        <option value="low">
                            Price: Low to High
                        </option>

                        <option value="high">
                            Price: High to Low
                        </option>

                        <option value="name">
                            Name: A-Z
                        </option>
                    </select>
                </div>

                <div className="category-filters">
                    {categories.map((item) => (
                        <button
                            key={item}
                            className={`category-btn ${category === item
                                ? "active"
                                : ""
                                }`}
                            onClick={() =>
                                setCategory(item)
                            }
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="product-grid">
                        {filteredProducts.map(
                            (product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            🔍
                        </div>

                        <h3>
                            No products found
                        </h3>

                        <p>
                            Try another search term
                            or category.
                        </p>
                    </div>
                )}
            </section>
        );
    }

    /* ABOUT + CONTACT FORM */

    function AboutPage() {
        return (
            <section className="about-page">
                <div className="about-hero">
                    <div className="section-label">
                        ABOUT CAMPUSCART
                    </div>

                    <h1>
                        Simple shopping for
                        student life.
                    </h1>

                    <p>
                        CampusCart is a React-based
                        student essentials product
                        gallery designed to provide
                        a simple and interactive
                        shopping experience. It
                        demonstrates product
                        browsing, searching,
                        filtering, sorting, wishlist
                        management, cart management,
                        form handling, client-side
                        validation, and responsive
                        user interface design.
                    </p>
                </div>

                <div className="about-grid">
                    <div className="about-card">
                        <div className="about-card-icon">
                            ⚛️
                        </div>

                        <h3>React Based</h3>

                        <p>
                            Built using React
                            functional components,
                            state management, hooks,
                            and dynamic rendering.
                        </p>
                    </div>

                    <div className="about-card">
                        <div className="about-card-icon">
                            🔎
                        </div>

                        <h3>Easy Discovery</h3>

                        <p>
                            Search, category
                            filtering, and sorting
                            make it easier to find
                            student essentials.
                        </p>
                    </div>

                    <div className="about-card">
                        <div className="about-card-icon">
                            🛒
                        </div>

                        <h3>Interactive Cart</h3>

                        <p>
                            Add products, update
                            quantities, remove
                            items, and view the total
                            cart value.
                        </p>
                    </div>

                    <div className="about-card">
                        <div className="about-card-icon">
                            ♥
                        </div>

                        <h3>Wishlist</h3>

                        <p>
                            Save products to a
                            wishlist and access them
                            quickly whenever required.
                        </p>
                    </div>

                    <div className="about-card">
                        <div className="about-card-icon">
                            🌙
                        </div>

                        <h3>Theme Support</h3>

                        <p>
                            Switch between light and
                            dark themes for a
                            comfortable browsing
                            experience.
                        </p>
                    </div>

                    <div className="about-card">
                        <div className="about-card-icon">
                            📱
                        </div>

                        <h3>Responsive Design</h3>

                        <p>
                            The interface adapts to
                            desktops, tablets, and
                            mobile screen sizes.
                        </p>
                    </div>
                </div>

                {/* CONTACT FORM */}

                <div className="contact-section">
                    <div className="section-label">
                        CONTACT US
                    </div>

                    <h2 className="section-title">
                        Send us a message
                    </h2>

                    <p className="contact-description">
                        Have a question or suggestion?
                        Fill out the form below.
                    </p>

                    <form
                        className="contact-form"
                        onSubmit={handleFormSubmit}
                        noValidate
                    >
                        <div className="form-group">
                            <label htmlFor="name">
                                Name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={
                                    handleFormChange
                                }
                                placeholder="Enter your name"
                            />

                            {formErrors.name && (
                                <p className="form-error">
                                    {
                                        formErrors.name
                                    }
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleFormChange
                                }
                                placeholder="Enter your email"
                            />

                            {formErrors.email && (
                                <p className="form-error">
                                    {
                                        formErrors.email
                                    }
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">
                                Message
                            </label>

                            <textarea
                                id="message"
                                name="message"
                                value={
                                    formData.message
                                }
                                onChange={
                                    handleFormChange
                                }
                                placeholder="Enter your message"
                                rows="5"
                            />

                            {formErrors.message && (
                                <p className="form-error">
                                    {
                                        formErrors.message
                                    }
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="primary-btn"
                        >
                            Submit
                        </button>

                        {formSubmitted && (
                            <p className="form-success">
                                Form submitted
                                successfully!
                            </p>
                        )}
                    </form>
                </div>
            </section>
        );
    }

    /* CART MODAL */

    function CartModal() {
        return (
            <div
                className="overlay"
                onClick={() =>
                    setShowCart(false)
                }
            >
                <aside
                    className="side-modal"
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >
                    <div className="modal-header">
                        <h2>Your Cart</h2>

                        <button
                            className="close-btn"
                            onClick={() =>
                                setShowCart(false)
                            }
                        >
                            ✕
                        </button>
                    </div>

                    {cart.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                🛒
                            </div>

                            <h3>
                                Your cart is empty
                            </h3>

                            <p>
                                Add some products to
                                get started.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cart.map((item) => (
                                    <div
                                        className="cart-item"
                                        key={item.id}
                                    >
                                        <img
                                            src={getProductImage(
                                                item
                                            )}
                                            alt={
                                                item.name
                                            }
                                            className="cart-item-image"
                                        />

                                        <div className="cart-item-info">
                                            <h4>
                                                {
                                                    item.name
                                                }
                                            </h4>

                                            <div className="cart-item-price">
                                                ₹
                                                {
                                                    item.price
                                                }
                                            </div>

                                            <div className="quantity-controls">
                                                <button
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>

                                                <span>
                                                    {
                                                        item.quantity
                                                    }
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        increaseQuantity(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            className="remove-btn"
                                            onClick={() =>
                                                removeFromCart(
                                                    item.id
                                                )
                                            }
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-footer">
                                <div className="cart-total">
                                    <span>
                                        Total
                                    </span>

                                    <span>
                                        ₹{cartTotal}
                                    </span>
                                </div>

                                <button
                                    className="clear-cart"
                                    onClick={
                                        clearCart
                                    }
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </>
                    )}
                </aside>
            </div>
        );
    }

    /* WISHLIST MODAL */

    function WishlistModal() {
        return (
            <div
                className="overlay"
                onClick={() =>
                    setShowWishlist(false)
                }
            >
                <aside
                    className="side-modal"
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >
                    <div className="modal-header">
                        <h2>Wishlist</h2>

                        <button
                            className="close-btn"
                            onClick={() =>
                                setShowWishlist(
                                    false
                                )
                            }
                        >
                            ✕
                        </button>
                    </div>

                    {wishlist.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                ♡
                            </div>

                            <h3>
                                Your wishlist is empty
                            </h3>

                            <p>
                                Save products you like
                                here.
                            </p>
                        </div>
                    ) : (
                        <div className="wishlist-list">
                            {wishlist.map(
                                (product) => (
                                    <div
                                        className="wishlist-item"
                                        key={
                                            product.id
                                        }
                                    >
                                        <img
                                            src={getProductImage(
                                                product
                                            )}
                                            alt={
                                                product.name
                                            }
                                        />

                                        <div className="wishlist-item-info">
                                            <h4>
                                                {
                                                    product.name
                                                }
                                            </h4>

                                            <span>
                                                ₹
                                                {
                                                    product.price
                                                }
                                            </span>
                                        </div>

                                        <button
                                            className="remove-btn"
                                            onClick={() =>
                                                toggleWishlist(
                                                    product
                                                )
                                            }
                                        >
                                            ♥
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </aside>
            </div>
        );
    }

    /* PRODUCT DETAILS */

    function ProductModal() {
        if (!selectedProduct) {
            return null;
        }

        return (
            <div
                className="center-overlay"
                onClick={() =>
                    setSelectedProduct(null)
                }
            >
                <div
                    className="product-modal"
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >
                    <div className="modal-header">
                        <h2>
                            Product Details
                        </h2>

                        <button
                            className="close-btn"
                            onClick={() =>
                                setSelectedProduct(
                                    null
                                )
                            }
                        >
                            ✕
                        </button>
                    </div>

                    <div className="product-modal-content">
                        <img
                            src={getProductImage(
                                selectedProduct
                            )}
                            alt={
                                selectedProduct.name
                            }
                            className="product-modal-image"
                        />

                        <div className="product-modal-info">
                            <div className="product-category">
                                {
                                    selectedProduct.category
                                }
                            </div>

                            <h2>
                                {
                                    selectedProduct.name
                                }
                            </h2>

                            <div className="product-price">
                                ₹
                                {
                                    selectedProduct.price
                                }
                            </div>

                            <p>
                                A useful and
                                affordable essential
                                selected for everyday
                                student life.
                            </p>

                            <button
                                className="primary-btn"
                                onClick={() => {
                                    addToCart(
                                        selectedProduct
                                    );

                                    setSelectedProduct(
                                        null
                                    );
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* MAIN APP */

    return (
        <div className="app">
            <header className="header">
                <button
                    className="brand"
                    onClick={() =>
                        changePage("dashboard")
                    }
                >
                    <div className="brand-icon">
                        🛒
                    </div>

                    <div className="brand-text">
                        <div className="brand-title">
                            CampusCart
                        </div>

                        <div className="brand-subtitle">
                            Student essentials
                        </div>
                    </div>
                </button>

                <nav className="nav">
                    <button
                        className={
                            page === "dashboard"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changePage(
                                "dashboard"
                            )
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className={
                            page === "products"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changePage(
                                "products"
                            )
                        }
                    >
                        Products
                    </button>

                    <button
                        className={
                            page === "about"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changePage("about")
                        }
                    >
                        About
                    </button>
                </nav>

                <div className="header-actions">
                    <button
                        className="icon-btn"
                        onClick={() =>
                            setShowWishlist(true)
                        }
                        title="Wishlist"
                    >
                        ♡
                    </button>

                    <button
                        className="icon-btn cart-icon-wrapper"
                        onClick={() =>
                            setShowCart(true)
                        }
                        title="Cart"
                    >
                        🛒

                        {cartCount > 0 && (
                            <span className="cart-badge">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <button
                        className="icon-btn"
                        onClick={() =>
                            setTheme(
                                theme === "light"
                                    ? "dark"
                                    : "light"
                            )
                        }
                        title="Toggle theme"
                    >
                        {theme === "light"
                            ? "🌙"
                            : "☀️"}
                    </button>
                </div>
            </header>

            <main className="main">
                {page === "dashboard" && (
                    <Dashboard />
                )}

                {page === "products" && (
                    <ProductsPage />
                )}

                {page === "about" && (
                    <AboutPage />
                )}
            </main>

            <footer className="footer">
                © 2026 CampusCart | Made for
                Students 🎓
            </footer>

            {showCart && <CartModal />}

            {showWishlist && (
                <WishlistModal />
            )}

            {selectedProduct && (
                <ProductModal />
            )}

            {toast && (
                <div className="toast">
                    {toast}
                </div>
            )}
        </div>
    );
}

export default App;