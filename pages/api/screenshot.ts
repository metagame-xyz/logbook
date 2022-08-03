import type { NextApiRequest, NextApiResponse } from 'next'

import { activateUrlbox } from 'utils/urlbox'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const url = req.query.url as string
    const height = Number(req.query.height) as number
    const width = Number(req.query.width) as number

    const pngUrl = await activateUrlbox(url, height, width)

    return res.status(200).send({ pngUrl })
}
