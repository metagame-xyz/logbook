import { InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Box, Button } from '@chakra-ui/react'

import { LOGBOOK_CONTRACT_ADDRESS } from 'utils/constants'
import { clickableIPFSLink } from 'utils/frontend'
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
    return (
        <Box p="16px" minH="calc(100vh - 146px)" w="auto">
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
            <Image src={clickableIPFSLink(image)} alt={name} width="800px" height="800px" />
            <Box>
                <Button
                    colorScheme="brand"
                    my={4}
                    size="lg"
                    boxShadow="lg"
                    fontSize="2xl"
                    bg="brand.700"
                    rightIcon={<ExternalLinkIcon />}
                    onClick={() => window.open(getOpenSeaUrl(tokenId.toString()))}
                >
                    View on OpenSea
                </Button>
            </Box>
        </Box>
    )
}

export default LogbookPage
