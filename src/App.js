import './App.css';
import './design.css';
import 'animate.css';
import React, { useState } from 'react';
import Context from './pages/Context';
// páginas.
import Pacientes from './pages/Pacientes';
import TransporteSanitario from './pages/TransporteSanitario';
import Login from './pages/Login';
import Toast from './components/Toast';
import Modal from './components/Modal';

function App() {
  // estados do context.
  const [toast, settoast] = useState({});
  const [dialogo, setdialogo] = useState({ id: 0, mensagem: '', funcao: null });
  const [usuario, setusuario] = useState({});
  const [pagina, setpagina] = useState(0);
  const [pacientes, setpacientes] = useState([]);
  const [transportes, settransportes] = useState([]);

  return (
    <Context.Provider
      value={{
        toast, settoast,
        dialogo, setdialogo,
        usuario, setusuario,
        pagina, setpagina,
        pacientes, setpacientes,
        transportes, settransportes,
      }}
    >
      <div>
        <Login></Login>
        <Pacientes></Pacientes>
        <TransporteSanitario></TransporteSanitario>
        <Toast></Toast>
        <Modal></Modal>
      </div>
    </Context.Provider>
  );
}

export default App;