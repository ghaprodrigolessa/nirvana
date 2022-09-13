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
    settransportes, transportes,
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
      // ok.
    });
  }

  // carregar lista de transportes.
  const loadTransportes = (codigo) => {
    axios.get(html + 'list_transportes').then((response) => {
      var x = [0, 1];
      var y = [0, 1];
      x = response.data.rows;
      if (x.length > 0) {
        y = x.filter(item => item.id_ambulancia == codigo);
        settransportes(y);
      }
    })
  }

  // atualizar registro de transportes.
  const updateTransporte = (parametro, status, justificativa) => {
    var objeto = {
      aih: parametro.aih,
      protocolo: parametro.protocolo,
      id_ambulancia: parametro.id_ambulancia,
      finalidade: parametro.finalidade,
      data_pedido: parametro.data_pedido,
      unidade_destino: parametro.unidade_destino,
      setor_destino: parametro.setor_destino,
      status: status,
      justificativa_recusa: justificativa,
    }
    console.log(objeto);

    axios.post(html + 'update_transporte/' + parametro.id, objeto).then(() => {
      toast(settoast, parametro.status, 'rgb(82, 190, 128, 1', 3000);
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
  const updateAmbulancia = (codigo, status) => {
    if (ambulancias.filter(item => item.codigo == codigo).length > 0) {
      let idambulancia = ambulancias.filter(item => item.codigo == codigo).map(item => item.id).pop();
      let statusambulancia = ambulancias.filter(item => item.codigo == codigo).map(item => item.status).pop();
      var obj = {
        codigo: codigo,
        motorista: usuario.nome,
        status: status,
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
              updateAmbulancia(e.target.value, ambulancias.filter(item => item.codigo == codigo).map(item => item.status).pop());
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
    if (transportes.length > 0) {
      return (
        <div className='scroll'
          style={{
            width: '85vw', flexDirection: 'row', justifyContent: 'flex-start',
            padding: 10, margin: 10, overflowX: 'auto', overflowY: 'hidden',
          }}>
          {transportes.map(item => (
            <div
              key={'empenho' + item.id}
              className={item.status == 'EM TRANSPORTE' ? 'card destaque' : 'card'}
              style={{
                display: viewcomponentes == 2 ? 'flex' : 'none',
                justifyContent: 'space-between',
                padding: 10,
                margin: 10,
                backgroundColor: item.status == 'TRANSPORTE CONCLUÍDO' ? 'rgb(82, 190, 128, 1)' : item.status == 'TRANSPORTE CANCELADO' ? 'rgb(231, 76, 60, 1)' : '',
                opacity: item.status == 'TRANSPORTE CONCLUÍDO' || item.status == 'TRANSPORTE CANCELADO' ? 0.3 : 1,
              }}>
              <div className='text1' style={{ color: '#ffffff', fontSize: 14, margin: 0 }}>
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
                <div>
                  {pacientes.filter(valor => valor.aih == item.aih).map(item => '## DADOS VITAIS ##\n PA: ' + item.pas + 'x' + item.pad + 'mmHg\n FC: ' + item.fc + 'bpm FR: ' + item.fr + 'irpm SAO2: ' + item.sao2 + '%')}
                </div>
                <div>
                  {pacientes.filter(valor => valor.aih == item.aih).map(item => '## RESUMO DO CASO ##\n' + item.dados_susfacil)}
                </div>
              </div>
              <div id="botões de ação"
                style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <div id="iniciar" className='button-green'
                  style={{
                    display: 'flex',
                    width: 50, height: 50,
                    opacity: item.status == 'TRANSPORTE LIBERADO' ? 1 : 0.5,
                    pointerEvents: item.status == 'TRANSPORTE LIBERADO' ? 'auto' : 'none',
                  }}
                  // atualizar registros de paciente, transporte e ambulância com o status "EM TRANSPORTE".
                  onClick={() => {
                    updatePaciente(pacientes.filter(valor => valor.aih == item.aih).pop(), 'EM TRANSPORTE');
                    updateTransporte(item, 'EM TRANSPORTE', null);
                    updateAmbulancia(codigo, 'EM TRANSPORTE');
                  }}
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
                  style={{
                    display: 'flex',
                    width: 50, height: 50,
                    opacity: item.status == 'TRANSPORTE LIBERADO' || item.status == 'EM TRANSPORTE' ? 1 : 0.5,
                    pointerEvents: item.status == 'TRANSPORTE LIBERADO' || item.status == 'EM TRANSPORTE' ? 'auto' : 'none',
                  }}
                  onClick={() => {
                    updatePaciente(pacientes.filter(valor => valor.aih == item.aih).pop(), 'TRANSPORTE CANCELADO');
                    updateTransporte(item, 'TRANSPORTE CANCELADO', null);
                    updateAmbulancia(codigo, 'TRANSPORTE CANCELADO');
                  }}
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
                  style={{
                    display: 'flex',
                    width: 50, height: 50,
                    opacity: item.status == 'EM TRANSPORTE' ? 1 : 0.5,
                    pointerEvents: item.status == 'EM TRANSPORTE' ? 'auto' : 'none',
                  }}
                  onClick={() => {
                    updatePaciente(pacientes.filter(valor => valor.aih == item.aih).pop(), 'TRANSPORTE CONCLUÍDO');
                    updateTransporte(item, 'TRANSPORTE CONCLUÍDO', null);
                    updateAmbulancia(codigo, 'TRANSPORTE CONCLUÍDO');
                  }}
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