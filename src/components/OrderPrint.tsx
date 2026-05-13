"use client";

export const OrderPrint = ({ order }: { order: any }) => {
  if (!order) return null;

  return (
    <div className="print-only">
      <div style={{ width: '58mm', padding: '10px', color: '#000', backgroundColor: '#fff', fontSize: '12px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '16px', margin: 0 }}>{order.lojista_nome || 'Pedido'}</h2>
          <p style={{ margin: '5px 0' }}>----------------------------</p>
          <p style={{ fontWeight: 'bold' }}>PEDIDO #{order.id?.slice(-4).toUpperCase()}</p>
        </div>

        <div style={{ marginBottom: '10px' }}>
          {order.itens?.map((item: any, index: number) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.quantidade}x {item.nome}</span>
                <span style={{ marginLeft: 'auto' }}>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
              </div>
              {item.obs && <p style={{ fontSize: '10px', margin: '2px 0 0 10px italic' }}>* {item.obs}</p>}
            </div>
          ))}
        </div>

        <p style={{ borderTop: '1px dashed #000', paddingTop: '5px' }}>
          <strong>TOTAL: R$ {order.total?.toFixed(2)}</strong>
        </p>
        
        <div style={{ marginTop: '10px', fontSize: '10px' }}>
          <p><strong>PAGAMENTO:</strong> {order.metodo_pagamento}</p>
          <p><strong>ENTREGA:</strong> {order.endereco || 'Retirada no Balcão'}</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
          <p>----------------------------</p>
          <p>Obrigado pela preferência!</p>
        </div>
      </div>
    </div>
  );
};