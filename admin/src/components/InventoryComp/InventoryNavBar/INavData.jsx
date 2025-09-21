import React from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InventoryIcon from '@mui/icons-material/Inventory';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import NotificationsIcon from '@mui/icons-material/Notifications';
import './INavBar.css';

export const INavData = [
    {
        title: 'Dashboard',
        icon: <GridViewRoundedIcon />,
        link: '/inventory',
    },
    {
        title: 'All Inventory',
        icon: <InventoryIcon />,
        link: '/inventory',
    },
    {
        title: 'Add Inventory',
        icon: <AddCircleOutlineIcon />,
        link: '/insertinventory',
    },
    {
        title: 'Download Report',
        icon: <CompareArrowsIcon />, 
        link: '/inventory',
    },   
];
