import { NextApiRequest, NextApiResponse } from 'next'

import { AddressZ } from 'evm-translator'
import { addressToName } from 'onoma'

import { WEBSITE_URL } from 'utils/constants'
import createSentences from 'utils/createSentences'
import generateSvg from 'utils/generateSvg'
import { addToIpfsFromSvgStr } from 'utils/ipfs'
import logbookMongoose from 'utils/logbookMongoose'
import { LogData, logError, logSuccess } from 'utils/logging'
import metabotMongoose from 'utils/metabot'
import { NftMetadata } from 'utils/models'
import getTranslator from 'utils/translator'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
    let address = _req.query.address as string

    const logData: LogData = {
        function_name: 'generateLogbook',
        message: `begin`,
        wallet_address: address,
    }

    try {
        logData.third_party_name = 'zod'
        address = AddressZ.parse(address)

        logData.wallet_address = address

        logData.third_party_name = 'metabotMongoose'
        await metabotMongoose.connect()
        const user = await metabotMongoose.getUserByEthAddress(address)

        if (!(user?.txHashList?.length > 0)) {
            throw new Error('No txHashList, or empty txHashList')
        }

        logData.third_party_name = 'evm-translator'
        const translator = await getTranslator(address)

        const decodedTx = await translator.getManyDecodedTxFromDB(user.txHashList)
        const interpretedData = await translator.interpretDecodedTxArr(decodedTx, address)

        // debugger

        logData.third_party_name = 'createSentences'
        const { sentences, actions, nftMintNames } = createSentences(interpretedData)

        const userName = user.ens || addressToName(user.address)

        const nftMetadata: NftMetadata = {
            name: `${userName}'s Logbook`,
            description: 'A compilation of all the transactions this address has been involved in',
            image: 'failed to load to ipfs',
            externalUrl: `https://${WEBSITE_URL}/logbook/${user.address}`,
            address: user.address,
            userName,
            sentences,
            lastUpdated: new Date(),
        }

        logData.third_party_name = 'generateSvg'
        const svgString = generateSvg(nftMetadata)

        logData.third_party_name = 'ipfs'
        const ipfsUrl = await addToIpfsFromSvgStr(svgString)

        nftMetadata.image = ipfsUrl

        logData.third_party_name = 'logbookMongoose'
        await logbookMongoose.connect()
        await logbookMongoose.addOrUpdateNftMetadata(nftMetadata)

        // const todo = data.______TODO______.filter((tx) => tx.toName !== 'OPENSEA')

        // delete data['______TODO______']

        logSuccess(logData)
        res.status(200).json({
            actions,
            sentences,
            nftMintNames,
        })
    } catch (err: any) {
        logError(logData, err)
        res.status(500).json({ statusCode: 500, message: err.message })
    }
}

export default handler
