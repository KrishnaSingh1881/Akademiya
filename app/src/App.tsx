import React from 'react';
import { useAuth } from './context/AuthContext';
import Desktop from './os/Desktop';
import LockScreen from './os/LockScreen';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? <Desktop /> : <LockScreen />}
    </>
  );
}
