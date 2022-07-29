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

export default function Home() {
    return (
        <div>
            <Lottie options={options} width={3000} />
            <main>
                <h1>Enigma</h1>
            </main>
        </div>
    )
}
