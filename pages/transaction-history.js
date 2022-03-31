/*
 * Copyright Algodex VASP (BVI) Corp., 2022
 * All Rights Reserved.
 */

import React, { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'next/head'
import { defaults } from '@/next-i18next.config'

// MUI Components
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// Custom Components
import TransactionHistoryForm from '@/components/TransactionHistoryForm'
import * as TransactionHistoryHelper from '@/lib/transaction_history'
import Link from '@/components/Nav/Link'
import TransactionTable from '@/components/TransactionTable'

/**
 * Generate Static Properties
 * @param locale
 */
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        ...defaults,
        'transaction-history-page',
      ])),
    },
  }
}

export function TransactionHistoryPage() {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState({
    assetId: '',
    senderAddress: '',
    csvTransactions: '',
  })
  const [loading, setLoading] = useState(false)
  const [actionStatus, setActionStatus] = useState({
    message: '',
    success: false,
  })
  const [csvLink, setCsvLink] = useState()
  const [tableRows, setTableRows] = useState([])

  const submitForm = async ({ formData }) => {
    const { senderAddress, assetId } = formData
    if (senderAddress != '' && assetId != '') {
      setCsvLink()
      setActionStatus({
        message: '',
        success: true,
      })
      setTableRows([])
      setFormData({
        assetId,
        senderAddress,
        csvTransactions: '',
      })
      if (assetId && senderAddress) {
        setLoading(true)
        const responseData =
          await TransactionHistoryHelper.getTransactionHistory(
            assetId.trim(),
            senderAddress.trim()
          )
        // console.debug('responseData', responseData)
        setLoading(false)
        if (responseData.error == true) {
          setActionStatus({
            message: responseData.body?.message || 'Sorry an error occured',
            success: false,
          })
        } else {
          setFormData({
            assetId,
            senderAddress,
            csvTransactions: responseData,
          })
          updateCSVTable(responseData)
        }
      }
    }
  }

  const updateCSVTable = (csv) => {
    const titles = csv.slice(0, csv.indexOf('\n')).split(',')
    const rows = csv.slice(csv.indexOf('\n') + 1).split('\n')
    // console.log({ rows })
    if (rows[0] == '') {
      setActionStatus({
        message: 'No transaction history to display',
        success: false,
      })
    } else {
      setCsvLink('data:text/csv;charset=utf-8,' + encodeURI(csv))
      let formattedRows = rows.map((v) => {
        if (v != '') {
          const values = v.split(',')
          const storeKeyValue = titles.reduce((obj, title, index) => {
            obj[title] = values[index]
            return obj
          }, {})
          return storeKeyValue
        }
      })
      setTableRows(formattedRows)
    }
  }
  return (
    <>
      <Head>
        <title>{`${t('/transaction-history')} | ${t('app-title')}`}</title>
      </Head>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8} lg={6} xl={5}>
          <Typography variant="h5" sx={{ marginBottom: '1rem' }}>
            {t('/transaction-history')}
          </Typography>
          <TransactionHistoryForm
            onSubmit={submitForm}
            isLoading={loading}
            formData={formData}
            actionStatus={actionStatus}
          />
        </Grid>
        <Grid item xs={12} md={11} lg={11} xl={9} marginBottom='2rem'>
          {tableRows.length > 0 && (
            <Box sx={{ marginBlock: '1rem' }}>
              <TransactionTable rows={tableRows} />
            </Box>
          )}
          {csvLink && (
            <Link
              href={csvLink}
              target="_blanc"
              download="Transaction History.csv"
              sx={{ color: 'blue', textDecoration: 'underline' }}
            >
              Click to download Transaction History
            </Link>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default TransactionHistoryPage
