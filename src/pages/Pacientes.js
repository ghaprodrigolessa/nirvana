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
import salvar from '../images/salvar.svg';
import editar from '../images/editar.svg';
import deletar from '../images/deletar.svg';
import novo from '../images/novo.svg';

function Pacientes() {

  // context.
  const {
    usuario,
    pagina, setpagina,
    pacientes, setpacientes,
    settoast,
    setdialogo,
    transportes, settransportes
  } = useContext(Context);

  var html = 'http://localhost:3333/'
  // carregar lista de pacientes internados.
  const [arraypacientes, setarraypacientes] = useState(pacientes);
  const loadPacientes = () => {
    axios.get(html + 'list_pacientes').then((response) => {
      setpacientes(response.data.rows);
      setarraypacientes(response.data.rows);
      console.log('## INFO ## \nLISTA DE PACIENTES INTERNADOS CARREGADA.\nTOTAL DE PACIENTES INTERNADOS: ' + response.data.rows.length);
    })
  }

  // variáveis do registro de pacientes.
  const [paciente, setpaciente] = useState([]);
  var obj = {}

  // obj utilizado para atualizar registro de paciente na checagem de relatório, exames e assinatura de AIH.
  const makeObj = (item) => {
    obj = {
      aih: item.aih,
      procedimento: item.procedimento,
      unidade_origem: item.unidade_origem,
      setor_origem: item.setor_origem,
      nome_paciente: item.nome_paciente,
      nome_mae: item.nome_mae,
      dn_paciente: item.dn_paciente,
      status: item.status,
      unidade_destino: item.unidade_destino,
      setor_destino: item.setor_destino,
      indicador_data_cadastro: item.indicador_data_cadastro,
      indicador_data_confirmacao: item.indicador_data_confirmacao,
      indicador_relatorio: item.indicador_relatorio,
      indicador_solicitacao_transporte: item.indicador_solicitacao_transporte,
      indicador_saida_origem: item.indicador_saida_origem,
      indicador_chegada_destino: item.indicador_chegada_destino,
      dados_susfacil: item.dados_susfacil,
      exames_ok: item.exames_ok,
      aih_ok: item.aih_ok
    }
  }

  // inserir registro de pacientes.
  const insertPaciente = () => {
    obj.unidade_origem = usuario.unidade;
    obj.status = 'AGUARDANDO VAGA';
    obj.indicador_data_cadastro = moment();
    axios.post(html + 'insert_paciente/', obj).then(() => {
      axios.get(html + 'list_pacientes').then((response) => {
        setpacientes(response.data.rows);
        setarraypacientes(response.data.rows);
        toast(settoast, 'REGISTRO INSERIDO COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      });
    });
  }

  // excluir registro de pacientes.
  const deletePaciente = (id) => {
    axios.get(html + 'delete_paciente/' + id).then(() => {
      setvieweditpaciente(0);
      loadPacientes();
      toast(settoast, 'REGISTRO EXCLUÍDO COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    });
  }

  // atualizar registro de pacientes.
  const updatePaciente = (id, atualiza) => {
    axios.post(html + 'update_paciente/' + id, obj).then(() => {
      // atualização da lista de pacientes após a atualização do registro.
      if (atualiza == 'sim') {
        axios.get(html + 'list_pacientes').then((response) => {
          setpacientes(response.data.rows);
          setarraypacientes(response.data.rows);
          toast(settoast, 'REGISTRO ATUALIZADO COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
        });
      }
    });
  }

  // carregar lista de transportes.
  const loadTransportes = () => {
    axios.get(html + 'list_transportes').then((response) => {
      settransportes(response.data.rows);
    })
  }

  // atualizar registro de transportes.
  const updateTransporte = (aih, justificativa) => {
    var objeto = {};
    transportes.filter(valor => valor.aih == aih && valor.status == 'TRANSPORTE SOLICITADO').map(valor => {
      return (
        objeto = {
          id: valor.id,
          aih: valor.aih,
          protocolo: valor.protocolo,
          id_ambulancia: valor.id_ambulancia,
          finalidade: valor.finalidade,
          data_pedido: valor.data_pedido,
          unidade_destino: valor.unidade_destino,
          setor_destino: valor.setor_destino,
          status: 'TRANSPORTE CANCELADO PELA ORIGEM',
          justificativa_recusa: justificativa,
        }
      )
    });
    console.log('ID DO TRANSPORTE: ' + objeto.id);
    axios.post(html + 'update_transporte/' + objeto.id, objeto).then(() => {
      toast(settoast, 'TRANSPORTE CANCELADO COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    });
  }

  useEffect(() => {
    if (pagina == 1) {
      loadPacientes();
      makeObj(paciente);
      loadTransportes();
    }
    // eslint-disable-next-line
  }, [pagina])

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

  const [filterpaciente, setfilterpaciente] = useState('');
  var searchpaciente = '';
  const filterPaciente = () => {
    clearTimeout(timeout);
    document.getElementById("inputPaciente").focus();
    searchpaciente = document.getElementById("inputPaciente").value.toUpperCase();
    timeout = setTimeout(() => {
      if (searchpaciente == '') {
        setarraypacientes(pacientes);
        document.getElementById("inputPaciente").value = '';
        document.getElementById("inputPaciente").focus();
      } else {
        setfilterpaciente(document.getElementById("inputPaciente").value.toUpperCase());
        setarraypacientes(pacientes.filter(item => item.nome_paciente.toUpperCase().includes(searchpaciente) == true));
        document.getElementById("inputPaciente").value = searchpaciente;
        setTimeout(() => {
          document.getElementById("inputPaciente").focus();
        }, 500);
      }
    }, 1000);
  }

  // filtro de paciente por nome.
  function FilterPaciente() {
    return (
      <input
        className="input"
        autoComplete="off"
        placeholder="BUSCAR PACIENTE..."
        onFocus={(e) => (e.target.placeholder = '')}
        onBlur={(e) => (e.target.placeholder = 'BUSCAR PACIENTE...')}
        onKeyUp={() => filterPaciente()}
        style={{
          width: '15vw',
          margin: 5,
        }}
        type="text"
        id="inputPaciente"
        defaultValue={filterpaciente}
        maxLength={100}
      ></input>
    )
  }

  /*
  ## status para os registros de pacientes internados ##
  AGUARDANDO VAGA
  VAGA LIBERADA
  TRANSPORTE SOLICITADO
  TRANSPORTE LIBERADO
  TRANSPORTE COM PACIENTE
  TRANSPORTE ENCERRADO
  TRANSPORTE CANCELADO
  VAGA CANCELADA NA ORIGEM
  VAGA CANCELADA NO DESTINO
  */

  // lista de pacientes internados.
  const ListaDePacientes = useCallback(() => {
    return (
      <div className='main' style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignContent: 'center',
          position: 'absolute', top: 10, right: 10,
        }}>
          <FilterPaciente></FilterPaciente>
          <div className='button-green'
            title='INSERIR PACIENTE INTERNADO'
            onClick={() => setvieweditpaciente(1)}
          >
            <img
              alt=""
              src={novo}
              style={{
                margin: 10,
                height: 30,
                width: 30,
              }}
            ></img>
          </div>
        </div>
        <div className="text3">LISTA DE PACIENTES INTERNADOS</div>
        <div className="header">
          <div className="button-transparent" style={{ width: '10vw', marginLeft: 70 }}>
            UNIDADE DE ORIGEM
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            AIH
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            DATA DE CADASTRO
          </div>
          <div className="button-transparent" style={{
            width: window.innerWidth > 1200 ? '25vw' : '10vw',
            display: window.innerWidth > 750 ? 'flex' : 'none',
          }}>
            NOME DO PACIENTE
          </div>
          <div className="button-transparent" style={{ width: '15vw' }}>
            STATUS
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            UNIDADE DE DESTINO
          </div>
        </div>
        <div className="scroll" style={{ height: '70vh', display: arraypacientes.length > 0 ? 'flex' : 'none' }}>
          {arraypacientes.sort((a, b) => moment(a.indicador_data_cadastro) < moment(b.indicador_data_cadastro) ? 1 : -1).map(item => (
            <div key={'pacientes' + item.id}>
              <div
                className="row"
                onClick={() => {
                  setpaciente(item);
                  document.getElementById("controle" + item.id).classList.toggle("expand");
                  document.getElementById("conteudo" + item.id).classList.toggle("show");
                }}
              >
                <div className="button-yellow"
                  onClick={() => setvieweditpaciente(2)}
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
                  {item.unidade_origem}
                </div>
                <div className="button" style={{ width: '10vw' }}>
                  {item.aih}
                </div>
                <div className="button" style={{ width: '10vw' }}>
                  {moment(item.indicador_data_cadastro).format('DD/MM/YY')}
                </div>
                <div className="button"
                  style={{
                    width: window.innerWidth > 1200 ? '25vw' : '15vw',
                    display: window.innerWidth > 750 ? 'flex' : 'none',
                  }}>
                  {item.nome_paciente}
                </div>
                <div className={
                  item.status == 'AGUARDANDO VAGA' ? 'button-red' :
                    item.status == 'VAGA LIBERADA' ? 'button destaque' : // requer tomada de ação, por isso o destaque.
                      item.status == 'TRANSPORTE SOLICITADO' ? 'button-green' :
                        item.status == 'TRANSPORTE LIBERADO' ? 'button-green' :
                          item.status == 'TRANSPORTE COM PACIENTE' ? 'button-green' :
                            item.status == 'TRANSPORTE ENCERRADO' ? 'button-green' :
                              item.status == 'TRANSPORTE CANCELADO' ? 'button-red' :
                                item.status == 'VAGA CANCELADA NA ORIGEM' ? 'button-red' :
                                  item.status == 'VAGA CANCELADA NO DESTINO' ? 'button-red' :
                                    'button'}
                  style={{ width: '15vw' }}>
                  {item.status}
                </div>
                <div className={item.unidade_destino == null ? "button destaque" : "button-green"} style={{ width: '10vw' }}
                  onClick={() => setviewdestinoselector(1)}
                >
                  {item.unidade_destino}
                </div>
              </div>
              {ControleDoPaciente(item)}
            </div>
          ))}
        </div>
        <div className="text3" style={{ height: '70vh', display: arraypacientes.length > 0 ? 'none' : 'flex', color: 'rgb(82, 190, 128, 1)' }}>SEM PACIENTES INTERNADOS NA UNIDADE</div>
      </div>
    )
    // eslint-disable-next-line
  }, [arraypacientes]);

  // componente para inserir ou atualizar um registro de paciente.
  const [vieweditpaciente, setvieweditpaciente] = useState(0);
  var timeout = null;
  const EditPaciente = useCallback(() => {
    return (
      <div className="fundo"
        style={{ display: vieweditpaciente > 0 ? 'flex' : 'none' }}
        onClick={() => setvieweditpaciente(0)}
      >
        <div className="janela" style={{ position: 'relative', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', margin: 50, width: '65vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <input
              autoComplete="off"
              placeholder="AIH"
              className="input"
              id="inputAih"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'AIH')}
              onChange={(e) => (obj.aih = e.target.value)}
              defaultValue={paciente.aih}
              type="number"
              maxLength={9}
              style={{
                marginTop: 10,
                marginBottom: 10,
                width: '25vw',
                height: 50,
              }}
            ></input>
            <input
              autoComplete="off"
              placeholder="PROCEDIMENTO"
              className="input"
              id="inputProcedimento"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'PROCEDIMENTO')}
              onChange={(e) => (obj.procedimento = e.target.value)}
              defaultValue={paciente.procedimento}
              type="number"
              maxLength={9}
              style={{
                marginTop: 10,
                marginBottom: 10,
                width: '25vw',
                height: 50,
              }}
            ></input>
            <div style={{ position: 'absolute', top: 25, right: 25, display: 'flex', flexDirection: 'row' }}>
              <div className='button-red'
                title={'EXCLUIR'}
                onClick={
                  (e) => {
                    modal(setdialogo, paciente.id, 'CONFIRMAR EXCLUSÃO DO PACIENTE?', deletePaciente); e.stopPropagation();
                  }}
              >
                <img
                  alt=""
                  src={deletar}
                  style={{
                    margin: 10,
                    height: 30,
                    width: 30,
                  }}
                ></img>
              </div>
              <div className='button-green'
                title={vieweditpaciente == 1 ? 'SALVAR' : 'ATUALIZAR'}
                onClick={vieweditpaciente == 1 ?
                  (e) => {
                    insertPaciente(); setvieweditpaciente(0); e.stopPropagation();
                  } :
                  (e) => {
                    makeObj(paciente);
                    obj.aih = document.getElementById("inputAih").value;
                    obj.procedimento = document.getElementById("inputProcedimento").value;
                    obj.nome_paciente = document.getElementById("inputNome").value.toUpperCase();
                    obj.dn_paciente = moment(document.getElementById("inputDn").value, 'DD/MM/YYYY');
                    obj.nome_mae = document.getElementById("inputNomeMae").value;
                    obj.dados_susfacil = document.getElementById("inputDados").value;
                    updatePaciente(paciente.id, 'sim'); setvieweditpaciente(0); e.stopPropagation();
                  }}
              >
                <img
                  alt=""
                  src={salvar}
                  style={{
                    margin: 10,
                    height: 30,
                    width: 30,
                  }}
                ></img>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <input
              autoComplete="off"
              placeholder="NOME DO PACIENTE"
              className="input"
              id="inputNome"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'NOME DO PACIENTE')}
              onChange={(e) => (obj.nome_paciente = e.target.value)}
              defaultValue={paciente.nome_paciente}
              type="text"
              style={{
                marginTop: 10,
                marginBottom: 10,
                width: '25vw',
                height: 50,
              }}
            ></input>
            <input
              autoComplete="off"
              placeholder="DN"
              title="DDMMYYYY"
              className="input"
              id="inputDn"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'DN')}
              onKeyUp={() => {
                var data = moment(document.getElementById("inputDn").value, 'DD/MM/YYYY');
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                  if (moment(data).format('DD/MM/YYYY') != 'Invalid date') {
                    obj.dn_paciente = data;
                    document.getElementById('inputDn').value = moment(data).format('DD/MM/YYYY');
                  } else {
                    toast(settoast, 'DATA INVÁLIDA', 'rgb(229, 126, 52, 1', 3000);
                    document.getElementById("inputDn").value = '';
                    data = '';
                  }
                }, 3000);
              }}
              defaultValue={moment(paciente.dn_paciente).format('DD/MM/YYYY')}
              type="text"
              maxLength={8}
              style={{
                marginTop: 10,
                marginBottom: 10,
                width: '10vw',
                height: 50,
              }}
            ></input>
            <input
              autoComplete="off"
              placeholder="NOME DA MÃE DO PACIENTE"
              className="input"
              id="inputNomeMae"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'NOME DA MÃE DO PACIENTE')}
              onChange={(e) => (obj.nome_mae = e.target.value)}
              defaultValue={paciente.nome_mae}
              type="text"
              style={{
                marginTop: 10,
                marginBottom: 10,
                width: '25vw',
                height: 50,
              }}
            ></input>
          </div>
          <textarea
            className="textarea"
            placeholder='RESUMO DO CASO E DADOS VITAIS'
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'RESUMO DO CASO E DADOS VITAIS')}
            onKeyUp={(e) => {
              var timeout = null;
              clearTimeout(timeout);
              var dados = e.target.value;
              timeout = setTimeout(() => obj.dados_susfacil = dados, 2000);
              e.stopPropagation()
            }}
            style={{ display: 'flex', flexDirection: 'center', width: 'calc(60vw + 20px)' }}
            id="inputDados"
            title="INFORME AQUI UM BREVE RESUMO DO CASO, DADOS VITAIS E OFERTA DE O2 SUPLEMENTAR."
            defaultValue={paciente.dados_susfacil}
          >
          </textarea>
        </div>
      </div >
    );
  }, [vieweditpaciente]);

  // painel de controle do paciente internado (dados clínicos e regulação de transporte).
  const ControleDoPaciente = (item) => {
    const [relatorio, setrelatorio] = useState(item.indicador_relatorio);
    const [exames, setexames] = useState(item.exames_ok);
    const [aih, setaih] = useState(item.aih_ok);
    const [justificativa, setjustificativa] = useState(0);
    return (
      <div
        id={"controle" + item.id}
        className="retract"
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
      >
        <div id={"conteudo" + item.id} className="hide" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div id={"DADOS CLÍNICOS" + item.id} className="card" style={{ width: '100%', height: 'calc(50vh - 20px)' }}>
            <div className="text2">DADOS CLÍNICOS DO PACIENTE E DO TRANSPORTE</div>
            <div className="textarea"
              style={{
                whiteSpace: 'pre-wrap', textAlign: 'center', height: '100%'
              }}>
              {item.dados_susfacil}
            </div>
          </div>
          <div id="cancelamento de AIH"
            style={{
              display: item.status == 'AGUARDANDO VAGA' ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'center', width: '100%',
              alignSelf: 'center',
            }}>
            <div className='button-red' style={{ width: 200, minWidth: 200, height: 50 }}
              onClick={justificativa == 1 ? () => setjustificativa(0) : () => setjustificativa(1)}
            >
              CANCELAR AIH
            </div>
            <textarea
              className="textarea"
              placeholder='JUSTIFICATIVA PARA O CANCELAMENTO DA AIH'
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'JUSTIFICATIVA PARA O CANCELAMENTO DA AIH')}
              onKeyUp={(e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                  makeObj(item);
                  obj.status = 'AIH CANCELADA PELA ORIGEM'
                  obj.dados_susfacil = obj.dados_susfacil + '\n### AIH CANCELADA ###\n' + e.target.value;
                  updatePaciente(item.id, 'sim');
                }, 2000);
                e.stopPropagation()
              }}
              style={{
                display: justificativa == 1 ? 'flex' : 'none', flexDirection: 'center',
                width: '100%',
                whiteSpace: 'pre-wrap'
              }}
              id="inputDados"
              title="JUSTIFIQUE AQUI O CANCELAMENTO DA AIH."
            >
            </textarea>
          </div>
          <div id={"CHECAGEM E EMPENHO DE TRANSPORTE" + item.id}
            style={{
              display: item.status == 'VAGA LIBERADA' ? 'flex' : 'none',
              flexDirection: 'column', alignSelf: 'center',
              width: '100%', marginLeft: 10,
            }}>
            <div id="botões de checagem"
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}
              onMouseLeave={() => {
                makeObj(item);
                obj.indicador_relatorio = relatorio;
                obj.exames_ok = exames;
                obj.aih_ok = aih;
                updatePaciente(item.id, 'não');
              }}
            >
              <div id="relatorio" className={relatorio == null ? 'button-red' : 'button-green'}
                style={{ width: '14vw', height: '8vw' }}
                onClick={relatorio == null ? () => setrelatorio(moment()) : () => setrelatorio(null)}
              >
                RELATÓRIO DE TRANSFERÊNCIA
              </div>
              <div id="exames" className={exames == 0 ? 'button-red' : 'button-green'}
                style={{ width: '14vw', height: '8vw' }}
                onClick={exames == 0 ? () => setexames(1) : () => setexames(0)}
              >
                EXAMES LABORATORIAIS
              </div>
              <div id="aih" className={aih == 0 ? 'button-red' : 'button-green'}
                style={{ width: '14vw', height: '8vw' }}
                onClick={aih == 0 ? () => setaih(1) : () => setaih(0)}
              >
                AIH CARIMBADA
              </div>
            </div>
            <div id="empenho de transporte"
              style={{
                display: relatorio != null && exames == 1 && aih == 1 ? 'flex' : 'none',
                flexDirection: 'row', justifyContent: 'center', width: '100%'
              }}>
              <div className='button' style={{ width: '14vw', height: '8vw' }}
                onClick={() => setviewopcoestransportesanitario(1)}
              >
                SOLICITAR TRANSPORTE SANITÁRIO
              </div>
              <div className='button' style={{ width: '14vw', height: '8vw' }}>
                AGENDAR TRANSPORTE SANITÁRIO
              </div>
              <div className='button' style={{ width: '14vw', height: '8vw' }}>
                SOLICITAR SAMU
              </div>
            </div>
          </div>
          <div id={"PROTOCOLO DE TRANSPORTE"}
            className='card'
            style={{
              display: transportes.filter(valor => valor.aih == item.aih && valor.status == 'TRANSPORTE SOLICITADO').length > 0 ? 'flex' : 'none',
              flexDirection: 'column', justifyContent: 'center',
              width: '100%', marginLeft: 10,
              borderRadius: 5,
            }}>
            <div className="text1">{'SOLICITAÇÃO DE TRANSPORTE REALIZADA COM SUCESSO!'}</div>
            <div className="text1" style={{ color: 'rgb(82, 190, 128, 1)' }}>
              {'PROTOCOLO: ' + transportes.filter(valor => valor.aih == item.aih && valor.status == 'TRANSPORTE SOLICITADO').map(valor => valor.protocolo)}
            </div>
            <div className="text1">
              {'DATA E HORA DA SOLICITAÇÃO: ' + transportes.filter(valor => valor.aih == item.aih && valor.status == 'TRANSPORTE SOLICITADO').map(valor => moment(valor.data_pedido).format('DD/MM/YYYY - HH:mm'))}
            </div>
            <div id="cancelamento de empenho"
              style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%',
                alignSelf: 'center',
              }}>
              <div className='button-red' style={{ width: 200, minWidth: 200, height: 50 }}
                onClick={justificativa == 1 ? () => setjustificativa(0) : () => setjustificativa(1)}
              >
                CANCELAR SOLICITAÇÃO DE TRANSPORTE
              </div>
              <textarea
                className="textarea"
                placeholder='JUSTIFICATIVA PARA O CANCELAMENTO DO TRANSPORTE'
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'JUSTIFICATIVA PARA O CANCELAMENTO DO TRANSPORTE')}
                onKeyUp={(e) => {
                  clearTimeout(timeout);
                  timeout = setTimeout(() => {
                    makeObj(item);
                    obj.status = 'TRANSPORTE CANCELADO PELA ORIGEM'
                    updatePaciente(item.id, 'sim');
                    var justificativa = e.target.value;
                    updateTransporte(item.aih, justificativa);
                  }, 2000);
                  e.stopPropagation()
                }}
                style={{
                  display: justificativa == 1 ? 'flex' : 'none', flexDirection: 'center',
                  width: '100%',
                  whiteSpace: 'pre-wrap'
                }}
                id="inputDados"
                title="JUSTIFIQUE AQUI O CANCELAMENTO DO TRANSPORTE."
                defaultValue={transportes.filter(valor => valor.aih == item.aih && valor.status == 'TRANSPORTE CANCELADO PELA ORIGEM').map(valor => valor.justificativa_recusa)}
              >
              </textarea>
            </div>
          </div>
        </div>
      </div >
    )
  };

  // seletor de finalidade do empenho de transporte sanitário.
  let finalidadedeslocamento = [
    {
      id: 1,
      finalidade: 'TRANSFERÊNCIA HOSPITALAR',
      orientacoes: 'SOLICITAR MACA OU CADEIRA DE RODAS PARA A TRANSIÇÃO DE CUIDADOS.'
    },
    {
      id: 2,
      finalidade: 'CONSULTA MÉDICA',
      orientacoes: 'AGUARDAR A CONCLUSÃO DA CONSULTA PARA RETORNO COM O PACIENTE À UNIDADE DE ORIGEM.'
    },
    {
      id: 3,
      finalidade: 'ENCAMINHAMENTO PARA HEMODIÁLISE',
      orientacoes: 'SOLICITAR MACA OU CADEIRA DE RODAS PARA A TRANSIÇÃO DE CUIDADOS.'
    },
  ]
  const [viewopcoestransportesanitario, setviewopcoestransportesanitario] = useState(0);
  function OpcoesTransporteSanitario() {
    return (
      <div className="fundo"
        style={{ display: viewopcoestransportesanitario == 1 ? 'flex' : 'none' }}
        onClick={() => setviewopcoestransportesanitario(0)}
      >
        <div className="janela"
          onClick={(e) => e.stopPropagation()}
        >
          <div className='text1' style={{ width: '20vw' }}>SELECIONE A FINALIDADE DO DESLOCAMENTO</div>
          <div className="scroll" style={{ height: '50vh' }}>
            {finalidadedeslocamento.map(item => (
              <div
                key={'finalidade' + item.id}
                className="button" style={{ width: '20vw' }}
                onClick={() => gerarEmpenhoTransporteSanitario(item.finalidade)}
              >
                {item.finalidade}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // inserindo registro de solicitação de transporte (empenho).
  const gerarEmpenhoTransporteSanitario = (finalidade) => {
    // gerando um registro de solicitação de transporte (empenho).
    var obj1 = {
      aih: paciente.aih,
      protocolo: Math.floor(10000 + Math.random() * 90000),
      id_ambulancia: null,
      justificativa_recusa: null,
      status: 'TRANSPORTE SOLICITADO',
      data_pedido: moment(),
      unidade_destino: paciente.unidade_destino,
      finalidade: finalidade,
      setor_destino: paciente.setor_destino,
    }
    axios.post(html + 'insert_transporte', obj1).then(() => {
      setviewopcoestransportesanitario(0);
      loadTransportes();
      loadPacientes();
      toast(settoast, 'TRANSPORTE SOLICITADO', 'rgb(82, 190, 128, 1)', 3000);
    })

    // atualizando o registro do paciente.
    var obj2 = {
      aih: paciente.aih,
      procedimento: paciente.procedimento,
      unidade_origem: paciente.unidade_origem,
      setor_origem: paciente.setor_origem,
      nome_paciente: paciente.nome_paciente,
      nome_mae: paciente.nome_mae,
      dn_paciente: paciente.dn_paciente,
      status: 'TRANSPORTE SOLICITADO',
      unidade_destino: paciente.unidade_destino,
      setor_destino: paciente.setor_destino,
      indicador_data_cadastro: paciente.indicador_data_cadastro,
      indicador_data_confirmacao: paciente.indicador_data_confirmacao,
      indicador_relatorio: paciente.indicador_relatorio,
      indicador_solicitacao_transporte: moment(),
      indicador_saida_origem: paciente.indicador_saida_origem,
      indicador_chegada_destino: paciente.indicador_chegada_destino,
      dados_susfacil: paciente.dados_susfacil,
      exames_ok: pacientes.exames_ok,
      aih_ok: pacientes.aih_ok
    }
    axios.post(html + 'update_paciente/' + paciente.id, obj2).then(() => {
      axios.get(html + 'list_pacientes').then((response) => {
        setpacientes(response.data.rows);
        toast(settoast, 'REGISTRO ATUALIZADO COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
      });
    });
  }

  // tela para seleção da unidade de destino, quando uma vaga é confirmada.
  const [viewdestinoselector, setviewdestinoselector] = useState(0);

  const unidades = [
    {
      id: 1,
      unidade: 'UPA-VN',
      endereco: 'RUA PADRE PEDRO PINTO, 175, VENDA NOVA',
      telefone: '(31) 3277-5504'
    },
    {
      id: 2,
      unidade: 'HMDCC',
      endereco: 'RUA DONA LUIZA, 311, MILIONÁRIOS',
      telefone: '(31) 3472-4000'
    },
  ]

  function DestinoSelector() {
    return (
      <div className="fundo"
        style={{ display: viewdestinoselector > 0 ? 'flex' : 'none' }}
        onClick={() => setviewdestinoselector(0)}
      >
        <div className="janela" style={{ position: 'relative', flexDirection: 'column', justifyContent: 'space-between', flexWrap: 'wrap', margin: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text1" style={{ color: 'rgb(82, 190, 128, 1' }}>VAGA LIBERADA!</div>
          <div className="text1">SELECIONE A UNIDADE DE DESTINO</div>
          <div id="lista de unidades" className="scroll" style={{ width: '30vw', height: '30vh', margin: 0, padding: 0, paddingRight: 5 }}>
            {unidades.map((item) => (
              <div id={'unidade' + item.id} key={item.id} className="button"
                onClick={() => {
                  var botoes = document.getElementById("lista de unidades").getElementsByClassName("button-red");
                  for (var i = 0; i < botoes.length; i++) {
                    botoes.item(i).className = "button";
                  }
                  document.getElementById('unidade' + item.id).className = "button-red";
                  makeObj(paciente);
                  obj.unidade_destino = item.unidade;
                }}
              >
                {item.unidade}
              </div>
            ))}
          </div>
          <textarea
            className="textarea"
            placeholder='SETOR DE DESTINO, NOME DO PROFISSIONAL QUE LIBEROU A VAGA E DEMAIS OBSERVAÇÕES.'
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'SETOR DE DESTINO, NOME DO PROFISSIONAL QUE LIBEROU A VAGA E DEMAIS OBSERVAÇÕES.')}
            style={{ display: 'flex', flexDirection: 'center', width: '30vw', padding: 0, margin: 0, marginTop: 10, marginBottom: 20 }}
            id="inputDadosVaga"
            title="INFORME AQUI O SETOR DE DESTINO, NOME DO PROFISSIONAL QUE LIBEROU A VAGA E DEMAIS OBSERVAÇÕES."
          >
          </textarea>
          <div className="button-green" style={{ width: 200 }}
            onClick={() => {
              obj.dados_susfacil = paciente.dados_susfacil + "\n## INFORMAÇÕES SOBRE A VAGA: ##\n" + document.getElementById("inputDadosVaga").value;
              obj.indicador_data_confirmacao = moment();
              obj.status = 'VAGA LIBERADA';
              updatePaciente(paciente.id, 'sim');
              setviewdestinoselector(0);
            }}
          >
            CONFIRMAR
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: pagina == 1 ? 'flex' : 'none' }}>
      <ListaDePacientes></ListaDePacientes>
      <Usuario></Usuario>
      <EditPaciente></EditPaciente>
      <OpcoesTransporteSanitario></OpcoesTransporteSanitario>
      <DestinoSelector></DestinoSelector>
    </div>
  );
}

export default Pacientes;