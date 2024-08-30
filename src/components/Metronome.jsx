import React, {useCallback} from 'react'

class Beat{                           
  frequency = 440;
  duration; //ms, time till next note
  // subDivision;
}

class Bar{
  timeSigNum = 4;
  timeSigDenom = 4;
  barDuration = 0;
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
    newBeat.duration = (4/timeSigDenom) * quarterNoteDuration;
    beats.push(newBeat)
  }

  const newBar = new Bar(4, 4, beats);
  newBar.totalBarDuration = totalBarDuration;

  return newBar;
}

function playNote(beat){
  const time = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
          const envelope = audioContext.createGain();
  
          oscillator.frequency.value = beat.frequency;
          envelope.gain.value = 1;
          envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
          envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
  
          oscillator.connect(envelope);
          envelope.connect(audioContext.destination);

          oscillator.start(time);
          oscillator.stop(time + 0.02);
          setTimeout(() => {}, beat.duration);
}

export default function Metronome(props) {
    const {audioContext} = props;

    const playNote = useCallback((beat) => {
      const time = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const envelope = audioContext.createGain();

      oscillator.frequency.value = beat.frequency;
      envelope.gain.value = 1;
      envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

      oscillator.connect(envelope);
      envelope.connect(audioContext.destination);
      oscillator.start(time);
      oscillator.stop(time + 0.02);
      setTimeout(() => {console.log(audioContext)}, beat.duration);
    },[])

    const togglePlay = useCallback(
      () => {
        const bar = constructBar(120, 4, 4)
        bar.beats.forEach((beat) => {
          playNote(beat);
        })
      },
      [],
    )


    return (
        <button onClick={togglePlay}>Play</button>
    )
}
