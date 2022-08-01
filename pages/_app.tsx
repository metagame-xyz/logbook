import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { datadogRum } from '@datadog/browser-rum'
import { darkTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Grommet } from 'grommet'
import { WagmiConfig } from 'wagmi'

import { DATADOG_RUM_APPLICATION_ID, DATADOG_RUM_CLIENT_TOKEN, DATADOG_RUM_ENV } from 'utils/constants'
import { chains, wagmiClient } from 'utils/rainbowkit'

// import Layout from 'components/Layout';
// import EthereumProvider from '../providers/EthereumProvider';
import '../styles/globals.css'
import theme from '../styles/theme'

const bgSize = ['100px', '120px', '220px', '300px']

const customTheme: Theme = darkTheme()

customTheme.fonts.body = 'Lars'

function App({ Component, pageProps }: AppProps): JSX.Element {
    const { route } = useRouter()

    const Layout = dynamic(() => import('components/Layout'))

    useEffect(() => {
        datadogRum.init({
            applicationId: DATADOG_RUM_APPLICATION_ID,
            clientToken: DATADOG_RUM_CLIENT_TOKEN,
            site: 'datadoghq.com',
            service: 'logbook',
            env: DATADOG_RUM_ENV,
            // Specify a version number to identify the deployed version of your application in Datadog
            // version: '1.0.0',
            sampleRate: 100,
            premiumSampleRate: 13,
            trackInteractions: true,
            defaultPrivacyLevel: 'mask-user-input',
        })
        // datadogRum.startSessionReplayRecording()
    }, [])

    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains} theme={customTheme}>
                <Grommet theme={theme} background="backgroundDark" className="grommet-container">
                    <Component {...pageProps} />
                </Grommet>
            </RainbowKitProvider>
        </WagmiConfig>
    )
}

export default App
