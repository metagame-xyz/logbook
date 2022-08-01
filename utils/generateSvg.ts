import { NftMetadata } from './models'

export default function generateSvg(metadata: NftMetadata): string {
    const { sentences, name, lastUpdated } = metadata

    const dateStr = lastUpdated.toDateString().split(' ').slice(1).join(' ')

    const titleOffset = 30
    const dividerOffset = titleOffset + 20
    const sentenceOffset = dividerOffset + 20

    const backgroundColor = 'beige'
    const fontColor = 'rgb(21, 61, 38)'
    const fontFamily = 'monospace'
    const sentenceSize = 16
    const sentenceSpaceSize = sentenceSize * 1.15

    /**********/
    /* Canvas */
    /**********/
    const canvasWidth = 550
    const canvasHeight = sentences.length * sentenceSpaceSize + sentenceOffset + titleOffset
    const canvasSvg = `<svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`
    const backgroundSvg = `<rect width="${canvasWidth}" height="${canvasHeight}" fill="${backgroundColor}" />`
    const styleSvg = `<style> text { fill: ${fontColor}; font-family: ${fontFamily};} .date { fill: rgb(36, 36, 36); font-weight: bold} </style>`
    const defsOpenTag = '<defs>'
    const defsCloseTag = '</defs>'
    const closingSvgTag = `</svg>`

    /**************/
    /*    TITLE   */
    /**************/

    const titleSvg = `<text x="${20}" y="${titleOffset}" font-size="30px" font-weight="bold">${name}</text>`

    const dividerX = 10
    const dividerSvg = `<line x1="${dividerX}" y1="${dividerOffset}" x2="${
        canvasWidth - dividerX
    }" y2="${dividerOffset}" stroke="${fontColor}" stroke-width="${2}"/>`

    /**************/
    /* SENTENCES  */
    /**************/

    const sentencesSvgArr = []

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i]

        if (sentence.includes('waiting to be interpreted')) {
            const sentenceArr = sentence.split(' ')
            const partOne = sentenceArr.slice(0, 4).join(' ')
            const partTwo = sentenceArr.slice(4).join(' ')

            sentencesSvgArr.push(
                `<a href="https://evm-translator.xyz/contribute" target="_blank"><text x="20" y="${
                    sentenceSpaceSize * (i + 1) + sentenceOffset
                }" font-size="${sentenceSize}">${partOne} <tspan text-decoration="underline">${partTwo}</tspan></text></a>`,
            )
        } else {
            sentencesSvgArr.push(
                `<text x="20" y="${
                    sentenceSpaceSize * (i + 1) + sentenceOffset
                }" font-size="${sentenceSize}">${sentence}</text>`,
            )
        }
    }

    const sentencesSvg = sentencesSvgArr.join('')

    /**************/
    /*   DATE     */
    /**************/

    const xCoord = canvasWidth - 140
    const yCoord = 20

    // const xOffset = xCoord + canvasHeight / 2
    // const yOffset = yCoord + canvasWidth / 2

    // const dateSvg = `<text x="${0}" y="${0}" transform="translate(${xCoord} ${yCoord}) rotate(-45)" class="date">${dateStr}</text>`
    const dateSvg = `<a href="https://evm-translator.xyz/contribute"> <text x="${0}" y="${0}" transform="translate(${xCoord} ${yCoord}) rotate(30)" class="date">${dateStr}</text></a>`

    // const timeGradientSVG = timeGradientArr.join('')
    /**************/
    /* SVG concat */
    /**************/
    const svgData = []
    svgData.push(canvasSvg)
    svgData.push(backgroundSvg)
    svgData.push(styleSvg)
    // svgData.push(defsOpenTag)
    // svgData.push(timeGradientSVG)
    // svgData.push(defsCloseTag)
    svgData.push(titleSvg)
    svgData.push(dividerSvg)
    svgData.push(sentencesSvg)
    svgData.push(dateSvg)
    svgData.push(closingSvgTag)
    const svgString = svgData.join('')

    return svgString
}
