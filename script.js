let recognition;
let recentWords = [];
let translationEnabled = true; // Controle para ativar/desativar a tradução

// Verifica se o navegador suporta a Web Speech API
if (!('webkitSpeechRecognition' in window)) {
    alert("Desculpe, a Web Speech API não é suportada neste navegador.");
} else {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Continua reconhecendo até que você pare de falar
    recognition.lang = "pt-BR"; // Define o idioma para português
    recognition.interimResults = true; // Mostra o texto enquanto você fala

    recognition.onresult = function (event) {
        // Recebe o texto do evento
        let text = event.results[event.results.length - 1][0].transcript.trim();

        // Adiciona palavras ao array apenas se não forem duplicadas consecutivas
        let words = text.split(/\s+/);
        words.forEach(word => {
            if (recentWords[recentWords.length - 1] !== word) {
                recentWords.push(word);
            }
        });

        // Mantém apenas as últimas 20 palavras
        recentWords = recentWords.slice(-20);

        // Exibe o texto no HTML
        if (translationEnabled) {
            translateToEnglish(recentWords.join(' '));
        } else {
            document.getElementById('transcribedText').innerText = recentWords.join(' ');
            scrollToBottom(); // Mantém o scroll no final
        }
    };

    recognition.onerror = function (event) {
        console.log("Erro de reconhecimento: ", event.error);
    };
}

// Função para traduzir o texto transcrito para inglês usando a API MyMemory
function translateToEnglish(text) {
    const sourceText = encodeURIComponent(text);
    const sourceLang = 'pt'; // Português
    const targetLang = 'en'; // Inglês

    const url = `https://api.mymemory.translated.net/get?q=${sourceText}&langpair=${sourceLang}|${targetLang}`;

    // Requisição de tradução para a API MyMemory
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Exibe o texto traduzido no HTML
            const translatedText = data.responseData.translatedText;
            if (translatedText !== document.getElementById('transcribedText').innerText) {
                document.getElementById('transcribedText').innerText = translatedText;
                scrollToBottom(); // Mantém o scroll no final
            }
        })
        .catch(error => {
            console.error('Erro ao traduzir:', error);
        });
}

// Função para iniciar o reconhecimento de fala
function startRecognition() {
    recognition.start();
    document.getElementById('transcribedText').innerText = "Escutando... Fale agora!";
}

// Função para alternar entre tradução ativada e desativada
function toggleTranslation() {
    translationEnabled = !translationEnabled;
    const status = translationEnabled ? "ativada" : "desativada";
    document.getElementById('translationStatus').innerText = `Tradução ${status}`;
}

// Função para manter o scroll no final do elemento
function scrollToBottom() {
    const transcribedTextElement = document.getElementById('transcribedText');
    transcribedTextElement.scrollTop = transcribedTextElement.scrollHeight;
}