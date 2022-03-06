import React, { useCallback, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'

// MUI Components
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

// Custom Components
import * as SendAssetsHelper from '@/lib/send_assets.js'
import SendAssetForm from '@/components/SendAssetForm'
import Link from '@/components/Nav/Link'
import useMyAlgo from '@/hooks/use-my-algo'
import { defaults } from 'next-i18next.config'
import { useTranslation } from 'next-i18next'
import Helper from '@/lib/helper'

/**
 * Generate Static Properties
 * @param locale
 */
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [...defaults])),
    },
  }
}

/**
 * Send Asset Page
 * @returns {JSX.Element}
 * @constructor
 */
export function SendAssetPage() {
  const [loading, setLoading] = useState(false)
  const [fromAddress, setFromAddress] = useState('')
  const [assetId, setAssetId] = useState('')
  const [actionStatus, setActionStatus] = useState({
    message: '',
    success: false,
  })
  const { t } = useTranslation('common')
  const [formattedAddresses, setFormattedAddresses] = useState([])

  const updateAddresses = useCallback(
    (addresses) => {
      if (addresses == null) {
        return
      }
      console.log({ addresses })
      setFormattedAddresses(addresses)
    },
    [setFormattedAddresses]
  )

  const { connect } = useMyAlgo(updateAddresses)
  const submitForm = async ({ formData }) => {
    const { wallet, assetId, csvTransactions } = formData
    console.log({ formData })
    setLoading(true)
    const responseData = await SendAssetsHelper.send(
      assetId,
      wallet,
      csvTransactions
    )
    console.log('responseData', responseData)
    setLoading(false)
    if (responseData.error == false) {
      const totalAssets = responseData.confirmedTransactions.length
      const sentAssets = responseData.confirmedTransactions.filter(
        (asset) => asset.value.status == 'confirmed'
      ).length
      setActionStatus({
        message: `${sentAssets}/${totalAssets} asset(s) sent successfully`,
        success: true,
      })
    } else {
      setActionStatus({
        message: responseData.body?.message || 'Sorry, an error occurred',
        success: false,
      })
    }
  }

  const getAssetBalance = async () => {
    if (fromAddress && assetId) {
      const responseData = await Helper.getFormattedAssetBalance(
        fromAddress,
        assetId,
        true
      )
      console.log(responseData)
    }
  }

  setInterval(() => {
    getAssetBalance()
  }, 3000)

  return (
    <>
      <Head>
        <title>{`${t('/send-asset')} | ${t('app-title')}`}</title>
      </Head>
      <Container sx={{ my: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8} lg={6} xl={5}>
            <Typography variant="h5" sx={{ marginBottom: '1rem' }}>
              {t('/send-asset')}
            </Typography>
            <Button variant="contained" onClick={connect}>
              {t('connect-wallet')}
            </Button>
            <SendAssetForm
              formattedAddresses={formattedAddresses}
              onSubmit={submitForm}
              isLoading={loading}
              setFromAddress={setFromAddress}
              setAssetId={setAssetId}
            />
            {actionStatus.message != '' && (
              <Typography
                variant="error-message"
                sx={{ display: 'flex', justifyContent: 'end' }}
                color={actionStatus.success ? 'green' : 'error'}
              >
                {actionStatus.message}
              </Typography>
            )}
            <Grid container spacing={2} sx={{ marginTop: '2rem' }}>
              <Grid item xs={6} lg={5} className="mr-2">
                <Link href={'/instructions'}>
                  {t('view-instructions-link')}
                </Link>
              </Grid>
              <Grid item xs={6} lg={5}>
                <Link href={'/downloadlink'}>
                  {t('download-csv-example-link')}
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default SendAssetPage
