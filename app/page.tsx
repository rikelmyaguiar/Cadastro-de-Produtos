'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { Product } from '../src/interfaces/Product';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado de edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // Confirmação de exclusão
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  async function loadProducts() {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (error) {
      setErrorMsg('Não foi possível carregar os produtos.');
      setLoading(false);
      return;
    }
    setProducts(data as Product[]);
    setLoading(false);
  }

  async function addProduct() {
    if (!name.trim()) return alert('O nome é obrigatório');

    const priceNum = Number(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) return alert('Preço inválido');

    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) return alert('Estoque inválido');

    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.from('products').insert([
      {
        name: name.trim(),
        description: description.trim() || null,
        sku: sku.trim() || null,
        price: priceNum,
        stock: stockNum,
      },
    ]);

    if (error) {
      if (error.code === '23505') setErrorMsg('Erro: SKU já existe (duplicado)');
      else if (error.code === '23502') setErrorMsg('Erro: Campo obrigatório não preenchido');
      else setErrorMsg('Erro ao adicionar produto: ' + error.message);
      setLoading(false);
      return;
    }

    setName('');
    setDescription('');
    setSku('');
    setPrice('');
    setStock('0');
    showSuccess('Produto adicionado com sucesso!');
    await loadProducts();
    setLoading(false);
  }

  // Abre o modo de edição preenchendo os campos com os dados atuais
  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDescription(p.description ?? '');
    setEditSku(p.sku ?? '');
    setEditPrice(String(p.price).replace('.', ','));
    setEditStock(String(p.stock));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return alert('O nome é obrigatório');

    const priceNum = Number(editPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) return alert('Preço inválido');

    const stockNum = Number(editStock);
    if (isNaN(stockNum) || stockNum < 0) return alert('Estoque inválido');

    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase
      .from('products')
      .update({
        name: editName.trim(),
        description: editDescription.trim() || null,
        sku: editSku.trim() || null,
        price: priceNum,
        stock: stockNum,
      })
      .eq('id', id);

    if (error) {
      if (error.code === '23505') setErrorMsg('Erro: SKU já existe (duplicado)');
      else setErrorMsg('Erro ao atualizar produto: ' + error.message);
      setLoading(false);
      return;
    }

    setEditingId(null);
    showSuccess('Produto atualizado com sucesso!');
    await loadProducts();
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      setErrorMsg('Erro ao excluir produto: ' + error.message);
      setLoading(false);
      return;
    }

    setConfirmDeleteId(null);
    showSuccess('Produto excluído.');
    await loadProducts();
    setLoading(false);
  }

  const inputStyle = {
    padding: '10px',
    fontSize: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  const btnPrimary = {
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  const btnDanger = {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  const btnSecondary = {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  const btnEdit = {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  const btnSuccess = {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '750px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '24px', color: '#111827' }}>Cadastro de Produtos</h1>

      {/* Mensagens de feedback */}
      {errorMsg && (
        <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', marginBottom: '16px', fontWeight: '600' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '12px', marginBottom: '16px', fontWeight: '600' }}>{successMsg}</div>
      )}

      {/* Formulário de adição */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#374151' }}>Novo Produto</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          <input placeholder="Nome *" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <textarea placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          <input placeholder="SKU (opcional)" value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} maxLength={30} style={inputStyle} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input placeholder="Preço * (ex: 99,90)" value={price} onChange={(e) => setPrice(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <input type="number" placeholder="Estoque" value={stock} onChange={(e) => setStock(e.target.value)} min={0} style={{ ...inputStyle, width: '130px' }} />
          </div>
          <button onClick={addProduct} disabled={loading} style={{ ...btnPrimary, padding: '12px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Aguarde...' : '+ Adicionar Produto'}
          </button>
        </div>
      </div>

      {/* Lista de produtos */}
      <h2 style={{ marginBottom: '16px', color: '#111827' }}>Produtos cadastrados</h2>

      {loading && <p style={{ color: '#6b7280' }}>Carregando...</p>}

      {products.length === 0 && !loading ? (
        <p style={{ color: '#9ca3af' }}>Nenhum produto cadastrado ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((p) => (
            <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: 'white' }}>
              {/* Modo visualização */}
              {editingId !== p.id ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '16px', color: '#111827' }}>{p.name}</strong>
                      {p.description && <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>{p.description}</p>}
                      <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                        SKU: <span style={{ color: '#374151' }}>{p.sku || '—'}</span>
                        &nbsp;&nbsp;|&nbsp;&nbsp; Estoque: <span style={{ color: '#374151' }}>{p.stock} unid.</span>
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '17px', fontWeight: '700', color: '#15803d' }}>R$ {Number(p.price).toFixed(2).replace('.', ',')}</div>
                    </div>

                    {/* Botões de ação */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => startEdit(p)} style={btnEdit}>
                        ✏️ Editar
                      </button>

                      {confirmDeleteId === p.id ? (
                        <>
                          <button onClick={() => deleteProduct(p.id)} disabled={loading} style={btnDanger}>
                            Confirmar
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} style={btnSecondary}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(p.id)} style={btnDanger}>
                          🗑 Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Modo edição inline */
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Editando produto</div>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome *" style={inputStyle} />
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Descrição (opcional)" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                  <input value={editSku} onChange={(e) => setEditSku(e.target.value.toUpperCase())} placeholder="SKU (opcional)" maxLength={30} style={inputStyle} />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Preço *" style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} placeholder="Estoque" min={0} style={{ ...inputStyle, width: '130px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => saveEdit(p.id)} disabled={loading} style={{ ...btnSuccess, opacity: loading ? 0.6 : 1 }}>
                      💾 Salvar
                    </button>
                    <button onClick={cancelEdit} style={btnSecondary}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
