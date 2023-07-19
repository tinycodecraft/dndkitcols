import React from 'react';
import logo from './logo.svg';
import './App.css';
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { MultipleContainers } from "./containers/Sortable/MultipleContainers";



function App() {
  return (
    <div className="App">
      <header className="App-header">
        
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        
      </header>
      <MultipleContainers itemCount={5} strategy={rectSortingStrategy} />
    </div>
  );
}

export default App;
