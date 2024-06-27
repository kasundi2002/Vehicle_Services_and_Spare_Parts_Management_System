import React from 'react'
import CarRepairIcon from '@mui/icons-material/CarRepair';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

export const NavBarData = [
    {
        title: 'Dashboard',
        icon: <GridViewRoundedIcon />,
        link: '/service/dashboard',
    },
    {
        title: 'Manage Service',
        icon: <CarRepairIcon />,
        link: '/service',
    },
    {
        title: 'Add Service',
        icon: <AddOutlinedIcon />,
        link: '/service/add',       
    },
    {
        title: 'Reporting',
        icon: <DescriptionRoundedIcon />,
        link: '/service/reporting',       
    }
]