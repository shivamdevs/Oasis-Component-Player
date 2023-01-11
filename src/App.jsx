import Player from "./Player";

export default function App() {
    return (
        <div className="app">
            <Player
                src="/media.mp4"
            />
            <Player
                src="/media1.mp4"
            />
        </div>
    );
};