if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/bricks-properties/sw.js', { scope: '/bricks-properties/' })})}