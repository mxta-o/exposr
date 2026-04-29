/* global React, ReactDOM */

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>exposr</h1>
      <p>Welcome — React served without a bundler</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
