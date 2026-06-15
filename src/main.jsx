import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Capacitor} from '@capacitor/core';
import {StatusBar, Style} from '@capacitor/status-bar';
import App from './App.jsx';
import './index.css';

async function initNativeShell() {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await StatusBar.setStyle({style: Style.Light});
        await StatusBar.setBackgroundColor({color: '#2563eb'});
    } catch { /* noop */ }
}

initNativeShell();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App/>
    </StrictMode>
);
