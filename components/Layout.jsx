/*
 * Copyright Algodex VASP (BVI) Corp., 2022
 * All Rights Reserved.
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'next-i18next'

// Hooks
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// MUI Components
import AppBar from '@mui/material/AppBar'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

// Defaults
import DefaultToolbar from '@/components/Nav/Toolbar'
import DefaultBottomNavigation from '@/components/Nav/BottomNavigation'
import DefaultDrawer from '@/components/Nav/Drawer'

// Icons
import SendIcon from '@mui/icons-material/Send'
import HistoryIcon from '@mui/icons-material/History'
import RedeemIcon from '@mui/icons-material/Redeem'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import { useRouter } from 'next/router'

/**
 * Layout Component
 *
 * Component includes three slots
 *
 * @param children
 * @param components
 * @param componentsProps
 * @returns {JSX.Element}
 * @component
 */
export function Layout({ children, components, componentsProps }) {
  const { Toolbar, BottomNavigation, Drawer } = components
  const [drawerWidth, setDrawerWidth] = useState(240)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const { t } = useTranslation('common')
  const routePath = useRouter().asPath
  const isHomePage =
    routePath === '/' ? true : routePath === '/#faq' ? true : false

  // Example for Changing Toolbar Height
  // const toolbarHeight = 200
  const toolbarHeight = undefined
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
    if (drawerWidth == 0) {
      setDrawerWidth(240)
    } else {
      setDrawerWidth(0)
    }
  }

  const sideLinks = [
    {
      to: '/send-assets',
      icon: <SendIcon />,
      primary: t('/send-assets'),
    },
    {
      to: '/transaction-history',
      icon: <HistoryIcon />,
      primary: t('/transaction-history'),
    },
    {
      to: '/redeem-assets',
      icon: <RedeemIcon />,
      primary: t('/redeem-assets'),
    },
    {
      to: '/return-assets',
      icon: <KeyboardReturnIcon />,
      primary: t('/return-assets'),
    },
  ]

  if (isHomePage) {
    return <> {children}</>
  }

  // Example of a Responsive Layout with Fixed Viewport
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '-webkit-fill-available',
      }}
    >
      <AppBar
        position="static"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar
          isMobile={isMobile}
          height={toolbarHeight}
          toggleDrawer={toggleDrawer}
          isDashboard={true}
          {...componentsProps.Toolbar}
        />
      </AppBar>
      {/* Flex row for when the Drawer is visible */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'auto' }}>
        {
          // Show the Desktop Drawer
          !isMobile && (
            <Drawer
              width={drawerWidth}
              open={drawerOpen}
              offset={toolbarHeight}
              links={sideLinks}
              {...componentsProps.Drawer}
            />
          )
        }
        {/* Display the Page Component */}

        <Container
          sx={{ my: 4, width: `calc(100% - ${!isMobile ? drawerWidth : 0}px)` }}
        >
          {children}
        </Container>
      </Box>
      {
        // Show the Mobile Navigation
        isMobile && (
          <Paper
            sx={{
              position: 'static',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
            elevation={3}
          >
            <BottomNavigation {...componentsProps.BottomNavigation} />
          </Paper>
        )
      }
    </Box>
  )
}

Layout.propTypes = {
  components: PropTypes.shape({
    Toolbar: PropTypes.elementType.isRequired,
    BottomNavigation: PropTypes.elementType.isRequired,
    Drawer: PropTypes.elementType.isRequired,
  }).isRequired,
}

Layout.defaultProps = {
  components: {
    Toolbar: DefaultToolbar,
    BottomNavigation: DefaultBottomNavigation,
    Drawer: DefaultDrawer,
  },
  componentsProps: {
    Toolbar: {},
    BottomNavigation: {},
    Drawer: {},
  },
}

export default Layout
