/* eslint eqeqeq: "off" */
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Context from './Context';
import moment, { isMoment } from 'moment';
// funções.
import toast from '../functions/toast';
// imagens.
import power from '../images/power.svg';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart, Filler } from 'chart.js';

function Indicadores() {

  // context.
  const {
    usuario,
    pagina, setpagina,
    settoast,
  } = useContext(Context);

  var html = 'http://localhost:3333/'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
  );

  Chart.register(Filler);

  // MODELOS PARA OS GRÁFICOS.
  // gráfico em doughnut.
  const legendas = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];
  const dados = {
    legendas,
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // carregar lista de pacientes internados.
  const [pacientes, setpacientes] = useState([0, 1]);
  const [pacientesgrafico, setpacientesgrafico] = useState([0, 1]);
  const loadPacientes = () => {
    console.log('ACIONOU');
    axios.get(html + 'list_pacientes').then((response) => {
      var x = [0, 1];
      x = response.data.rows;
      var y = [0, 1];
      y = x.filter(item => item.indicador_chegada_destino != null && moment(item.indicador_data_cadastro) >= datainicio && moment(item.indicador_data_cadastro) <= datatermino);
      var z = [0, 1];
      z = x.filter(item => moment(item.indicador_data_cadastro) >= datainicio && moment(item.indicador_data_cadastro) <= datatermino);
      setpacientes(y);
      setpacientesgrafico(z);
      console.log('INTERVALO DE DATAS: ' + datainicio.format('DD/MM/YY') + ' A ' + datatermino.format('DD/MM/YY'));
      console.log('REGISTROS: ' + y.length);
      getIndicadores(y);
      setTimeout(() => {
        arraydays.map(item => { catchTodasAihsCadastradas(item); catchNovasAihsCadastradas(item); catchAtivasAihsCadastradas(item) });
      }, 3000);
    })
  }

  // INDICADORES
  const [tempocadastrovaga, settempocadastrovaga] = useState(moment.duration());
  const [tempovagarelatorio, settempovagarelatorio] = useState(moment.duration());
  const [temporelatoriotransporte, settemporelatoriotransporte] = useState(moment.duration());
  const [tempotransportesaida, settempotransportesaida] = useState(moment.duration());
  const [temposaidadestino, settemposaidadestino] = useState(moment.duration());
  const [tempopermanenciageral, settempopermanenciageral] = useState(moment.duration());

  // função usada para redução de arrays (soma).
  function soma(total, num) {
    return total + num;
  }

  // indicadores globais (consolidado de todas as upas).
  const getIndicadores = (pacientes) => {
    if (pacientes.length > 0) {
      // ## 1. TEMPO CADASTRO >> CONFIRMAÇÃO DA VAGA ##
      // array com os tempos de cada registro.
      let todoscadastrovaga = pacientes.map(item => moment(item.indicador_data_confirmacao).diff(item.indicador_data_cadastro), 'days');
      // soma de todos os tempos.
      if (pacientes.length > 0) {
        let totalcadastrovaga = todoscadastrovaga.reduce(soma);
        // cálculo do tempo médio (total / número de pacientes).
        let mediacadastrovaga = moment.duration(Math.ceil(totalcadastrovaga / pacientes.length));
        settempocadastrovaga(mediacadastrovaga);
        console.log('PACIENTES: ' + todoscadastrovaga);
      }
      // ## 2. TEMPO CONFIRMAÇÃO DA VAGA >> RELATÓRIO MÉDICO ##
      let todosvagarelatorio = pacientes.map(item => moment(item.indicador_relatorio).diff(item.indicador_data_confirmacao), 'days');
      if (pacientes.length > 0) {
        let totalvagarelatorio = todosvagarelatorio.reduce(soma);
        let mediavagarelatorio = moment.duration(Math.ceil(totalvagarelatorio / pacientes.length));
        settempovagarelatorio(mediavagarelatorio);
      }
      // ## 3. TEMPO RELATÓRIO MÉDICO >> SOLICITAÇÃO DO TRANSPORTE ##
      let todosrelatoriotransporte = pacientes.map(item => moment(item.indicador_solicitacao_transporte).diff(item.indicador_relatorio), 'days');
      if (pacientes.length > 0) {
        let totalrelatoriotransporte = todosrelatoriotransporte.reduce(soma);
        let mediarelatoriotransporte = moment.duration(Math.ceil(totalrelatoriotransporte / pacientes.length));
        settemporelatoriotransporte(mediarelatoriotransporte);
      }
      // ## 4. TEMPO SOLICITAÇÃO DO TRANSPORTE >> SAÍDA DA UNIDADE ##
      let todostransportesaida = pacientes.map(item => moment(item.indicador_saida_origem).diff(item.indicador_solicitacao_transporte), 'days');
      if (pacientes.length > 0) {
        let totaltransportesaida = todostransportesaida.reduce(soma);
        let mediatransportesaida = moment.duration(Math.ceil(totaltransportesaida / pacientes.length));
        settempotransportesaida(mediatransportesaida);
      }
      // ## 5. TEMPO DE SAÍDA DA ORIGEM >> CHEGADA AO DESTINO ##
      let todossaidadestino = pacientes.map(item => moment(item.indicador_chegada_destino).diff(item.indicador_origem_saida), 'days');
      if (pacientes.length > 0) {
        let totalsaidadestino = todossaidadestino.reduce(soma);
        let mediasaidadestino = moment.duration(Math.ceil(totalsaidadestino / pacientes.length));
        settemposaidadestino(mediasaidadestino);
      }
      // ## 6. TEMPO GERAL DE PERMANÊNCIA NA UNIDADE ##
      let todospermanenciageral = pacientes.map(item => moment(item.indicador_chegada_destino).diff(item.indicador_data_cadastro), 'days');
      if (pacientes.length > 0) {
        let totalpermanenciageral = todospermanenciageral.reduce(soma);
        let mediapermanenciageral = moment.duration(Math.ceil(totalpermanenciageral / pacientes.length));
        settempopermanenciageral(mediapermanenciageral);
      }
    } else {
      return null;
    }
  }

  // exibição dos indicadores por UPA.
  const getIndicadoresPorUnidade = (pacientes, unidade) => {
    let mediacadastrovaga = moment.duration();
    let mediavagarelatorio = moment.duration();
    let mediarelatoriotransporte = moment.duration();
    let mediatransportesaida = moment.duration();
    let mediasaidadestino = moment.duration();
    let mediapermanenciageral = moment.duration();

    // verificar se a unidade tem registros de pacientes com todos os processos concluídos.
    if (pacientes.filter(item => item.unidade_origem == unidade && item.indicador_chegada_destino != null)) {
      // ## 1. TEMPO DE CADASTRO DA AIH ATÉ A CONFIRMAÇÃO DA VAGA ##
      let todoscadastrovaga = pacientes.filter(item => item.unidade_origem == unidade).map(item => moment(item.indicador_data_confirmacao).diff(item.indicador_data_cadastro), 'days');
      let totalcadastrovaga = null;
      if (todoscadastrovaga.length > 0) {
        totalcadastrovaga = todoscadastrovaga.reduce(soma);
        mediacadastrovaga = moment.duration(Math.ceil(totalcadastrovaga / pacientes.filter(item => item.unidade_origem == unidade).length));
      }
      // ## 2. TEMPO CONFIRMAÇÃO DA VAGA >> RELATÓRIO MÉDICO ##
      let todosvagarelatorio = pacientes.filter(item => item.unidade_origem == unidade).map(item => moment(item.indicador_relatorio).diff(item.indicador_data_confirmacao), 'days');
      let totalvagarelatorio = null;
      if (todosvagarelatorio.length > 0) {
        totalvagarelatorio = todosvagarelatorio.reduce(soma);
        mediavagarelatorio = moment.duration(Math.ceil(totalvagarelatorio / pacientes.filter(item => item.unidade_origem == unidade).length));
      }
      // ## 3. TEMPO RELATÓRIO MÉDICO >> SOLICITAÇÃO DO TRANSPORTE ##
      let todosrelatoriotransporte = pacientes.filter(item => item.unidade_origem == unidade).map(item => moment(item.indicador_solicitacao_transporte).diff(item.indicador_relatorio), 'days');
      let totalrelatoriotransporte = null;
      if (todosrelatoriotransporte.length > 0) {
        totalrelatoriotransporte = todosrelatoriotransporte.reduce(soma);
        mediarelatoriotransporte = moment.duration(Math.ceil(totalrelatoriotransporte / pacientes.filter(item => item.unidade_origem == unidade).length));
      }
      // ## 4. TEMPO SOLICITAÇÃO DO TRANSPORTE >> SAÍDA DA UNIDADE ##
      let todostransportesaida = pacientes.filter(item => item.unidade_origem == unidade).map(item => moment(item.indicador_saida_origem).diff(item.indicador_solicitacao_transporte), 'days');
      let totaltransportesaida = null;
      if (todostransportesaida.length > 0) {
        totaltransportesaida = todostransportesaida.reduce(soma);
        mediatransportesaida = moment.duration(Math.ceil(totaltransportesaida / pacientes.filter(item => item.unidade_origem == unidade).length));
      }
      // ## 5. TEMPO DE SAÍDA DA ORIGEM >> CHEGADA AO DESTINO ##
      let todossaidadestino = pacientes.filter(item => item.unidade_origem == unidade).map(item => moment(item.indicador_chegada_destino).diff(item.indicador_origem_saida), 'days');
      let totalsaidadestino = null;
      if (todossaidadestino.length > 0) {
        totalsaidadestino = todossaidadestino.reduce(soma);
        mediasaidadestino = moment.duration(Math.ceil(totalsaidadestino / pacientes.filter(item => item.unidade_origem == unidade).length));
      }
      // ## 6. TEMPO GERAL DE PERMANÊNCIA NA UNIDADE ##
      let todospermanenciageral = pacientes.filter(item => item.unidade_origem == unidade).map(item => moment(item.indicador_chegada_destino).diff(item.indicador_data_cadastro), 'days');
      let totalpermanenciageral = null;
      if (todospermanenciageral.length > 0) {
        totalpermanenciageral = todospermanenciageral.reduce(soma);
        mediapermanenciageral = moment.duration(Math.ceil(totalpermanenciageral / pacientes.filter(item => item.unidade_origem == unidade).length));
      }
      return (
        <div key={'UPAS ' + unidade} className="card" style={{ margin: 10 }}>
          <div className="text3">{unidade}</div>
          <div style={{ display: mediacadastrovaga != moment.duration() ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>

            <div id="internação >> vaga" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: mediacadastrovaga.days() > 5 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 5 dias.
                  mediacadastrovaga.days() > 2 && mediacadastrovaga.days() < 6 ? 'rgb(229, 126, 52, 1)' : // amarelo se 3 a 5 dias.
                    'rgb(82, 190, 128, 1)' // verde se até 2 dias.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{mediacadastrovaga.days() + 'D ' + mediacadastrovaga.hours() + 'H ' + mediacadastrovaga.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE INTERNAÇÃO ATÉ A LIBERAÇÃO DA VAGA</div>
            </div>

            <div id="vaga >> relatório" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: mediavagarelatorio.hours() > 2 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 2 horas.
                  mediavagarelatorio.hours() > 1 && mediavagarelatorio.hours() < 2 ? 'rgb(229, 126, 52, 1)' : // amarelo se 1 a 2 horas.
                    'rgb(82, 190, 128, 1)' // verde se até 1 hora.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{mediavagarelatorio.hours() + 'H ' + mediavagarelatorio.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE LIBERAÇÃO DA VAGA ATÉ A EMISSÃO DO RELATÓRIO DE TRANSFERÊNCIA</div>
            </div>

            <div id="relatório >> pedido transporte" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: mediarelatoriotransporte.minutes() > 30 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 30 minutos.
                  mediarelatoriotransporte.minutes() > 15 && mediarelatoriotransporte.minutes() < 30 ? 'rgb(229, 126, 52, 1)' : // amarelo se 15 a 30 minutos.
                    'rgb(82, 190, 128, 1)' // verde se até 15 minutos.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{mediarelatoriotransporte.days() + 'D ' + mediarelatoriotransporte.hours() + 'H ' + mediarelatoriotransporte.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE LIBERAÇÃO DO RELATÓRIO DE TRANSFERÊNCIA ATÉ O ACIONAMENTO DO TRANSPORTE</div>
            </div>

            <div id="pedido transporte >> saída" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: mediatransportesaida.hours() > 2 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 2 horas.
                  mediatransportesaida.hours() > 1 && mediatransportesaida.hours() < 2 ? 'rgb(229, 126, 52, 1)' : // amarelo se 1 a 2 horas.
                    'rgb(82, 190, 128, 1)' // verde se até 1 hora.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{mediatransportesaida.hours() + 'H ' + mediatransportesaida.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE ACIONAMENTO DO TRANSPORTE ATÉ A SAÍDA DO PACIENTE DA UNIDADE</div>
            </div>

            <div id="saída >> chegada ao destino" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: mediasaidadestino.hours() > 1 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 1 hora.
                  mediasaidadestino.minutes() > 30 && mediasaidadestino.minutes() < 15 ? 'rgb(229, 126, 52, 1)' : // amarelo se 15 a 30 minutos.
                    'rgb(82, 190, 128, 1)' // verde se até 15 minutos.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{mediasaidadestino.hours() + 'H ' + mediasaidadestino.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE DESLOCAMENTO DA UNIDADE DE ORIGEM À UNIDADE DE DESTINO</div>
            </div>

            <div id="saída >> chegada ao destino" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: mediapermanenciageral.days() > 5 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 5 dias.
                  mediapermanenciageral.days() > 3 && mediapermanenciageral.days() < 5 ? 'rgb(229, 126, 52, 1)' : // amarelo se 3 a 5 dias.
                    'rgb(82, 190, 128, 1)' // verde se até 3 dias.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{mediapermanenciageral.hours() + 'H ' + mediapermanenciageral.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE DESLOCAMENTO DA UNIDADE DE ORIGEM À UNIDADE DE DESTINO</div>
            </div>

          </div>
        </div>
      )
    }
  }

  const upas = [
    {
      id: 1,
      unidade: 'UPA-BAR', // UPA BARREIRO
    },
    {
      id: 2,
      unidade: 'UPA-CS', // UPA CENTRO-SUL
    },
    {
      id: 3,
      unidade: 'UPA-L', // UPA LESTE
    },
    {
      id: 4,
      unidade: 'UPA-NE', // UPA NORDESTE
    },
    {
      id: 5,
      unidade: 'UPA-NO', // UPA NOROESTE
    },
    {
      id: 6,
      unidade: 'UPA-N', // UPA NORTE
    },
    {
      id: 7,
      unidade: 'UPA-O', // UPA OESTE
    },
    {
      id: 8,
      unidade: 'UPA-P', // UPA PAMPULHA
    },
    {
      id: 9,
      unidade: 'UPA-VN', // UPA VENDA NOVA
    },
  ]

  // componente para filtrar registros por data de cadastro da AIH.
  // mês e ano atuais.
  const [datainicio, setdatainicio] = useState(moment().startOf('month'));
  const [datatermino, setdatatermino] = useState(moment());
  var timeout = null;
  function FilterData() {
    return (
      <div className="card"
        style={{
          // position: 'absolute', top: 10, right: 10,
          display: 'flex', flexDirection: 'row', justifyContent: 'center',
          margin: 0, alignSelf: 'flex-end'
        }}>
        <div id="setor" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div className="text1" style={{ opacity: 0.3 }}>INÍCIO</div>
          <input
            autoComplete="off"
            placeholder="INÍCIO"
            title="DD/MM/YYYY"
            className="input"
            id="inputDataInicio"
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'INÍCIO')}
            onKeyUp={() => {
              var data1 = moment(document.getElementById("inputDataInicio").value, 'DD/MM/YYYY');
              clearTimeout(timeout);
              timeout = setTimeout(() => {
                if (isMoment(data1) == true) {
                  setdatainicio(data1);
                  // document.getElementById('inputDatainicio').value = moment(data).format('DD/MM/YYYY');
                } else {
                  toast(settoast, 'DATA INVÁLIDA', 'rgb(231, 76, 60, 1)', 3000);
                  document.getElementById("inputDatainicio").value = '';
                  data = '';
                }
              }, 3000);
            }}
            defaultValue={moment(datainicio).format('DD/MM/YYYY')}
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
        <div id="setor" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div className="text1" style={{ opacity: 0.3 }}>TÉRMINO</div>
          <input
            autoComplete="off"
            placeholder="TÉRMINO"
            title="DD/MM/YYYY"
            className="input"
            id="inputDataTermino"
            onFocus={(e) => (e.target.placeholder = '')}
            onBlur={(e) => (e.target.placeholder = 'TÉRMINO')}
            onKeyUp={() => {
              var data2 = moment(document.getElementById("inputDataTermino").value, 'DD/MM/YYYY');
              clearTimeout(timeout);
              timeout = setTimeout(() => {
                if (isMoment(data2) == true) {
                  setdatatermino(data2);
                  // document.getElementById('inputDataTermino').value = moment(data2).format('DD/MM/YYYY');
                } else {
                  toast(settoast, 'DATA INVÁLIDA', 'rgb(231, 76, 60, 1)', 3000);
                  document.getElementById("inputDataTermino").value = '';
                  data2 = '';
                }
              }, 3000);
            }}
            defaultValue={moment(datatermino).format('DD/MM/YYYY')}
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
      </div>
    )
  }

  // componente para exibição dos indicadores (processos).
  function IndicadoresGerais() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: pacientes.length > 0 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="text3">INDICADORES GLOBAIS</div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div id="internação >> vaga" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: tempocadastrovaga.days() > 5 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 5 dias.
                  tempocadastrovaga.days() > 2 && tempocadastrovaga.days() < 6 ? 'rgb(229, 126, 52, 1)' : // amarelo se 3 a 5 dias.
                    'rgb(82, 190, 128, 1)' // verde se até 2 dias.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{tempocadastrovaga.days() + 'D ' + tempocadastrovaga.hours() + 'H ' + tempocadastrovaga.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE INTERNAÇÃO ATÉ A LIBERAÇÃO DA VAGA</div>
            </div>
            <div id="vaga >> relatório" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: tempovagarelatorio.hours() > 2 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 2 horas.
                  tempovagarelatorio.hours() > 1 && tempovagarelatorio.hours() < 2 ? 'rgb(229, 126, 52, 1)' : // amarelo se 1 a 2 horas.
                    'rgb(82, 190, 128, 1)' // verde se até 1 hora.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{tempovagarelatorio.hours() + 'H ' + tempovagarelatorio.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE LIBERAÇÃO DA VAGA ATÉ A EMISSÃO DO RELATÓRIO DE TRANSFERÊNCIA</div>
            </div>
            <div id="relatório >> pedido transporte" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: temporelatoriotransporte.minutes() > 30 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 30 minutos.
                  temporelatoriotransporte.minutes() > 15 && temporelatoriotransporte.minutes() < 30 ? 'rgb(229, 126, 52, 1)' : // amarelo se 15 a 30 minutos.
                    'rgb(82, 190, 128, 1)' // verde se até 15 minutos.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{temporelatoriotransporte.days() + 'D ' + temporelatoriotransporte.hours() + 'H ' + temporelatoriotransporte.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE LIBERAÇÃO DO RELATÓRIO DE TRANSFERÊNCIA ATÉ O ACIONAMENTO DO TRANSPORTE</div>
            </div>
            <div id="pedido transporte >> saída" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: tempotransportesaida.hours() > 2 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 2 horas.
                  tempotransportesaida.hours() > 1 && tempotransportesaida.hours() < 2 ? 'rgb(229, 126, 52, 1)' : // amarelo se 1 a 2 horas.
                    'rgb(82, 190, 128, 1)' // verde se até 1 hora.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{tempotransportesaida.hours() + 'H ' + tempotransportesaida.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE ACIONAMENTO DO TRANSPORTE ATÉ A SAÍDA DO PACIENTE DA UNIDADE</div>
            </div>
            <div id="saída >> chegada ao destino" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: temposaidadestino.hours() > 1 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 1 hora.
                  temposaidadestino.minutes() > 30 && temposaidadestino.minutes() < 15 ? 'rgb(229, 126, 52, 1)' : // amarelo se 15 a 30 minutos.
                    'rgb(82, 190, 128, 1)' // verde se até 15 minutos.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{temposaidadestino.hours() + 'H ' + temposaidadestino.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE DESLOCAMENTO DA UNIDADE DE ORIGEM À UNIDADE DE DESTINO</div>
            </div>
            <div id="saída >> chegada ao destino" className='card'
              style={{
                width: '12vw', height: '14vw', padding: 10, margin: 10,
                backgroundColor: tempopermanenciageral.days() > 5 ? 'rgb(231, 76, 60, 1)' : // vermelho se > 5 dias.
                  tempopermanenciageral.days() > 3 && tempopermanenciageral.days() < 5 ? 'rgb(229, 126, 52, 1)' : // amarelo se 3 a 5 dias.
                    'rgb(82, 190, 128, 1)' // verde se até 3 dias.
              }}>
              <div className='text2' style={{ fontSize: 18, color: '#ffffff' }}>{tempopermanenciageral.hours() + 'H ' + tempopermanenciageral.minutes() + 'M'}</div>
              <div className='text2'>TEMPO MÉDIO DE DESLOCAMENTO DA UNIDADE DE ORIGEM À UNIDADE DE DESTINO</div>
            </div>
          </div>
        </div>
        <div className="card" style={{
          display: pacientes.length > 0 ? 'none' : 'flex',
          width: '80vw', backgroundColor: 'rgb(231, 76, 60, 0.7)',
          alignSelf: 'center', alignContent: 'center',
        }}>
          <div className='text3'
            style={{ color: '#ffffff', alignSelf: 'center', padding: 20 }}>
            SEM DADOS SUFICIENTES PARA GERAR INDICADORES GLOBAIS
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (pagina == 4) {
      mountArrayDaysInterval();
      loadPacientes();
    }
    // eslint-disable-next-line
  }, [pagina, datainicio, datatermino, arraydays]);

  // identificação do usuário.
  function Usuario() {
    return (
      <div style={{
        // position: 'absolute', top: 10, left: 10,
        display: 'flex', flexDirection: 'row', height: 70,
        // alignSelf: 'center',
      }}>
        <div className='button-red' style={{ maxHeight: 50, maxWidth: 50 }}
          onClick={() => setpagina(0)} title="SAIR">
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

  /* ## GRÁFICO 1 ##
  dataset1: AIHs cadastradas para o intervalo selecionado.
  dataset2: vagas liberadas para o intervalo selecionado.
  dataset3: altas de pacientes com AIH no intervalo selecionado.
  dataset4: óbitos de pacientes com AIH no intervalo selecionado. 
  */

  // definindo a quantidade de dias contidos no intervalo selecionado.
  const [arraydays, setarraydays] = useState([]);
  const [arraytodasaihs, setarraytodasaihs] = useState([]);
  const [arraynovasaihs, setarraynovasaihs] = useState([]);
  const [arrayativasaihs, setarrayativasaihs] = useState([]);
  const mountArrayDaysInterval = () => {
    setTimeout(() => {
      setarraydays([]);
      var adddate = moment(document.getElementById("inputDataInicio").value, 'DD/MM/YYYY');
      var localarraydays = [];
      while (adddate < datatermino) {
        adddate = adddate.add(1, 'day');
        localarraydays.push(adddate.format('DD/MM/YY'));
        setarraydays(localarraydays);
        console.log('ARRAY DATAS: ' + JSON.stringify(arraydays));
      }
    }, 1000);
  }

  // mapeando os registros de pacientes com AIH para cada data pesquisada.
  var vararraytodasaihs = [];
  const catchTodasAihsCadastradas = (data) => {
    vararraytodasaihs.push(pacientesgrafico.filter(item => moment(item.indicador_data_cadastro) < moment(data, 'DD/MM/YY')).length);
    setarraytodasaihs(vararraytodasaihs);
  }
  var vararraynovasaihs = [];
  const catchNovasAihsCadastradas = (data) => {
    vararraynovasaihs.push(pacientesgrafico.filter(item => moment(item.indicador_data_cadastro).startOf('day').diff(moment(data, 'DD/MM/YY'), 'days') == 0).length);
    setarraynovasaihs(vararraynovasaihs);
  }
  var vararrayativasaihs = [];
  const catchAtivasAihsCadastradas = (data) => {
    vararrayativasaihs.push(pacientesgrafico.filter(item => item.status == 'AGUARDANDO VAGA' && moment(item.indicador_data_cadastro) < moment(data, 'DD/MM/YY')).length);
    setarrayativasaihs(vararrayativasaihs);
  }

  const options = {
    scales: {
      y: {
        display: true,
        min: 0,
        // max: 30,
        ticks: {
          suggestedMin: 0,
          suggestedMax: 20,
          stepSize: 1,
        }
      }
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'GRÁFICO 1',
      },
    },
  };
  const labels = arraydays.map(item => moment(item, 'DD/MM/YY').format('DD/MM'));
  const data = {
    labels,
    datasets: [
      {
        label: "NOVAS AIH'S CADASTRADAS",
        data: arraynovasaihs.map(item => item),
        borderColor: 'rgb(133, 193, 233, 0.5)',
        backgroundColor: 'rgb(133, 193, 233, 0.2)',
        fill: true,
      },
      {
        label: "TOTAL DE AIH'S CADASTRADAS",
        data: arraytodasaihs.map(item => item),
        borderColor: 'rgb(82, 190, 128, 0.5)',
        backgroundColor: 'rgb(82, 190, 128, 0.2)',
        fill: true,
      },
      {
        label: "AIH'S AGUARDANDO VAGA",
        data: arrayativasaihs.map(item => item),
        borderColor: 'rgb(231, 76, 60, 0.5)',
        backgroundColor: 'rgb(231, 76, 60, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div className="main"
      style={{ display: pagina == 4 ? 'flex' : 'none', justifyContent: 'space-between' }}>
      <div
        style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
          width: 'calc(100vw - 20px)', padding: 10
        }}>
        <Usuario></Usuario>
        <FilterData></FilterData>
      </div>
      <div className='scroll'
        style={{
          margin: 10, padding: 10,
          // width: 'calc(100vw - 20px)',
          height: '75vh'
        }}>
        <IndicadoresGerais></IndicadoresGerais>
        {upas.map(item => getIndicadoresPorUnidade(pacientes, item.unidade))}
        <Line options={options} data={data} />
      </div>
    </div>
  );
}

export default Indicadores;