
import './App.css';
import Dashboard from './Dashboard';

function App() {
  return (
    <div className="App">
      <Dashboard wsUrl="ws://localhost:3001" />
    </div>
  );
}

export default App;