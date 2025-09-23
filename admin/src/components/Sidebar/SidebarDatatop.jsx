import React from 'react'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

export const SidebarDatatop = [
  {
    title: "Dashboard",
    icon: <SpaceDashboardOutlinedIcon />,
    link: "/dashboard"
  },
  {
    title: "Home",
    icon: <HomeOutlinedIcon />,
    link: "/home"
  },
  {
    title: "Users",
    icon: <PeopleAltOutlinedIcon />,
    link: "/users"
  },
  {
    title: "Rate Limit Monitor",
    icon: <SecurityOutlinedIcon />,
    link: "/rate-limit-monitor"
  }
]