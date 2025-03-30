
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('produtoForm');
    const tabela = document.getElementById('tabelaProdutos').querySelector('tbody');
    const salvarBtn = document.getElementById('salvarBtn');
    const cancelarBtn = document.getElementById('cancelarBtn');
    let editandoId = null;

    // Carregar produtos
    async function carregarProdutos() {
        try {
            const response = await fetch('http://localhost:3000/produtos');
            const produtos = await response.json();
            
            tabela.innerHTML = produtos.map(produto => `
                <tr>
                    <td>${produto.nome}</td>
                    <td>${produto.codigo}</td>
                    <td>${produto.descricao || '-'}</td>
                    <td>R$ ${Number(produto.preco).toFixed(2)}</td>
                    <td>
                        <button onclick="editarProduto(this)"
                                data-id="${produto.id}"
                                data-nome="${produto.nome}"
                                data-codigo="${produto.codigo}"
                                data-descricao="${produto.descricao || ''}"
                                data-preco="${produto.preco}">Editar</button>
                        <button onclick="excluirProduto(${produto.id})">Excluir</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            alert('Erro ao carregar produtos');
        }
    }

    // Formulário submit
    form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const produto = {
        nome: document.getElementById('nome').value,
        codigo: document.getElementById('codigo').value,
        descricao: document.getElementById('descricao').value,
        preco: parseFloat(document.getElementById('preco').value)
    };

    try {
        if (window.editandoId) {
            // Atualiza o produto existente
            await fetch(`http://localhost:3000/produtos/${window.editandoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto)
            });
        } else {
            // Adiciona novo produto
            await fetch('http://localhost:3000/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto)
            });
        }
        
        form.reset();
        window.editandoId = null;
        document.getElementById('salvarBtn').textContent = 'Salvar';
        carregarProdutos();
    } catch (error) {
        alert('Erro ao salvar produto');
    }
});

    // Cancelar edição
    cancelarBtn.addEventListener('click', () => {
        form.reset();
        editandoId = null;
        salvarBtn.textContent = 'Salvar';
        cancelarBtn.style.display = 'none';
    });

    // Funções globais para os botões
    window.editarProduto = function(botaoEditar) {
        // Pega os dados diretamente do botão clicado
        const id = botaoEditar.getAttribute('data-id');
        const nome = botaoEditar.getAttribute('data-nome');
        const codigo = botaoEditar.getAttribute('data-codigo');
        const descricao = botaoEditar.getAttribute('data-descricao');
        const preco = botaoEditar.getAttribute('data-preco');
        
        // Preenche o formulário
        document.getElementById('nome').value = nome;
        document.getElementById('codigo').value = codigo;
        document.getElementById('descricao').value = descricao;
        document.getElementById('preco').value = preco;
        
        // Armazena o ID que está sendo editado
        window.editandoId = id;
        
        // Muda o texto do botão para "Atualizar"
        document.getElementById('salvarBtn').textContent = 'Atualizar';
    };
    window.excluirProduto = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        
        try {
            const response = await fetch(`http://localhost:3000/produtos/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Erro ao excluir');
            
            carregarProdutos();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir produto");
        }
    };

    // Carregar produtos ao iniciar
    carregarProdutos();
});


