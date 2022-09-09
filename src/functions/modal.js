const modal = (setdialogo, id, mensagem, funcao, parametros) => {
  setdialogo({
    id: id,
    mensagem: mensagem,
    funcao: funcao,
    parametros: parametros
  });
  console.log('ID: ' + id);
}

export default modal;
