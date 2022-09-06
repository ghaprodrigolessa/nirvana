/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import Context from './Context';
import moment from 'moment';
// imagens.
import power from '../images/power.svg';
import editar from '../images/editar.svg';
import ambulancia from '../images/ambulancia.svg';

function TransporteSanitario() {

  // context.
  const {
    usuario,
    pagina, setpagina,
    pacientes, setpacientes,
    settransportes
  } = useContext(Context);

  var html = 'http://localhost:3333/'

  // carregar lista de pacientes internados.
  const loadPacientes = () => {
    axios.get(html + 'list_pacientes').then((response) => {
      setpacientes(response.data.rows);
      loadTransportes();
      loadAmbulancias();
      console.log('## INFO ## \nLISTA DE PACIENTES INTERNADOS CARREGADA.\nTOTAL DE PACIENTES INTERNADOS: ' + response.data.rows.length);
    })
  }

  // atualizando o registro do paciente.
  const updatePaciente = (obj) => {
    var objeto = {
      aih: obj.aih,
      procedimento: obj.procedimento,
      unidade_origem: obj.unidade_origem,
      setor_origem: obj.setor_origem,
      nome_paciente: obj.nome_paciente,
      nome_mae: obj.nome_mae,
      dn_paciente: obj.dn_paciente,
      status: 'TRANSPORTE LIBERADO',
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

  // estados para os registro de paciente e transporte selecionados.
  const [objpaciente, setobjpaciente] = useState({});
  const [objtransporte, setobjtransporte] = useState({});

  /*
  ## STATUS PARA O TRANSPORTE ##
  TRANSPORTE SOLICITADO.
  TRANSPORTE LIBERADO.
  TRANSPORTE COM PACIENTE.
  TRANSPORTE ENCERRADO.
  TRANSPORTE CANCELADO.
  */

  // objetos utilizado para atualizar registros de paciente (mudanças no status do transporte) e de transporte.
  const makeObj = (item) => {
    // resgatando registro do paciente associado ao pedido de transporte empenhado.
    pacientes.filter(valor => valor.aih == item.aih && valor.status == 'TRANSPORTE SOLICITADO').map(valor => {
      setobjpaciente(
        {
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
        }
      )
      return null;
    });
    // criando o objeto para atualizaçao do registro de transporte.
    setobjtransporte(
      {
        id: item.id,
        aih: item.aih,
        protocolo: item.protocolo,
        id_ambulancia: selectedambulancia.codigo, // preferível usar o código da ambulância.
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
  const [arraytransportes, setarraytransportes] = useState([]);
  const loadTransportes = () => {
    axios.get(html + 'list_transportes').then((response) => {
      settransportes(response.data.rows);
      setarraytransportes(response.data.rows);
      console.log('## INFO ## \nLISTA DE TRANSPORTES CARREGADA.');
      console.log(response.data);
    })
  }

  // atualizar registro de transportes.
  const updateTransporte = (obj) => {
    var objeto = {
      aih: obj.aih,
      protocolo: obj.protocolo,
      id_ambulancia: obj.id_ambulancia,
      finalidade: obj.finalidade,
      data_pedido: obj.data_pedido,
      unidade_destino: obj.unidade_destino,
      setor_destino: obj.setor_destino,
      status: 'TRANSPORTE LIBERADO',
      justificativa_recusa: obj.justificativa,
    }
    axios.post(html + 'update_transporte/' + obj.id, objeto).then(() => {
      console.log('## INFO ## \nREGISTRO DE TRANSPORTE COM SUCESSO');
    });
  }

  // carregar frota de ambulâncias.
  const [ambulancias, setambulancias] = useState([]);
  const loadAmbulancias = () => {
    axios.get(html + 'list_ambulancias').then((response) => {
      setambulancias(response.data.rows);
      console.log('## INFO ## \nFROTA DE AMBULÂNCIAS CARREGADA.');
    })
  }

  // atualizar registro de uma ambulância (status).
  const updateAmbulancia = (item) => {
    var obj = {
      codigo: item.codigo,
      motorista: item.motorista,
      status: 'TRANSPORTE LIBERADO',
    }
    axios.post(html + 'update_ambulancia/' + item.id, obj).then(() => {
      // toast.
    });
  }

  const [viewfrota, setviewfrota] = useState(0);
  const [selectedambulancia, setselectedambulancia] = useState({})
  function PainelDeAmbulancias() {
    return (
      <div className="fundo"
        style={{ display: viewfrota == 1 ? 'flex' : 'none' }}
        onClick={() => setviewfrota(0)}
      >
        <div className="janela" style={{ position: 'relative', flexDirection: 'row', justifyContent: 'space-evenly', flexWrap: 'wrap', margin: 50, width: '70vw', height: '70vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {ambulancias.sort((a, b) => moment(a.codigo) < moment(b.codigo) ? 1 : -1).map(item => (
            <div
              key={"ambulancia " + item.id}
              className={item.status == 'EM TRANSPORTE' ? "button-yellow destaque" : item.status == 'INDISPONÍVEL' ? "button-red" : "button"} title={item.motorista}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                width: '10vw', height: '10vw'
              }}
              onClick={() => {
                // capturando informações da ambulância selecionada para o transporte.
                setselectedambulancia(
                  {
                    id: item.id,
                    codigo: item.codigo,
                    motorista: item.motorista,
                    status: item.status
                  }
                );
                setviewfrota(0);
                // atualizar o registro do paciente com o status "TRANSPORTE LIBERADO".
                updatePaciente(objpaciente);
                // atualizar o registro de transporte com o status "TRANSPORTE LIBERADO".
                updateTransporte(objtransporte);
                // atualizar o status da ambulância com o status "EM TRANSPORTE".
                updateAmbulancia(item);
              }}
            >
              <img
                alt=""
                src={ambulancia}
                style={{
                  margin: 10,
                  padding: 10,
                  height: '100%',
                  width: '100%',
                }}
              ></img>
              <div className="text1" style={{ position: 'absolute', top: 5, color: '#ffffff' }}>{item.status}</div>
              <div className="text1" style={{ position: 'absolute', bottom: 5, color: '#ffffff' }}>{item.codigo}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (pagina == 2) {
      loadPacientes();
    }
    // eslint-disable-next-line
  }, [pagina]);

  // identificação do usuário.
  function Usuario() {
    return (
      <div style={{
        position: 'absolute', top: 10, left: 10,
        display: 'flex', flexDirection: 'row',
      }}>
        <div className='button-red' onClick={() => setpagina(0)} title="SAIR">
          <img
            alt=""
            src={power}
            style={{
              margin: 10,
              height: 30,
              width: 30,
            }}
          ></img>
        </div>
        <div className='text1'>{usuario.nome}</div>
      </div>
    )
  }

  // lista de pacientes internados.
  const ListaDeTransportes = useCallback(() => {
    return (
      <div className='main' style={{ position: 'relative' }}>
        <div className="text3">LISTA DE TRANSPORTES SOLICITADOS</div>
        <div className="header">
          <div className="button-transparent" style={{ width: '10vw', marginLeft: 70 }}>
            UNIDADE DE ORIGEM
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            PROTOCOLO
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            DATA DE SOLICITAÇÃO
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            FINALIDADE
          </div>
          <div className="button-transparent" style={{
            width: window.innerWidth > 1200 ? '20vw' : '10vw',
            display: window.innerWidth > 750 ? 'flex' : 'none',
          }}>
            NOME DO PACIENTE
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            UNIDADE DE DESTINO
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            STATUS
          </div>
        </div>
        <div className="scroll" style={{ height: '70vh', display: arraytransportes.length > 0 ? 'flex' : 'none' }}>
          {arraytransportes.sort((a, b) => moment(a.data_pedido) < moment(b.data_pedido) ? 1 : -1).map(item => (
            <div key={'transportes' + item.id}>
              <div
                className="row"
                onClick={() => {
                  // setpaciente(item);
                }}
              >
                <div className="button-yellow"
                // onClick={() => setvieweditpaciente(2)}
                >
                  <img
                    alt=""
                    src={editar}
                    style={{
                      margin: 10,
                      height: 30,
                      width: 30,
                    }}
                  ></img>
                </div>
                <div className="button" style={{ width: '10vw' }}>
                  {pacientes.filter(valor => valor.aih == item.aih).map(valor => valor.unidade_origem)}
                </div>
                <div className="button" style={{ width: '10vw' }}>
                  {item.protocolo}
                </div>
                <div className="button" style={{ width: '10vw' }}>
                  {moment(item.indicador_data_pedido).format('DD/MM/YY')}
                </div>
                <div className="button" style={{ width: '10vw' }}>
                  {item.finalidade}
                </div>
                <div className="button"
                  style={{
                    width: window.innerWidth > 1200 ? '20vw' : '10vw',
                    display: window.innerWidth > 750 ? 'flex' : 'none',
                  }}>
                  {pacientes.filter(valor => valor.aih == item.aih).map(valor => valor.nome_paciente)}
                </div>
                <div className={item.unidade_destino == null ? "button destaque" : "button-green"} style={{ width: '10vw' }}>
                  {item.unidade_destino}
                </div>
                <div
                  onClick={item.status == 'TRANSPORTE SOLICITADO' ? () => { makeObj(item); setviewfrota(1) } : () => null}
                  className={
                    item.status == 'TRANSPORTE SOLICITADO' ? 'button destaque' : // requer tomada de ação, por isso o destaque.
                      item.status == 'TRANSPORTE LIBERADO' ? 'button-green' :
                        item.status == 'TRANSPORTE FINALIZADO' ? 'button-green' :
                          item.status.includes("CANCELADO") == true ? 'button-red' :
                            'button'}
                  style={{ width: '10vw' }}>
                  {item.status}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text3" style={{ height: '70vh', display: arraytransportes.length > 0 ? 'none' : 'flex', color: 'rgb(82, 190, 128, 1)' }}>SEM PEDIDOS DE TRANSPORTE</div>
      </div >
    )
    // eslint-disable-next-line
  }, [arraytransportes]);

  return (
    <div style={{ display: pagina == 2 ? 'flex' : 'none' }}>
      <ListaDeTransportes></ListaDeTransportes>
      <PainelDeAmbulancias></PainelDeAmbulancias>
      <Usuario></Usuario>
    </div>
  );
}

export default TransporteSanitario;