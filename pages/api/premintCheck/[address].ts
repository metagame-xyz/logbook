import type { NextApiRequest, NextApiResponse } from 'next'

import { Signature } from 'ethers'

import { METABOT_BASE_API_URL } from 'utils/constants'
import logbookMongoose from 'utils/logbookMongoose'
import { fetcher } from 'utils/requests'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const address = req.query.address as string

        type PremintCheckResponse = {
            allowlist: boolean
            signature: Signature | null
        }

        const { allowlist, signature } = (await fetcher(
            `${METABOT_BASE_API_URL}premintCheck/${address}`,
        )) as PremintCheckResponse

        const response = {
            allowlist,
            signature,
            errorCode: null,
            message: null,
        }

        if (!allowlist) {
            response.message = 'User is not on mint whitelist'
            response.errorCode = 1
            return res.status(200).json(response)
        }

        const metadata = await logbookMongoose.getMetadataForAddress(address)

        if (!metadata) {
            response.message = 'data not yet generated for user'
            response.errorCode = 2
        }

        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}
