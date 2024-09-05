import React, {useCallback, useEffect, useState} from 'react'

import BeatVisual from './BeatVisual';

export class Beat{                           
  frequency = 440;
  // duration; //ms, time till next note
  // subDivision;
}

export class Bar{
  timeSigNum = 4;
  timeSigDenom = 4;
  barDuration = 0;
  beatDuration = 0;
  beats = []

  constructor(timeSigNum, timeSigDenom, beats){
    this.timeSigNum = timeSigNum;
    this.timeSigDenom = timeSigDenom;
    
    if (beats.length > timeSigNum){
      throw Error("Too many notes");
    }

    if (beats.length < timeSigNum){
      throw Error("Too few notes");
    }

    this.beats = beats;
  }
}

function constructBar(bpm, timeSigNum, timeSigDenom){
  const quarterNoteDuration = 60000/bpm;
  const totalBarDuration = quarterNoteDuration * timeSigNum; // TODO: does not support non quarter note time signatures i.e 7/8 
  
  const beats = []
  for (let i = 0; i < timeSigNum; i++){
    const newBeat = new Beat();
    beats.push(newBeat)
  }

  const newBar = new Bar(4, 4, beats);
  newBar.totalBarDuration = totalBarDuration;
  newBar.beatDuration = (4/timeSigDenom) * quarterNoteDuration;

  return newBar;
}

const worker = new Worker("./src/worker.js");

export default function Metronome(props) {
    const {audioContext} = props;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBar, setBar] = useState();
    const [bpm, setBPM] = useState(120);
    const [tsNumerator, setTSN] = useState(4);
    const [tsDenominator, setTSD] = useState(4);

    const [beatIndex, setBeatIndex] = useState(0);

    useEffect(() => {
      setBar(constructBar(bpm, tsNumerator, tsDenominator))
      if (isPlaying){
        worker.postMessage({type:"Stop"})
        worker.postMessage({type:"Start", dur:currentBar.beatDuration});
      }
    }, [bpm, tsNumerator, tsDenominator])


    worker.onmessage = (message) => {
      const time = audioContext.currentTime;

      const oscillator = audioContext.createOscillator();
      oscillator.frequency.value = currentBar.beats[beatIndex].frequency;
      const gainNode = audioContext.createGain();

      gainNode.gain.value = 1;
      gainNode.gain.exponentialRampToValueAtTime(1, time + 0.001);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(time);
      oscillator.stop(time + 0.02);

      if (beatIndex == tsNumerator - 1){
        setBeatIndex(0);
        return;
      }
      setBeatIndex(beatIndex + 1);
    }

    // const playBeat = useCallback(
    //   (freq, time) => {
        
    //     const oscillator = audioContext.createOscillator();
    //     oscillator.frequency.value = freq;
    //     const gainNode = audioContext.createGain();

    //     gainNode.gain.value = 1;
    //     gainNode.gain.exponentialRampToValueAtTime(1, time + 0.001);
    //     gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    //     oscillator.connect(gainNode);
    //     gainNode.connect(audioContext.destination);

    //     oscillator.start(time);
    //     oscillator.stop(time + 0.02);

    //     // console.log(freq + " " + time);
    //   }
    // )

    return (
      <div className={'min-h-screen flex flex-col justify-center gap-20 shadow-[0_0_150px_inset_rgba(0,89,255,0.253)]'}>
        <BeatVisual/>
        <div className='flex flex-row gap-20 justify-center items-center'>
          <div className='flex flex-col align-middle text-center'>
            <label className='text-white place-items-center'>{bpm + " BPM"}</label>
            <input type='range' max={500} min={1} value={bpm} onChange={(e) => {setBPM(e.target.value)}}/>
          </div>
          <div className='flex flex-col gap-1 justify-center max-w-25'>
            <select className='rounded-2xl text-white bg-slate-900 text-center appearance-none p-5' value={tsNumerator} onChange={(e) => {setTSN(e.target.value)}}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4} >4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10</option>
              <option value={11}>11</option>
              <option value={12}>12</option>
            </select>
            <hr className='m-1'/>
            <select className='rounded-2xl text-white bg-slate-900 text-center appearance-none p-5' value={tsDenominator} onChange={(e) => {setTSD(e.target.value)}}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
            </select>
          </div>
        </div>
        <div className='flex flex-row justify-center'>
          <button className='text-white rounded p-3 px-4 border-blue-200 border-2'
          onClick={
            () => {
              if (isPlaying){
                setIsPlaying(false);
                worker.postMessage({type:"Stop"})
                return;
              }
            
              setIsPlaying(true)
              if (currentBar == null){
                const newBar = constructBar(120, 4, 4);
                setBar(newBar);
              }

              worker.postMessage({type:"Start", dur:currentBar.beatDuration});
            }
          }>{!isPlaying ? "Play" : "Stop"}
          </button>
        </div>

      </div>
    )
}
