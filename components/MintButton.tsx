import React, { useState } from 'react'

import { Button } from 'grommet'

const MintButton = ({ canMint = false, mint = () => {} }) => {
    const [mintLabel, setMintLabel] = useState('Mint')

    return (
        <div
            onMouseEnter={() => canMint && setMintLabel('> Mint <')}
            onMouseLeave={() => setMintLabel('Mint')}
            style={{ width: '100%' }}
        >
            <Button
                onClick={mint}
                size="large"
                primary
                disabled={!canMint}
                label={mintLabel}
                style={{ width: '100%' }}
            />
        </div>
    )
}

export default MintButton
