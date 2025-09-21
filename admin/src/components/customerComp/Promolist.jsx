import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Promolist.css"

const PromoList = () => {

    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        axios.get("https://vehicle-sever.onrender.com/promotions").then((res) => {
            setCustomers(res.data);
            console.log(res.data);
        }).catch(() => {
            console.log("Error while data")
        });
    }, []);


    return (
        <div className="ShowCustomerList">
            <header>
                <nav className="navbar navbar-expand-lg bg-primary">
                    <div className="container-fluid">
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <a className="nav-link active" aria-current="page" href="#">HOME</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-white" href="#">SERVICES</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-white" href="#">PROMOTIONS</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-white" href="#">CONTACT US</a>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-danger">SHOP NOW</button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-danger">BOOK NOW</button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-danger">EMERGENCY</button>
                                </li>

                            </ul>
                            <div className="search" >
                                <form class="d-flex" role="search">
                                    <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                                    <button class="btn btn-success" type="submit">Search</button>
                                </form>
                            </div>

                        </div>
                    </div>
                </nav>
            </header>
            <div className="promolist">
                <h2>
                    Service Promotions
                </h2>
                <div className="mt-5">
                    <div className="list mt-5">

                        <div class="card" style={{ width: '18rem' }}>
                            <img src="promo1.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">Seasonal Maintenance Package</h5>
                                <p class="card-text">Get your vehicle ready for the upcoming season with our comprehensive maintenance package, including fluid top-up, tire rotation, and inspection for just Rs.2500 .</p>
                               
                            </div>
                        </div>

                        <div class="card" style={{ width: '18rem' }}>
                            <img src="promo2.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">Brake Inspection and Service</h5>
                                <p class="card-text">Ensure your safety on the road with our brake inspection and service. Book now and receive 15% off on brake pad replacement and rotor resurfacing.</p>
                                
                            </div>
                        </div>

                        <div class="card" style={{ width: '18rem' }}>
                            <img src="promo3.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">AC Performance Check</h5>
                                <p class="card-text">Don't sweat it out this summer! Bring your car in for an AC performance receive 10% and stay cool on the road..</p>
                                
                            </div>
                        </div>

                        <div class="card" style={{ width: '18rem' }}>
                            <img src="promo4.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">Oil Change Special</h5>
                                <p class="card-text">Keep your engine running smoothly with our oil change special! For a limited time, enjoy a full synthetic oil change for only Rs.1000</p>
                                
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
};

export default PromoList