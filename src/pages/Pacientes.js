/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import Context from './Context';
import moment from 'moment';

function Pacientes() {

  // context.
  const {
    pagina,
    pacientes, setpacientes,
  } = useContext(Context)

  // carregar lista de pacientes internados.
  var html = 'http://localhost:3333/'
  const [arraypacientes, setarraypacientes] = useState(pacientes);
  const loadPacientes = () => {
    axios.get(html + 'list_pacientes').then((response) => {
      setpacientes(response.data.rows);
      setarraypacientes(response.data.rows);
      console.log('## INFO ## \nLISTA DE PACIENTES INTERNADOS CARREGADA.\nTOTAL DE PACIENTES INTERNADOS: ' + response.data.rows.length);
    })
  }

  // atualizar registro de pacientes.
  const updatePaciente = (item, setor_origem, status, unidade_destino, setor_destino, indicador_data_cadastro, indicador_data_confirmacao, indicador_relatorio, indicador_solicitacao_transporte, indicador_saida_origem, indicador_chegada_destino, exames_ok, aih_ok) => {
    var obj = {
      aih: item.aih,
      procedimento: item.procedimento,
      unidade_origem: item.unidade_origem,
      setor_origem: setor_origem, // modificável.
      nome_paciente: item.nome_paciente,
      nome_mae: item.nome_mae,
      dn_paciente: item.dn_paciente,
      status: status, // modificável.
      unidade_destino: unidade_destino, // modificável.
      setor_destino: setor_destino, // modificável.
      indicador_data_cadastro: indicador_data_cadastro, // modificável.
      indicador_data_confirmacao: indicador_data_confirmacao, // modificável.
      indicador_relatorio: indicador_relatorio, // modificável.
      indicador_solicitacao_transporte: indicador_solicitacao_transporte, // modificável.
      indicador_saida_origem: indicador_saida_origem, // modificável.
      indicador_chegada_destino: indicador_chegada_destino, // modificável.
      dados_susfacil: item.dados_susfacil,
      exames_ok: exames_ok, // modificável.
      aih_ok: aih_ok // modificável.
    }
    axios.post(html + 'update_paciente/' + item.id, obj).then(() => {
      axios.get(html + 'list_pacientes').then((response) => {
        setpacientes(response.data.rows);
      });
      console.log('## INFO ## \nREGISTRO ATUALIZADO COM SUCESSO');
    });
  }

  useEffect(() => {
    if (pagina == 1) {
      loadPacientes();
    }
    // eslint-disable-next-line
  }, [pagina])

  // lista de pacientes internados.
  const ListaDePacientes = useCallback(() => {
    return (
      <div className='main'>
        <div className="text3">LISTA DE PACIENTES INTERNADOS</div>
        <div className="header">
          <div className="button-transparent" style={{ width: '10vw' }}>
            UNIDADE DE ORIGEM
          </div>
          <div className="button-transparent" style={{ width: '15vw' }}>
            AIH
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            DATA DE CADASTRO
          </div>
          <div className="button-transparent" style={{ width: '25vw' }}>
            NOME DO PACIENTE
          </div>
          <div className="button-transparent" style={{ width: '15vw' }}>
            STATUS
          </div>
          <div className="button-transparent" style={{ width: '10vw' }}>
            UNIDADE DE DESTINO
          </div>
        </div>
        <div className="scroll" style={{ height: '75vh' }}>
          {arraypacientes.sort((a, b) => moment(a.indicador_data_cadastro) < moment(b.indicador_data_cadastro) ? 1 : -1).map(item => (
            <div>
              <div
                key={item.id}
                className="row"
                onClick={() => {
                  document.getElementById("controle" + item.id).classList.toggle("expand");
                  document.getElementById("conteudo" + item.id).classList.toggle("show");
                }}
              >
                <div className="button" style={{ width: '10vw' }}>
                  {item.unidade_origem}
                </div>
                <div className="button" style={{ width: '15vw' }}>
                  {item.aih}
                </div>
                <div className="button" style={{ width: '10vw' }}>
                  {moment(item.indicador_data_cadastro).format('DD/MM/YY - HH:mm')}
                </div>
                <div className="button" style={{ width: '25vw' }}>
                  {item.nome_paciente}
                </div>
                <div className="button" style={{ width: '15vw' }}>
                  {item.status}
                </div>
                <div className="button" style={{ width: '10vw' }}>
                  {item.unidade_destino}
                </div>
              </div>
              {ControleDoPaciente(item)}
            </div>
          ))}
        </div>
      </div>
    )
    // eslint-disable-next-line
  }, [arraypacientes]);

  // painel de controle do paciente internado (dados clínicos e regulação de transporte).
  const ControleDoPaciente = (item) => {
    const [relatorio, setrelatorio] = useState(item.indicador_relatorio);
    const [exames, setexames] = useState(item.exames_ok);
    const [aih, setaih] = useState(item.aih_ok);
    return (
      <div
        id={"controle" + item.id}
        className="retract"
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
      >
        <div id={"conteudo" + item.id} className="hide" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div id={"DADOS CLÍNICOS" + item.id} className="card" style={{ width: '42vw', height: 'calc(50vh - 20px)' }}>
            <div className="text2">DADOS CLÍNICOS DO PACIENTE</div>
            <div className="textarea" style={{ height: '100%' }}>
              {item.dados_susfacil}
            </div>
          </div>
          <div id={"CHECAGEM E EMPENHO DE TRANSPORTE" + item.id} style={{ flexDirection: 'column', alignSelf: 'center' }}>
            <div id="botões de checagem" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <div id="relatorio" className={relatorio != null ? 'button-green' : 'button-red'}
                style={{ width: '15vw', height: '8vw' }}
                onClick={relatorio == null ?
                  () => {
                    setrelatorio(moment());
                    setTimeout(() => {
                      updatePaciente(item, item.setor_origem, item.status, item.unidade_destino, item.setor_destino, item.indicador_data_cadastro, item.indicador_data_confirmacao, moment(), item.indicador_solicitacao_transporte, item.indicador_saida_origem, item.indicador_chegada_destino, exames, aih);
                    }, 200);
                  }
                  :
                  () => {
                    setrelatorio(null);
                    setTimeout(() => {
                      updatePaciente(item, item.setor_origem, item.status, item.unidade_destino, item.setor_destino, item.indicador_data_cadastro, item.indicador_data_confirmacao, null, item.indicador_solicitacao_transporte, item.indicador_saida_origem, item.indicador_chegada_destino, exames, aih);
                    }, 200);
                  }
                }
              >
                RELATÓRIO DE TRANSFERÊNCIA
              </div>
              <div id="exames" className={exames == 1 ? 'button-green' : 'button-red'}
                style={{ width: '15vw', height: '8vw' }}
                onClick={exames == 0 ?
                  () => {
                    setexames(1);
                    setTimeout(() => {
                      updatePaciente(item, item.setor_origem, item.status, item.unidade_destino, item.setor_destino, item.indicador_data_cadastro, item.indicador_data_confirmacao, relatorio, item.indicador_solicitacao_transporte, item.indicador_saida_origem, item.indicador_chegada_destino, 1, aih);
                    }, 200);
                  }
                  :
                  () => {
                    setexames(0);
                    setTimeout(() => {
                      updatePaciente(item, item.setor_origem, item.status, item.unidade_destino, item.setor_destino, item.indicador_data_cadastro, item.indicador_data_confirmacao, relatorio, item.indicador_solicitacao_transporte, item.indicador_saida_origem, item.indicador_chegada_destino, 0, aih);
                    }, 200);
                  }
                }
              >
                EXAMES LABORATORIAIS
              </div>
              <div className={aih == 1 ? 'button-green' : 'button-red'}
                style={{ width: '15vw', height: '8vw', marginRight: 0 }}
                onClick={aih == 0 ?
                  () => {
                    setaih(1);
                    setTimeout(() => {
                      updatePaciente(item, item.setor_origem, item.status, item.unidade_destino, item.setor_destino, item.indicador_data_cadastro, item.indicador_data_confirmacao, relatorio, item.indicador_solicitacao_transporte, item.indicador_saida_origem, item.indicador_chegada_destino, exames, 1);
                    }, 200);
                  }
                  :
                  () => {
                    setaih(0);
                    setTimeout(() => {
                      updatePaciente(item, item.setor_origem, item.status, item.unidade_destino, item.setor_destino, item.indicador_data_cadastro, item.indicador_data_confirmacao, relatorio, item.indicador_solicitacao_transporte, item.indicador_saida_origem, item.indicador_chegada_destino, exames, 0)
                    }, 200);
                  }
                }
              >
                AIH ASSINADA E CARIMBADA
              </div>
            </div>
            <div id="empenho de transporte"
              style={{
                display: relatorio != null && exames == 1 && aih == 1 ? 'flex' : 'none',
                flexDirection: 'row', justifyContent: 'center'
              }}>
              <div className='button' style={{ width: '15vw', height: '8vw' }}
                onClick={() => setviewopcoestransportesanitario(1)}
              >
                SOLICITAR TRANSPORTE SANITÁRIO
              </div>
              <div className='button' style={{ width: '15vw', height: '8vw' }}>
                AGENDAR TRANSPORTE SANITÁRIO
              </div>
              <div className='button' style={{ width: '15vw', height: '8vw', marginRight: 0 }}>
                SOLICITAR SAMU
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
      finalidade: 'TRANSFERÊNCIA HOSPITALAR',
      orientacoes: 'SOLICITAR MACA OU CADEIRA DE RODAS PARA A TRANSIÇÃO DE CUIDADOS.'
    },
    {
      finalidade: 'CONSULTA MÉDICA',
      orientacoes: 'AGUARDAR A CONCLUSÃO DA CONSULTA PARA RETORNO COM O PACIENTE À UNIDADE DE ORIGEM.'
    },
    {
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
                className="button" style={{ width: '20vw' }}
                id={item.key}
              >
                {item.finalidade}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: pagina == 1 ? 'flex' : 'none' }}>
      <ListaDePacientes></ListaDePacientes>
      <OpcoesTransporteSanitario></OpcoesTransporteSanitario>
    </div>
  );
}

export default Pacientes;