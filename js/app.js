const produtosContainer =
document.getElementById("produtos");

const modal =
document.getElementById("modalProduto");

const overlay =
document.getElementById("overlay");

const modalImagem =
document.getElementById("modalImagem");

const modalNome =
document.getElementById("modalNome");

const modalDescricao =
document.getElementById("modalDescricao");

const modalPreco =
document.getElementById("modalPreco");

const fecharModal =
document.getElementById("fecharModal");

const campoBusca =
document.getElementById("campoBusca");

const botoesCategoria =
document.querySelectorAll(".categoria-btn");

const carrinho =
document.getElementById("carrinho");

const btnCarrinho =
document.getElementById("btnCarrinho");

const fecharCarrinho =
document.getElementById("fecharCarrinho");

const contadorCarrinho =
document.getElementById("contadorCarrinho");

const itensCarrinho =
document.getElementById("itensCarrinho");

const valorTotal =
document.getElementById("valorTotal");

const btnAdicionarCarrinho =
document.getElementById("btnAdicionarCarrinho");

const quantidadeAtual =
document.getElementById("quantidadeAtual");

const btnMaisQtd =
document.getElementById("maisQtd");

const btnMenosQtd =
document.getElementById("menosQtd");

let categoriaAtual = "Todos";

let produtoSelecionado = null;

let quantidadeSelecionada = 1;

let carrinhoItens = [];



const API = "http://127.0.0.1:5000";

let mesaAtual = null;

async function identificarMesa() {

    const params =
    new URLSearchParams(
        window.location.search
    );

    const token =
    params.get("token");

    if(!token){

        alert(
            "Mesa não identificada."
        );

        return;
    }

    try{

        const resposta =
        await fetch(
            API +
            "/mesa-token/" +
            token
        );

        const resultado =
        await resposta.json();

        if(!resultado.sucesso){

            alert(
                "Token inválido."
            );

            return;
        }

        mesaAtual =
        resultado.mesa;

        console.log(
            "Mesa detectada:",
            mesaAtual
        );

    }catch(erro){

        console.error(erro);

        alert(
            "Erro ao identificar mesa."
        );
    }

}






let clienteId =
localStorage.getItem(
    "cliente_id"
);

let clienteNome =
localStorage.getItem(
    "cliente_nome"
);

/* ========================= */
/* FORMATAR PREÇO */
/* ========================= */

function formatarPreco(valor){

    if(typeof valor === "string"){

        return valor;
    }

    return valor.toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );
}

/* ========================= */
/* GERAR CARD */
/* ========================= */

function criarCard(produto){

    return `
    
    <div
    class="produto-card"
    data-id="${produto.id}">

        <img
        src="${produto.imagem}"
        alt="${produto.nome}"
        class="produto-imagem">

        <div class="produto-info">

            <h3>
                ${produto.nome}
            </h3>

            <div class="produto-preco">

                ${
                    typeof produto.preco === "number"
                    ?
                    formatarPreco(produto.preco)
                    :
                    `R$ ${produto.preco}`
                }

            </div>

        </div>

    </div>

    `;
}



const modalCliente =
document.getElementById(
    "modalCliente"
);

const btnSalvarCliente =
document.getElementById(
    "btnSalvarCliente"
);

if(clienteId){

    modalCliente.style.display =
    "none";

}else{

    btnSalvarCliente.addEventListener(
        "click",
        async ()=>{

            const nome =
            document
            .getElementById(
                "nomeClienteModal"
            ).value;

            const telefone =
            document
            .getElementById(
                "telefoneClienteModal"
            ).value;

            const mesa =
            mesaAtual;

            if(!nome){

                alert(
                    "Informe seu nome."
                );

                return;
            }

            if(!mesaAtual){

                alert(
                    "Informe primeiro o número da mesa."
                );

                return;
            }

            const resposta =
            await fetch(
                "http://127.0.0.1:5000/cliente",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":
                        "application/json"
                    },
                    body:JSON.stringify({

                        numero_mesa:
                        Number(mesa),

                        nome,

                        telefone

                    })
                }
            );

            const resultado =
            await resposta.json();

            if(resultado.sucesso){

                localStorage.setItem(
                    "cliente_id",
                    resultado.cliente_id
                );

                localStorage.setItem(
                    "cliente_nome",
                    nome
                );

                clienteId =
                resultado.cliente_id;

                modalCliente.style.display =
                "none";

            }

        }
    );

}



/* ========================= */
/* RENDER */
/* ========================= */

function renderizarProdutos(){

    let produtosFiltrados =
    window.cardapio;

    if(categoriaAtual !== "Todos"){

        produtosFiltrados =
        produtosFiltrados.filter(
            produto =>
            produto.categoria === categoriaAtual
        );
    }

    const busca =
    campoBusca.value.toLowerCase();

    produtosFiltrados =
    produtosFiltrados.filter(produto =>

        produto.nome
        .toLowerCase()
        .includes(busca)
    );

    produtosContainer.innerHTML =
    produtosFiltrados
    .map(criarCard)
    .join("");

    adicionarEventosCards();
}

/* ========================= */
/* EVENTOS CARD */
/* ========================= */

function adicionarEventosCards(){

    const cards =
    document.querySelectorAll(".produto-card");

    cards.forEach(card => {

        card.addEventListener("click", () => {

            const id =
            Number(card.dataset.id);

            const produto =
            cardapio.find(
                item => item.id === id
            );

            abrirModal(produto);
        });

    });

}

