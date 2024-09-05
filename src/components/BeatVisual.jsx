import React from 'react'

export default function BeatVisual(props) {
  const {beats} = props;
  return (
    <div className='text-white min w-px-15 h-px-15 bg-slate-700'>
        <ul>
          {/* {
            beats.forEach((e) => {
              return (
                <li>
                  <div className='max-w-24 bg-white'></div>
                </li>
              )
            })
          } */}
        </ul>
    </div>
  )
}
