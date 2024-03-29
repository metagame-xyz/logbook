import type { NextApiRequest, NextApiResponse } from 'next'

import logbookMongoose from 'utils/logbookMongoose'
import { LogData, logError, logSuccess } from 'utils/logging'
import withMiddleware from 'utils/middleware'

import OpenseaForceUpdate from './queues/openseaForceUpdate'

// import OpenseaForceUpdate from './queues/openseaForceUpdate'

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { minterAddress, tokenId } = req.body

    const logData: LogData = {
        level: 'info',
        function_name: 'newTransaction',
        message: `begin`,
        token_id: tokenId,
        wallet_address: minterAddress,
    }

    try {
        await logbookMongoose.connect()

        const metadata = await logbookMongoose.addTokenIdForAddress(minterAddress, tokenId)

        const result = {
            minterAddress: metadata.address,
            tokenId: metadata.tokenId,
            userName: metadata.userName,
            ensName: metadata.userName,
        }

        const tokenIdStr = String(tokenId)

        try {
            await OpenseaForceUpdate.enqueue(
                {
                    tokenId: tokenIdStr,
                    attempt: 1,
                    newImageUrl: metadata.image,
                },
                { id: tokenIdStr, override: true },
            )
        } catch (error) {
            logError(logData, error)
        }

        logSuccess(logData)
        res.status(200).send({
            status: 1,
            message: 'success',
            result,
        })
    } catch (error) {
        logError(logData, error)

        res.status(500).json({ error: error.message })
    }
}

export default withMiddleware('eventForwarderAuth')(handler)
