import { InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import { useContext, useEffect, useState } from 'react'

// import Image from 'next/image'
import { Box, Button, Image, ResponsiveContext, Stack } from 'grommet'

import { LOGBOOK_CONTRACT_ADDRESS } from 'utils/constants'
import { clickableIPFSLink } from 'utils/frontend'
import { getSize } from 'utils/generateSvg'
import logbookMongoose from 'utils/logbookMongoose'

import PlusBorder from 'components/PlusBorder'

export const getServerSideProps = async (context) => {
    const { tokenId } = context.query

    const metadata = tokenId.includes('0x')
        ? await logbookMongoose.getMetadataForAddress(tokenId)
        : await logbookMongoose.getMetadataForTokenId(tokenId)

    delete metadata.lastUpdated // if we need this then we need https://github.com/blitz-js/superjson#using-with-nextjs
    return {
        props: {
            metadata,
        },
    }
}

function LogbookPage({ metadata }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [contentContainer, setContentContainer] = useState<HTMLElement | null>(null)
    const isMobile = useContext(ResponsiveContext) === 'small'
    const { name, tokenId, image, description } = metadata

    const { width, height } = getSize(metadata)

    const getOpenSeaUrl = (tokenId: string) => {
        return `https://opensea.io/assets/${LOGBOOK_CONTRACT_ADDRESS}/${tokenId}`
    }
    const size = ['80vw']

    useEffect(() => {
        const contentLayerElement = document.querySelector('.main-stack').children[1] as HTMLElement
        contentLayerElement.style.overflowY = 'auto'
        contentLayerElement.classList.add('content-layer')
        setContentContainer(document.querySelector('.content-container') as HTMLElement)
    }, [])

    async function downloadPngBlob() {
        const file = await fetch(
            `/api/screenshot?url=${clickableIPFSLink(image)}&width=${width}&height=${height}`,
        ).then((res) => res.blob())

        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = `${name}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
    }

    return (
        <Stack fill="horizontal" className="main-stack">
            <Box height="100vh" className="zoom" justify="center" background="backgroundDark" />

            <Box pad={isMobile ? 'none' : 'medium'} overflow="hidden" fill>
                <Box
                    background="backgroundLight"
                    round={isMobile ? 'none' : 'small'}
                    pad="small"
                    direction="row"
                    gap="large"
                    flex
                >
                    <PlusBorder contentContainer={contentContainer} />
                    <Box margin="small" fill gap="large" className="content-container">
                        <Image src="/static/assets/logbookLogo.svg" alt="Logbook Logo" />
                        <Box
                            direction="row"
                            gap="medium"
                            fill="horizontal"
                            justify="center"
                            style={{ minHeight: 'auto' }}
                        >
                            <Button
                                secondary
                                label="View on OpenSea"
                                onClick={() => window.open(getOpenSeaUrl(tokenId.toString()))}
                            />
                            <Button secondary label="Download" onClick={() => downloadPngBlob()} />
                        </Box>
                        <Box>
                            <Head>
                                <title>{name}</title>
                                <meta property="og:title" content={name} />
                                <meta property="og:description" content={description} />
                                <meta property="og:image" content={clickableIPFSLink(image)} />
                                <meta name="twitter:title" content={name} />
                                <meta name="twitter:description" content={description} />
                                <meta name="twitter:image" content={clickableIPFSLink(image)} />
                                <meta name="twitter:image:alt" content={name} />
                            </Head>
                            <Image src={clickableIPFSLink(image)} alt={name} height="100%" />
                        </Box>
                    </Box>
                    <PlusBorder contentContainer={contentContainer} />
                </Box>
            </Box>
        </Stack>
    )
}

export default LogbookPage
