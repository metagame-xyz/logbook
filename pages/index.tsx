import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { ExternalLinkIcon } from '@chakra-ui/icons'
import { AccordionButton, Box, Button, Heading, Link, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { parseEther } from '@ethersproject/units'
import { BigNumber, Contract, ethers, Wallet } from 'ethers'
import { addressToNameObject } from 'onoma'
import { useAccount } from 'wagmi'

import {
    ALCHEMY_PROJECT_ID,
    blackholeAddress,
    CONTRACT_ADDRESS,
    METABOT_API_URL,
    networkStrings,
    WEBSITE_URL,
} from 'utils/constants'
import { copy } from 'utils/content'
import { debug, event } from 'utils/frontend'
import { Metadata } from 'utils/metadata'
import { maxW } from 'components/Layout'
import { fetcher } from 'utils/frontend'
import logbookAbi from 'utils/logbookAbi'

const LOGBOOK_CONTRACT_ADDRESS = "0x536ea5d11e914bcef00889a8e790947cd8603e29"

function About({ heading, text }) {
    return (
        <VStack maxW={['sm', 'md', 'md', 'full']}>
            <Heading as="h2" fontSize="24px">
                {heading}
            </Heading>
            <Text align="center">{text}</Text>
        </VStack>
    )
}

function heartbeatShowerLink(tokenId: number): string {
    return `https://${WEBSITE_URL}/heart/${tokenId}`
}

function Home({ metadata }) {
    // const { provider, signer, userAddress, userName, eventParams, openWeb3Modal, toast } = useEthereum();
    const [{ data: account, error, loading }] = useAccount({
        fetchEns: true,
    })
    const [isWhitelisted, setWhitelisted] = useState(false)
    const [whitelistLoading, setWhitelistLoading] = useState(false)
    const [expandedSignature, setExpandedSignature] = useState()

    useEffect(() => {

        if (account && !whitelistLoading) {
            setWhitelistLoading(true)
            console.log('calling', account.address);
            const response = axios.get(`${METABOT_API_URL}premintCheck?` + new URLSearchParams({ address: account.address }), { 
                headers: { 
                    'content-type': 'application/json',
                },
            })
                .then((resp) => {
                    console.log(resp.data)
                    setExpandedSignature(resp.data)
                    setWhitelisted(true)
                    setWhitelistLoading(false)
                })
                .catch((err) => {
                    console.log('WHITELIST ERR', err)
                    setWhitelistLoading(false)
                })
        }
    }, [account && account.address])

    const testSign = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(LOGBOOK_CONTRACT_ADDRESS, logbookAbi, provider)
        const contractWithSigner = contract.connect(signer)

        let tx = await contractWithSigner.mintWithSignature(account.address, expandedSignature.v, expandedSignature.r, expandedSignature.s, {
            gasLimit: 2100000,
            gasPrice: 8000000000,
            value: ethers.utils.parseEther("0.01")
        });
        console.log("Transaction:", tx.hash);
        
    }

    const createToken = () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract("0xa01769a4887f78969ecfcdcd428b72545e787b88", testSignAbi, provider)
        const contractWithSigner = contract.connect(signer)
        contractWithSigner.create(
            "https://ipfs.io/ipfs/bafybeibnsoufr2renqzsh347nrx54wcubt5lgkeivez63xvivplfwhtpym/metadata.json", 
            0,
            {
                gasLimit: 2100000,
                gasPrice: 8000000000,
            }
        )
            .then((resp) => {
                console.log('create', resp)
            })
            .catch((err) => {
                console.log('create err', err)
            })
    }

    const checkSignature = async () => {
        const DOMAIN_SEPARATOR = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                [
                    "bytes32",
                    "bytes32",
                    "bytes32",
                    "uint256",
                    "address"
                ],
                [
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")),
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Metagame")),
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("1")),
                    4,
                    "0x6eafa48d9c01713cbc11f87026288fbc85e9c51d"
                ]
            )
        )

        const payload = ethers.utils.defaultAbiCoder.encode([ "bytes32", "address", "uint256" ], [ ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Mint(address minter,uint256 tokenId)")), account.address, 1 ])
        const payloadHash = ethers.utils.keccak256(payload)

        console.log("Recovered:", ethers.utils.verifyMessage(ethers.utils.arrayify(payloadHash), expandedSignature));
    }

    const setValidSigner = () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract("0x6eafa48d9c01713cbc11f87026288fbc85e9c51d", testSignAbi, provider)
        const contractWithSigner = contract.connect(signer)
        contractWithSigner.setValidSigner(
            "0x3EDfd44082A87CF1b4cbB68D6Cf61F0A40d0b68f", 
            true,
            {
                gasLimit: 2100000,
                gasPrice: 8000000000,
            }
        )
            .then((resp) => {
                console.log('set signer', resp)
            })
            .catch((err) => {
                console.log('set signer err', err)
            })
    }

    const mint = () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract("0x6eafa48d9c01713cbc11f87026288fbc85e9c51d", testSignAbi, provider)
        const contractWithSigner = contract.connect(signer)
        console.log(expandedSignature)
        console.log(account.address)
        contractWithSigner.callStatic.mintWithSignature(
            expandedSignature.v, 
            expandedSignature.r, 
            expandedSignature.s, 
            account.address, 
            1, 
            {
                gasLimit: 2100000,
                gasPrice: 8000000000,
            }
        )
            .then((resp) => {
                console.log(resp)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    // const contract = new Contract(CONTRACT_ADDRESS, heartbeat.abi, provider);

    // let [minted, setMinted] = useState(false);
    // let [minting, setMinting] = useState(false);
    // let [userTokenId, setUserTokenId] = useState<number>(null);

    // let [mintCount, setMintCount] = useState<number>(null);

    // useEffect(() => {
    //     async function getUserMintedTokenId() {
    //         // userAddress has changed. TokenId defaults to null
    //         let tokenId = null;
    //         try {
    //             if (userAddress) {
    //                 const filter = contract.filters.Transfer(
    //                     blackholeAddress,
    //                     userAddress,
    //                 );
    //                 const [event] = await contract.queryFilter(filter); // get first event, should only be one
    //                 if (event) {
    //                     tokenId = event.args[2].toNumber();
    //                 }
    //             }
    //         } catch (error) {
    //             toast(toastErrorData('Get User Minted Token Error', JSON.stringify(error)));
    //             debug({ error });
    //         } finally {
    //             // set it either to null, or to the userAddres's tokenId
    //             setUserTokenId(tokenId);
    //         }
    //     }
    //     getUserMintedTokenId();
    // }, [userAddress]);

    // Mint Count
    // useEffect(() => {
    //     async function getMintedCount() {
    //         try {
    //             console.log('getting mint count');
    //             const mintCount: BigNumber = await contract.mintedCount();
    //             setMintCount(mintCount.toNumber());
    //         } catch (error) {
    //             debug({ error });
    //         }
    //     }
    //     const interval = setInterval(getMintedCount, 4000);
    //     return () => clearInterval(interval);
    // }, []);

    // const mint = async () => {
    //     event('Mint Button Clicked', eventParams);
    //     const network = await provider.getNetwork();
    //     if (network.name != networkStrings.ethers) {
    //         event('Mint Attempt on Wrong Network', eventParams);
    //         toast(wrongNetworkToast);
    //         return;
    //     }

    //     setMinting(true);
    //     const contractWritable = contract.connect(signer);
    //     const value = parseEther('0.01');
    //     try {
    //         const data = await contractWritable.mint({ value });
    //         const moreData = await data.wait();
    //         const [fromAddress, toAddress, tokenId] = moreData.events.find(
    //             (e) => (e.event = 'Transfer'),
    //         ).args;
    //         setUserTokenId(tokenId.toNumber());
    //         setMinting(false);
    //         setMinted(true);
    //         event('Mint Success', eventParams);
    //     } catch (error) {
    //         // const { reason, code, error, method, transaction } = error
    //         setMinting(false);

    //         if (error?.error?.message) {
    //             const eventParamsWithError = {
    //                 ...eventParams,
    //                 errorMessage: error.error.message,
    //                 errorReason: error.reason,
    //             };
    //             event('Mint Error', eventParamsWithError);
    //             toast(toastErrorData(error.reason, error.error.message));
    //         }
    //     }
    // };

    // const mintText = () => {
    //     if (!minting && !minted) {
    //         return 'Mint';
    //     } else if (minting) {
    //         return 'Minting...';
    //     } else if (minted) {
    //         return 'Minted';
    //     } else {
    //         return 'wtf';
    //     }
    // };

    // const textUnderButton = () => {
    //     if (userTokenId) {
    //         return <></>;
    //         // } else if (freeMintsLeft === null || freeMintsLeft > 0) {
    //         //     return (
    //         //         <Text fontWeight="light" fontSize={['2xl', '3xl']} color="white">
    //         //             {`${freeMintsLeft || '?'}/${freeMints} free mints left`}
    //         //         </Text>
    //         //     );
    //     } else {
    //         return (
    //             <div>
    //                 <Text fontWeight="light" fontSize={['xl', '2xl']} color="white">
    //                     0.01 ETH to mint
    //                 </Text>
    //                 {mintCount && (
    //                     <Text fontWeight="light" fontSize={['sm', 'md']} color="white">
    //                         {`${mintCount} ${copy.title}s have been minted`}
    //                     </Text>
    //                 )}
    //             </div>
    //         );
    //     }
    // };
    return (
        <Box>
            <Head>
                <title>{copy.title}</title>
            </Head>
            <Box px={8} pt={8} width="fit-content" mx="auto" maxW={maxW}>
                <Heading as="h1" fontSize={[54, 72, 96]} textAlign="center" color="brand.900">
                    {copy.title}
                </Heading>
                <Text fontSize={[16, 22, 30]} fontWeight="light" maxW={['container.md']} pb={4}>
                    {copy.heroSubheading}
                    <br />
                    {account?.address}
                </Text>
                <Text fontSize={[16, 22, 30]} fontWeight="light" maxW={['container.md']} pb={4}>
                    {(!whitelistLoading && account) ? (
                        <>
                        {isWhitelisted ? "Whitelistedddd" : "Not whitelisted" }
                        </>
                    ) : null}
                </Text>
                <div
                    style={{
                        aspectRatio: '1/1',
                        width: '80%',
                        maxWidth: '800px',
                    }}
                ></div>
            </Box>
            <Box px={8} py={8} width="fit-content" margin="auto" maxW={maxW}>
                <SimpleGrid columns={[1, 1, 1, 3]} spacing={16}>
                    <About heading={copy.heading1} text={copy.text1} />
                    <About heading={copy.heading2} text={copy.text2} />
                    <About heading={copy.heading3} text={copy.text3} />
                </SimpleGrid>
            </Box>
            <Button
                onClick={mint}
                loadingText="Minting..."
                fontWeight="normal"
                colorScheme="brand"
                bgColor="brand.600"
                // color="brand.900"
                _hover={{ bg: 'brand.500' }}
                size="lg"
                height="60px"
                minW="xs"
                boxShadow="lg"
                fontSize="4xl"
                borderRadius="full">
                Mint
            </Button>
            <Button
                onClick={createToken}
                loadingText="Minting..."
                fontWeight="normal"
                colorScheme="brand"
                bgColor="brand.600"
                // color="brand.900"
                _hover={{ bg: 'brand.500' }}
                size="lg"
                height="60px"
                minW="xs"
                boxShadow="lg"
                fontSize="4xl"
                borderRadius="full">
                Create Token
            </Button>
            <Button
                onClick={setValidSigner}
                loadingText="Minting..."
                fontWeight="normal"
                colorScheme="brand"
                bgColor="brand.600"
                // color="brand.900"
                _hover={{ bg: 'brand.500' }}
                size="lg"
                height="60px"
                minW="xs"
                boxShadow="lg"
                fontSize="4xl"
                borderRadius="full">
                Set signer
            </Button>
            <Button
                onClick={checkSignature}
                loadingText="Minting..."
                fontWeight="normal"
                colorScheme="brand"
                bgColor="brand.600"
                // color="brand.900"
                _hover={{ bg: 'brand.500' }}
                size="lg"
                height="60px"
                minW="xs"
                boxShadow="lg"
                fontSize="4xl"
                borderRadius="full">
                Check signature
            </Button>
            <Button
                onClick={testSign}
                loadingText="Minting..."
                fontWeight="normal"
                colorScheme="brand"
                bgColor="brand.600"
                // color="brand.900"
                _hover={{ bg: 'brand.500' }}
                size="lg"
                height="60px"
                minW="xs"
                boxShadow="lg"
                fontSize="4xl"
                borderRadius="full">
                Test sign
            </Button>

            {/* <VStack justifyContent="center" spacing={4} px={4} py={8} bgColor="brand.700">
                {!minted && !userTokenId ? (
                    <Button
                        onClick={userAddress ? mint : () => openWeb3Modal('Main Page Section')}
                        isLoading={minting}
                        loadingText="Minting..."
                        isDisabled={minted}
                        fontWeight="normal"
                        colorScheme="brand"
                        bgColor="brand.600"
                        // color="brand.900"
                        _hover={{ bg: 'brand.500' }}
                        size="lg"
                        height="60px"
                        minW="xs"
                        boxShadow="lg"
                        fontSize="4xl"
                        borderRadius="full">
                        {userAddress ? mintText() : 'Connect Wallet'}
                    </Button>
                ) : (
                    <Box fontSize={[24, 24, 36]} color="white">
                        <Text>{`${userName}'s ${copy.title} (#${userTokenId}) has been minted.`}</Text>
                        <Button
                            colorScheme="brand"
                            color="white"
                            variant="outline"
                            _hover={{ bgColor: 'brand.600' }}
                            _active={{ bgColor: 'brand.500' }}
                            mt={2}
                            size="lg"
                            rightIcon={<ExternalLinkIcon />}
                            onClick={() => window.open(heartbeatShowerLink(userTokenId))}>
                            View your Heartbeat
                        </Button>
                    </Box>
                )}
                {textUnderButton()}
            </VStack> */}
            <Box px={8} py={20} width="fit-content" margin="auto" maxW={maxW}>
                <Heading as="h1" fontSize={['24', '24', '36']} textAlign="center">
                    {copy.bottomSectonHeading}
                </Heading>
                <Text mt={4} fontWeight="light" maxW="xl">
                    {copy.bottomSectionText}
                    <Link isExternal href={'https://twitter.com/The_Metagame'}>
                        @The_Metagame
                    </Link>
                </Text>
            </Box>
        </Box>
    )
}

export default Home
