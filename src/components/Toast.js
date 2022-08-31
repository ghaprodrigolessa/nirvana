/* eslint eqeqeq: "off" */
import React, { useState, useEffect } from 'react';

function Toast({ valortoast, cor, mensagem }) {
  const [viewtoast, setviewtoast] = useState(0);
  useEffect(() => {
    setviewtoast(valortoast);
  }, [valortoast])

  if (viewtoast === 1) {
    return (
      <div className="toast" style={{ zIndex: 999, position: 'fixed', top: 0, bottom: 0, left: 0, right: 0 }}>
        <div className="menucover">
          <div
            className="secondary"
            style={{
              alignItems: 'center',
              textAlign: 'center',
              backgroundColor: cor,
              padding: 25,
              minHeight: 50,
              maxHeight: 300,
              minWidth: 100,
              maxWidth: 300,
              color: '#ffffff',
              fontWeight: 'bold',
            }}>
            {mensagem}
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default Toast;
