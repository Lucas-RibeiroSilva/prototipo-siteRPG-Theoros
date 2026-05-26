/* Menu lateral: abre e fecha o painel de navegação */
function chamarMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('aberto');
}

function fecharMenu() {
    const menu = document.getElementById('menu');
    menu.classList.remove('aberto');
}
