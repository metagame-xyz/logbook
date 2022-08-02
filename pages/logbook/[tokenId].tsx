import { InferGetServerSidePropsType } from 'next'
import Head from 'next/head'

// import Image from 'next/image'
import { Box, Button, Image } from 'grommet'

import { LOGBOOK_CONTRACT_ADDRESS } from 'utils/constants'
import { clickableIPFSLink } from 'utils/frontend'
import generateSvg from 'utils/generateSvg'
import logbookMongoose from 'utils/logbookMongoose'

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
    const { name, tokenId, image, description } = metadata

    const getOpenSeaUrl = (tokenId: string) => {
        return `https://opensea.io/assets/${LOGBOOK_CONTRACT_ADDRESS}/${tokenId}`
    }
    console.log(clickableIPFSLink(image))
    const size = ['80vw']

    // async function download() {
    //     const canvas = document.getElementById('canvas') as HTMLCanvasElement
    //     const ctx = canvas.getContext('2d')
    //     const v = Canvg.fromString(ctx, svgString)
    //     v.start()
    //     const png = canvas.toDataURL('image/png')
    //     const link = document.createElement('a')
    //     link.download = `${name}.png`
    //     link.href = png
    //     link.click()
    // }

    return (
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
            <Image src={clickableIPFSLink(image)} alt={name} />
            <Box>
                <Button label="View on OpenSea" onClick={() => window.open(getOpenSeaUrl(tokenId.toString()))} />
                <Button primary label="Download" />
            </Box>
        </Box>
    )
}

export default LogbookPage
