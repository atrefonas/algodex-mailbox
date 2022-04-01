/*
 * Copyright Algodex VASP (BVI) Corp., 2022
 * All Rights Reserved.
 */

import '@/styles/global.css'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { appWithTranslation } from 'next-i18next'
import mediaQuery from 'css-mediaquery'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider } from '@emotion/react'

import getTheme from '@/themes/getTheme'
import createEmotionCache from '@/utils/createEmotionCache'
import {Layout} from '@/components/Layout'
const theme = getTheme('normal')
// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

const mobileSsrMatchMedia = query => ({
  matches: mediaQuery.match(query, {
    // The estimated CSS width of the browser.
    width: '0px'
  })
})
const desktopSsrMatchMedia = query => ({
  matches: mediaQuery.match(query, {
    // The estimated CSS width of the browser.
    width: '1024px'
  })
})

const mobileMuiTheme = createTheme({
  ...theme,
  props: {
    // Change the default options of useMediaQuery
    MuiUseMediaQuery: { ssrMatchMedia: mobileSsrMatchMedia }
  }
})
const desktopMuiTheme = createTheme({
  ...theme,
  props: {
    // Change the default options of useMediaQuery
    MuiUseMediaQuery: { ssrMatchMedia: desktopSsrMatchMedia }
  }
})

export function App(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider  theme={
        pageProps.deviceType === 'mobile' ? mobileMuiTheme : desktopMuiTheme
      }>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </CacheProvider>
  )
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
}

export default appWithTranslation(App)
