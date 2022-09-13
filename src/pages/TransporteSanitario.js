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
import ambulancia from '../images/ambulancia.svg';

function TransporteSanitario() {

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
  const loadPacientes = () => {
    axios.get(html + 'list_pacientes').then((response) => {
      setpacientes(response.data.rows);
      setTimeout(() => {
        loadTransportes();
        loadAmbulancias();
        console.log('## INFO ## \nLISTA DE PACIENTES INTERNADOS CARREGADA.\nTOTAL DE PACIENTES INTERNADOS: ' + response.data.rows.length);
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

  /*
  ## STATUS PARA O TRANSPORTE ##
  TRANSPORTE SOLICITADO.
  TRANSPORTE LIBERADO.
  TRANSPORTE COM PACIENTE.
  TRANSPORTE ENCERRADO.
  TRANSPORTE CANCELADO.
  */

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
      console.log('## INFO ## \nFROTA DE AMBULÂNCIAS CARREGADA.');
    })
  }

  // atualizar registro de uma ambulância (status).
  const updateAmbulancia = (item, status) => {
    var obj = {
      codigo: item.codigo,
      motorista: item.motorista,
      status: status,
    }
    axios.post(html + 'update_ambulancia/' + item.id, obj).then(() => {
      loadAmbulancias();
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
        <div className="janela" style={{ position: 'relative', flexDirection: 'row', justifyContent: 'space-evenly', flexWrap: 'wrap', margin: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='scroll' style={{ width: '70vw', height: '70vh', flexDirection: 'row', justifyContent: 'space-evenly', flexWrap: 'wrap' }}>
            {ambulancias.sort((a, b) => moment(a.codigo) < moment(b.codigo) ? 1 : -1).map(item => (
              <div
                key={"ambulancia " + item.id}
                className={item.status == 'EM TRANSPORTE' ? "button-yellow destaque" : item.status == 'INDISPONÍVEL' ? "button-red" : "button"}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  width: '13vw', height: '13vw'
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
                  if (item.status != 'INDISPONÍVEL' || item.status != 'INTERVALO' || item.status != 'DESOCUPADA') {
                    setviewfrota(0);
                    // atualizar o registro do paciente com o status "TRANSPORTE LIBERADO".
                    updatePaciente(objpaciente, 'TRANSPORTE LIBERADO');
                    // atualizar o registro de transporte com o status "TRANSPORTE LIBERADO".
                    objtransporte.id_ambulancia = item.codigo;
                    updateTransporte({ obj: objtransporte, status: 'TRANSPORTE LIBERADO', justificativa: null });
                    // atualizar o status da ambulância com o status "TRANSPORTE".
                    updateAmbulancia(item, 'EM TRANSPORTE');
                  } else {
                    setviewstatusambulancia(1);
                    // toast(settoast, 'AMBULÂNCIA INDISPONÍVEL', 'rgb(231, 76, 60, 1)', 3000);
                  }
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
                <div className="text1" style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 10 }}>{item.codigo}</div>
                <div className="text1" title={"MOTORISTA"} style={{ position: 'absolute', bottom: 5, color: '#ffffff' }}>{item.motorista}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // componente para alterar o status da ambulância ociosa ("INTERVALO", "INDISPONÍVEL").
  let statusambulancia = ['OCIOSA', 'INTERVALO', 'INDISPONÍVEL']
  const [viewstatusambulancia, setviewstatusambulancia] = useState('');
  function ViewStatusAmbulancia() {
    return (
      <div className="fundo"
        style={{ display: viewstatusambulancia == 1 ? 'flex' : 'none' }}
        onClick={() => setviewstatusambulancia(0)}
      >
        <div className="janela" style={{
          position: 'relative',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          margin: 50, alignItems: 'center',
        }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='text1'>{'ALTERAR STATUS DA AMBULÂNCIA'}</div>
          <div className='scroll' style={{ width: '20vw', marginTop: 20 }}>
            {statusambulancia.map(item => (
              <div
                id={'statusambulancia' + item}
                key={'statusambulancia' + item}
                className='button'
                onClick={() => {
                  updateAmbulancia(selectedambulancia, item);
                  setviewstatusambulancia(0);
                  toast(settoast, 'STATUS DA AMBULÂNCIA ATUALIZADO', 'rgb(82, 190, 128, 1', 3000);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // componente que sinaliza a ambulância empenhada para cada registro de transporte.
  function MonstraAmbulancia(item) {
    return (
      <div
        id="mostraambulancia"
        className='button'
        style={{
          position: 'absolute', top: 65, right: -5, zIndex: 20,
          display: 'none', width: '10vw',
          flexDirection: 'column', justifyContent: 'center',
          backgroundColor: 'rgb(97, 99, 110, 1)',
        }}
        onClick={(e) => { document.getElementById("mostraambulancia").style.display = 'none'; e.stopPropagation() }}
      >
        <div className="text2">DADOS DA AMBULÂNCIA</div>
        <div className='text2'>{item.id_ambulancia}</div>
        <div className='text2'>{ambulancias.filter(valor => valor.codigo == item.id_ambulancia).map(item => item.motorista)}</div>
      </div>
    )
  }

  useEffect(() => {
    if (pagina == 2) {
      loadPacientes();
      loadAmbulancias();
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
        <div className="header-scroll" style={{ width: 'calc(100vw - 40px)', maxWidth: 'calc(100vw - 40px)' }}>
          <div className="header-row" style={{ justifyContent: 'space-between' }}>
            <div className="button-transparent" style={{ width: '10vw' }}>
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
              width: '20vw',
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
        </div>
        <div className="scroll"
          style={{
            height: '70vh',
            width: 'calc(100vw - 40px)', maxWidth: 'calc(100vw - 40px)',
            display: arraytransportes.length > 0 ? 'flex' : 'none'
          }}>
          {arraytransportes.sort((a, b) => moment(a.data_pedido) < moment(b.data_pedido) ? 1 : -1).map(item => (
            <div key={'transportes' + item.id}>
              <div
                className="row"
                style={{
                  // classificando registros por cores, conforme o tempo de internação na upa.
                  backgroundColor:
                    item.status == 'TRANSPORTE CANCELADO' ? 'rgb(229, 126, 52, 0.5)' :
                      item.status == 'TRANSPORTE SOLICITADO' || item.status == 'TRANSPORTE LIBERADO' || item.status == 'EM TRANSPORTE' ? 'rgb(229, 126, 52, 0.5' :
                        'rgb(82, 190, 128, 0.5)',
                  borderRadius: 5,
                  justifyContent: 'space-between',
                }}
                onClick={() => {
                  makeObj(item);
                  setTimeout(() => {
                    document.getElementById("controleTransporte" + item.id).classList.toggle("expand");
                    document.getElementById("conteudoTransporte" + item.id).classList.toggle("show");
                  }, 700);
                }}
              >
                <div className="button" style={{ width: '10vw' }}>
                  {pacientes.filter(valor => valor.aih == item.aih).slice(-1).map(valor => valor.unidade_origem)}
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
                    width: '20vw',
                    display: window.innerWidth > 750 ? 'flex' : 'none',
                  }}>
                  {pacientes.filter(valor => valor.aih == item.aih).slice(-1).map(valor => valor.nome_paciente)}
                </div>
                <div className="button" style={{ width: '10vw' }}>
                  {item.unidade_destino}
                </div>
                <div
                  onClick={item.status == 'TRANSPORTE SOLICITADO' ?
                    (e) => { makeObj(item); setviewfrota(1); e.stopPropagation(); } :
                    item.status == 'TRANSPORTE LIBERADO' ? (e) => { document.getElementById("mostraambulancia").style.display = 'flex'; e.stopPropagation(); } :
                      () => null}
                  className={item.status == 'TRANSPORTE SOLICITADO' ? 'button destaque' : 'button'} // requer tomada de ação, por isso o destaque.
                  style={{ width: '10vw', position: 'relative' }}>
                  {item.status}
                  {MonstraAmbulancia(item)}
                </div>
              </div>
              {ControleDoTransporte(item, pacientes.filter(valor => valor.aih == item.aih).pop())}
            </div>
          ))}
        </div>
        <div className="text3" style={{ height: '70vh', display: arraytransportes.length > 0 ? 'none' : 'flex', color: 'rgb(82, 190, 128, 1)' }}>SEM PEDIDOS DE TRANSPORTE</div>
      </div >
    )
    // eslint-disable-next-line
  }, [arraytransportes]);

  function ControleDoTransporte(item, paciente) {
    return (
      <div
        id={"controleTransporte" + item.id}
        className="retract"
        style={{ flexDirection: 'row', justifyContent: 'space-between' }}
      >
        <div id={"conteudoTransporte" + item.id} className="hide" style={{
          justifyContent: 'space-between', width: '100%'
        }}>
          <div id={"DADOS CLÍNICOS" + item.id} className="card"
            style={{
              width: '100%',
              height: 'calc(50vh - 20px)',
              marginRight: item.status == 'EM TRANSPORTE' || item.status == 'TRANSPORTE CANCELADO' ? 0 : 10,
            }}>
            <div className="text2">DADOS CLÍNICOS DO PACIENTE</div>
            <div style={{
              display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
              width: item.status == 'AIH CANCELADA NA ORIGEM' ? 'calc(100vw - 100px)' : '100%'
            }}>
              <div className='text1' style={{ margin: 0 }}>{'GLASGOW: ' + paciente.glasgow}</div>
              <div className='text1' style={{ margin: 0 }}>{'PAS: ' + paciente.pas + ' MMHG'}</div>
              <div className='text1' style={{ margin: 0 }}>{'PAD: ' + paciente.pad + ' MMHG'}</div>
              <div className='text1' style={{ margin: 0 }}>{'FC: ' + paciente.fc + ' BPM'}</div>
              <div className='text1' style={{ margin: 0 }}>{'FR: ' + paciente.fr + ' IRPM'}</div>
              <div className='text1' style={{ margin: 0 }}>{'SAO2: ' + paciente.sao2 + '%'}</div>
              <div className='text1' style={{ margin: 0 }}>{'OFERTA DE O2: ' + paciente.ofertao2}</div>
            </div>
            <div className="scroll text1"
              style={{
                whiteSpace: 'pre-wrap', justifyContent: 'flex-start',
                textAlign: 'center',
                height: 'calc(100% - 30px)', width: 'calc(100% - 30px)',
              }}>
              {paciente.dados_susfacil}
            </div>
          </div>
          {CondutaTransporte(item)}
        </div>
      </div>
    )
  };

  // componente para cancelar ou acionar transporte.
  function CondutaTransporte(item) {
    const [negativas, setnegativas] = useState(0);
    return (
      <div className="card"
        style={{
          display: item.status == 'TRANSPORTE SOLICITADO' ? 'flex' : 'none',
          width: 'calc(100%)', height: 'calc(100% - 20px)',
          flexDirection: 'row', justifyContent: 'center',
          alignContent: 'center', alignSelf: 'center', alignItems: 'center'
        }}>
        <div
          className='button-green'
          style={{ display: item.status != 'TRANSPORTE LIBERADO' && negativas == 0 ? 'flex' : 'none', width: '15vw', height: 50 }}
          onClick={() => setviewfrota(1)}
        >
          ACIONAR TRANSPORTE
        </div>

        <div
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignContent: 'center', alignItems: 'center'
          }}>
          <div
            className='button-red' style={{ width: '15vw', height: 50 }}
            onClick={negativas == 0 ? () => setnegativas(1) : () => setnegativas(0)}
          >
            NEGAR TRANSPORTE
          </div>
          <div id="cancelamento de transporte" style={{ display: negativas == 1 ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'center' }}>
            <div
              className='button' style={{ width: 200 }}
              onClick={() => {
                makeObj(item);
                console.log('ID: ' + item.id);
                console.log(item);
                console.log(pacientes.filter(valor => valor.aih == item.aih).pop());
                modal(setdialogo, item.id, 'CONFIRMAR NEGATIVA DE TRANSPORTE ?', updateTransporte, { obj: item, status: 'TRANSPORTE CANCELADO', justificativa: 'CONDIÇÃO CLÍNICA INCOMPATÍVEL' });
                updatePaciente(pacientes.filter(valor => valor.aih == item.aih).pop(), 'TRANSPORTE CANCELADO');
                setnegativas(0);
              }}
            >
              CONDIÇÃO CLÍNICA INCOMPATÍVEL
            </div>
            <div
              className='button' style={{ width: 200 }}
              onClick={() => {
                modal(setdialogo, item.id, 'CONFIRMAR NEGATIVA DE TRANSPORTE ?', updateTransporte, { obj: item, status: 'TRANSPORTE CANCELADO', justificativa: 'PACIENTE RECUSOU TRANSPORTE' });
                updatePaciente(pacientes.filter(valor => valor.aih == item.aih).pop(), 'TRANSPORTE CANCELADO');
                setnegativas(0);
              }}
            >
              PACIENTE RECUSOU TRANSPORTE
            </div>
          </div >
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: pagina == 2 ? 'flex' : 'none' }}>
      <ListaDeTransportes></ListaDeTransportes>
      <PainelDeAmbulancias></PainelDeAmbulancias>
      <ViewStatusAmbulancia></ViewStatusAmbulancia>
      <Usuario></Usuario>
    </div>
  );
}

export default TransporteSanitario;