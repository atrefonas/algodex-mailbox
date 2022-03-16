import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'next-i18next'

// MUI Components
import MUIToolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Custom Language Selector
import LocaleNavMenu from '@/components/Nav/LocaleNavMenu'

//Algodex
import Helper from '@/lib/helper'

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
function Toolbar({ title, height, isMobile, onClick, toggleDrawer, ...rest }) {
  const { t } = useTranslation('common')
  const { environment } = Helper.getAlgodex()
  const environmentText = environment.toUpperCase()
  return (
    <MUIToolbar sx={{ height }} {...rest}>
      {!isMobile && (
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={() => {
            toggleDrawer()
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div">
          {title || t('app-title')}
        </Typography>
        <Typography
          component="div"
          color={'green'}
          paddingTop="0.25rem"
          fontStyle="italic"
          fontSize="0.8rem"
          fontWeight="bold"
          lineHeight={1}
        >
          {environmentText}
        </Typography>
      </Box>
      <LocaleNavMenu isMobile={isMobile} onClick={onClick} />
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
}

Toolbar.defaultProps = {
  onClick: console.debug,
}
export default Toolbar
