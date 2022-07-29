import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Grommet } from 'grommet'
import { darkTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiConfig } from 'wagmi'

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

    return (
        <WagmiConfig client={wagmiClient} >
            <RainbowKitProvider chains={chains} theme={customTheme}>
                <Grommet theme={theme} background="backgroundDark" full style={{ maxWidth: "100%"}}>
                    <Component {...pageProps} />
                </Grommet>
            </RainbowKitProvider>
        </WagmiConfig>
    )
}

export default App
