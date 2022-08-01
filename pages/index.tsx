import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'

import { Box, Button, Heading, ResponsiveContext, Stack, Text } from 'grommet'
import { parseEther } from '@ethersproject/units'
import axios from 'axios'
import { BigNumber, Contract, ethers, Wallet } from 'ethers'
import { addressToNameObject } from 'onoma'
import { useAccount, useProvider, useSigner } from 'wagmi'

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
    const [svgElement, setSvgElement] = useState()

    let cantMintReason = null
    
    if (errorCode === 1) cantMintReason = `You're not on the allowlist yet. Plz message Metabot`
    if (errorCode === 2) cantMintReason = `You're on the allowlist but the Enigma Machine hasn't finished processing your data`
    
    const isMobile = useContext(ResponsiveContext) === 'small';

    useEffect(() => {
        const zoomElement = document.querySelector(".zoom")
        const baseZoom = isMobile ? 1 : 0.95

        zoomElement.style.transform = `scale(${baseZoom})`  
        let zoom = baseZoom
        const ZOOM_SPEED = 0.1
        
        let xDown = null;                                                        
        let yDown = null;
        
        const handleWheel = (e) => {
            e.preventDefault()

            const svgElement = document.querySelector(".zoom")?.querySelector("g")
            if(e.deltaY > 0 && window.innerWidth * 1.4 > svgElement.getBoundingClientRect().width){    
                zoom += ZOOM_SPEED
                zoomElement.style.transform = `scale(${zoom})`  
            }else if (e.deltaY < 0 && zoom > baseZoom) { 
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
            e.preventDefault()
            const xUp = e.touches[0].clientX;                                    
            const yUp = e.touches[0].clientY;
            
            const xDiff = xDown - xUp;
            const yDiff = yDown - yUp;

            const svgElement = document.querySelector(".zoom")?.querySelector("g")
            
            if ( Math.abs( xDiff ) < Math.abs( yDiff ) && svgElement) {
                if ( yDiff > 0 && window.innerHeight > svgElement.getBoundingClientRect().height) {
                    zoom += ZOOM_SPEED
                    zoomElement.style.transform = `scale(${zoom})`  
                } else if (yDiff < 0 && zoom > baseZoom) { 
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
        
        // document.addEventListener("scroll", (e) => e.preventDefault(), { passive: false, capture: false })

        
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
            <Stack fill>
                <Box fill className="zoom" justify="center">
                    <Lottie 
                        options={options} 
                        width="fit-content" 
                    />
                </Box>
            
                <Box fill pad={isMobile ? "none" : { horizontal: "medium", top: "medium", bottom: "none" }}>
                    <Box fill background="backgroundLight" round={isMobile ? "none" : "small"}>
                        <Text>
                            {address}
                        </Text>
                        <Text>
                        {!allowlistLoading && address ? <>{isAllowlisted ? 'Whitelistedddd' : 'Not whitelisted'}</> : null}
                    </Text>
                </Box>
                
                </Box>
                {/* <Box px={8} py={8} width="fit-content" margin="auto" maxW={maxW}>
                <SimpleGrid columns={[1, 1, 1, 3]} spacing={16}>
                <About heading={copy.heading1} text={copy.text1} />
                <About heading={copy.heading2} text={copy.text2} />
                <About heading={copy.heading3} text={copy.text3} />
                </SimpleGrid>
            </Box> */}
                { address ? 
                    <Button
                    onClick={mint}
                    size="large"
                    >
                    Mint
                    </Button>
                    : <></>
                }
            
            
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
        