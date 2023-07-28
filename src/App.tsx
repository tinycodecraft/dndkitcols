import React from "react";
// import logo from "./logo.svg";
import "./App.css";
import { rectSortingStrategy } from "@dnd-kit/sortable";
// import { MultipleContainers } from "./containers/Sortable/MultipleContainers";
import SortableCollector from "./containers/SortableCollector";
import { ContainerArrayProvider } from "./tx/ContainerArrayContext";
import { createRange } from "./methods";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
      <ContainerArrayProvider bags={{ A: createRange(5, (index) => `A${index + 1}`) }} itemCount={5}>
        <SortableCollector strategy={rectSortingStrategy} />
      </ContainerArrayProvider>
    </div>
  );
}

export default App;
