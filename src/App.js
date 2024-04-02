import logo from './logo.svg';
import './App.css';
import Home from "./Home";
import { HashRouter, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <HashRouter>
        <div className="mainApp">
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </div>
    </HashRouter>
  );
}

export default App;
