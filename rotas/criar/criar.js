/* Menu lateral: abre e fecha o painel de navegação */
function chamarMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('aberto');
}

function fecharMenu() {
    const menu = document.getElementById('menu');
    menu.classList.remove('aberto');
}

/* Preview da imagem: mostra a imagem selecionada pelo usuário */
function mostrarPreview(event) {
    const input = event.target;
    const preview = document.getElementById('preview');
    const textoPlaceholder = document.querySelector('#personagem-imagem p');
    const arquivo = input.files && input.files[0];

    if (!arquivo) {
        return;
    }

    const leitor = new FileReader();
    leitor.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        textoPlaceholder.style.display = 'none';
    };

    leitor.readAsDataURL(arquivo);
}
