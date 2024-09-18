import React, {useCallback, useEffect, useRef, useState} from 'react'

import BeatVisual from './BeatVisual';
import {colors} from '../colors';

class Beat{                           
  frequency = 440;
  // duration; //ms, time till next note
  // subDivision;
  id;
}

class Bar{
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
  const beats = []
  for (let i = 0; i < timeSigNum; i++){
    const newBeat = new Beat();
    newBeat.id = i;
    beats.push(newBeat)
  }

  const newBar = new Bar(timeSigNum, timeSigDenom, beats);

  const quarterNoteDuration = 60000/bpm;  // ms
  const beatDuration = (4/timeSigDenom) * quarterNoteDuration;
  const totalBarDuration = beatDuration * timeSigNum;

  newBar.totalBarDuration = totalBarDuration;
  newBar.beatDuration = (4/timeSigDenom) * quarterNoteDuration;

  return newBar;
}

const worker = new Worker("./src/worker.js");

export default function Metronome(props) {
    const {audioContext} = props;

    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBPM] = useState(120);
    const [tsNumerator, setTSN] = useState(4);
    const [tsDenominator, setTSD] = useState(4);

    const [currentBar, setBar] = useState(constructBar(bpm, tsNumerator, tsDenominator));
    const [beatIndex, setBeatIndex] = useState(0);
    const [vCol, setVCol] = useState("black");
    const [forceUpdateBool, forceUpdate] = useState(false);
    
    const tapIntervals = useRef([]);

    useEffect(() => {
      const newBar = constructBar(bpm, tsNumerator, tsDenominator);
      setBar(newBar);
      if (isPlaying){
        worker.postMessage({type:"Stop"});
        worker.postMessage({type:"Start", dur:newBar.beatDuration});
      }

    }, [bpm, tsNumerator, tsDenominator])

    const tapBPM = useCallback(() => {
      if (tapIntervals.current.length === 4){
        tapIntervals.current.shift();
        tapIntervals.current.push(audioContext.currentTime);

        let average = 0;
        for (let i = 0; i < tapIntervals.current.length-2; i++){
          average += tapIntervals.current[i+1]-tapIntervals.current[i];
        }
        average /= 4;   // average is average quarter note duration in seconds
        
        const bpm = 60/average > 400 ? 400 : 60/average;

        setBPM(bpm);    // convert quarter note duration to bpm

        return;
      }

      if (audioContext.currentTime === 0){
        const oscillator = audioContext.createOscillator();     // start time
        oscillator.start();
        oscillator.stop()
      }

      tapIntervals.current.push(audioContext.currentTime);
    })

    worker.onmessage = (message) => {
      const time = audioContext.currentTime;

      setVCol(colors.get(currentBar.beats[beatIndex].frequency));
      setTimeout(() => {
        setVCol("black");
      }, 150);

      const oscillator = audioContext.createOscillator();
      oscillator.frequency.value = currentBar.beats[beatIndex].frequency;
      const gainNode = audioContext.createGain();

      gainNode.gain.value = 1;
      gainNode.gain.exponentialRampToValueAtTime(1, time + 0.001);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(time);
      oscillator.stop(time + 0.03);

      if (beatIndex == tsNumerator - 1){
        setBeatIndex(0);
        return;
      }
      setBeatIndex(beatIndex + 1);
    }

    return (
      <div className={`min-h-screen flex flex-col justify-center gap-20 transition-shadow ease-in-out shadow-[0_0_150px_inset] ${(isPlaying) && ("shadow-" + vCol + "A")}`}>
        <BeatVisual beats={currentBar.beats} forceUpdate={forceUpdate} forceUpdateBool={forceUpdateBool} beatIndex={beatIndex} isPlaying={isPlaying} beatLastInd={tsNumerator - 1}/>
        <div className='flex flex-row gap-20 justify-center items-center'>
          <div className='flex flex-col align-middle text-center place-items-center'>
            <button className='text-white rounded-full border-white border-2 w-1/2 p-2 justify-center' onClick={tapBPM}>Tap</button>
            <br/>
            <label className='text-white py-1'>{bpm.toFixed(0) + " BPM"}</label>
            <input type='range' max={400} min={1} value={bpm} onChange={(e) => {setBPM(e.target.value)}}/>
          </div>
          <div className='flex flex-col gap-1 justify-center max-w-25'>
            <select className='rounded-[10px] text-white bg-slate-900 text-center appearance-none p-5' value={tsNumerator} onChange={(e) => {setTSN(e.target.value)}}>
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
              <option value={13}>13</option>
              <option value={14}>14</option>
              <option value={15}>15</option>
              <option value={16}>16</option>
            </select>
            <hr className='m-1'/>
            <select className='rounded-[10px] text-white bg-slate-900 text-center appearance-none p-5' value={tsDenominator} onChange={(e) => {setTSD(e.target.value)}}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
            </select>
          </div>
        </div>
        <div className='flex flex-row justify-center'>
          <button className='text-white rounded-full p-3 px-4 border-white border-2'
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
              
              setBeatIndex(0);
              worker.postMessage({type:"Start", dur:currentBar.beatDuration});
            }
          }>{!isPlaying ? "Play" : "Stop"}
          </button>
        </div>
      </div>
    )
}
