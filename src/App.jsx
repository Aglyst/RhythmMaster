import { useEffect, useState } from 'react'
import Metronome from './components/Metronome'
import bottle from "./assets/sounds/bottle.mp3"

// class AudioPlayer{
//   audioContext;
//   audioElement;
//   loaded = false;

//   constructor(){
//     this.audioElement = new Audio(click);
//     this.firstLoad = this.firstLoad.bind(this);
//   }

//   firstLoad(){
//     if (!this.loaded) {
//       this.audioContext = new AudioContext();
//       const source = this.audioContext.createMediaElementSource(this.audioElement);
//       source.connect(this.audioContext.destination);
//       this.loaded = true;
//     }
//   }

//   togglePlay(){
//     this.firstLoad();
//     if (this.audioElement.paused){
//       this.audioElement.play();
//     }
//     else{
//       this.audioElement.pause();
//     }
//   }
// }

function App() {
  const audioContext = new AudioContext();
  
  // function firstLoad(){
  //   if (!loaded) {
  //     audioContext.resume();
  //     loaded = true;
  //   }
  // }

  return (
    <>
      <Metronome audioContext={audioContext}/>
    </>
  )
}

export default App
