import React from 'react'

import { colors } from '../colors';

export default function BeatVisual(props) {
  const {beats, forceUpdate, forceUpdateBool, beatIndex, isPlaying, beatLastInd} = props;

  return (
    <div>
        <ul className='flex flex-row flex-wrap gap-20 justify-center py-10'>
          {
            beats.map((e) => {
              const color = colors.get(e.frequency);
              const offsetBeatIndex = (beatIndex === 0) ? beatLastInd : beatIndex - 1 ;
              return (
                <li key={e.id}>
                  <button className={`h-10 w-10 transition-colors ease-in-out duration-100 ${"border-" + color} border-2 rounded-[9px] ${isPlaying && (e.id === offsetBeatIndex) ? (" bg-" + color) : "bg-black"}`}
                          onClick={() => { 
                            
                            if (e.frequency === 440){
                              beats[e.id].frequency = 800;
                            }
                            else if (e.frequency === 800){
                              beats[e.id].frequency = 1200;
                            }
                            else if (e.frequency === 1200){
                              beats[e.id].frequency = 440;
                            }
                            forceUpdate(!forceUpdateBool);
                          }}></button>
                </li>
              )
            })
          }
        </ul>
    </div>
  )
}
