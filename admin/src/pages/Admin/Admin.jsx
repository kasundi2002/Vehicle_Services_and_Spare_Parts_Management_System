import React from 'react'
import './Admin.css'
import Sidebar from '../../components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router'
import Dashboard from '../Dashboard/Dashboard'
import Home from '../Home/Home'
import Users from '../Users/Users'
import Service from '../Service/Service'
import Bookings from '../Booking/bookings'
import Issue from '../Issue/Issue'
import Supplier from '../Supplier/Supplier'
import Employee from '../Employee/Employee'
import Payment from '../Payment/Payment'
import OnlineShop from '../OnlineShop/OnlineShop'
import Customer from '../Customer/Customer'
import Orders from '../../components/onlineShop/Orders/Orders'
import Alerts from '../../components/onlineShop/Alerts/Alerts'
import AddProduct from '../../components/onlineShop/AddProduct/AddProduct'
import UpdateProduct from '../../components/onlineShop/UpdateProduct/UpdateProduct'
import AddService from '../../components/serviceComp/AddService/AddService'
import AddBooking from '../../components/BookingComp/AddBooking/AddBooking'
import AllBooking from '../../components/BookingComp/AllBookings/AllBooking'
import BookingDashboard from '../../components/BookingComp/Dashboard/Dashboard'
import Report from '../../components/BookingComp/Report/report'
import CreateIssue from '../../components/IssueComp/CreateIssues';
import ShowIssue from '../../components/IssueComp/ShowIssue';
import EditIssue from '../../components/IssueComp/EditIssue';
import DeleteIssue from '../../components/IssueComp/DeleteIssue';
import LogIn from '../Login/LogIn'
import PrivateRoute from '../Login/PrivateRoute';
//import InsertInventory from '../../components/InventoryComp/InsertInventory';
//import UpdateInventory from '../../components/InventoryComp/UpdateInventory';
//import Inventory from '../../components/InventoryComp/Inventory';
import Register from '../../components/customerComp/Register';
import Userprofile from '../../components/customerComp/Userprofile';
import Edituser from '../../components/customerComp/Edituser';
import ViewDetails from '../../components/customerComp/Viewdetails';
import UpdateCustomerForm from '../../components/customerComp/Updatecustomer';


const Admin = () => {
  return (
    <div className='Admin'>
      {sessionStorage.getItem('authToken') ? <Sidebar /> : <></>}
      <Routes>
        <Route path='/' element={<LogIn />} />
        <Route path="/dashboard" element={<PrivateRoute allowedRoles={['1']} />}>
          <Route path="" element={<Dashboard />} />
        </Route>
        <Route path="/home" element={<PrivateRoute allowedRoles={['2']} />}>
          <Route path="" element={<Home />} />
        </Route>
        <Route path="/users" element={<PrivateRoute allowedRoles={['3']} />}>
          <Route path="" element={<Users />} />
        </Route>
        <Route path="/service" element={<PrivateRoute allowedRoles={['4']} />}>
          <Route path="" element={<Service />} />
        </Route>
        <Route path="/booking" element={<PrivateRoute allowedRoles={['5']} />}>
          <Route path="" element={<Bookings />} />
        </Route>
        <Route path="/issue" element={<PrivateRoute allowedRoles={['6']} />}>
          <Route path="" element={<Issue />} />
        </Route>
        {/*<Route path="/inventory" element={<PrivateRoute allowedRoles={['7']} />}>
          <Route path="" element={<Inventory />} />
  </Route>*/}
        <Route path="/supplier" element={<PrivateRoute allowedRoles={['8']} />}>
          <Route path="" element={<Supplier />} />
        </Route>
        <Route path="/employee" element={<PrivateRoute allowedRoles={['9']} />}>
          <Route path="" element={<Employee />} />
        </Route>
        <Route path="/payment" element={<PrivateRoute allowedRoles={['10']} />}>
          <Route path="" element={<Payment />} />
        </Route>
        <Route path="/onlineshop" element={<PrivateRoute allowedRoles={['11']} />}>
          <Route path="" element={<OnlineShop />} />
        </Route>
        <Route path="/customer" element={<PrivateRoute allowedRoles={['12']} />}>
          <Route path="" element={<Customer />} />
        </Route>
        <Route path="/Onlineshop/orders" element={<PrivateRoute allowedRoles={['11']} />}>
          <Route path="" element={<Orders />} />
        </Route>
        <Route path="/Onlineshop/Alerts" element={<PrivateRoute allowedRoles={['11']} />}>
          <Route path="" element={<Alerts />} />
        </Route>
        <Route path="/Onlineshop/products/addproduct" element={<PrivateRoute allowedRoles={['11']} />}>
          <Route path="" element={<AddProduct />} />
        </Route>
        <Route path="/service/add" element={<PrivateRoute allowedRoles={['4']} />}>
          <Route path="" element={<AddService />} />
        </Route>
        <Route path="/service" element={<PrivateRoute allowedRoles={['4']} />}>
          <Route path="" element={<Service />} />
        </Route>
        <Route exact path="/Onlineshop/products/updateproduct/:id" element={<PrivateRoute allowedRoles={['11']} />}>
          <Route path="" element={<UpdateProduct />} />
        </Route>
        <Route path="/booking/dashboard" element={<PrivateRoute allowedRoles={['5']} />}>
          <Route path="" element={<BookingDashboard />} />
        </Route>
        <Route path="/booking/add" element={<PrivateRoute allowedRoles={['5']} />}>
          <Route path="" element={<AddBooking />} />
        </Route>
        <Route path="/booking/all" element={<PrivateRoute allowedRoles={['5']} />}>
          <Route path="" element={<AllBooking />} />
        </Route>
        <Route path="/booking/reporting" element={<PrivateRoute allowedRoles={['5']} />}>
          <Route path="" element={<Report />} />
        </Route>
        <Route path="/issues/create" element={<PrivateRoute allowedRoles={['6']} />}>
          <Route path="" element={<CreateIssue />} />
        </Route>
        <Route path="/issues/details/:id" element={<PrivateRoute allowedRoles={['6']} />}>
          <Route path="" element={<ShowIssue />} />
        </Route>
        <Route path="/issues/edit/:id" element={<PrivateRoute allowedRoles={['6']} />}>
          <Route path="" element={<EditIssue />} />
        </Route>
        <Route path="/issues/delete/:id" element={<PrivateRoute allowedRoles={['6']} />}>
          <Route path="" element={<DeleteIssue />} />
        </Route>
        {/*<Route path="/insertinventory" element={<InsertInventory />} />*/}
        {/*<Route path="/updateinventory/:id" element={<UpdateInventory />} />*/}
        <Route path="/customer/register" element={<Register />} />
        <Route path="/customer/userprofile" element={<Userprofile />} />
        <Route path="/customer/edituser" element={<Edituser />} />
        <Route path="/customer/viewdetails/:id" element={<ViewDetails />} />
        <Route path="/customer/updatecustomer/:id" element={<UpdateCustomerForm />} />
      </Routes>
    </div>
  );
}

export default Admin;
