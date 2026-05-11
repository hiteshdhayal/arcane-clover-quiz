import React from 'react';
import { useStore } from '../context/AppContext';

export default function Profile() { 
  const user = useStore(state => state.user);
  return <div className="screen active" style={{padding:24}}><h1>{user.name}</h1><p>{user.gamesPlayed} Games Played</p></div>; 
}
