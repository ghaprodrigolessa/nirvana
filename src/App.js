import './App.css';
import Context from './pages/Context';
import Pacientes from './pages/Pacientes';
import './design.css';
import React, { useState } from 'react';


function App() {
  
  // estados do context.
  const [pagina, setpagina] = useState(1);
  const [pacientes, setpacientes] = useState([]);
  
  return (
    <Context.Provider
      value={{
        pagina, setpagina,
        pacientes, setpacientes,
      }}
    >
      <div>
        <Pacientes></Pacientes>
      </div>
    </Context.Provider>
  );
}

export default App;
