/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import Context from './Context';
import moment, { isMoment } from 'moment';
// funções.
import toast from '../functions/toast';
import modal from '../functions/modal';
// imagens.
import power from '../images/power.svg';
import salvar from '../images/salvar.svg';
import refresh from '../images/refresh.svg';
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

  // definindo os atributos de obj para inserir ou atualizar registro de paciente. 
  const mountObj = () => {
    obj.aih = document.getElementById("inputAih").value;
    obj.procedimento = document.getElementById("inputProcedimento").value;
    obj.unidade_origem = usuario.unidade;
    obj.setor_origem = null;
    obj.nome_paciente = document.getElementById("inputNome").value.toUpperCase();
    obj.nome_mae = document.getElementById("inputNomeMae").value.toUpperCase();
    obj.dn_paciente = moment(document.getElementById("inputDn").value, 'DD/MM/YYYY');
    obj.status = 'AGUARDANDO VAGA';
    obj.unidade_destino = null;
    obj.indicador_data_cadastro = moment();
    obj.indicador_data_confirmacao = null;
    obj.indicador_relatorio = null;
    obj.indicador_solicitacao_transporte = null;
    obj.indicador_saida_origem = null;
    obj.indicador_chegada_destino = null;
    obj.dados_susfacil = document.getElementById("inputResumo").value.toUpperCase();
    obj.exames_ok = 0;
    obj.aih_ok = 0;
    obj.glasgow = document.getElementById("inputGlasgow").value;
    obj.pas = document.getElementById("inputPas").value;
    obj.pad = document.getElementById("inputPad").value;
    obj.fc = document.getElementById("inputFc").value;
    obj.fr = document.getElementById("inputFr").value;
    obj.sao2 = document.getElementById("inputSao2").value;
  }

  // carregando obj para atualizações do registro de paciente na checagem de relatório, exames, ssinatura de AIH e mudanças de status.
  const loadObj = (item) => {
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
      aih_ok: item.aih_ok,
      glasgow: item.glasgow,
      pas: item.pas,
      pad: item.pad,
      fc: item.fc,
      fr: item.fr,
      sao2: item.sao2,
      ofertao2: item.ofertao2,
      tipo_leito: item.tipo_leito,
      contato_nome: item.contato_nome,
      contato_telefone: item.contato_telefone,
      leito_destino: item.leito_destino
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
  const updateTransporte = (aih, status, justificativa) => {
    transportes.filter(valor => valor.aih == aih).map(valor =>
      obj = {
        id: valor.id,
        aih: valor.aih,
        protocolo: valor.protocolo,
        id_ambulancia: valor.id_ambulancia,
        finalidade: valor.finalidade,
        data_pedido: valor.data_pedido,
        unidade_destino: valor.unidade_destino,
        setor_destino: valor.setor_destino,
        status: status,
        justificativa_recusa: justificativa,
      }
    )

    console.log('ID DO TRANSPORTE: ' + obj.id);
    console.log(obj);

    axios.post(html + 'update_transporte/' + obj.id, obj).then(() => {
      toast(settoast, 'TRANSPORTE CANCELADO COM SUCESSO', 'rgb(82, 190, 128, 1)', 3000);
    });
  }

  var timeout = null;
  useEffect(() => {
    if (pagina == 1) {
      loadTransportes();
      loadPacientes();
      loadObj(paciente);
      window.onmousemove = function () {
        // refreshData();
      }
    }

    // eslint-disable-next-line
  }, [pagina])

  // atualizando dados.
  /*
  var intervall = null;
  const refreshData = () => {
    clearInterval(interval);
    interval = setInterval(() => {
      document.getElementById("refresh").style.display = 'flex';
      setTimeout(() => {
        loadPacientes();
        loadTransportes();
      }, 2000);
    }, 30000);
  }
  */

  function RefreshLogo() {
    return (
      <div
        id="refresh"
        style={{ display: 'none', position: 'absolute', right: 10, bottom: 10, backgroundColor: 'red', borderRadius: 50, opacity: 0.8 }}>
        <img
          alt=""
          src={refresh}
          style={{
            margin: 5,
            height: 15,
            width: 15,
          }}
        ></img>
      </div>
    )
  }

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
        setfilterpaciente('');
        setarraypacientes(pacientes);
        document.getElementById("inputPaciente").value = '';
        setTimeout(() => {
          document.getElementById("inputPaciente").focus();
        }, 100);
      } else {
        setfilterpaciente(document.getElementById("inputPaciente").value.toUpperCase());
        setarraypacientes(pacientes.filter(item => item.nome_paciente.toUpperCase().includes(searchpaciente) == true));
        document.getElementById("inputPaciente").value = searchpaciente;
        setTimeout(() => {
          document.getElementById("inputPaciente").focus();
        }, 100);
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
  AIH CANCELADA NA ORIGEM
  AIH CANCELADA NO DESTINO
  */

  // lista de pacientes internados.
  const ListaDePacientes = useCallback(() => {
    return (
      <div
        className='main'
        style={{ position: 'relative' }}
      >
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
        <div className="header-scroll"
          style={{
            width: 'calc(100vw - 40px)', maxWidth: 'calc(100vw - 40px)',
            display: arraypacientes.length > 0 ? 'flex' : 'none',
          }}>
          <div className='header-row' style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <div className="button-transparent" style={{ width: 50 }}
              onClick={() => setvieweditpaciente(2)}
            >
            </div>
            <div className="button-transparent" style={{ width: '10vw' }}>
              TIPO DE LEITO
            </div>
            <div className="button-transparent" style={{ width: '10vw' }}>
              AIH
            </div>
            <div className="button-transparent" style={{ width: '10vw' }}>
              DATA DE ENTRADA
            </div>
            <div className="button-transparent"
              style={{
                width: window.innerWidth > 1200 ? '25vw' : '15vw',
                display: window.innerWidth > 750 ? 'flex' : 'none',
              }}>
              NOME
            </div>
            <div className={"button-transparent"}
              style={{ width: '15vw' }}>
              STATUS
            </div>
            <div className={"button-transparent"}
              style={{ width: '10vw' }}
            >
              DESTINO
            </div>
          </div>
        </div>

        <div className="scroll" style={{ width: 'calc(100vw - 40px)', maxWidth: 'calc(100vw - 40px)', height: '73vh', display: arraypacientes.length > 0 ? 'flex' : 'none' }}>
          {arraypacientes.filter(item => item.unidade_origem == usuario.unidade).sort((a, b) => moment(a.indicador_data_cadastro) < moment(b.indicador_data_cadastro) ? 1 : -1).map(item => (
            <div key={'pacientes' + item.id}>
              <div
                className="row"
                style={{
                  // classificando registros por cores, conforme o tempo de internação na upa.
                  backgroundColor:
                    moment().diff(moment(item.indicador_data_cadastro), 'days') > 4 ? 'rgb(229, 126, 52, 0.5)' :
                      moment().diff(moment(item.indicador_data_cadastro), 'days') < 5 && moment().diff(moment(item.indicador_data_cadastro), 'days') > 2 ? 'rgb(229, 126, 52, 0.5' :
                        'rgb(82, 190, 128, 0.5)',
                  borderRadius: 5,
                  justifyContent: 'space-between',
                }}
                onClick={() => {
                  setpaciente(item);
                  document.getElementById("controle" + item.id).classList.toggle("expand");
                  document.getElementById("conteudo" + item.id).classList.toggle("show");
                }}
              >
                <div id="editar paciente" className="button-yellow"
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
                  {item.tipo_leito}
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
                <div className={item.status == 'VAGA LIBERADA' ? "button destaque" : "button"}
                  style={{ width: '15vw' }}>
                  {item.status}
                </div>
                <div className={item.status == 'AGUARDANDO VAGA' ? "button destaque" : "button"}
                  style={{ width: '10vw' }}
                  onClick={item.status == "AGUARDANDO VAGA" ? () => setviewdestinoselector(1) : () => null}
                >
                  {item.unidade_destino}
                </div>
              </div>
              {ControleDoPaciente(item)}
            </div>
          ))}
        </div>
        <div className="text3" style={{ height: '70vh', display: arraypacientes.length > 0 ? 'none' : 'flex', color: 'rgb(82, 190, 128, 1)' }}>SEM PACIENTES INTERNADOS NA UNIDADE</div>
      </div >
    )
    // eslint-disable-next-line
  }, [arraypacientes]);

  // função para destacar campo obrigatório em branco.
  const checkEmptyInput = (id, mensagem, botao) => {
    if (document.getElementById(id).value == '') {
      document.getElementById(id).style.backgroundColor = 'rgb(231, 76, 60, 0.3)';
      document.getElementById(botao).style.opacity = 0.3;
      document.getElementById(botao).style.pointerEvents = 'none';
      setTimeout(() => {
        document.getElementById(botao).style.pointerEvents = 'auto';
        document.getElementById(botao).style.opacity = 1;
      }, 3000);
      toast(settoast, mensagem, 'rgb(231, 76, 60, 1)', 3000);
    } else {
      document.getElementById(id).style.backgroundColor = 'white';
    }
  }

  // componente para inserir ou atualizar um registro de paciente.
  const [vieweditpaciente, setvieweditpaciente] = useState(0);
  var suplementacaoO2 = ['CN 1-4L/MIN', 'MF 5-12L/MIN', 'VM']
  const EditPaciente = useCallback(() => {
    // recuperando informações no caso de edição do registro de paciente.
    const [leito, setleito] = useState(paciente.tipo_leito);
    const [aih, setaih] = useState(paciente.aih);
    const [procedimento, setprocedimento] = useState(paciente.procedimento);
    const [nomepaciente, setnomepaciente] = useState(paciente.nome_paciente);
    const [dn, setdn] = useState(paciente.dn_paciente);
    const [nomemae, setnomemae] = useState(paciente.nome_mae);
    const [glasgow, setglasgow] = useState(paciente.glasgow);
    const [pas, setpas] = useState(paciente.pas);
    const [pad, setpad] = useState(paciente.pad);
    const [fc, setfc] = useState(paciente.fc);
    const [fr, setfr] = useState(paciente.fr);
    const [sao2, setsao2] = useState(paciente.sao2);
    const [ofertao2, setofertao2] = useState(paciente.ofertao2);
    const [resumo, setresumo] = useState(paciente.dados_susfacil);

    return (
      <div className="fundo"
        style={{ display: vieweditpaciente > 0 ? 'flex' : 'none' }}
        onClick={() => setvieweditpaciente(0)}
      >
        <div className="janela" style={{
          position: 'relative',
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          flexWrap: 'wrap', margin: 50, width: '70vw', alignItems: 'center',
        }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="scroll" style={{ height: '80vh', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
              <div id="seletores enfermaria e cti" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <div id="selectcti" className={leito == 'CTI' ? 'button-yellow' : 'button'} style={{ width: 120, height: 100 }}
                  onClick={() => {
                    setleito('CTI');
                  }}
                >
                  CTI
                </div>
                <div id="selectenf" className={leito == 'ENFERMARIA' ? 'button-yellow' : 'button'} style={{ width: 120, height: 100 }}
                  onClick={() => {
                    setleito('ENFERMARIA');
                  }}
                >
                  ENFERMARIA
                </div>
              </div>
              <div id="aih e procedimento" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <div id="aih" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className='text1' style={{ opacity: 0.5 }}>
                    AIH
                  </div>
                  <input
                    autoComplete="off"
                    placeholder="AIH"
                    className="input"
                    id="inputAih"
                    onFocus={(e) => (e.target.placeholder = '')}
                    onBlur={(e) => (e.target.placeholder = 'AIH')}
                    onChange={(e) => (setaih(e.target.value))}
                    onKeyUp={() => {
                      var x = document.getElementById("inputAih").value;
                      if (isNaN(x) == true || x.length > 8) {
                        toast(settoast, 'ERRO AO REGISTRAR AIH', 'rgb(231, 76, 60, 1)', 3000);
                        document.getElementById("inputAih").value = '';
                        document.getElementById("inputAih").focus();
                      }
                    }}
                    defaultValue={aih}
                    type="text"
                    maxLength={9}
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                      width: '15vw',
                      height: 50,
                    }}
                  ></input>
                </div>
                <div id="procedimento" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className='text1' style={{ opacity: 0.5 }}>
                    PROCEDIMENTO
                  </div>
                  <input
                    autoComplete="off"
                    placeholder="PROCEDIMENTO"
                    className="input"
                    id="inputProcedimento"
                    onFocus={(e) => (e.target.placeholder = '')}
                    onBlur={(e) => (e.target.placeholder = 'PROCEDIMENTO')}
                    onChange={(e) => (setprocedimento(e.target.value))}
                    onKeyUp={() => {
                      var x = document.getElementById("inputProcedimento").value;
                      if (isNaN(x) == true || x.length > 8) {
                        toast(settoast, 'ERRO AO REGISTRAR PROCEDIMENTO', 'rgb(231, 76, 60, 1)', 3000);
                        document.getElementById("inputProcedimento").value = '';
                        document.getElementById("inputProcedimento").focus();
                      }
                    }}
                    defaultValue={procedimento}
                    type="text"
                    maxLength={9}
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                      width: '15vw',
                      height: 50,
                    }}
                  ></input>
                </div>
              </div>
              <div id="botões" style={{ position: 'absolute', top: 25, right: 40, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <div className='button-red'
                  title={'EXCLUIR'}
                  onClick={
                    (e) => {
                      modal(setdialogo, paciente.id, 'CONFIRMAR EXCLUSÃO DO PACIENTE?', deletePaciente, paciente.id); e.stopPropagation();
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
                <div
                  id="salvar aih"
                  className='button-green'
                  title={vieweditpaciente == 1 ? 'SALVAR' : 'ATUALIZAR'}
                  onMouseOver={() => {
                    if (leito == null) {
                      document.getElementById("seletores enfermaria e cti").className = "button destaque"
                      toast(settoast, 'INFORME O TIPO DE LEITO', 'rgb(231, 76, 60, 1)', 3000);
                    } else {
                      document.getElementById("seletores enfermaria e cti").className = ""
                    }
                    if (ofertao2 == null) {
                      document.getElementById("suplementao2").className = "button destaque"
                      toast(settoast, 'INFORME A OFERTA DE O2', 'rgb(231, 76, 60, 1)', 3000);
                    } else {
                      document.getElementById("suplementao2").className = ""
                    }
                    checkEmptyInput("inputAih", 'CAMPO AIH EM BRANCO', "salvar aih");
                    checkEmptyInput("inputProcedimento", 'CAMPO PROCEDIMENTO EM BRANCO', "salvar aih");
                    checkEmptyInput("inputNome", 'CAMPO NOME DO PACIENTE EM BRANCO', "salvar aih");
                    checkEmptyInput("inputNomeMae", 'CAMPO NOME DA MÃE EM BRANCO', "salvar aih");
                    checkEmptyInput("inputDn", 'CAMPO DATA DE NASCIMENTO EM BRANCO', "salvar aih");
                    checkEmptyInput("inputGlasgow", 'CAMPO GLASGOW EM BRANCO', "salvar aih");
                    checkEmptyInput("inputPas", 'CAMPO PRESSÃO ARTERIAL SISTÓLICA EM BRANCO', "salvar aih");
                    checkEmptyInput("inputPad", 'CAMPO PRESSÃO ARTERIAL DIASTÓLICA EM BRANCO', "salvar aih");
                    checkEmptyInput("inputFc", 'CAMPO FREQUÊNCIA CARDÍACA EM BRANCO', "salvar aih");
                    checkEmptyInput("inputFr", 'CAMPO FREQUÊNCIA RESPIRATÓRIA EM BRANCO', "salvar aih");
                    checkEmptyInput("inputSao2", 'CAMPO SATURAÇÃO DE O2 EM BRANCO', "salvar aih");
                  }}
                  onClick={vieweditpaciente == 1 ?
                    () => {
                      mountObj();
                      obj.tipo_leito = leito;
                      obj.ofertao2 = ofertao2;
                      insertPaciente();
                      setvieweditpaciente(0);
                    } :
                    () => {
                      mountObj();
                      updatePaciente(paciente.id, 'sim');
                      setvieweditpaciente(0);
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

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
              <div id="nome do paciente" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1' style={{ opacity: 0.5 }}>
                  NOME DO PACIENTE
                </div>
                <input
                  autoComplete="off"
                  placeholder="NOME DO PACIENTE"
                  className="input"
                  id="inputNome"
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'NOME DO PACIENTE')}
                  onChange={(e) => (setnomepaciente(e.target.value))}
                  defaultValue={nomepaciente}
                  type="text"
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    width: '25vw',
                    height: 50,
                  }}
                ></input>
              </div>
              <div id="data de nascimento"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
                <div className='text1' style={{ opacity: 0.5 }}>
                  DATA DE NASCIMENTO
                </div>
                <input
                  autoComplete="off"
                  placeholder="DN"
                  title="DD/MM/YYYY"
                  className="input"
                  id="inputDn"
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'DN')}
                  onKeyUp={() => {
                    var data = moment(document.getElementById("inputDn").value, 'DD/MM/YYYY');
                    console.log(data);
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                      if (isMoment(data) == true) {
                        setdn(data);
                        document.getElementById('inputDn').value = moment(data).format('DD/MM/YYYY');
                      } else {
                        toast(settoast, 'DATA INVÁLIDA', 'rgb(231, 76, 60, 1)', 3000);
                        document.getElementById("inputDn").value = '';
                        data = '';
                      }
                    }, 5000);
                  }}
                  defaultValue={moment(dn).format('DD/MM/YYYY')}
                  type="text"
                  maxLength={10}
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    width: '10vw',
                    height: 50,
                    alignSelf: 'center'
                  }}
                ></input>
              </div>
              <div id="nome da mãe" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className='text1' style={{ opacity: 0.5 }}>
                  NOME DA MÃE
                </div>
                <input
                  autoComplete="off"
                  placeholder="NOME DA MÃE DO PACIENTE"
                  className="input"
                  id="inputNomeMae"
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'NOME DA MÃE DO PACIENTE')}
                  onChange={(e) => (setnomemae(e.target.value))}
                  defaultValue={nomemae}
                  type="text"
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    width: '25vw',
                    height: 50,
                  }}
                ></input>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', alignSelf: 'center' }}>
              <div id="dados vitais" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
                <div id="dados vitais" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                  <div id="glasgow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='text1' style={{ opacity: 0.5 }}>
                      GLASGOW
                    </div>
                    <input
                      title="GLASGOW"
                      autoComplete="off"
                      placeholder="GLASGOW"
                      className="input"
                      type="text"
                      maxLength={2}
                      id="inputGlasgow"
                      onFocus={(e) => (e.target.placeholder = '')}
                      onBlur={(e) => (e.target.placeholder = 'GLASGOW')}
                      defaultValue={glasgow}
                      onKeyUp={(e) => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                          var x = e.target.value;
                          if ((isNaN(x) == false && x > 0 && x < 16) || x == '') {
                            setglasgow(e.target.value);
                          } else {
                            toast(settoast, 'VALOR PARA GLASGOW INCORRETO', 'rgb(231, 76, 60, 1)', 3000);
                            document.getElementById("inputGlasgow").value = '';
                            document.getElementById("inputGlasgow").focus();
                          }
                        }, 100);
                      }}
                      style={{
                        marginTop: 10,
                        marginBottom: 10,
                        width: 100,
                        height: 50,
                      }}
                    ></input>
                  </div>
                  <div id="PAS" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='text1' style={{ opacity: 0.5 }}>
                      PAS
                    </div>
                    <input
                      title="PAS"
                      autoComplete="off"
                      placeholder="PAS"
                      className="input"
                      type="text"
                      maxLength={3}
                      id="inputPas"
                      onFocus={(e) => (e.target.placeholder = '')}
                      onBlur={(e) => (e.target.placeholder = 'PAS')}
                      defaultValue={pas}
                      onKeyUp={(e) => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                          var x = e.target.value;
                          if ((isNaN(x) == false && x > 0 && x < 200) || x == '') {
                            setpas(x);
                          } else {
                            toast(settoast, 'VALOR PARA PAS INCORRETO', 'rgb(231, 76, 60, 1)', 3000);
                            document.getElementById("inputPas").value = '';
                            document.getElementById("inputPas").focus();
                          }
                        }, 100);
                      }}
                      style={{
                        marginTop: 10,
                        marginBottom: 10,
                        width: 100,
                        height: 50,
                      }}
                    ></input>
                  </div>
                  <div id="PAD" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='text1' style={{ opacity: 0.5 }}>
                      PAD
                    </div>
                    <input
                      title="PAD"
                      autoComplete="off"
                      placeholder="PAD"
                      className="input"
                      type="text"
                      maxLength={3}
                      id="inputPad"
                      onFocus={(e) => (e.target.placeholder = '')}
                      onBlur={(e) => (e.target.placeholder = 'PAD')}
                      defaultValue={pad}
                      onKeyUp={(e) => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                          var x = e.target.value;
                          if ((isNaN(x) == false && x > 0 && x < 200) || x == '') {
                            setpad(x);
                          } else {
                            toast(settoast, 'VALOR PARA PAD INCORRETO', 'rgb(231, 76, 60, 1)', 3000);
                            document.getElementById("inputPad").value = '';
                            document.getElementById("inputPad").focus();
                          }
                        }, 100);
                      }}
                      style={{
                        marginTop: 10,
                        marginBottom: 10,
                        width: 100,
                        height: 50,
                      }}
                    ></input>
                  </div>
                  <div id="FC" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='text1' style={{ opacity: 0.5 }}>
                      FC
                    </div>
                    <input
                      title="FC"
                      autoComplete="off"
                      placeholder="FC"
                      className="input"
                      type="text"
                      maxLength={2}
                      id="inputFc"
                      onFocus={(e) => (e.target.placeholder = '')}
                      onBlur={(e) => (e.target.placeholder = 'FC')}
                      defaultValue={fc}
                      onKeyUp={(e) => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                          var x = e.target.value;
                          if ((isNaN(x) == false && x > 0 && x < 250) || x == '') {
                            setfc(x);
                          } else {
                            toast(settoast, 'VALOR PARA FC INCORRETO', 'rgb(231, 76, 60, 1)', 3000);
                            document.getElementById("inputFc").value = '';
                            document.getElementById("inputFc").focus();
                          }
                        }, 100);
                      }}
                      style={{
                        marginTop: 10,
                        marginBottom: 10,
                        width: 100,
                        height: 50,
                      }}
                    ></input>
                  </div>
                  <div id="FR" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='text1' style={{ opacity: 0.5 }}>
                      FR
                    </div>
                    <input
                      title="FR"
                      autoComplete="off"
                      placeholder="FR"
                      className="input"
                      type="text"
                      maxLength={2}
                      id="inputFr"
                      onFocus={(e) => (e.target.placeholder = '')}
                      onBlur={(e) => (e.target.placeholder = 'FR')}
                      defaultValue={fr}
                      onKeyUp={(e) => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                          var x = e.target.value;
                          if ((isNaN(x) == false && x > 10 && x < 50) || x == '') {
                            setfr(x);
                          } else {
                            toast(settoast, 'VALOR PARA FR INCORRETO', 'rgb(231, 76, 60, 1)', 3000);
                            document.getElementById("inputFr").value = '';
                            document.getElementById("inputFr").focus();
                          }
                        }, 100);
                      }}
                      style={{
                        marginTop: 10,
                        marginBottom: 10,
                        width: 100,
                        height: 50,
                      }}
                    ></input>
                  </div>
                  <div id="SAO2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className='text1' style={{ opacity: 0.5 }}>
                      SAO2
                    </div>
                    <input
                      title="SAO2"
                      autoComplete="off"
                      placeholder="SAO2"
                      className="input"
                      type="text"
                      maxLength={3}
                      id="inputSao2"
                      onFocus={(e) => (e.target.placeholder = '')}
                      onBlur={(e) => (e.target.placeholder = 'SAO2')}
                      defaultValue={sao2}
                      onKeyUp={(e) => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                          var x = e.target.value;
                          if ((isNaN(x) == false && x > 0 && x < 101) || x == '') {
                            setsao2(x);
                          } else {
                            toast(settoast, 'VALOR PARA SAO2 INCORRETO', 'rgb(231, 76, 60, 1)', 3000);
                            document.getElementById("inputSao2").value = '';
                            document.getElementById("inputSao2").focus();
                          }
                        }, 100);
                      }}
                      style={{
                        marginTop: 10,
                        marginBottom: 10,
                        width: 100,
                        height: 50,
                      }}
                    ></input>
                  </div>
                </div>
              </div>
              <div id="suplementação de o2"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignSelf: 'center' }}>
                <div className='text1' style={{ opacity: 0.5 }}>
                  SUPLEMENTAÇÃO DE O2
                </div>
                <div id="suplementao2"
                  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  {suplementacaoO2.map(item => (
                    <div
                      key={'suplementacaoO2' + item}
                      className={ofertao2 == item ? "button-yellow" : "button"}
                      id={"suplementacaoO2" + item}
                      style={{ width: '10vw' }}
                      onClick={() => {
                        setofertao2(item);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div id="resumo do caso"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 10, alignSelf: 'center', width: '100%' }}>
                <div className='text1' style={{ opacity: 0.5, alignSelf: 'center' }}>
                  RESUMO DO CASO
                </div>
                <textarea
                  className="textarea"
                  placeholder='RESUMO DO CASO'
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'RESUMO DO CASO')}
                  onKeyUp={(e) => {
                    clearTimeout(timeout);
                    var dados = e.target.value;
                    timeout = setTimeout(() => {
                      setresumo(dados);
                    }, 2000);
                    e.stopPropagation()
                  }}
                  style={{ display: 'flex', flexDirection: 'center', width: 'calc(60vw + 20px)', alignSelf: 'center' }}
                  id="inputResumo"
                  title="INFORME AQUI UM BREVE RESUMO DO CASO."
                  defaultValue={resumo}
                >
                </textarea>
              </div>
            </div>
          </div>
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
        style={{ flexDirection: 'row', justifyContent: 'space-between' }}
      >
        <div id={"conteudo" + item.id} className="hide" style={{
          justifyContent: 'space-between', width: '100%'
        }}>
          <div id={"DADOS CLÍNICOS" + item.id} className="card"
            style={{
              width: '100%',
              height: 'calc(50vh - 20px)',
              marginRight: item.status == 'AIH CANCELADA NA ORIGEM' || item.status == 'EM TRANSPORTE' ? 0 : 10,
            }}>
            <div className="text2">DADOS CLÍNICOS DO PACIENTE</div>
            <div style={{
              display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
              width: '100%',
            }}>
              <div className='text1' style={{ margin: 0 }}>{'GLASGOW: ' + item.glasgow}</div>
              <div className='text1' style={{ margin: 0 }}>{'PAS: ' + item.pas + ' MMHG'}</div>
              <div className='text1' style={{ margin: 0 }}>{'PAD: ' + item.pad + ' MMHG'}</div>
              <div className='text1' style={{ margin: 0 }}>{'FC: ' + item.fc + ' BPM'}</div>
              <div className='text1' style={{ margin: 0 }}>{'FR: ' + item.fr + ' IRPM'}</div>
              <div className='text1' style={{ margin: 0 }}>{'SAO2: ' + item.sao2 + '%'}</div>
              <div className='text1' style={{ margin: 0 }}>{'OFERTA DE O2: ' + item.ofertao2}</div>
            </div>
            <div className="scroll text1"
              style={{
                whiteSpace: 'pre-wrap', justifyContent: 'flex-start',
                textAlign: 'center',
                height: 'calc(100% - 30px)', width: 'calc(100% - 30px)',
              }}>
              {item.dados_susfacil}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div id="cancelamento de AIH"
              style={{
                display: item.status == 'AGUARDANDO VAGA' || item.status == 'VAGA LIBERADA' || item.status == 'TRANSPORTE CANCELADO' ? 'flex' : 'none',
                flexDirection: 'column', justifyContent: 'center',
                alignSelf: 'center', alignItems: 'center', alignContent: 'center',
              }}>
              <div className='button-red' style={{ width: 200, height: 50, alignSelf: 'center', opacity: justificativa == 1 ? 1 : 0.5 }}
                onClick={justificativa == 1 ? () => setjustificativa(0) : () => setjustificativa(1)}
              >
                CANCELAR AIH
              </div>
              <div style={{ display: justificativa == 1 ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'center', }}>
                <div className='button'
                  style={{ width: '14vw' }}
                  onClick={() => {
                    loadObj(item);
                    obj.status = 'AIH CANCELADA NA ORIGEM'
                    // eslint-disable-next-line
                    obj.dados_susfacil = obj.dados_susfacil + '\n' + moment().format('DD/MM/YYYY - HH:mm') + '\n\n## AIH CANCELADA NA ORIGEM ##\n' + 'OBITO';
                    updatePaciente(item.id, 'sim');
                    // cancelar transporte, se já empenhado.
                    if (transportes.filter(valor => valor.aih == item.aih).length > 0) {
                      updateTransporte(item.aih, 'AIH CANCELADA NA ORIGEM', 'ÓBITO');
                      toast(settoast, 'AIH CANCELADA', 'rgb(82, 190, 128, 1', 3000);
                    }
                  }}>
                  ÓBITO
                </div>
                <div className='button'
                  style={{ width: '14vw' }}
                  onClick={() => {
                    loadObj(item);
                    obj.status = 'AIH CANCELADA NA ORIGEM'
                    // eslint-disable-next-line
                    obj.dados_susfacil = obj.dados_susfacil + '\n' + moment().format('DD/MM/YYYY - HH:mm') + '\n\n## AIH CANCELADA NA ORIGEM ##\n' + 'EVASÃO';
                    updatePaciente(item.id, 'sim');
                    // cancelar transporte, se já empenhado.
                    if (transportes.filter(valor => valor.aih == item.aih)) {
                      updateTransporte(item.aih, 'AIH CANCELADA NA ORIGEM', 'EVASÃO');
                      toast(settoast, 'AIH CANCELADA', 'rgb(82, 190, 128, 1', 3000);
                    }
                  }}>
                  EVASÃO
                </div>
                <div className='button'
                  style={{ width: '14vw' }}
                  onClick={() => {
                    loadObj(item);
                    obj.status = 'AIH CANCELADA NA ORIGEM'
                    // eslint-disable-next-line
                    obj.dados_susfacil = obj.dados_susfacil + '\n' + moment().format('DD/MM/YYYY - HH:mm') + '\n\n## AIH CANCELADA NA ORIGEM ##\n' + 'OBITO';
                    updatePaciente(item.id, 'sim');
                    // cancelar transporte, se já empenhado.
                    if (transportes.filter(valor => valor.aih == item.aih).length > 0) {
                      updateTransporte(item.aih, 'AIH CANCELADA NA ORIGEM', 'ALTA');
                      toast(settoast, 'AIH CANCELADA', 'rgb(82, 190, 128, 1', 3000);
                    }
                  }}>
                  ALTA
                </div>
              </div>
              <textarea
                className="textarea"
                placeholder='JUSTIFICATIVA PARA O CANCELAMENTO DA AIH'
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => (e.target.placeholder = 'JUSTIFICATIVA PARA O CANCELAMENTO DA AIH')}
                onKeyUp={(e) => {
                  clearTimeout(timeout);
                  timeout = setTimeout(() => {
                    loadObj(item);
                    obj.status = 'AIH CANCELADA NA ORIGEM'
                    obj.dados_susfacil = obj.dados_susfacil + '\n' + moment().format('DD/MM/YYYY - HH:mm') + '\n\n## AIH CANCELADA NA ORIGEM ##\n' + e.target.value;
                    if (document.getElementById("inputJustificativaCancelamentoOrigem").value == '') {
                      toast(settoast, 'É NECESSÁRIO INFORMAR O MOTIVO DO CANCELAMENTO DA AIH', 'rgb(231, 76, 60, 1)', 3000);
                    } else {
                      updatePaciente(item.id, 'sim');
                      // cancelar transporte, se já empenhado.
                      if (transportes.filter(valor => valor.aih == item.aih).length > 0) {
                        updateTransporte(item.aih, 'AIH CANCELADA NA ORIGEM', document.getElementById("inputJustificativaCancelamentoOrigem").value.toUpperCase());
                        toast(settoast, 'AIH CANCELADA', 'rgb(82, 190, 128, 1', 3000);
                      }
                    }
                  }, 2000);
                  e.stopPropagation();
                }}
                style={{
                  display: justificativa == 1 ? 'flex' : 'none',
                  flexDirection: 'center', alignSelf: 'center',
                  width: '30vw', marginTop: 20,
                  whiteSpace: 'pre-wrap'
                }}
                id="inputJustificativaCancelamentoOrigem"
                title="JUSTIFIQUE AQUI O CANCELAMENTO DA AIH."
              >
              </textarea>
            </div>
            <div id="botões de checagem"
              style={{
                display: justificativa == 0 && (item.status == 'VAGA LIBERADA' || item.status == 'TRANSPORTE CANCELADO') ? 'flex' : 'none',
                flexDirection: 'row', justifyContent: 'center',
              }}
            /*
            onMouseLeave={() => {
              loadObj(item);
              obj.indicador_relatorio = relatorio;
              obj.exames_ok = exames;
              obj.aih_ok = aih;
              updatePaciente(item.id, 'não');
            }}
            */
            >
              <div id="relatorio" className={relatorio == null ? 'button-red' : 'button-green'}
                style={{ width: '14vw', height: 75 }}
                onClick={relatorio == null ?
                  () => {
                    setrelatorio(moment());
                    loadObj(item);
                    obj.indicador_relatorio = moment();
                    obj.exames_ok = exames;
                    obj.aih_ok = aih;
                    updatePaciente(item.id, 'não');
                  } :
                  () => {
                    setrelatorio(null);
                    loadObj(item);
                    obj.indicador_relatorio = moment();
                    obj.exames_ok = exames;
                    obj.aih_ok = aih;
                    updatePaciente(item.id, 'não');
                  }
                }
              >
                RELATÓRIO DE TRANSFERÊNCIA
              </div>
              <div id="exames" className={exames == 0 ? 'button-red' : 'button-green'}
                style={{ width: '14vw', height: 75 }}
                onClick={exames == 0 ?
                  () => {
                    setexames(1);
                    loadObj(item);
                    obj.indicador_relatorio = relatorio;
                    obj.exames_ok = 1;
                    obj.aih_ok = aih;
                    updatePaciente(item.id, 'não');
                    
                  } :
                  () => {
                    setexames(0);
                    loadObj(item);
                    obj.indicador_relatorio = relatorio;
                    obj.exames_ok = 0;
                    obj.aih_ok = aih;
                    updatePaciente(item.id, 'não');
                  }
                }
              >
                EXAMES LABORATORIAIS
              </div>
              <div id="aih" className={aih == 0 ? 'button-red' : 'button-green'}
                style={{ width: '14vw', height: 75 }}
                onClick={aih == 0 ?
                  () => {
                    setaih(1);
                    loadObj(item);
                    obj.indicador_relatorio = relatorio;
                    obj.exames_ok = exames;
                    obj.aih_ok = 1;
                    updatePaciente(item.id, 'não');
                  } :
                  () => {
                    setaih(0);
                    loadObj(item);
                    obj.indicador_relatorio = relatorio;
                    obj.exames_ok = exames;
                    obj.aih_ok = 0;
                    updatePaciente(item.id, 'não');
                  }
                }
              >
                AIH CARIMBADA
              </div>
            </div>
            <div id="empenho de transporte"
              style={{
                display: relatorio != null && exames == 1 && aih == 1 && (item.status == 'VAGA LIBERADA' || item.status == 'TRANSPORTE CANCELADO') && justificativa == 0 ? 'flex' : 'none',
                flexDirection: 'row', justifyContent: 'center'
              }}>
              <div className='button' style={{ width: '14vw', height: 75 }}
                onClick={() => setviewopcoestransportesanitario(1)}
              >
                SOLICITAR TRANSPORTE SANITÁRIO
              </div>
              <div className='button' style={{ width: '14vw', height: 75 }}>
                AGENDAR TRANSPORTE SANITÁRIO
              </div>
              <div className='button' style={{ width: '14vw', height: 75 }}>
                SOLICITAR SAMU
              </div>
            </div>
            <div id="protocolo de transporte"
              className='card'
              style={{
                display: item.status == 'TRANSPORTE SOLICITADO' || item.status == 'TRANSPORTE LIBERADO' ? 'flex' : 'none',
                flexDirection: 'column', justifyContent: 'center',
                borderRadius: 5,
              }}>
              <div style={{ display: justificativa == 1 ? 'none' : 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="text1">{'SOLICITAÇÃO DE TRANSPORTE REALIZADA COM SUCESSO!'}</div>
                <div className="text1" style={{ color: 'rgb(82, 190, 128, 1)' }}>
                  {'PROTOCOLO: ' + transportes.filter(valor => valor.aih == item.aih && valor.status == 'TRANSPORTE SOLICITADO').map(valor => valor.protocolo)}
                </div>
                <div className="text1">
                  {'DATA E HORA DA SOLICITAÇÃO: ' + transportes.filter(valor => valor.aih == item.aih && valor.status == 'TRANSPORTE SOLICITADO').map(valor => moment(valor.data_pedido).format('DD/MM/YYYY - HH:mm'))}
                </div>
              </div>
              <div id="cancelamento de empenho"
                style={{
                  display: 'flex',
                  flexDirection: 'column', justifyContent: 'center',
                  alignSelf: 'center', alignItems: 'center', alignContent: 'center',
                }}>
                <div className='button-red'
                  style={{ width: 200, minWidth: 200, height: 50, alignSelf: 'center', opacity: justificativa == 1 ? 1 : 0.5 }}
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
                      if (e.target.value == '') {
                        toast(settoast, 'É NECESSÁRIO INFORMAR O MOTIVO DO CANCELAMENTO DO TRANSPORTE', 'rgb(231, 76, 60, 1)', 3000);
                      } else {
                        loadObj(item);
                        obj.status = 'TRANSPORTE CANCELADO';
                        obj.dados_susfacil = obj.dados_susfacil + '\n' + moment().format('DD/MM/YYYY - HH:mm') + '\n\n## TRANSPORTE CANCELADO NA ORIGEM ##\n' + e.target.value;
                        updatePaciente(item.id, 'sim');
                        var justificativa = e.target.value;
                        updateTransporte(item.aih, 'TRANSPORTE CANCELADO', justificativa.toUpperCase());
                      }
                    }, 2000);
                    e.stopPropagation();
                  }}
                  style={{
                    display: justificativa == 1 ? 'flex' : 'none', flexDirection: 'center',
                    marginTop: 20,
                    whiteSpace: 'pre-wrap', width: '30vw'
                  }}
                  id="inputJustificativaCancelamentoTransporte"
                  title="JUSTIFIQUE AQUI O CANCELAMENTO DO TRANSPORTE."
                  defaultValue={transportes.filter(valor => valor.aih == item.aih && valor.status == 'TRANSPORTE CANCELADO PELA ORIGEM').map(valor => valor.justificativa_recusa)}
                >
                </textarea>
              </div>
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
      aih_ok: paciente.aih_ok,
      glasgow: paciente.glasgow,
      pas: paciente.pas,
      pad: paciente.pad,
      fc: paciente.fc,
      fr: paciente.fr,
      sao2: paciente.sao2,
      ofertao2: paciente.ofertao2,
      tipo_leito: paciente.tipo_leito,
      contato_nome: paciente.contato_nome,
      contato_telefone: paciente.contato_telefone,
      leito_destino: paciente.leito_destino
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

  const DestinoSelector = useCallback(() => {
    return (
      <div className="fundo"
        style={{ display: viewdestinoselector > 0 ? 'flex' : 'none' }}
        onClick={() => setviewdestinoselector(0)}
      >
        <div className="janela"
          style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            height: '80vh'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='scroll'>
            <div className="text1" style={{ color: 'rgb(82, 190, 128, 1' }}>VAGA LIBERADA!</div>
            <div className="text1" style={{ opacity: 0.3 }}>SELECIONE A UNIDADE DE DESTINO</div>
            <div id="lista de unidades"

              className="scroll"
              style={{
                height: '200 !important', minHeight: 200,
                width: '40vw', margin: 10, marginTop: 0,
                backgroundColor: "#ffffff", borderColor: '#ffffff',
              }}>
              {unidades.map((item) => (
                <div id={'unidade' + item.id} key={item.id} className="button"
                  onClick={() => {
                    var botoes = document.getElementById("lista de unidades").getElementsByClassName("button-red");
                    for (var i = 0; i < botoes.length; i++) {
                      botoes.item(i).className = "button";
                    }
                    document.getElementById('unidade' + item.id).className = "button-yellow";
                    loadObj(paciente);
                    obj.unidade_destino = item.unidade;
                  }}
                >
                  {item.unidade}
                </div>
              ))}

            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div id="setor" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="text1" style={{ opacity: 0.3 }}>SETOR</div>
                <input
                  autoComplete="off"
                  placeholder="SETOR"
                  className="input"
                  id="inputSetorDestino"
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'SETOR')}
                  onChange={(e) => (obj.setor_destino = e.target.value)}
                  defaultValue={paciente.setor_destino}
                  type="text"
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    width: '25vw',
                    height: 50,
                  }}
                ></input>
              </div>
              <div id="leito" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="text1" style={{ opacity: 0.3 }}>LEITO</div>
                <input
                  autoComplete="off"
                  placeholder="LEITO"
                  className="input"
                  id="inputLeitoDestino"
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'LEITO')}
                  onChange={(e) => (obj.leito_destino = e.target.value)}
                  defaultValue={paciente.leito_destino}
                  type="text"
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    width: 100,
                    height: 50,
                  }}
                ></input>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div id="contato" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="text1" style={{ opacity: 0.3 }}>CONTATO</div>
                <input
                  autoComplete="off"
                  placeholder="NOME DO CONTATO"
                  className="input"
                  id="inputContatoNome"
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'NOME DO CONTATO')}
                  onChange={(e) => (obj.contato_nome = e.target.value)}
                  defaultValue={paciente.contato_nome}
                  type="text"
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    width: '25vw',
                    height: 50,
                  }}
                ></input>
              </div>
              <div id="telefone" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="text1" style={{ opacity: 0.3 }}>TELEFONE</div>
                <input
                  autoComplete="off"
                  placeholder="TELEFONE DO CONTATO"
                  className="input"
                  id="inputContatoTelefone"
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = 'TELEFONE DO CONTATO')}
                  onChange={(e) => (obj.contato_telefone = e.target.value)}
                  defaultValue={paciente.contato_telefone}
                  type="text"
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    width: '25vw',
                    height: 50,
                  }}
                ></input>
              </div>
            </div>
            <div className="text1" style={{ opacity: 0.3 }}>DEMAIS OBSERVAÇÕES</div>
            <textarea
              className="textarea"
              placeholder='DEMAIS OBSERVAÇÕES.'
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'SETOR DE DESTINO, NOME DO PROFISSIONAL QUE LIBEROU A VAGA E DEMAIS OBSERVAÇÕES.')}
              style={{ display: 'flex', flexDirection: 'center', width: '50vw' }}
              id="inputDadosVaga"
              title="INFORME AQUI DEMAIS OBSERVAÇÕES."
            >
            </textarea>
          </div>
          <div id="salvar vaga" className="button-green" style={{ width: 200, alignSelf: 'center' }}
            onMouseOver={() => {
              checkEmptyInput("inputSetorDestino", "CAMPO SETOR É OBRIGATÓRIO", "salvar vaga");
              checkEmptyInput("inputLeitoDestino", "CAMPO LEITO É OBRIGATÓRIO", "salvar vaga");
              checkEmptyInput("inputContatoNome", "CAMPO NOME DO CONTATO É OBRIGATÓRIO", "salvar vaga");
              checkEmptyInput("inputContatoTelefone", "CAMPO TELEFONE DO DESTINO É OBRIGATÓRIO", "salvar vaga");
            }}
            onClick={() => {
              obj.setor_destino = document.getElementById("inputSetorDestino", "salvar vaga").value.toUpperCase();
              obj.leito_destino = document.getElementById("inputLeitoDestino", "salvar vaga").value.toUpperCase();
              obj.contato_nome = document.getElementById("inputContatoNome", "salvar vaga").value.toUpperCase();
              obj.contato_telefone = document.getElementById("inputContatoTelefone", "salvar vaga").value.toUpperCase();
              obj.indicador_data_confirmacao = moment();
              obj.status = 'VAGA LIBERADA';
              obj.dados_susfacil = paciente.dados_susfacil + "\n\n## INFORMAÇÕES SOBRE A VAGA ##" +
                "\nSETOR: " + obj.setor_destino + " - LEITO: " + obj.leito_destino +
                "\nNOME DO CONTATO: " + obj.contato_nome +
                "\nTELEFONE DO CONTATO: " + obj.contato_telefone +
                "\nOBS: " + document.getElementById("inputDadosVaga").value.toUpperCase();
              updatePaciente(paciente.id, 'sim');
              setviewdestinoselector(0);
            }}
          >
            CONFIRMAR
          </div>
        </div>
      </div>
    )
  }, [viewdestinoselector]);

  return (
    <div style={{ display: pagina == 1 ? 'flex' : 'none' }}>
      <ListaDePacientes></ListaDePacientes>
      <Usuario></Usuario>
      <EditPaciente></EditPaciente>
      <OpcoesTransporteSanitario></OpcoesTransporteSanitario>
      <DestinoSelector></DestinoSelector>
      <RefreshLogo></RefreshLogo>
    </div>
  );
}

export default Pacientes;