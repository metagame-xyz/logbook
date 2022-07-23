import type { NextApiRequest, NextApiResponse } from 'next'

import logbookMongoose from 'utils/logbookMongoose'
import { LogData, logError, logSuccess } from 'utils/logging'
import withMiddleware from 'utils/middleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { address, tokenId } = req.body

    const logData: LogData = {
        level: 'info',
        function_name: 'newTransaction',
        message: `begin`,
        token_id: tokenId,
        wallet_address: address,
    }

    try {
        await logbookMongoose.connect()

        const metadata = await logbookMongoose.addTokenIdForAddress(address, tokenId)

        const result = {
            minterAddress: metadata.address,
            tokenId: metadata.tokenId,
            userName: metadata.userName,
            ensName: metadata.userName,
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
