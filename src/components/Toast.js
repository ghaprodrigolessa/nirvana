/* eslint eqeqeq: "off" */
import React, { useContext } from 'react';
import Context from '../pages/Context';

function Toast() {

  const {
    toast,
  } = useContext(Context)

  return (
    <div className="toasty"
      style={{ zIndex: 999, position: 'fixed', bottom: 20, right: 20 }}>
      <div
        style={{
          display: toast.display,
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: toast.cor,
          padding: 10,
          minHeight: 50,
          maxHeight: 300,
          minWidth: 100,
          maxWidth: 300,
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 14,
          borderRadius: 5,
        }}>
        {toast.mensagem}
      </div>
    </div >
  );
}

export default Toast;
