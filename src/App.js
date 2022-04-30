import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';


const useVideoControl = (videoRef, video, setVideo, playlist, counter, setCounter) => {
    const [play, setPlay] = useState(false);
    const [change, setChange] = useState(false);
    const [finish, setFinish] = useState(false);
    const togglePlay = () => {
        play ? setPlay(false) : setPlay(true);
    };


    const changeVideo = (newVideo) => {
        setVideo(newVideo);
        setChange(true);
        setPlay(true);
        
    };

    const playNext = () => {
        setPlay(true);
        setFinish(true);
        if(counter+1<playlist.length)
            changeVideo(playlist[counter + 1]);

    }
    useEffect(() => {
        if (videoRef.current != null) {
            play ? videoRef.current.play() : videoRef.current.pause();
        }
        if (change) {
            videoRef.current.load();
            setChange(false);
            setCounter(playlist.indexOf(video));
        }
        if (finish) {
            setCounter(counter + 1);
            setFinish(false);
        }
    }, [play,change, finish, counter, videoRef]);
    
    return { togglePlay, changeVideo, playNext};

};

const VideControl = ({togglePlay }) => {
    
    
    return (
        <div className="Controls">
            <button onClick={togglePlay}>></button>
            <button>o</button>
            <div>00:00</div>
        </div>)
}



const PlayList = ({ lst, changeVideo}) => {
    return(
        <div>
            <ul class="list-group list-group-flush playlist">
                {lst.map(item =>
                    <li key={item.name} class="list-group-item" >
                        <PlayListItem title={item.metadata.title} thumbnail={item.thumbnails[0].url} item={item} changeVideo={changeVideo}/>
                    </li>)}
            </ul>
        </div>
        )
}

const PlayListItem = ({ title, thumbnail, item, changeVideo}) => {
    return (
        <div class="Item" onClick={() => { changeVideo(item) }}>
            <img class="rounded Item-thumbnail" src={thumbnail} ></img>
            <div class="text-left Item-text">{title}</div> 
        </div>
        )
}

const useVideo = (setVideo) => {

    const [playlist, setPlaylist] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    useEffect(() => {
        const axios = require('axios').default;
        axios.get("https://thingproxy.freeboard.io/fetch/https://ign-apis.herokuapp.com/videos?startIndex=0\u0026count=10")
            .then(res => res.data.data)
            .then(data => {
                setVideo(data[0])
                setPlaylist(data);
                setLoading(false);
                
            })
            .catch(err => setError(err))
    }, []);
    return [playlist, loading, error];
};

const playNext = (counter,setCounter) => {
    setCounter(counter + 1)
    
}

function App() {
    const [video, setVideo] = useState();
    const [playlist, loading, error] = useVideo(setVideo);
    const[counter, setCounter] = useState(0);
    const videoRef = useRef(null);
    const { togglePlay, changeVideo, playNext } = useVideoControl(videoRef, video, setVideo, playlist, counter, setCounter)
    if (error) return <h1>{error}</h1>;
    if (loading) return <h1>Loading the page.</h1>

    return (
        <div className="App .d-flex">
            <div>
                <video ref={videoRef} className="Window" controls onEnded={() => { playNext()}}>
                    {console.log(video)}
                    {
                        video != null? video.assets.map(v => <source key={v.height} src={v.url}/>).reverse(): <div></div>
                    }
                </video>
                <VideControl  togglePlay={togglePlay} />
                <div className="Detail">
                    <h3>{video.metadata.title}</h3>
                    <div>{video.metadata.description}</div>
                </div>
            </div>
            <PlayList lst={playlist} changeVideo={changeVideo} />
        </div>

  );
}

export default App;
