import React from 'react'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

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
  }
]