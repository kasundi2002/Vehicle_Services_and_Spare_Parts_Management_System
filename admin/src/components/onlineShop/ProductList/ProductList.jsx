import React, { useState, useEffect } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UpdateIcon from '@mui/icons-material/Update';
import './ProdcutList.css';
import SearchProduct from '../Search/Search';
import Category from '../category/category';
import PopupFilter from '../Filter/PopupFilter'
import AddButton from '../AddButon/AddButton';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar'

const ProductList = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    const Navigate = useNavigate();

    const naigateToUpdate = (productId) =>{
        Navigate(`/Onlineshop/products/updateproduct/${productId}`)
    }


    
    useEffect(() => {
        fetch('https://vehicle-sever.onrender.com/allproducts')
            .then((res) => res.json())
            .then((data) => {
                setAllProducts(data);
                setFilteredProducts(data);
            });
    }, []);

    const handleSearch = (searchTerm) => {
        const filtered = allProducts.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        if (category === '') {
            setFilteredProducts(allProducts);
        } else {
            const filtered = allProducts.filter((product) => product.category === category);
            setFilteredProducts(filtered);
        }
    };

    const handleFilterChange = (category, brand) => {
        setSelectedCategory(category);
        setSelectedBrand(brand);

        let filtered = allProducts;

        if (category !== '') {
            filtered = filtered.filter((product) => product.category === category);
        }

        if (brand !== '') {
            filtered = filtered.filter((product) => product.brand === brand);
        }

        setFilteredProducts(filtered);
    };

    const remove_product = async (id) => {
        try {
            const response = await fetch('https://vehicle-sever.onrender.com/removeproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id }),
            });
    
            if (response.ok) {
                const updatedProducts = allProducts.filter(product => product.id !== id);
                setAllProducts(updatedProducts);
                setFilteredProducts(updatedProducts);
            } else {
                console.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };
    

    return (
        <div>
            <Navbar />
            <div className='Product-options'>
                <div className='Product-options-left'>
                    <Category onCategoryChange={handleCategoryChange} />
                </div>
                <div className='Product-options-right'>
                    <PopupFilter allProducts={allProducts} onFilterChange={handleFilterChange} />
                    <SearchProduct onSearch={handleSearch} />
                    <AddButton />
                </div>
            </div>
            <div className="ProductList">
                <table className="ProductList-table">
                    <thead>
                        <tr className='headp'>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Image</th>
                            <th>Old Price</th>
                            <th>New Price</th>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody className='table-body'>
                        {filteredProducts.map((product, index) => (
                            <tr key={index}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>{product.brand}</td>
                                <td>
                                    <img src={product.image} className="ProductList-format-image" alt="" />
                                </td>
                                <td>Rs.{product.new_price}</td>
                                <td>Rs.{product.old_price}</td>
                                <td>{product.description}</td>
                                <td>{product.quantity}</td>
                                <td>
                                    <UpdateIcon onClick={() => naigateToUpdate(product.id)} className="updateIcn" />
                                    <DeleteOutlineIcon onClick={()=>{remove_product(product.id)}} className="removeIcn" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;