import React from 'react'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import NotificationAddRoundedIcon from '@mui/icons-material/NotificationAddRounded';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

export const BNavData = [
    {
        title: 'Dashboard',
        icon: <GridViewRoundedIcon />,
        link: '/booking/dashboard',
    },
    {
        title: 'Booking requests',
        icon: <CompareArrowsIcon />,
        link: '/booking',
    },
    {
        title: 'All Bookings',
        icon: <BookOnlineIcon />,
        link: '/booking/all',       
    },
    {
        title: 'Add Bookings',
        icon: <AddOutlinedIcon />,
        link: '/booking/add',       
    },
    {
        title: 'Reporting',
        icon: <DescriptionRoundedIcon />,
        link: '/booking/reporting',       
    }
]