/* ========================= */
/* MODAL */
/* ========================= */

function abrirModal(produto){

    produtoSelecionado =
    produto;

    quantidadeSelecionada = 1;

    quantidadeAtual.textContent =
    quantidadeSelecionada;

    modalImagem.src =
    produto.imagem;

    modalNome.textContent =
    produto.nome;

    modalDescricao.textContent =
    produto.descricao;

    modalPreco.textContent =

    typeof produto.preco === "number"

    ?

    formatarPreco(produto.preco)

    :

    `R$ ${produto.preco}`;

    modal.classList.add("active");

    overlay.classList.add("active");
}

function fecharModalProduto(){

    modal.classList.remove("active");

    overlay.classList.remove("active");
}

fecharModal.addEventListener(
    "click",
    fecharModalProduto
);

/* ========================= */
/* QUANTIDADE */
/* ========================= */

btnMaisQtd.addEventListener(
    "click",
    () => {

        quantidadeSelecionada++;

        quantidadeAtual.textContent =
        quantidadeSelecionada;
    }
);

btnMenosQtd.addEventListener(
    "click",
    () => {

        if(
            quantidadeSelecionada > 1
        ){

            quantidadeSelecionada--;

            quantidadeAtual.textContent =
            quantidadeSelecionada;
        }
    }
);

/* ========================= */
/* CARRINHO */
/* ========================= */

btnAdicionarCarrinho.addEventListener(
    "click",
    () => {

        carrinhoItens.push({

            ...produtoSelecionado,

            quantidade:
            quantidadeSelecionada

        });

        atualizarCarrinho();

        fecharModalProduto();
    }
);

function atualizarCarrinho(){

    contadorCarrinho.textContent =
    carrinhoItens.length;

    itensCarrinho.innerHTML = "";

    let total = 0;

    carrinhoItens.forEach(item => {

        const div =
        document.createElement("div");

        div.className =
        "item-carrinho";

        let subtotal = 0;

        if(
            typeof item.preco ===
            "number"
        ){

            subtotal =
            item.preco *
            item.quantidade;

            total += subtotal;
        }

        div.innerHTML = `

        <div
        style="
        padding:12px;
        border-bottom:1px solid #2b2b2b;
        ">

            <strong>

                ${item.nome}

            </strong>

            <br>

            ${item.quantidade}x

            ${
                typeof item.preco === "number"
                ?
                formatarPreco(item.preco)
                :
                item.preco
            }

        </div>

        `;

        itensCarrinho.appendChild(div);
    });

    valorTotal.textContent =
    formatarPreco(total);
}

/* ========================= */
/* ABRIR CARRINHO */
/* ========================= */

btnCarrinho.addEventListener(
    "click",
    () => {

        carrinho.classList.add(
            "active"
        );

        overlay.classList.add(
            "active"
        );
    }
);

fecharCarrinho.addEventListener(
    "click",
    () => {

        carrinho.classList.remove(
            "active"
        );

        overlay.classList.remove(
            "active"
        );
    }
);

/* ========================= */
/* OVERLAY */
/* ========================= */

overlay.addEventListener(
    "click",
    () => {

        modal.classList.remove(
            "active"
        );

        carrinho.classList.remove(
            "active"
        );

        overlay.classList.remove(
            "active"
        );
    }
);

/* ========================= */
/* BUSCA */
/* ========================= */

campoBusca.addEventListener(
    "input",
    renderizarProdutos
);

/* ========================= */
/* CATEGORIAS */
/* ========================= */

botoesCategoria.forEach(botao => {

    botao.addEventListener(
        "click",
        () => {

            botoesCategoria.forEach(
                btn =>
                btn.classList.remove(
                    "active"
                )
            );

            botao.classList.add(
                "active"
            );

            categoriaAtual =
            botao.dataset.categoria;

            renderizarProdutos();
        }
    );

});

/* ========================= */
/* FINALIZAR */
/* ========================= */

document
.getElementById("btnFinalizar")
.addEventListener(
    "click",
    async () => {

        
        const mesa = mesaAtual;

       if (!mesaAtual) {

         alert("Mesa não identificada.");

        return;
}



        const nomeCliente =
         document.getElementById(
         "nomeCliente"
        ).value;

        if(!nomeCliente){

         alert(
               "Informe seu nome."
         );

    return;
}
        if (carrinhoItens.length === 0) {

            alert("Carrinho vazio.");

            return;
        }

        try {

            const resposta =
            await fetch(
                "http://127.0.0.1:5000/novo-pedido",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({

                     mesa: Number(mesa),

                     nome_cliente:
                     document.getElementById(
                     "nomeCliente"
                     ).value,

                    telefone:
                     document.getElementById(
                    "telefoneCliente"
                     ).value,

                       observacao: "",

                     itens: carrinhoItens

                }) 
                }
            );

            const resultado =
            await resposta.json();

            if (resultado.sucesso) {

                alert(
                    `Pedido #${resultado.pedido_id} enviado para a cozinha!`
                );

                carrinhoItens = [];

                atualizarCarrinho();

               

            } else {

                alert(resultado.erro);
            }

        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao conectar com o servidor."
            );
        }
    }
);
/* ========================= */
/* INICIAR */
/* ========================= */

(async ()=>{

    await identificarMesa();

    renderizarProdutos();

})();