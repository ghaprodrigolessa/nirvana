/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import Context from './Context';
import moment from 'moment';
// funções.
import toast from '../functions/toast';
import modal from '../functions/modal';
// imagens.
import power from '../images/power.svg';
import deletar from '../images/deletar.svg';

function Motorista() {

  // context.
  const {
    usuario,
    pagina, setpagina,
    pacientes, setpacientes,
    settoast,
    setdialogo,
    settransportes,
  } = useContext(Context);

  var html = 'http://localhost:3333/'

  // carregar lista de pacientes internados.
  const loadPacientes = (codigo) => {
    axios.get(html + 'list_pacientes').then((response) => {
      setpacientes(response.data.rows);
      setTimeout(() => {
        loadTransportes(codigo);
      }, 1000);
    })
  }

  // atualizando o registro do paciente.
  const updatePaciente = (obj, status) => {
    var objeto = {
      aih: obj.aih,
      procedimento: obj.procedimento,
      unidade_origem: obj.unidade_origem,
      setor_origem: obj.setor_origem,
      nome_paciente: obj.nome_paciente,
      nome_mae: obj.nome_mae,
      dn_paciente: obj.dn_paciente,
      status: status,
      unidade_destino: obj.unidade_destino,
      setor_destino: obj.setor_destino,
      indicador_data_cadastro: obj.indicador_data_cadastro,
      indicador_data_confirmacao: obj.indicador_data_confirmacao,
      indicador_relatorio: obj.indicador_relatorio,
      indicador_solicitacao_transporte: obj.indicador_solicitacao_transporte,
      indicador_saida_origem: obj.indicador_saida_origem,
      indicador_chegada_destino: obj.indicador_chegada_destino,
      dados_susfacil: obj.dados_susfacil,
      exames_ok: obj.exames_ok,
      aih_ok: obj.aih_ok,
      glasgow: obj.glasgow,
      pas: obj.pas,
      pad: obj.pad,
      fc: obj.fc,
      fr: obj.fr,
      sao2: obj.sao2,
      ofertao2: obj.ofertao2,
      tipo_leito: obj.tipo_leito,
      contato_nome: obj.contato_nome,
      contato_telefone: obj.contato_telefone,
      leito_destino: obj.leito_destino
    }
    axios.post(html + 'update_paciente/' + obj.id, objeto).then(() => {
      loadPacientes();
    });
  }

  // objetos utilizados para atualizar registros de paciente (mudanças no status do transporte) e de transporte.
  // estados para os registro de paciente e transporte selecionados.
  const [objpaciente, setobjpaciente] = useState({});
  const [objtransporte, setobjtransporte] = useState({});
  const makeObj = (item) => {
    // resgatando registro do paciente associado ao pedido de transporte empenhado.
    pacientes.filter(valor => valor.aih == item.aih && valor.status == 'TRANSPORTE SOLICITADO').map(valor => {
      setobjpaciente({
        id: valor.id,
        aih: valor.aih,
        procedimento: valor.procedimento,
        unidade_origem: valor.unidade_origem,
        setor_origem: valor.setor_origem,
        nome_paciente: valor.nome_paciente,
        nome_mae: valor.nome_mae,
        dn_paciente: valor.dn_paciente,
        status: 'TRANSPORTE LIBERADO',
        unidade_destino: valor.unidade_destino,
        setor_destino: valor.setor_destino,
        indicador_data_cadastro: valor.indicador_data_cadastro,
        indicador_data_confirmacao: valor.indicador_data_confirmacao,
        indicador_relatorio: valor.indicador_relatorio,
        indicador_solicitacao_transporte: valor.indicador_solicitacao_transporte,
        indicador_saida_origem: valor.indicador_saida_origem,
        indicador_chegada_destino: valor.indicador_chegada_destino,
        dados_susfacil: valor.dados_susfacil,
        exames_ok: valor.exames_ok,
        aih_ok: valor.aih_ok,
        glasgow: valor.glasgow,
        pas: valor.pas,
        pad: valor.pad,
        fc: valor.fc,
        fr: valor.fr,
        sao2: valor.sao2,
        ofertao2: valor.ofertao2,
        tipo_leito: valor.tipo_leito,
        contato_nome: valor.contato_nome,
        contato_telefone: valor.contato_telefone,
        leito_destino: valor.leito_destino
      })
      return null;
    });
    // criando o objeto para atualizaçao do registro de transporte.
    setobjtransporte(
      {
        id: item.id,
        aih: item.aih,
        protocolo: item.protocolo,
        id_ambulancia: item.codigo,
        finalidade: item.finalidade,
        data_pedido: item.data_pedido,
        unidade_destino: item.unidade_destino,
        setor_destino: item.setor_destino,
        status: 'TRANSPORTE LIBERADO',
        justificativa_recusa: item.justificativa_recusa
      }
    )
  }

  // carregar lista de transportes.
  const [transporte, settransporte] = useState([]);
  const loadTransportes = (codigo) => {
    axios.get(html + 'list_transportes').then((response) => {
      settransportes(response.data);
      var x = [0, 1];
      var y = [0, 1];
      x = response.data.rows;
      if (x.length > 0) {
        y = x.filter(item => item.id_ambulancia == codigo);
        settransporte(y);
      }
    })
  }

  // atualizar registro de transportes.
  const updateTransporte = (parametro) => {
    var objeto = {
      aih: parametro.obj.aih,
      protocolo: parametro.obj.protocolo,
      id_ambulancia: parametro.obj.id_ambulancia,
      finalidade: parametro.obj.finalidade,
      data_pedido: parametro.obj.data_pedido,
      unidade_destino: parametro.obj.unidade_destino,
      setor_destino: parametro.obj.setor_destino,
      status: parametro.status,
      justificativa_recusa: parametro.justificativa,
    }
    axios.post(html + 'update_transporte/' + parametro.obj.id, objeto).then(() => {
      toast(settoast, parametro.obj.status, 'rgb(82, 190, 128, 1', 3000);
      loadTransportes();
    });
  }

  // carregar frota de ambulâncias.
  const [ambulancias, setambulancias] = useState([]);
  const loadAmbulancias = () => {
    axios.get(html + 'list_ambulancias').then((response) => {
      setambulancias(response.data.rows);
    })
  }

  // atualizar registro de uma ambulância (atribuindo motorista ao veículo).
  const updateAmbulancia = (codigo) => {
    if (ambulancias.filter(item => item.codigo == codigo).length > 0) {
      let idambulancia = ambulancias.filter(item => item.codigo == codigo).map(item => item.id).pop();
      let statusambulancia = ambulancias.filter(item => item.codigo == codigo).map(item => item.status).pop();
      var obj = {
        codigo: codigo,
        motorista: usuario.nome,
        status: statusambulancia,
      }
      // console.log(obj);
      axios.post(html + 'update_ambulancia/' + idambulancia, obj).then(() => {
        toast(settoast, 'VINCULADO À AMBULÂNCIA COM SUCESSO', 'rgb(82, 190, 128, 1', 3000);
        // carrega registros de pacientes e de transportes vinculados ao código da ambulância.
        loadPacientes(codigo);
        // exibe o ticket de transporte.
        setviewcomponentes(2);
      });
    } else {
      toast(settoast, 'AMBULÂNCIA NÃO ENCONTRADA', 'rgb(231, 76, 60, 1)', 3000);
      document.getElementById("inputCodigo").focus();
    }
  }

  // componente para informar o código da ambulância.
  var timeout = null;
  const [viewcomponentes, setviewcomponentes] = useState(1);
  const [codigo, setcodigo] = useState(null);
  function SetCodigo() {
    return (
      <div className='card'
        style={{
          display: viewcomponentes == 1 ? 'flex' : 'none',
          width: '90vw', padding: 10, margin: 5,
          alignItems: 'center', alignContent: 'center', alignSelf: 'center',
        }}>
        <div className='text1'>INFORME O CÓDIGO DA SUA AMBULÂNCIA</div>
        <input
          autoComplete="off"
          placeholder="CÓDIGO"
          className="input"
          id="inputCodigo"
          onFocus={(e) => (e.target.placeholder = '')}
          onBlur={(e) => (e.target.placeholder = 'CÓDIGO')}
          onChange={(e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              setcodigo(e.target.value);
              // atualiza ambulância com nome do motorista logado.
              updateAmbulancia(e.target.value);
            }, 3000);
          }}
          type="number"
          maxLength={5}
          style={{
            marginTop: 10,
            marginBottom: 10,
            width: '80vw',
            height: 50,
          }}
        ></input>
      </div>
    )
  }

  // componente com as informações do transporte.
  function TicketTransporte() {
    if (transporte.length > 0) {
      return (
        <div className='scroll'
          style={{
            width: '85vw', flexDirection: 'row', justifyContent: 'flex-start',
            padding: 10, margin: 10, overflowX: 'auto', overflowY: 'hidden',
          }}>
          {transporte.map(item => (
            <div
              key={'empenho' + item.id}
              className='card'
              style={{
                display: viewcomponentes == 2 ? 'flex' : 'none',
                justifyContent: 'space-between',
                padding: 10,
                margin: 10
              }}>
              <div className='text1' style={{ color: 'rgb(82, 190, 128, 0.7)', fontSize: 14, margin: 0 }}>
                {'PROTOCOLO: ' + item.protocolo}
              </div>
              <div className='text1' style={{ margin: 0 }}>
                {'DESTINO: ' + item.unidade_destino + ' - ' + item.setor_destino}
              </div>
              <div id="identificação do paciente" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1' style={{ margin: 0 }}>
                  {pacientes.filter(valor => valor.aih == item.aih).map(item => item.nome_paciente)}
                </div>
                <div className='text1' style={{ margin: 0 }}>
                  {pacientes.filter(valor => valor.aih == item.aih).map(item => 'DN: ' + moment(item.dn_paciente).format('DD/MM/YYYY'))}
                </div>
                <div className='text1' style={{ margin: 0 }}>
                  {pacientes.filter(valor => valor.aih == item.aih).map(item => 'MÃE: ' + item.nome_mae)}
                </div>
              </div>
              <div id="informações do transporte" className='scroll text1'
                style={{
                  whiteSpace: 'pre-wrap', justifyContent: 'flex-start',
                }}>
                {pacientes.filter(valor => valor.aih == item.aih).map(item => item.dados_susfacil)}
              </div>
              <div id="botões de ação"
                style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <div id="iniciar" className='button-green'
                  style={{ width: 50, height: 50 }}
                  // onClick={() => } // atualizar registros de ambulância, transporte e paciente com o status "EM TRANSPORTE".
                  title="INICIAR TRANSPORTE">
                  <img
                    alt=""
                    src={power}
                    style={{
                      margin: 0,
                      height: 30,
                      width: 30,
                    }}
                  ></img>
                </div>
                <div id="cancelar" className='button-red'
                  style={{ width: 50, height: 50 }}
                  // onClick={() => } // atualizar registros de ambulância, transporte e paciente com o status "TRANSPORTE CANCELADO".
                  title="CANCELAR TRANSPORTE">
                  <img
                    alt=""
                    src={deletar}
                    style={{
                      margin: 0,
                      height: 30,
                      width: 30,
                    }}
                  ></img>
                </div>
                <div id="concluir" className='button-green'
                  style={{ width: 50, height: 50 }}
                  // onClick={() => } // atualizar registros de ambulância, transporte e paciente com o status "TRANSPORTE CONCLUÍDO".
                  title="FINALIZAR TRANSPORTE">
                  ✔
                </div>
              </div>
            </div>
          ))}
        </div >
      )
    } else {
      return (
        <div className='card'
          style={{
            display: viewcomponentes == 2 ? 'flex' : 'none',
            width: '90vw', padding: 10,
            alignItems: 'center', alignContent: 'center', alignSelf: 'center',
          }}>
          <div className='text1'>NENHUM TRANSPORTE LIBERADO PARA ESTA AMBULÂNCIA NO MOMENTO</div>
        </div>
      )
    }
  }

  useEffect(() => {
    if (pagina == 3) {
      loadAmbulancias();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // identificação do usuário.
  function Usuario() {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center'
      }}>
        <div
          className='button-red'
          style={{ width: 50, height: 50 }}
          onClick={() => setpagina(0)}
          title="SAIR">
          <img
            alt=""
            src={power}
            style={{
              margin: 0,
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
        <div className='text1' style={{ margin: 0 }}>{codigo == null ? usuario.nome : usuario.nome + ' - ' + codigo}</div>
      </div>
    )
  }

  return (
    <div className='main' style={{ display: pagina == 3 ? 'flex' : 'none', justifyContent: 'center' }}>
      <Usuario></Usuario>
      <SetCodigo></SetCodigo>
      <TicketTransporte></TicketTransporte>
    </div>
  );
}

export default Motorista;