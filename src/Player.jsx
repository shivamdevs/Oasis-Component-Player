import { useEffect, useRef, useState } from 'react';
import css from  './Player.module.css';
function Player(props) {
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [muted, setMuted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState(false);
    const [seeking, setSeeking] = useState(false);
    const [activated, setActivated] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const video = useRef(null);
    const range = useRef(null);
    const frame = useRef(null);
    const seeker = useRef(null);
    const volrange = useRef(null);

    const videoPaused = () => {
        setPlaying(false);
    };
    const videoPlaying = () => {
        setPlaying(true);
    };
    const videoLoaded = () => {
        setLoading(false);
        videoActionRangeEnd();
    };
    const videoWaiting = () => {
        setLoading(true);
    };
    const videoCanPlay = () => {

    };
    const videoSeeked = ({target}) => {
        const duration = target.duration;
        if (duration > 0) {
            for (let i = 0; i < target.buffered.length; i++) {
                if (target.buffered.start(target.buffered.length - 1 - i) < target.currentTime) {
                    seeker.current.style.setProperty('--seeked', ((target.buffered.end(target.buffered.length - 1 - i) * 100) / duration).toFixed(2) + '%');
                    break;
                }
            }
        }
    };
    const videoLoadError = () => {
        setLoading(false);
        setFetchError(true);
    };
    const videoTimeUpdate = ({target}) => {
        setProgress(() => {
            const prog = ((target.currentTime / target.duration) * 100).toFixed(2);
            range.current.value = prog;
            range.current.style.setProperty('--progress', `${prog}%`);
            return prog;
        });
        setCurrentTime(target.currentTime);
    };
    const videoMetaDataLoaded = ({target}) => {
        setDuration(target.duration);
    };

    const videoActionResume = () => {
        const vid = video.current;
        if (vid.paused || vid.ended) {
            vid.play();
        } else {
            vid.pause();
        }
    };
    const videoActionMute = () => {
        setMuted(mute => !mute);
    };
    const videoActionRange = ({target}) => {
        video.current.currentTime = (target.value / 100) * video.current.duration;
        target.style.setProperty('--progress', `${((video.current.currentTime / video.current.duration) * 100).toFixed(2) }%`);
    };
    const videoActionRangeStart = () => {
        if (!video.current.paused) {
            //video.current.pause();
            setSeeking(true);
            window.addEventListener('mouseup', () => videoActionRangeEnd, { once: true });
        }
    };
    const videoActionRangeEnd = () => {
        console.log(seeking , !loading , video.current.paused);
        if (seeking && loading && video.current.paused) {
            setSeeking(false);
            video.current.play();
        }
    };
    const videoActionFullscreen = () => {
        const element = frame.current;
        var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;
        element.requestFullScreen = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || function () {
            return false;
        };
        document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () {
            return false;
        };
        isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
    };

    const videoActionFullscreenHandler = () => {
        const isFullscreen = !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement;
        setFullscreen(!isFullscreen);
    };
    const videoActionSeekBack = (jump) => {
        video.current.currentTime -= jump;
    };
    const videoActionSeekFor = (jump) => {
        video.current.currentTime += jump;
    };
    const videoActionVolumeUp = () => {
        if (video.current.volume < 1) video.current.volume += 0.1;
        console.log(video.current.volume);
    };
    const videoActionVolumeDown = () => {
        if (video.current.volume > 0) video.current.volume -= 0.1;
        console.log(video.current.volume);
    };
    const videoActionVolume = ({ target }) => {
        if (muted) setMuted(false);
        setVolume(target.value);
        target.style.setProperty('--progress', `${(target.value * 100).toFixed(2)}%`);
    };

    const playerKeypress = (e) => {
        const key = e.keyCode || e.which || e.charCode;
        if (e.target.nodeName === 'BUTTON' && key === 32) return;
        switch (key) {
            case 32: videoActionResume(); break;
            case 37: videoActionSeekBack(e.ctrlKey ? 30 : e.shiftKey ? 5 : 10); break;
            case 38: videoActionVolumeUp(); break;
            case 39: videoActionSeekFor(e.ctrlKey ? 30 : e.shiftKey ? 5 : 10); break;
            case 40: videoActionVolumeDown(); break;
            case 70: videoActionFullscreen(); break;
            case 77: videoActionMute(); break;
            default: return console.log(key, e.code);
        }

        e.preventDefault();
    };

    useEffect(() => {
        setActivated(!fetchError);
    }, [setActivated, fetchError]);

    useEffect(() => {

        document.addEventListener('fullscreenchange', videoActionFullscreenHandler, false);
        document.addEventListener('mozfullscreenchange', videoActionFullscreenHandler, false);
        document.addEventListener('MSFullscreenChange', videoActionFullscreenHandler, false);
        document.addEventListener('webkitfullscreenchange', videoActionFullscreenHandler, false);

        video.current.volume = volume;
        volrange.current.style.setProperty('--progress', `${(volume * 100).toFixed(2)}%`);
    });

    return (
        <div className={`${css.player} ${fullscreen ? css.fullscreen : ''}`} ref={frame} tabIndex={0} onKeyDown={playerKeypress}>
            <div className={css.media}>
                <video
                    src={props.src}
                    ref={video}
                    onLoad={(e) => {videoLoaded(e); videoSeeked(e);}}
                    onError={videoLoadError}
                    onCanPlay={videoCanPlay}
                    onLoadedData={videoLoaded}
                    onTimeUpdate={videoTimeUpdate}
                    onLoadedMetadata={videoMetaDataLoaded}
                    onPlaying={videoLoaded}
                    onWaiting={videoWaiting}
                    onPause={videoPaused}
                    onPlay={videoPlaying}
                    onProgress={videoSeeked}
                    onSeeked={videoSeeked}
                    onLoadStart={videoSeeked}
                    className={css.video}
                    controls={false}
                    autoPlay={true}
                    muted={muted}
                />
            </div>
            <div className={css.cover}>{/* poster={props.poster} show={playing} style={{ "background-image": `url(${props.poster || ""})`}} */}
                {loading && <Loader />}
            </div>
            <div className={`${css.cover} ${css.logs}`}>
                {true && <div className={css.logger}>
                
                </div>}
            </div>
            <div className={`${css.controls} ${activated ? css.visible : ''}}`}>
                <div className={css.c_row}>
                    <div className={css.seeker} ref={seeker}>
                        <input
                            type="range"
                            ref={range}
                            step={0.01}
                            min={0}
                            max={100}
                            defaultValue={progress}
                            className={css.range}
                            onMouseDown={videoActionRangeStart}
                            onInput={videoActionRange}
                        />
                    </div>
                </div>
                <div className={css.c_row}>
                    <div className={css.panel}>
                        <button className={css.control} type='button' onClick={videoActionResume}>
                            {!playing && getButton('play')}
                            {playing && getButton('pause')}
                        </button>
                        <button className={css.control} type='button' onClick={videoActionMute}>
                            {muted && getButton('volume-mute')}
                            {!muted && getButton('volume-' + volume)}
                        </button>
                        <div className={css.volumearea}>
                            <input
                                type="range"
                                ref={volrange}
                                step={0.1}
                                min={0}
                                max={1}
                                defaultValue={volume}
                                className={css.range}
                                onInput={videoActionVolume}
                            />
                        </div>
                        <div className={css.c_time}>{parseTime(currentTime)} / {parseTime(duration)}</div>
                    </div>
                    <div className={css.panel}>
                        <button className={css.control} type='button' onClick={videoActionFullscreen}>
                            {fullscreen && getButton('fullscreenexit')}
                            {!fullscreen && getButton('fullscreenenter')}
                        </button>
                    </div>
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
            width="5em"
            height="5em"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
        >
            <circle
                cx="50"
                cy="50"
                r="40"
                stroke="transparent"
                strokeWidth=""
                fill="none"
            ></circle>
            <circle
                cx="50"
                cy="50"
                r="40"
                stroke={"#fff"}
                strokeWidth={".5em"}
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




function getButton(type) {
    // play
    // pause
    // replay
    // fullscreen
    // exit fullscreen
    // settings

    switch(type) {
        case 'play': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M176 480C148.6 480 128 457.6 128 432v-352c0-25.38 20.4-47.98 48.01-47.98c8.686 0 17.35 2.352 25.02 7.031l288 176C503.3 223.8 512 239.3 512 256s-8.703 32.23-22.97 40.95l-288 176C193.4 477.6 184.7 480 176 480z"></path></svg>);
        case 'pause': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M272 63.1l-32 0c-26.51 0-48 21.49-48 47.1v288c0 26.51 21.49 48 48 48L272 448c26.51 0 48-21.49 48-48v-288C320 85.49 298.5 63.1 272 63.1zM80 63.1l-32 0c-26.51 0-48 21.49-48 48v288C0 426.5 21.49 448 48 448l32 0c26.51 0 48-21.49 48-48v-288C128 85.49 106.5 63.1 80 63.1z"></path></svg>);
        case 'fullscreenenter': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M128 32H32C14.31 32 0 46.31 0 64v96c0 17.69 14.31 32 32 32s32-14.31 32-32V96h64c17.69 0 32-14.31 32-32S145.7 32 128 32zM416 32h-96c-17.69 0-32 14.31-32 32s14.31 32 32 32h64v64c0 17.69 14.31 32 32 32s32-14.31 32-32V64C448 46.31 433.7 32 416 32zM128 416H64v-64c0-17.69-14.31-32-32-32s-32 14.31-32 32v96c0 17.69 14.31 32 32 32h96c17.69 0 32-14.31 32-32S145.7 416 128 416zM416 320c-17.69 0-32 14.31-32 32v64h-64c-17.69 0-32 14.31-32 32s14.31 32 32 32h96c17.69 0 32-14.31 32-32v-96C448 334.3 433.7 320 416 320z"></path></svg>);
        case 'fullscreenexit': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M128 320H32c-17.69 0-32 14.31-32 32s14.31 32 32 32h64v64c0 17.69 14.31 32 32 32s32-14.31 32-32v-96C160 334.3 145.7 320 128 320zM416 320h-96c-17.69 0-32 14.31-32 32v96c0 17.69 14.31 32 32 32s32-14.31 32-32v-64h64c17.69 0 32-14.31 32-32S433.7 320 416 320zM320 192h96c17.69 0 32-14.31 32-32s-14.31-32-32-32h-64V64c0-17.69-14.31-32-32-32s-32 14.31-32 32v96C288 177.7 302.3 192 320 192zM128 32C110.3 32 96 46.31 96 64v64H32C14.31 128 0 142.3 0 160s14.31 32 32 32h96c17.69 0 32-14.31 32-32V64C160 46.31 145.7 32 128 32z"></path></svg>);
        case 'volume-0': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M301.2 34.85c-11.5-5.188-25.02-3.122-34.44 5.253L131.8 160H48c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9c5.984 5.312 13.58 8.094 21.26 8.094c4.438 0 8.972-.9375 13.17-2.844c11.5-5.156 18.82-16.56 18.82-29.16V64C319.1 51.41 312.7 40 301.2 34.85zM513.9 255.1l47.03-47.03c9.375-9.375 9.375-24.56 0-33.94s-24.56-9.375-33.94 0L480 222.1L432.1 175c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94l47.03 47.03l-47.03 47.03c-9.375 9.375-9.375 24.56 0 33.94c9.373 9.373 24.56 9.381 33.94 0L480 289.9l47.03 47.03c9.373 9.373 24.56 9.381 33.94 0c9.375-9.375 9.375-24.56 0-33.94L513.9 255.1z"></path></svg>);
        case 'volume-0.1': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M320 64v383.1c0 12.59-7.337 24.01-18.84 29.16C296.1 479.1 292.4 480 288 480c-7.688 0-15.28-2.781-21.27-8.094l-134.9-119.9H48c-26.51 0-48-21.49-48-47.1V208c0-26.51 21.49-47.1 48-47.1h83.84l134.9-119.9c9.422-8.375 22.93-10.45 34.43-5.259C312.7 39.1 320 51.41 320 64z"></path></svg>);
        case 'volume-0.2': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M412.6 181.9c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.37 3.375 33.78C393.5 228.4 400 241.8 400 256c0 14.19-6.5 27.62-17.81 36.87c-10.28 8.406-11.78 23.53-3.375 33.78c4.719 5.812 11.62 8.812 18.56 8.812c5.344 0 10.75-1.781 15.19-5.406C435.1 311.6 448 284.7 448 256S435.1 200.4 412.6 181.9zM301.2 34.84c-11.5-5.187-25.01-3.116-34.43 5.259L131.8 160H48c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C272.7 477.2 280.3 480 288 480c4.438 0 8.959-.9313 13.16-2.837C312.7 472 320 460.6 320 448V64C320 51.41 312.7 39.1 301.2 34.84z"></path></svg>);
        case 'volume-0.3': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M412.6 181.9c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.37 3.375 33.78C393.5 228.4 400 241.8 400 256c0 14.19-6.5 27.62-17.81 36.87c-10.28 8.406-11.78 23.53-3.375 33.78c4.719 5.812 11.62 8.812 18.56 8.812c5.344 0 10.75-1.781 15.19-5.406C435.1 311.6 448 284.7 448 256S435.1 200.4 412.6 181.9zM301.2 34.84c-11.5-5.187-25.01-3.116-34.43 5.259L131.8 160H48c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C272.7 477.2 280.3 480 288 480c4.438 0 8.959-.9313 13.16-2.837C312.7 472 320 460.6 320 448V64C320 51.41 312.7 39.1 301.2 34.84z"></path></svg>);
        case 'volume-0.4': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M412.6 181.9c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.37 3.375 33.78C393.5 228.4 400 241.8 400 256c0 14.19-6.5 27.62-17.81 36.87c-10.28 8.406-11.78 23.53-3.375 33.78c4.719 5.812 11.62 8.812 18.56 8.812c5.344 0 10.75-1.781 15.19-5.406C435.1 311.6 448 284.7 448 256S435.1 200.4 412.6 181.9zM301.2 34.84c-11.5-5.187-25.01-3.116-34.43 5.259L131.8 160H48c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C272.7 477.2 280.3 480 288 480c4.438 0 8.959-.9313 13.16-2.837C312.7 472 320 460.6 320 448V64C320 51.41 312.7 39.1 301.2 34.84z"></path></svg>);
        case 'volume-0.5': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M444.6 181.9c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.37 3.375 33.78C425.5 228.4 432 241.8 432 256c0 14.19-6.5 27.62-17.81 36.87c-10.28 8.406-11.78 23.53-3.375 33.78c4.719 5.812 11.62 8.812 18.56 8.812c5.344 0 10.75-1.781 15.19-5.406C467.1 311.6 480 284.7 480 256S467.1 200.4 444.6 181.9zM505.1 108c-10.22-8.344-25.34-6.906-33.78 3.344c-8.406 10.25-6.906 25.37 3.344 33.78C508.6 172.9 528 213.3 528 256s-19.44 83.09-53.31 110.9c-10.25 8.406-11.75 23.53-3.344 33.78c4.75 5.781 11.62 8.781 18.56 8.781c5.375 0 10.75-1.781 15.22-5.437C550.2 367.1 576 313.1 576 256S550.2 144.9 505.1 108zM333.2 34.84c-11.5-5.187-25.01-3.116-34.43 5.259L163.8 160H80c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C304.7 477.2 312.3 480 320 480c4.438 0 8.959-.9313 13.16-2.837C344.7 472 352 460.6 352 448V64C352 51.41 344.7 39.1 333.2 34.84z"></path></svg>);
        case 'volume-0.6': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M444.6 181.9c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.37 3.375 33.78C425.5 228.4 432 241.8 432 256c0 14.19-6.5 27.62-17.81 36.87c-10.28 8.406-11.78 23.53-3.375 33.78c4.719 5.812 11.62 8.812 18.56 8.812c5.344 0 10.75-1.781 15.19-5.406C467.1 311.6 480 284.7 480 256S467.1 200.4 444.6 181.9zM505.1 108c-10.22-8.344-25.34-6.906-33.78 3.344c-8.406 10.25-6.906 25.37 3.344 33.78C508.6 172.9 528 213.3 528 256s-19.44 83.09-53.31 110.9c-10.25 8.406-11.75 23.53-3.344 33.78c4.75 5.781 11.62 8.781 18.56 8.781c5.375 0 10.75-1.781 15.22-5.437C550.2 367.1 576 313.1 576 256S550.2 144.9 505.1 108zM333.2 34.84c-11.5-5.187-25.01-3.116-34.43 5.259L163.8 160H80c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C304.7 477.2 312.3 480 320 480c4.438 0 8.959-.9313 13.16-2.837C344.7 472 352 460.6 352 448V64C352 51.41 344.7 39.1 333.2 34.84z"></path></svg>);
        case 'volume-0.7': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M444.6 181.9c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.37 3.375 33.78C425.5 228.4 432 241.8 432 256c0 14.19-6.5 27.62-17.81 36.87c-10.28 8.406-11.78 23.53-3.375 33.78c4.719 5.812 11.62 8.812 18.56 8.812c5.344 0 10.75-1.781 15.19-5.406C467.1 311.6 480 284.7 480 256S467.1 200.4 444.6 181.9zM505.1 108c-10.22-8.344-25.34-6.906-33.78 3.344c-8.406 10.25-6.906 25.37 3.344 33.78C508.6 172.9 528 213.3 528 256s-19.44 83.09-53.31 110.9c-10.25 8.406-11.75 23.53-3.344 33.78c4.75 5.781 11.62 8.781 18.56 8.781c5.375 0 10.75-1.781 15.22-5.437C550.2 367.1 576 313.1 576 256S550.2 144.9 505.1 108zM333.2 34.84c-11.5-5.187-25.01-3.116-34.43 5.259L163.8 160H80c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C304.7 477.2 312.3 480 320 480c4.438 0 8.959-.9313 13.16-2.837C344.7 472 352 460.6 352 448V64C352 51.41 344.7 39.1 333.2 34.84z"></path></svg>);
        case 'volume-0.8': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M412.6 182c-10.28-8.334-25.41-6.867-33.75 3.402c-8.406 10.24-6.906 25.35 3.375 33.74C393.5 228.4 400 241.8 400 255.1c0 14.17-6.5 27.59-17.81 36.83c-10.28 8.396-11.78 23.5-3.375 33.74c4.719 5.806 11.62 8.802 18.56 8.802c5.344 0 10.75-1.779 15.19-5.399C435.1 311.5 448 284.6 448 255.1S435.1 200.4 412.6 182zM473.1 108.2c-10.22-8.334-25.34-6.898-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C476.6 172.1 496 213.3 496 255.1s-19.44 82.1-53.31 110.7c-10.25 8.396-11.75 23.5-3.344 33.74c4.75 5.775 11.62 8.771 18.56 8.771c5.375 0 10.75-1.779 15.22-5.431C518.2 366.9 544 313 544 255.1S518.2 145 473.1 108.2zM534.4 33.4c-10.22-8.334-25.34-6.867-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C559.9 116.3 592 183.9 592 255.1s-32.09 139.7-88.06 185.5c-10.25 8.396-11.75 23.5-3.344 33.74C505.3 481 512.2 484 519.2 484c5.375 0 10.75-1.779 15.22-5.431C601.5 423.6 640 342.5 640 255.1S601.5 88.34 534.4 33.4zM301.2 34.98c-11.5-5.181-25.01-3.076-34.43 5.29L131.8 160.1H48c-26.51 0-48 21.48-48 47.96v95.92c0 26.48 21.49 47.96 48 47.96h83.84l134.9 119.8C272.7 477 280.3 479.8 288 479.8c4.438 0 8.959-.9314 13.16-2.835C312.7 471.8 320 460.4 320 447.9V64.12C320 51.55 312.7 40.13 301.2 34.98z"></path></svg>);
        case 'volume-0.9': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M412.6 182c-10.28-8.334-25.41-6.867-33.75 3.402c-8.406 10.24-6.906 25.35 3.375 33.74C393.5 228.4 400 241.8 400 255.1c0 14.17-6.5 27.59-17.81 36.83c-10.28 8.396-11.78 23.5-3.375 33.74c4.719 5.806 11.62 8.802 18.56 8.802c5.344 0 10.75-1.779 15.19-5.399C435.1 311.5 448 284.6 448 255.1S435.1 200.4 412.6 182zM473.1 108.2c-10.22-8.334-25.34-6.898-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C476.6 172.1 496 213.3 496 255.1s-19.44 82.1-53.31 110.7c-10.25 8.396-11.75 23.5-3.344 33.74c4.75 5.775 11.62 8.771 18.56 8.771c5.375 0 10.75-1.779 15.22-5.431C518.2 366.9 544 313 544 255.1S518.2 145 473.1 108.2zM534.4 33.4c-10.22-8.334-25.34-6.867-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C559.9 116.3 592 183.9 592 255.1s-32.09 139.7-88.06 185.5c-10.25 8.396-11.75 23.5-3.344 33.74C505.3 481 512.2 484 519.2 484c5.375 0 10.75-1.779 15.22-5.431C601.5 423.6 640 342.5 640 255.1S601.5 88.34 534.4 33.4zM301.2 34.98c-11.5-5.181-25.01-3.076-34.43 5.29L131.8 160.1H48c-26.51 0-48 21.48-48 47.96v95.92c0 26.48 21.49 47.96 48 47.96h83.84l134.9 119.8C272.7 477 280.3 479.8 288 479.8c4.438 0 8.959-.9314 13.16-2.835C312.7 471.8 320 460.4 320 447.9V64.12C320 51.55 312.7 40.13 301.2 34.98z"></path></svg>);
        case 'volume-1': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M412.6 182c-10.28-8.334-25.41-6.867-33.75 3.402c-8.406 10.24-6.906 25.35 3.375 33.74C393.5 228.4 400 241.8 400 255.1c0 14.17-6.5 27.59-17.81 36.83c-10.28 8.396-11.78 23.5-3.375 33.74c4.719 5.806 11.62 8.802 18.56 8.802c5.344 0 10.75-1.779 15.19-5.399C435.1 311.5 448 284.6 448 255.1S435.1 200.4 412.6 182zM473.1 108.2c-10.22-8.334-25.34-6.898-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C476.6 172.1 496 213.3 496 255.1s-19.44 82.1-53.31 110.7c-10.25 8.396-11.75 23.5-3.344 33.74c4.75 5.775 11.62 8.771 18.56 8.771c5.375 0 10.75-1.779 15.22-5.431C518.2 366.9 544 313 544 255.1S518.2 145 473.1 108.2zM534.4 33.4c-10.22-8.334-25.34-6.867-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C559.9 116.3 592 183.9 592 255.1s-32.09 139.7-88.06 185.5c-10.25 8.396-11.75 23.5-3.344 33.74C505.3 481 512.2 484 519.2 484c5.375 0 10.75-1.779 15.22-5.431C601.5 423.6 640 342.5 640 255.1S601.5 88.34 534.4 33.4zM301.2 34.98c-11.5-5.181-25.01-3.076-34.43 5.29L131.8 160.1H48c-26.51 0-48 21.48-48 47.96v95.92c0 26.48 21.49 47.96 48 47.96h83.84l134.9 119.8C272.7 477 280.3 479.8 288 479.8c4.438 0 8.959-.9314 13.16-2.835C312.7 471.8 320 460.4 320 447.9V64.12C320 51.55 312.7 40.13 301.2 34.98z"></path></svg>);
        case 'volume-mute': return (<svg className={css.svgbutton} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M630.8 469.1l-88.78-69.59C583.9 362.8 608 310.9 608 256c0-57.12-25.84-111.1-70.88-147.1c-10.22-8.344-25.34-6.906-33.78 3.344c-8.406 10.25-6.906 25.38 3.344 33.78C540.6 172.9 560 213.3 560 256c0 42.69-19.44 83.09-53.31 110.9c-1.045 .8574-1.599 2.029-2.46 3.013l-44.33-34.74c.5039 .0313 .9713 .3249 1.477 .3249c5.344 0 10.75-1.781 15.19-5.406C499.1 311.6 512 284.7 512 256c0-28.65-12.91-55.62-35.44-74.06c-10.28-8.344-25.41-6.875-33.75 3.406c-8.406 10.25-6.906 25.38 3.375 33.78C457.5 228.4 464 241.8 464 256s-6.5 27.62-17.81 36.88c-7.719 6.311-10.48 16.41-7.824 25.39L384 275.7V64c0-12.59-7.337-24.01-18.84-29.16c-11.5-5.188-25.01-3.116-34.43 5.259L214.9 143.1L38.81 5.111C34.41 1.673 29.19 0 24.03 0C16.91 0 9.839 3.158 5.12 9.189c-8.188 10.44-6.37 25.53 4.068 33.7l591.1 463.1c10.5 8.203 25.57 6.328 33.69-4.078C643.1 492.4 641.2 477.3 630.8 469.1zM64 208V304c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9C336.7 477.2 344.3 480 352 480c4.438 0 8.959-.9312 13.16-2.837C376.7 472 384 460.6 384 448v-50.34L88.75 166.3C74.05 174.5 64 189.1 64 208z"></path></svg>);
        default: return (<></>);
    }
};