import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
  };

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const response = await fetch("https://fakestoreapi.com/products/");
      const products = await response.json();
      setData(products);
      setFilter(products);
      setLoading(false);
    };
    getProducts();
  }, []);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) {
      setFilter(data);
      return;
    }

    try {
      const response = await fetch(`http://localhost:4001/api/v1/ai-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          products: data,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const matchedProducts = data.filter((p) => result.ids.includes(p.id));
        setFilter(matchedProducts);
      } else {
        console.error("❌ AI Search error:", result.message);
      }
    } catch (err) {
      console.error("💥 AI Search fetch error:", err);
    }
  };

  const applyFiltersAndSort = () => {
    let updatedList = [...data];

    // Apply category filter
    // This part is left for you to implement if you want to combine it with other filters.
    // For now, the existing filterProduct function can be used independently.

    // Apply price filter
    if (minPrice !== "" || maxPrice !== "") {
      updatedList = updatedList.filter((item) => {
        const min = minPrice !== "" ? parseFloat(minPrice) : 0;
        const max = maxPrice !== "" ? parseFloat(maxPrice) : Infinity;
        return item.price >= min && item.price <= max;
      });
    }

    // Apply sorting
    if (sortOption === "price-asc") {
      updatedList.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      updatedList.sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating-desc") {
      updatedList.sort((a, b) => b.rating.rate - a.rating.rate);
    }

    setFilter(updatedList);
  };

  const filterProduct = (cat) => {
    const updatedList = data.filter((item) => item.category === cat);
    setFilter(updatedList);
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [minPrice, maxPrice, sortOption, data]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fa fa-star text-warning"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fa fa-star-half-o text-warning"></i>);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<i key={`empty-${i}`} className="fa fa-star-o text-warning"></i>);
    }
    return stars;
  };

  const Loading = () => (
    <>
      <div className="col-12 py-5 text-center">
        <Skeleton height={40} width={560} />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      ))}
    </>
  );

  const ShowProducts = () => (
    <>
      <div className="buttons text-center py-3">
        <button className="btn btn-outline-dark btn-sm m-2" onClick={() => setFilter(data)}>All</button>
        <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("men's clothing")}>Men's Clothing</button>
        <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("women's clothing")}>Women's Clothing</button>
        <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("jewelery")}>Jewelery</button>
        <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("electronics")}>Electronics</button>
      </div>

      {filter.map((product) => (
        <div key={product.id} className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <div className="card text-center h-100">
            <img className="card-img-top p-3" src={product.image} alt="Card" height={300} />
            <div className="card-body">
              <h5 className="card-title">{product.title.substring(0, 12)}...</h5>
              <div className="my-2">
                {renderStars(product.rating.rate)}
                <br />
                <span className="text-muted">({product.rating.count} reviews)</span>
              </div>
              <p className="card-text">{product.description.substring(0, 90)}...</p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item lead">$ {product.price}</li>
            </ul>
            <div className="card-body">
              <Link to={"/product/" + product.id} className="btn btn-dark m-1">Buy Now</Link>
              <button className="btn btn-dark m-1" onClick={() => { toast.success("Added to cart"); addProduct(product); }}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="container my-3 py-3">
      <div className="row">
        <div className="col-12 text-center">
          <h2 className="display-5">Latest Products</h2>
          <hr />
        </div>
      </div>

      <div className="row mb-4 justify-content-center">
        {/* AI Search Bar */}
        <div className="col-md-6 mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search products with AI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-dark" onClick={handleAiSearch}>
              Search
            </button>
          </div>
        </div>

        {/* Price Filter & Sort Controls */}
        <div className="col-md-6 mb-3">
          <div className="input-group">
            <span className="input-group-text">Price Range</span>
            <input
              type="number"
              className="form-control"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <select
              className="form-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Sort By...</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        {loading ? <Loading /> : <ShowProducts />}
      </div>
    </div>
  );
};

export default Products;