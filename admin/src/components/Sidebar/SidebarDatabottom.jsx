import React from 'react'
import CarRepairOutlinedIcon from '@mui/icons-material/CarRepairOutlined';
import EmergencyShareOutlinedIcon from '@mui/icons-material/EmergencyShareOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined';

export const SidebarDatabottom = [
  {
    title: "Service",
    icon: <CarRepairOutlinedIcon />,
    link: "/service"
  },
  {
    title: "Booking",
    icon: <BookOnlineOutlinedIcon />,
    link: "/booking"
  },
  {
    title: "Issue",
    icon: <EmergencyShareOutlinedIcon />,
    link: "/issue"
  },
  {
    title: "Inventory",
    icon: <Inventory2OutlinedIcon />,
    link: "/inventory"
  },
  {
    title: "Supplier",
    icon: <LocalShippingOutlinedIcon />,
    link: "/supplier"
  },
  {
    title: "Employee",
    icon: <EngineeringOutlinedIcon />,
    link: "/employee"
  },
  {
    title: "Payment",
    icon: <LocalAtmOutlinedIcon />,
    link: "/payment"
  },
  {
    title: "Online shop",
    icon: <LocalMallOutlinedIcon />,
    link: "/onlineshop"
  },
  {
    title: "Customer",
    icon: <SupportAgentOutlinedIcon />,
    link: "/customer"
  }
]