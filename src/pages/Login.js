/* eslint eqeqeq: "off" */
import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import Context from './Context';
import toast from '../functions/toast';
// imagens.
import pbh from '../images/pbh.svg';

function Login() {

  // context.
  const {
    pagina, setpagina,
    settoast,
    setusuario,
  } = useContext(Context);

  let user = null;
  let password = null;
  useEffect(() => {
    // eslint-disable-next-line
  }, [pagina])

  // checando se o usuário inserido está registrado no sistema.
  var timeout = null;
  var html = 'http://localhost:3333/';
  const checkLogin = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      user = document.getElementById('inputUsuario').value
      password = document.getElementById('inputSenha').value
      var obj = {
        usuario: user,
        senha: password,
      }
      axios.post(html + 'checkusuario', obj).then((response) => {
        var x = [0, 1];
        x = response.data;
        if (x.rows.length == 1) {
          var objeto = x.rows.pop();
          toast(settoast, 'BEM-VINDO, ' + objeto.nome, 'rgb(82, 190, 128, 1)', 3000);
          setusuario(
            {
              id: objeto.id,
              usuario: objeto.usuario,
              nome: objeto.nome,
              unidade: objeto.unidade,
            }
          );
          if (objeto.unidade == 'GESTOR-TS') {
            setpagina(2);
          } else if (objeto.unidade == 'MOTORISTA-TS') {
            setpagina(3);
          } else {
            setpagina(1);
          }
        } else {
          toast(settoast, 'USUÁRIO OU SENHA INCORRETOS', 'rgb(231, 76, 60, 1)', 3000);
        }
      });
    }, 1000);
  }

  return (
    <div className="main cor3 fadein" style={{ display: pagina == 0 ? 'flex' : 'none' }}>
      <div style={{ position: 'absolute', bottom: 10, right: 20, opacity: 0.4 }}>
        <img
          alt=""
          src={pbh}
          style={{
            margin: 10,
            height: 50,
          }}
        ></img>
      </div>
      <div className="text3" style={{ margin: 20, fontSize: 20 }}>NIRVANA</div>
      <input
        autoComplete="off"
        placeholder="USUÁRIO"
        className="input"
        type="text"
        id="inputUsuario"
        onFocus={(e) => (e.target.placeholder = '')}
        onBlur={(e) => (e.target.placeholder = 'USUÁRIO')}
        onChange={(e) => (user = e.target.value)}
        style={{
          marginTop: 10,
          marginBottom: 10,
          width: 200,
          height: 50,
        }}
      ></input>
      <input
        autoComplete="off"
        placeholder="SENHA"
        className="input"
        type="password"
        id="inputSenha"
        onFocus={(e) => (e.target.placeholder = '')}
        onBlur={(e) => (e.target.placeholder = 'SENHA')}
        onChange={(e) => { password = e.target.value; checkLogin() }}
        style={{
          marginTop: 10,
          marginBottom: 10,
          width: 200,
          height: 50,
        }}
      ></input>
    </div>
  );
}

export default Login;