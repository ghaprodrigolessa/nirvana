const modal = (setdialogo, id, mensagem, funcao) => {
  setdialogo({
    id: id,
    mensagem: mensagem,
    funcao: funcao
  });
  console.log('ID: ' + id);
}

export default modal;
