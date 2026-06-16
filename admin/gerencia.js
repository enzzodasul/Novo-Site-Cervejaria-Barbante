const API = "http://127.0.0.1:5000";

let pedidos = [];
let clientes = [];

// ======================
// CARREGAR DADOS
// ======================
async function carregar(){

pedidos = await fetch(API+"/pedidos").then(r=>r.json());
clientes = await fetch(API+"/clientes").then(r=>r.json());

renderDashboard();
renderPedidos();
renderClientes();
renderCaixa();
renderGrafico();

}

// ======================
// DASHBOARD
// ======================
function renderDashboard(){

let total = 0;
let abertos = 0;

pedidos.forEach(p=>{
total += Number(p.total || 0);
if(p.status !== "fechado") abertos++;
});

let ticket = pedidos.length ? total / pedidos.length : 0;

document.getElementById("faturamentoHoje").innerText =
total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

document.getElementById("faturamentoTotal").innerText =
total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

document.getElementById("pedidosAbertos").innerText = abertos;

document.getElementById("ticketMedio").innerText =
ticket.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

}

// ======================
// PEDIDOS
// ======================
function renderPedidos(){

let html = "";

pedidos.slice().reverse().forEach(p=>{

html += `
<div class="pedido">
<b>Mesa ${p.numero_mesa}</b><br>
Cliente: ${p.nome_cliente || "-"}<br>
Total: R$ ${p.total}<br>
Status: ${p.status}<br>

<button class="cancelar" onclick="cancelar(${p.id})">
Cancelar Pedido
</button>

</div>
`;

});

document.getElementById("pedidos").innerHTML = html;

}

// ======================
// CLIENTES CRM (POR TELEFONE)
// ======================
function renderClientes(){

const mapa = {};

clientes.forEach(c=>{

if(!c.telefone) return;

if(!mapa[c.telefone]){
mapa[c.telefone] = {
nome:c.nome,
telefone:c.telefone,
visitas:0
};
}

mapa[c.telefone].visitas++;

});

let html = "";

Object.values(mapa).forEach(c=>{

html += `
<div class="pedido">
<b>${c.nome}</b><br>
📞 ${c.telefone}<br>
🔁 Visitas: ${c.visitas}
</div>
`;

});

document.getElementById("clientes").innerHTML = html;

}

// ======================
// CAIXA
// ======================
function renderCaixa(){

let pix=0,dinheiro=0,cartao=0;

pedidos.forEach(p=>{

if(p.forma_pagamento=="pix") pix += Number(p.total || 0);
if(p.forma_pagamento=="dinheiro") dinheiro += Number(p.total || 0);
if(p.forma_pagamento=="cartao") cartao += Number(p.total || 0);

});

document.getElementById("caixa").innerHTML = `
PIX: R$ ${pix}<br>
DINHEIRO: R$ ${dinheiro}<br>
CARTÃO: R$ ${cartao}
`;

}

// ======================
// GRÁFICO SIMPLES
// ======================
function renderGrafico(){

const dias = {};

pedidos.forEach(p=>{

let dia = (p.criado_em || "").split(" ")[0];

dias[dia] = (dias[dia] || 0) + Number(p.total || 0);

});

new Chart(document.getElementById("graficoVendas"),{
type:"line",
data:{
labels:Object.keys(dias),
datasets:[{
label:"Vendas",
data:Object.values(dias),
borderColor:"#00ff88"
}]
}
});

}

// ======================
// CANCELAR PEDIDO
// ======================
async function cancelar(id){

await fetch(API+"/pedido/cancelar/"+id,{
method:"POST"
});

carregar();

}

carregar();
setInterval(carregar,3000);