/* MENU LATERAL - Controla a abertura e fechamento do menu de navegação */

function chamarMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('aberto');
}
function fecharMenu() {
    const menu = document.getElementById('menu');
    menu.classList.remove('aberto');
}


/* CARROSSEL - Sistema de deslizamento com suporte a arrastar com mouse/touch */

/**
 * createCarousel(carouselId, trackId, total)
 * 
 * Cria um carrossel interativo com suporte a mouse e touch
 * 
 * Parâmetros:
 * @param {string} carouselId - ID do container do carrossel (elemento que corta o conteúdo)
 * @param {string} trackId - ID do track (elemento que contém os slides)
 * @param {number} total - Quantidade total de slides no carrossel
 * 
 * Comportamento:
 * - Permite arrastar slides para esquerda/direita
 * - Suporta touch em dispositivos móveis
 * - Anima a transição entre slides
 * - Mostra "peek" (preview) do próximo slide
 */

function createCarousel(carouselId, trackId, total) {
    let cur = 0; // Índice do slide atual (começa em 0)
    const carousel = document.getElementById(carouselId);
    const track = document.getElementById(trackId);
    const slides = Array.from(track ? track.querySelectorAll('.slide') : []);
    if (!carousel || !track || slides.length === 0) return;

    /**
     * CONSTANTES DO CARROSSEL
     */

    const GAP = 12;   // Espaço (gap) entre slides no CSS

    /**
     * peek() - Largura em pixels do slide vizinho visível (preview do próximo slide)
     * Ajusta dinamicamente baseado na largura da tela para evitar bugs em mobile
     */
    function peek() {
        return window.innerWidth <= 768 ? 70 : 150; // 110px para desktop, 70px para mobile
    }

    /**
     * sw() - Screen Width do carrossel visível
     * Calcula a largura disponível para cada slide
     * 
     * Fórmula: offsetWidth do carousel - (peek() em ambos os lados)
     * Exemplo: Se carousel tem 900px e peek() é 110px:
     *   - 900 - (2 * 110) = 680px de largura por slide
     */

    function sw() {
        if (window.innerWidth <= 768) {
            return carousel.offsetWidth - 2.1 * peek();
        }
        return carousel.offsetWidth - 0 * peek();
    }

    /**
     * offset(n) - Calcula a posição de translação para o slide n
     * 
     * Fórmula: peek() - n * (largura_slide + gap)
     * 
     * Explicação:
     * - peek() posiciona o slide ativo na borda esquerda
     * - n * (sw() + GAP) move para a direita de acordo com o índice
     * 
     * Exemplo com n=0 (primeiro slide):
     *   offset(0) = 110 - 0 * (680 + 12) = 110px
     * 
     * Exemplo com n=1 (segundo slide):
     *   offset(1) = 110 - 1 * (692) = 110 - 692 = -582px
     *   (Move 582 pixels para a esquerda)
     */

    function offset(n) {
        return peek() - n * (sw() + GAP);
    }

    /**
     * applyStyles(dragProgress, dragDir)
     * Aplica transformações de escala, opacidade e z-index aos slides
     * 
     * Parâmetros:
     * @param {number} dragProgress - Progresso do arraste (0 a 1)
     * @param {number} dragDir - Direção do arraste (positivo/negativo/zero)
     * 
     * Lógica de estilos aplicados:
     * 1. Slide atual (i === cur):
     *    - Encolhe: scale(1 - 0.04 * p) = 96% a 100%
     *    - Desaparece: opacity(1 - 0.12 * p) = 88% a 100%
     *    - Fica atrás: z-index 2
     * 
     * 2. Slide chegando (i === ni):
     *    - Cresce: scale(0.95 + 0.05 * p) = 95% a 100%
     *    - Aparece: opacity(0.55 + 0.45 * p) = 55% a 100%
     *    - Fica na frente: z-index 3
     * 
     * 3. Slides vizinhos (|i - cur| === 1):
     *    - Em repouso: scale(0.95), opacity(0.55), z-index 1
     * 
     * 4. Outros slides:
     *    - Menores e transparentes: scale(0.92), opacity(0.3), z-index 1
     */

    function applyStyles(dragProgress, dragDir) {
        const p = Math.min(1, Math.abs(dragProgress)); // Limita p entre 0 e 1
        // Calcula qual slide está "chegando" (sendo puxado para o centro)
        const ni = dragDir < 0 ? cur + 1 : dragDir > 0 ? cur - 1 : -1;

        slides.forEach((slide, i) => {
            if (i === cur) {
                // Slide ativo: encolhe e desaparece durante o drag
                slide.style.transform = `scale(${1 - p * 0.04})`;
                slide.style.opacity = `${1 - p * 0.12}`;
                slide.style.zIndex = '2';
            } else if (i === ni) {
                // Slide chegando: cresce e aparece POR CIMA do atual
                slide.style.transform = `scale(${0.95 + p * 0.05})`;
                slide.style.opacity = `${0.55 + p * 0.45}`;
                slide.style.zIndex = '3';
            } else if (Math.abs(i - cur) === 1) {
                // Vizinhos em repouso (preview estático à direita/esquerda)
                slide.style.transform = 'scale(0.75)';
                slide.style.opacity = '0.2';
                slide.style.zIndex = '1';
            } else {
                // Outros slides: muito pequenos e transparentes
                slide.style.transform = 'scale(0.92)';
                slide.style.opacity = '0.5';
                slide.style.zIndex = '1';
            }
        });
    }

    /**
     * setTransitions(enabled)
     * Ativa ou desativa transições CSS suave nos slides
     * 
     * Quando enabled = true:
     *   - Aplica transição suave de 0.35s com easing 'ease'
     *   - Usado após o arraste para animação suave
     * 
     * Quando enabled = false:
     *   - Remove transições (transition: none)
     *   - Usado durante o arraste para movimento instantâneo
     */

    function setTransitions(enabled) {
        const transition = enabled
            ? 'transform 0.35s ease, opacity 0.35s ease, box-shadow 0.35s ease'
            : 'none';
        slides.forEach(slide => {
            slide.style.transition = transition;
        });
    }

    /**
     * triggerAnim(index)
     * Dispara animação de "snap" (encaixe) no slide específico
     * 
     * Processo:
     * 1. Remove classe 'snap-in' se existir
     * 2. Força recalcular CSS do elemento (void offsetWidth)
     * 3. Adiciona classe 'snap-in' novamente
     * 4. Ao terminar a animação, remove a classe
     */

    function triggerAnim(index) {
        const slide = slides[index];
        slide.classList.remove('snap-in');
        void slide.offsetWidth; // Force repaint
        slide.classList.add('snap-in');
        slide.addEventListener('animationend', () => {
            slide.classList.remove('snap-in');
        }, { once: true });
    }

    /**
     * goTo(index, skipAnimation)
     * Move o carrossel para um slide específico
     * 
     * Parâmetros:
     * @param {number} index - Índice do slide de destino
     * @param {boolean} skipAnimation - Se true, não dispara animação de snap
     * 
     * Processo:
     * 1. Salva índice anterior (previous)
     * 2. Limita index entre 0 e total-1
     * 3. Ativa transições suave
     * 4. Calcula nova posição usando offset()
     * 5. Aplica transformação CSS ao track
     * 6. Dispara animação se slide mudou
     */

    function goTo(index, skipAnimation) {
        const previous = cur;
        cur = Math.max(0, Math.min(total - 1, index)); // Limita entre 0 e total-1
        setTransitions(true); // Ativa transição suave
        track.classList.remove('no-transition');
        track.style.transform = `translateX(${offset(cur)}px)`;
        applyStyles(0, 0); // Reseta estado de arraste
        if (!skipAnimation && previous !== cur) {
            triggerAnim(cur); // Anima apenas se slide mudou
        }
    }

    /**
     * VARIÁVEIS DE CONTROLE DO ARRASTE
    */

    let startX = 0;        // Posição X inicial do mouse/touch
    let startY = 0;        // Posição Y inicial do mouse/touch
    let isDragging = false; // Flag indicando se está arrastando
    let dragX = 0;         // Distância em pixels arrastada no eixo X

    /**
     * onStart(x, y)
     * Inicia o arraste do carrossel
     * 
     * Disparado em:
     * - mousedown (mouse)
     * - touchstart (toque)
     * 
     * Ações:
     * 1. Salva posição inicial (x, y)
     * 2. Marca como arrastando
     * 3. Remove transições para feedback instantâneo
     * 4. Adiciona classe 'dragging' para mudar cursor
    */
    function onStart(x, y) {
        startX = x;
        startY = y;
        isDragging = true;
        dragX = 0;
        track.classList.add('no-transition'); // Remove animações
        setTransitions(false);
        carousel.classList.add('dragging'); // Muda cursor para 'grabbing'
    }

    /**
     * onMove(x, y)
     * Atualiza posição do carrossel durante o arraste
     * 
     * Lógica:
     * 1. Calcula distância arrastada: dragX = x - startX
     * 2. Calcula distância vertical: dy = y - startY
     * 3. Se movimento vertical > horizontal + 10px: cancela arraste (scroll vertical)
     * 4. Calcula nova posição: base + dragX * 0.92 (reduz velocidade)
     * 5. Limita movimento entre min e max offsets
     * 6. Aplica transformação CSS ao track
     * 7. Atualiza estilos dos slides (escala/opacidade)
    */
    function onMove(x, y) {
        if (!isDragging) return;
        dragX = x - startX; // Distância em pixels
        const dy = y - startY;
        // Detecta scroll vertical e cancela arraste
        if (Math.abs(dy) > Math.abs(dragX) + 10) {
            onEnd();
            return;
        }

        // Calcula posição com desaceleração (0.92)
        const base = offset(cur);
        const minOffset = offset(total - 1); // Máximo deslocamento à esquerda
        const maxOffset = offset(0);         // Mínimo deslocamento (início)
        const moved = Math.max(minOffset, Math.min(maxOffset, base + dragX * 0.92));
        
        track.style.transform = `translateX(${moved}px)`;
        applyStyles(dragX / sw(), dragX); // Feedback visual
    }

    /**
     * onEnd()
     * Finaliza o arraste e decide para qual slide ir
     * 
     * Lógica:
     * 1. Calcula threshold (limiar): 28% da largura do carousel
     * 2. Se dragX < -threshold: avança para próximo slide (arrastar para esquerda)
     * 3. Se dragX > +threshold: volta para slide anterior (arrastar para direita)
     * 4. Caso contrário: volta para slide atual
     * 
     * Exemplo com carousel 900px:
     *   - threshold = 900 * 0.28 = 252px
     *   - Se arrastar > 252px para esquerda: próximo slide
     *   - Se arrastar > 252px para direita: slide anterior
     */
    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        carousel.classList.remove('dragging'); // Muda cursor de volta
        
        // Distância mínima para aceitar como "deslize"
        const threshold = carousel.offsetWidth * 0.28; // 28% da largura
        
        if (dragX < -threshold) goTo(cur + 1);      // Arrastar esquerda = próximo
        else if (dragX > threshold) goTo(cur - 1);  // Arrastar direita = anterior
        else goTo(cur);                              // Volttar ao atual
    }

    /**
     * LISTENERS DE EVENTOS - MOUSE
     */
    carousel.addEventListener('mousedown', e => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => { if (isDragging) onMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', onEnd);

    /**
     * LISTENERS DE EVENTOS - TOUCH (Mobile)
     */
    carousel.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener('touchmove', e => { if (isDragging) onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchend', onEnd);
    carousel.addEventListener('touchcancel', onEnd);

    // Inicializa no primeiro slide
    goTo(0, true);

    // Recalcula a posição do carrossel em caso de redimensionamento
    window.addEventListener('resize', () => goTo(cur, true));
}

/**
 * INICIALIZAÇÃO DOS CARROSSÉIS
 * Cria dois carrosséis independentes na página
 */
createCarousel('carousel-sets', 'track-sets', 4);           // Carrossel de sets padrão
createCarousel('carousel-comunidade', 'track-comunidade', 4); // Carrossel de fichas da comunidade

