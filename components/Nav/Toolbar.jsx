/*
 * Copyright Algodex VASP (BVI) Corp., 2022
 * All Rights Reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'next-i18next'

// MUI Components
import MUIToolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Image from 'next/image'

// Custom Language Selector
import LocaleNavMenu from '@/components/Nav/LocaleNavMenu'

//Algodex
import Helper from '@/lib/helper'
import Link from './Link'

/**
 * Toolbar
 * @param title
 * @param height
 * @param isMobile
 * @param onClick
 * @param rest
 * @returns {JSX.Element}
 * @constructor
 */

const environmentLinks = ['TESTNET', 'MAINNET']

const styles = {
  select: {
    fontSize: '0.8rem',
    marginBlock: '0.25rem',
    border: 'solid 1px',
  },
  linkStyles: {
    fontWeight: '700',
    marginRight: '1.6rem',
    color: (theme) => theme.palette.primary.contrastText,
  },
}

const MAINNET_LINK = process.env.NEXT_PUBLIC_MAINNET_LINK
const TESTNET_LINK = process.env.NEXT_PUBLIC_TESTNET_LINK
const ENABLE_NETWORK_SELECTION = TESTNET_LINK && MAINNET_LINK
function Toolbar({
  title,
  height,
  isMobile,
  onClick,
  toggleDrawer,
  isDashboard,
  ...rest
}) {
  const { t } = useTranslation('common')
  const { environment } = Helper.getAlgodex()

  const [environmentText, setEnvironmentText] = React.useState(
    environment.toUpperCase()
  )

  const handleChange = (event) => {
    const {
      target: { value },
    } = event
    if (ENABLE_NETWORK_SELECTION) {
      setEnvironmentText(value)
      if (value === 'MAINNET') {
        window.location = MAINNET_LINK
      } else {
        window.location = TESTNET_LINK
      }
    }
  }

  return (
    <MUIToolbar sx={{ height }} {...rest}>
      {!isMobile && isDashboard && (
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          <Image
            src="/algodex-logo.svg"
            alt="Algodex logo"
            height={28}
            width={170}
          />
          <Typography
            variant="h6"
            component="div"
            marginRight={2}
            marginLeft="0.5rem"
            lineHeight={0}
          >
            {title || t('mailbox')}
          </Typography>
        </Box>
        {isDashboard && (
          <Select
            className="environment-select-wrapper"
            value={environmentText}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'Without label' }}
            style={{
              ...styles.select,
              color: environmentText == 'TESTNET' ? 'green' : 'blue',
            }}
          >
            {environmentLinks.map((environment) => (
              <MenuItem key={environment} value={environment}>
                {environment}
              </MenuItem>
            ))}
          </Select>
        )}
      </Box>
      {!isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/#user-guide" sx={styles.linkStyles}>
            User Guide
          </Link>
          <Link href="/#faq" sx={styles.linkStyles}>
            FAQ
          </Link>
          <Link
            href="https://about.algodex.com/support/"
            target="_blanc"
            sx={styles.linkStyles}
          >
            Support
          </Link>
        </Box>
      )}
      {isMobile && !isDashboard && (
        <IconButton onClick={toggleDrawer}>
          <MenuIcon />
        </IconButton>
      )}
      {((!isMobile && !isDashboard) || isDashboard) && (
        <LocaleNavMenu isMobile={isMobile} onClick={onClick} />
      )}
    </MUIToolbar>
  )
}

Toolbar.propTypes = {
  /**
   * onClick
   */
  onClick: PropTypes.func.isRequired,
  /**
   * height
   */
  height: PropTypes.number,
  /**
   * isMobile
   */
  isMobile: PropTypes.bool,

  toggleDrawer: PropTypes.func.isRequired,
}

Toolbar.defaultProps = {
  onClick: console.debug,
}
export default Toolbar
