import React, {useState} from 'react'
import Sort from './Sort';
import './PopupSort.css'

const PopupSort = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
      };
  
    return (
    <div>
        <button className='popup-btn' onClick={togglePopup}>Filter</button>
        {isPopupOpen && <Sort />}
    </div>
  )
}

export default PopupSort