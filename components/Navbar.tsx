import Image from 'next/image'
import React from 'react'

import { Avatar, Box, Button, Flex, Heading, HStack, Spacer, Text, useBreakpointValue } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

import { copy } from 'utils/content'

import { Etherscan, Logo, Opensea, Twitter } from 'components/Icons'

function Navbar(props) {
    // const { userName, openWeb3Modal, avatarUrl } = useEthereum();
    const userName = null
    const openWeb3Modal = (a) => {
        a
    }
    const avatarUrl = null

    const showName = useBreakpointValue({ base: false, md: true })

    return (
        <Flex width="100%" bgColor="transparent" boxShadow="md">
            <HStack as="nav" width="100%" margin="auto" justify="center" align="center" p={4} {...props}>
                <HStack align="center" spacing={2} pr={[0, 2]}>
                    <Logo boxSize={10} />
                    {showName && (
                        <Heading as="h1" fontSize="34px">
                            {copy.title}
                        </Heading>
                    )}
                    <Image src="/static/assets/logbookLogo.svg" alt="Logbook Logo" width={200} height={100} />
                </HStack>
                <Spacer />
                <HStack align="center" spacing={[3, 4, 5, 6]}>
                    <Twitter />
                    <Opensea />
                    <Etherscan />
                    {userName ? (
                        <Box bgColor="brand.700" color="white" px={4} py={3} borderRadius="full">
                            <HStack>
                                {avatarUrl && <Avatar size="xs" src={`${avatarUrl}`} />}
                                <Text>{userName}</Text>
                            </HStack>
                        </Box>
                    ) : (
                        <ConnectButton />
                        // <Button
                        //     onClick={() => openWeb3Modal('Navbar')}
                        //     fontWeight="normal"
                        //     colorScheme="brand"
                        //     bg="brand.700"
                        //     size="lg"
                        //     boxShadow="lg"
                        //     fontSize="2xl"
                        //     borderRadius="full">
                        //     Connect
                        // </Button>
                    )}
                </HStack>
            </HStack>
        </Flex>
    )
}

export default Navbar
