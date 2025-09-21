import React from 'react'
import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';

export const NavbarData = [
  {
    title: "Products",
    icon: <BallotOutlinedIcon />,
    link: "/onlineshop"
  },
  {
    title: "Orders",
    icon: <LocalShippingOutlinedIcon />,
    link: "/onlineshop/orders"
  },
  {
    title: "Alerts",
    icon: <NotificationsActiveOutlinedIcon />,
    link: "/onlineshop/Alerts"
  }
]