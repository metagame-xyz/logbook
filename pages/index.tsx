import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'

import { Avatar, Box, Button, Heading, Image, ResponsiveContext, Stack, Text } from 'grommet'
import { parseEther } from '@ethersproject/units'
import axios from 'axios'
import { BigNumber, Contract, ethers, Wallet } from 'ethers'
import { addressToNameObject } from 'onoma'
import { useAccount, useProvider, useSigner } from 'wagmi'
import { Etherscan, Logo, Opensea, Twitter } from 'components/Icons'
import {
    ALCHEMY_PROJECT_ID,
    blackholeAddress,
    LOGBOOK_CONTRACT_ADDRESS,
    networkStrings,
    WEBSITE_URL,
} from 'utils/constants'
import { copy } from 'utils/content'
import { debug, event } from 'utils/frontend'
import logbookAbi from 'utils/logbookAbi'
import { Metadata } from 'utils/metadata'

import { maxW } from 'components/Layout'

import newThing from 'public/static/animations/too-big.json'
import Lottie from 'react-lottie'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import CustomConnectButton from 'components/ConnectButton'
import MintButton from 'components/MintButton'

const options = {
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: newThing,
    renderingSettings: {
        preserveAspectRatio: 'xMidYMid slice',
    },
}

function Home({ metadata }) {
    // const { provider, signer, userAddress, userName, eventParams, openWeb3Modal, toast } = useEthereum();
    const { address, isConnecting, isDisconnected } = useAccount()
    
    const provider = useProvider()
    const { data: signer, isError, isLoading } = useSigner()
    
    const [isAllowlisted, setAllowlisted] = useState<boolean | false>(null)
    const [errorCode, setErrorCode] = useState<number | null>(null)
    const [allowlistLoading, setAllowlistLoading] = useState(false)
    const [expandedSignature, setExpandedSignature] = useState({ v: null, r: null, s: null })

    let cantMintReason = null
    
    if (errorCode === 1) cantMintReason = `You're not on the allowlist yet. Plz message Metabot`
    if (errorCode === 2) cantMintReason = `You're on the allowlist but the Enigma Machine hasn't finished processing your data`
    
    const isMobile = useContext(ResponsiveContext) === 'small';

    useEffect(() => {
        const contentLayerElement = document.querySelector('.main-stack').children[1]
        contentLayerElement.style.overflowY = 'auto'
        contentLayerElement.classList.add('content-layer')
    }, [])

    useEffect(() => {
        const zoomElement = document.querySelector(".zoom")
        const baseZoom = isMobile ? 1 : 0.95

        zoomElement.style.transform = `scale(${baseZoom})`  
        let zoom = baseZoom
        const ZOOM_SPEED = 0.05
        
        let xDown = null;                                                        
        let yDown = null;
        
        const handleWheel = (e) => {
            const svgElement = document.querySelector(".zoom")?.querySelector("g")
            const contentLayerElement = document.querySelector(".content-layer")
            if(e.deltaY > 0 && window.innerWidth * 1.4 > svgElement.getBoundingClientRect().width){
                e.preventDefault()    
                zoom += ZOOM_SPEED
                zoomElement.style.transform = `scale(${zoom})`  
            }else if (e.deltaY < 0 && zoom > baseZoom && !contentLayerElement.scrollTop) {
                e.preventDefault() 
                zoom -= ZOOM_SPEED
                zoomElement.style.transform = `scale(${zoom})`  
            }
        }
        
        const getTouches = (e) => {
            return e.touches ||             // browser API
            e.originalEvent.touches; // jQuery
        }
        
        const handleTouchStart = (e) => {
            const firstTouch = getTouches(e)[0];                                      
            xDown = firstTouch.clientX;                                      
            yDown = firstTouch.clientY;                                      
        };                                                
        
        const handleTouchMove = (e) => {
            const xUp = e.touches[0].clientX;                                    
            const yUp = e.touches[0].clientY;
            
            const xDiff = xDown - xUp;
            const yDiff = yDown - yUp;

            const svgElement = document.querySelector(".zoom")?.querySelector("g")
            const contentLayerElement = document.querySelector(".content-layer")

            if ( Math.abs( xDiff ) < Math.abs( yDiff ) && svgElement) {
                if ( yDiff > 0 && window.innerHeight > svgElement.getBoundingClientRect().height) {
                    e.preventDefault()
                    zoom += ZOOM_SPEED
                    zoomElement.style.transform = `scale(${zoom})`  
                } else if (yDiff < 0 && zoom > baseZoom && !contentLayerElement.scrollTop) {
                    e.preventDefault() 
                    zoom -= ZOOM_SPEED
                    zoomElement.style.transform = `scale(${zoom})`  
                }                                                                 
            }
            /* reset values */
            xDown = xUp;
            yDown = yUp;                                             
        };
        
        document.addEventListener("wheel", handleWheel, { passive: false, capture: false })
        
        document.addEventListener('touchstart', handleTouchStart, { passive: false, capture: false })       
        document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: false })

        
    }, [])
    
    useEffect(() => {
        if (address && !allowlistLoading) {
            setAllowlistLoading(true)
            console.log('calling', address)
            const response = axios
            .get(`/api/premintCheck/${address}`, {
                // headers: {
                //     'content-type': 'application/json',
                // },
            })
            .then((resp) => {
                const { allowlist, signature, errorCode } = resp.data                
                if (resp.data.allowlist) {
                    setExpandedSignature(signature)
                    setAllowlisted(allowlist)
                    setAllowlistLoading(false)
                } else {
                    setErrorCode(errorCode)
                    setAllowlisted(allowlist)
                    setAllowlistLoading(false)
                }
            })
            .catch((err) => {
                console.log('ERR', err)
            })
        }
    }, [address])
    
    const mint = async () => {
        // const provider = new ethers.providers.Web3Provider(provider)
        // const signer = provider.getSigner()
        const contract = new ethers.Contract(LOGBOOK_CONTRACT_ADDRESS, logbookAbi, provider)
        const contractWithSigner = contract.connect(signer)
        
        const tx = await contractWithSigner.mintWithSignature(
            address,
            expandedSignature.v,
            expandedSignature.r,
            expandedSignature.s,
            {
                gasLimit: 2100000,
                gasPrice: 8000000000,
                value: ethers.utils.parseEther('0.01'),
            },
            )
        console.log('Transaction:', tx.hash)
    }

    const PlusBorder = () => (
        <Box align="center">
            {
                [...Array(100).keys()].map((i) => <Text key={i} color="brand">+</Text>)
            }
        </Box>
    )
        
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
            <Stack fill="horizontal" className="main-stack">
                <Box height="100vh" className="zoom" justify="center">
                    <Lottie 
                        options={options} 
                        width="fit-content" 
                    />
                </Box>
            
                <Box style={{marginTop: '100vh'}} pad={isMobile ? "none" : { horizontal: "medium", top: "medium", bottom: "none" }}>
                    <Box background="backgroundLight" round={isMobile ? "none" : "small"} pad="small" direction="row" gap="large" flex>
                        <PlusBorder />
                        <Box margin="small" fill gap="large">
                            <Image src="/static/assets/logbookLogo.svg" alt="Logbook Logo" />
                            <Box direction={isMobile ? "column" : "row"} gap="medium">
                                <Box basis="2/3">
                                    <Text color="brand">
                                    Logbook elevator pitch goes here. Lorem ipsum dolor sit    
            amet, consectetur adipiscing elit, sunt in culpa qui anim. 
            sed do eiusmod tempor incididunt ut labore et dolore magna 
            aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
            ullamco laboris nisi ut aliquip ex ea commodo consequat. 
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                    </Text>
                                </Box>
                                
                                <Box align="end" gap="medium" basis="1/3">
                                    <CustomConnectButton />
                                    <MintButton canMint={address && isAllowlisted} mint={mint} />
                                </Box>
                            </Box>

                            
                            <Image src={`/static/assets/pageDivider${isMobile ? "Mobile" : "Desktop"}.svg`} alt="Page divider" />
                            <Box>
                                <Text>
                                {   `MM   MM  EEEEE TTTTTTT  AAA    GGG    AAA   MM   MM  EEEEE \n
                                    M M M M  EEEE     T    A   A  G      A   A  M M M M  EEEE \n
                                    M  M  M  E        T    AAAAA  G  GG  AAAAA  M  M  M  E \n
                                    M     M  EEEEE    T    A   A   GGG   A   A  M     M  EEEEE`}
                                </Text>
                            </Box>

                        </Box>
                        <PlusBorder />
                    </Box>
                </Box>
                {/* <Box px={8} py={8} width="fit-content" margin="auto" maxW={maxW}>
                <SimpleGrid columns={[1, 1, 1, 3]} spacing={16}>
                <About heading={copy.heading1} text={copy.text1} />
                <About heading={copy.heading2} text={copy.text2} />
                <About heading={copy.heading3} text={copy.text3} />
                </SimpleGrid>
            </Box> */}
            
            
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
            </Stack>
            )
        }
        
        export default Home
        