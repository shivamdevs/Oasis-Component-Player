import { useEffect, useRef, useState } from 'react';
import css from  './Player.module.css';
function Player(props) {
    const [loading, setLoading] = useState(true);
    const [progress, setprogress] = useState(0);
    const [activated, setActivated] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const video = useRef(null);

    const videoPaused = () => {};
    const videoPlaying = () => {};
    const videoLoaded = () => {
        setLoading(false);
    };
    const videoWaiting = () => {
        setLoading(true);
    };
    const videoCanPlay = () => {

    };
    const videoLoadError = () => {
        setLoading(false);
        setFetchError(true);
    };
    const videoTimeUpdate = ({target}) => {
        setprogress(((target.currentTime / target.duration) * 100).toFixed(2));
        setCurrentTime(target.currentTime);
    };
    const videoMetaDataLoaded = ({target}) => {
        setDuration(target.duration);
    };
    return (
        <div className={css.player}>
            <div className={css.media}>
                <video
                    src={props.src}
                    ref={video}
                    onLoad={videoLoaded}
                    onError={videoLoadError}
                    onCanPlay={videoCanPlay}
                    onLoadedData={videoLoaded}
                    onTimeUpdate={videoTimeUpdate}
                    onLoadedMetadata={videoMetaDataLoaded}
                    onPlaying={videoLoaded}
                    onWaiting={videoWaiting}
                    onPause={videoPaused}
                    onPlay={videoPlaying}
                    className={css.video}
                    controls={false}
                    autoPlay={true}
                    loop={true}
                />
            </div>
            <div className={css.cover} onClick={() => video.current.play()}>
                {loading && <Loader />}
            </div>
            <div className={`${css.cover} ${css.logs}`} onClick={() => video.current.play()}>
                {true && <div className={css.logger}>
                
                </div>}
            </div>
            <div className={`${css.controls} ${activated ? css.visible : ''}}`}>
                <div className={css.c_row}>
                    <div className={css.seeker}>
                        <input type="range" step={0.01} min={0} max={100} defaultValue={progress} className={css.range} onInput={(e) => console.log(e.target.value)} />
                    </div>
                </div>
                <div className={css.c_row}>
                    <div className={css.panel}>
                        <div className={css.c_time}>{parseTime(currentTime)} / {parseTime(duration)}</div>
                    </div>
                    <div className={css.panel}></div>
                    </div>
            </div>
        </div>
    );
};

export default Player;

function parseTime(totalSeconds) {
    let hours = Math.floor(totalSeconds / 3600).toFixed(0);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60).toFixed(0);
    let seconds = (totalSeconds % 60).toFixed(0);

    return ((hours > 0) ? String(hours).padStart(2, "0") + ':' : '') + String(minutes).padStart(2, "0") + ':' + String(seconds).padStart(2, "0");
};

function Loader() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className={css.loadersvg}
            width="1em"
            height="1em"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
        >
            <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#fff3"
                strokeWidth="10"
                fill="none"
            ></circle>
            <circle
                cx="50"
                cy="50"
                r="40"
                stroke={"#2a52be"}
                strokeWidth={"10"}
                strokeLinecap=""
                fill="none"
            >
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    repeatCount="indefinite"
                    dur="3s"
                    values="0 50 50;180 50 50;720 50 50"
                    keyTimes="0;0.5;1"
                ></animateTransform>
                <animate
                    attributeName="stroke-dasharray"
                    repeatCount="indefinite"
                    dur="3s"
                    values="25.132741228718345 226.1946710584651;201.06192982974676 50.26548245743669;25.132741228718345 226.1946710584651"
                    keyTimes="0;0.5;1"
                ></animate>
            </circle>
        </svg>
    );
}