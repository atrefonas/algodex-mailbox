/*
 * Copyright Algodex VASP (BVI) Corp., 2022
 * All Rights Reserved.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'

// MUI Components
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

// Custom Components
import SendAssetForm from '@/components/SendAssetForm'
import Link from '@/components/Nav/Link'
import { defaults } from 'next-i18next.config'
import { useTranslation } from 'next-i18next'
import Helper from '@/lib/helper'
import useSendAsset from '@/hooks/useSendAsset'
import useFormattedAddress from '@/hooks/useFormattedAddress'

// Library Files
import SendAssets from '@/lib/send_assets'
import { LinearProgressWithLabel } from '@/components/LinearProgressWithLabel'

/**
 * Generate Static Properties
 * @param locale
 */
export async function getServerSideProps({ locale }) {
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
  const { formattedAddresses, connect } = useFormattedAddress()
  const { progress, status, total, hideProgress, setHideProgress, setStatus } =
    useSendAsset()
  const [loading, setLoading] = useState(false)
  const [assetId, setAssetId] = useState()
  const [wallet, setWallet] = useState()
  const [csvTransactions, setCsvTransactions] = useState()
  const [assetBalance, setAssetBalance] = useState({
    success: false,
    message: '',
  })
  const [actionStatus, setActionStatus] = useState({
    message: '',
    success: false,
  })
  const { t } = useTranslation('common')
  const [gettingBalance, setGettingBalance] = useState(false)
  const [shareableLink, setShareableLink] = useState('')
  const [tooltiptext, setTooltiptext] = useState('Click to Copy')
  const [duplicateList, setDuplicateList] = useState([])

  const updateStatusMessage = (message, status) => {
    setActionStatus({
      message: message || '',
      success: status || false,
    })
  }

  const submitForm = async ({ formData }) => {
    console.debug(formData)

    // console.debug('not blocked')
    setLoading(true)
    updateStatusMessage()
    const responseData = await SendAssets.send(
      assetId,
      wallet,
      csvTransactions
    )
    // console.debug('responseData', responseData)
    setLoading(false)
    if (responseData instanceof Error) {
      setStatus()
      setHideProgress(true)
      if (
        /PopupOpenError|blocked|Can not open popup window/.test(responseData)
      ) {
        updateStatusMessage(
          'Please disable your popup blocker (likely in the top-right of your browser window)',
          false
        )
        return
      }
      updateStatusMessage(
        responseData.body?.message ||
          responseData.message ||
          'Sorry, an error has occurred',
        false
      )
    }
    if (responseData?.error == false) {
      if (responseData.confirmedTransactions.accepted == false) {
        updateStatusMessage(
          'Please, ensure you enter a valid wallet address with the asset id provided',
          false
        )
      } else {
        const totalAssets = responseData.confirmedTransactions.length
        const sentAssets = responseData.confirmedTransactions.filter(
          (asset) => asset.value.status == 'confirmed'
        ).length
        updateStatusMessage(
          `${sentAssets}/${totalAssets} transaction(s) sent successfully`,
          true
        )
        setShareableLink(Helper.getShareableRedeemLink(wallet, assetId))
        getAssetBalance()
      }
    }
  }

  const hasStatusBar = useMemo(() => {
    return typeof status !== 'undefined'
  }, [status])

  useEffect(() => {
    if (!gettingBalance) {
      getAssetBalance()
    }
  }, [assetId, csvTransactions, wallet, gettingBalance])

  useEffect(() => {
    if (actionStatus.message != '') {
      updateStatusMessage()
    }
  }, [assetId, csvTransactions, wallet])

  const getAssetBalance = async () => {
    if (wallet && assetId) {
      setGettingBalance(true)
      const responseData = await Helper.getFormattedAssetBalance(
        wallet,
        parseInt(assetId),
        true
      )
      setTimeout(() => {
        setGettingBalance(false)
      }, 2000)
      // console.debug('responseData', responseData)
      if (responseData && responseData.error == false) {
        setAssetBalance({ success: true, message: responseData.balance })
      } else {
        setAssetBalance({
          success: false,
          message:
            responseData?.data?.message ||
            // eslint-disable-next-line max-len
            'An error occurred while getting your asset balance, please ensure you enter a valid asset id',
        })
      }
    }
  }

  const copyLink = () => {
    document.querySelector('.copyToClipboard')
    navigator.clipboard.writeText(shareableLink)
    setTooltiptext(`Copied: ${shareableLink}`)
    setTimeout(() => {
      setTooltiptext('Click to Copy')
    }, 500)
  }

  return (
    <>
      <Head>
        <title>{`${t('/send-assets')} | ${t('app-title')}`}</title>
      </Head>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8} lg={6} xl={5}>
          {/*<Typography variant="h1" sx={{color: 'purple'}}>
          Example Event Status: {status}
          </Typography>*/}
          <Typography variant="h5" sx={{ marginBottom: '1rem' }}>
            {t('/send-assets')}
          </Typography>
          <Button variant="contained" onClick={connect}>
            {t('connect-wallet')}
          </Button>
          {assetBalance.message != '' && (
            <Typography
              variant="error-message"
              display="block"
              marginTop="1rem"
              color={assetBalance.success ? 'green' : 'error'}
            >
              {assetBalance.message} {assetBalance.success ? 'available' : ''}
            </Typography>
          )}
          <SendAssetForm
            formattedAddresses={formattedAddresses}
            onSubmit={submitForm}
            isLoading={loading}
            setWallet={setWallet}
            actionStatus={actionStatus}
            setAssetId={setAssetId}
            csvTransactions={csvTransactions}
            assetId={assetId}
            wallet={wallet}
            assetBalance={assetBalance}
            setCsvTransactions={setCsvTransactions}
            setDuplicateList={setDuplicateList}
            updateStatusMessage={updateStatusMessage}
          />
          {hasStatusBar && (
            <LinearProgressWithLabel
              status={status}
              progress={progress}
              total={total}
              hideProgress={hideProgress}
            />
          )}
          {duplicateList.length > 0 && (
            <>
              <Typography
                variant="error-message"
                display="block"
                marginTop="1rem"
                marginBottom="0"
                color={'error'}
              >
                Find below the duplicate wallet address
                {duplicateList.length > 1 && 'es'}:
              </Typography>
              <List dense={false}>
                {duplicateList.map((d) => (
                  <ListItem key={d} sx={{ paddingBlock: '0' }}>
                    <ListItemText
                      primary={d}
                      sx={{ color: 'red', marginBlock: '0' }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {actionStatus.success == true && (
            <Box
              marginTop="3rem"
              sx={{
                border: 'solid 2px',
                borderColor: 'secondary.main',
                padding: '1rem',
                borderRadius: '0.2rem',
              }}
            >
              <Box
                variant="error-message"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Link
                  href={shareableLink}
                  target="_blanc"
                  sx={{ color: 'blue' }}
                >
                  Share this link with receiver(s) to redeem asset(s):
                </Link>
                <Tooltip
                  title={tooltiptext}
                  placement="top"
                  arrow
                  sx={{
                    cursor: 'pointer',
                    marginLeft: '0.5rem',
                  }}
                >
                  <ContentCopyIcon
                    onClick={copyLink}
                    className="copyToClipboard"
                    fontSize="0.9rem"
                  />
                </Tooltip>
              </Box>
              <Typography variant="p" marginY={'1rem'}>
                Link above takes users to the redeem page of this site and
                autofills sender address. Receivers will need to opt into the
                asset before claiming.
              </Typography>
              <Typography
                variant="p"
                fontStyle="italic"
                marginLeft="1rem"
                color={(theme) => theme.palette.grey.main}
              >
                *Receivers already opted in to the sent ASA before it was sent
                will automatically receive assets with no additional steps.
              </Typography>
            </Box>
          )}
          <Grid container spacing={2} sx={{ marginBlock: '2rem' }}>
            <Grid item xs={6} lg={5} className="mr-2">
              <Link
                href="https://about.algodex.com/docs/algodex-mailbox-user-guide/"
                target="blanc"
                color="primary.dark"
              >
                {t('view-instructions-link')}
              </Link>
            </Grid>
            <Grid item xs={6} lg={5}>
              <Link href={'/sample.csv'} download color="primary.dark">
                {t('download-csv-example-link')}
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default SendAssetPage
