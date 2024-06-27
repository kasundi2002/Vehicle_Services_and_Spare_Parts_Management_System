import React, { useState } from 'react'
import Navbar from '../Navbar/Navbar'
import upload_img from '../../../assets/upload_img.png'
import './AddProduct.css'

const AddProduct = () => {

  const [image,setImage] = useState(false);
  const [productDetails,setProductDetails] = useState({
    name:"",
    image:"",
    category:"",
    new_price:"",
    old_price:"",
    description:"",
    quantity:"",
    brand:""
  })

  const imageHandler = (e) =>{
      setImage(e.target.files[0]);
  }

  const changeHandler = (e) =>{
    if (e.target.name === "old_price" || e.target.name === "new_price" || e.target.name === "quantity") {
      if (isNaN(e.target.value)) {
        alert("Please enter a numerical value for Old Price, New Price, and Product Quantity.");
        return;
      }
    }
    setProductDetails({...productDetails,[e.target.name]:e.target.value})
  }

  const validateForm = () => {
    if (
      !productDetails.name ||
      !productDetails.category ||
      !productDetails.new_price ||
      !productDetails.old_price ||
      !productDetails.description ||
      !productDetails.quantity ||
      !productDetails.brand ||
      !image
    ) {
      alert("Please fill in all fields and upload an image.");
      return false;
    }
    return true;
  }

  const Add_product = async () => {
    if (!validateForm()) {
      return;
    }
    console.log(productDetails);

    let responseData;
    let product = productDetails;

    let formData = new FormData();
    formData.append('product',image);

    await fetch('http://localhost:4000/upload',{
      method:'POST',
      headers:{
        Accept:'application/json',
      },
      body:formData,
    }).then((resp)=> resp.json()).then((data)=>{responseData=data})

    if(responseData.success)
    {
      product.image = responseData.image_url;
      console.log(product);
      await fetch('http://localhost:4000/addproduct',{
        method:'POST',
        headers:{
          Accept:'application/json',
          'Content-Type':'application/json',
        },
        body:JSON.stringify(product),
      }).then((resp)=>resp.json()).then((data)=>{
        data.success?alert("Product Added"):alert("Failed")
        window.location.reload()
      })
    }
  }

  return (
    <div className="Add">
        <Navbar/>
        <div className='add-product'>
          <div className='addproduct-itemfield'>
            <div className='addproduct-item'>
              <p>Product Name</p>
              <input value={productDetails.name} onChange={changeHandler} type="text" name="name" placeholder='Type Name'/>
            </div>
              <div className='addproduct-item'>
                <p>Old Price</p>
                <input value={productDetails.old_price} onChange={changeHandler} type='text' name='old_price' placeholder='Type old price'/>
              </div>
              <div className='addproduct-item'>
                <p>New Price</p>
                <input value={productDetails.new_price} onChange={changeHandler} type='text' name='new_price' placeholder='Type new price'/>
              </div>
            <div className='addproduct-item'>
              <p>Brand</p>
              <input value={productDetails.brand} onChange={changeHandler} type='text' name='brand' placeholder='Type brand'/>
            </div>
          </div>
          <div className='addproduct-itemfield'>
            <div className='addproduct-item'>
              <p>Product Description</p>
              <textarea value={productDetails.description} onChange={changeHandler} id="description" name="description" rows="4" cols="50" />
            </div>
            <div className='addproduct-item'>
              <p>Product Category</p>
              <select name="category" className='add-product-selector' value={productDetails.category} onChange={changeHandler}>
                <option value="Interiour">Interiour</option>
                <option value="Exteriour">Exteriour</option>
                <option value="Car_care">Car care</option>
              </select>
            </div>
            <div className='addproduct-item'>
              <p>Product Quantity</p>
              <input value={productDetails.quantity} onChange={changeHandler} type="number" id="quantity" name="quantity" min="0" max="100"/>
            </div>
            <div className='addproduct-item'>
              <label htmlFor="file-input">
                <img src={image?URL.createObjectURL(image):upload_img} className='addproduct-thumbnail' alt="Upload Thumbnail" />
              </label>
              <input onChange={imageHandler} type='file' name='image' id='file-input' hidden={true} />
            </div>
          </div>
          <button onClick={Add_product} className='addproduct-btn'>Add Product</button>
        </div>
    </div>
  )
}

export default AddProduct;
