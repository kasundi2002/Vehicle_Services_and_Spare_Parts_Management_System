import React, { useContext } from 'react'
import Breadcrum from '../../../Components/OnlineShop/Breadcrums/Breadcrum';
import {ProductContext} from '../../../Context/ProductContext'
import { useParams } from 'react-router-dom';
import ProductDisplay from '../../../Components/OnlineShop/ProductDisplay/ProductDisplay';
import RelatedProducts from '../../../Components/OnlineShop/RelatedProducts/RelatedProducts';

const Product = () => {
  const {all_product}= useContext(ProductContext);
  const {productId} = useParams();
  const product = all_product.find((e) => e.id === Number(productId));

  return (
    <div>
      <Breadcrum product={product}/>
      <ProductDisplay product={product}/>
      <RelatedProducts product={product}/>
    </div>
  )
}

export default Product