(function() {
    const CONFIG = {
        token: "YOURTOKEN",
        chatId: "YOURID"
    };

    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendBtn');
    const statusDiv = document.getElementById('statusMsg');
    const charCountSpan = document.getElementById('charCount');

    function updateCharCount() {
        const len = messageInput.value.length;
        charCountSpan.textContent = len;
        
        if (len > 360) {
            charCountSpan.style.color = '#ffaa66';
        } else if (len > 380) {
            charCountSpan.style.color = '#ff3b30';
        } else {
            charCountSpan.style.color = '#6c6c7a';
        }
    }
    
    messageInput.addEventListener('input', updateCharCount);
    updateCharCount();

    function setStatus(type, text) {
        statusDiv.className = 'status-message ' + type;
        let icon = '';
        if (type === 'loading') icon = '<i class="fas fa-spinner fa-pulse"></i> ';
        else if (type === 'success') icon = '<i class="fas fa-check-circle"></i> ';
        else if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i> ';
        statusDiv.innerHTML = icon + text;
    }

    function clearStatusAuto() {
        setTimeout(() => {
            if (statusDiv.className !== 'status-message loading') {
                statusDiv.className = 'status-message';
                statusDiv.innerHTML = '';
            }
        }, 2800);
    }

    async function sendToTelegram(message) {
        const url = `https://api.telegram.org/bot${CONFIG.token}/sendMessage`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: CONFIG.chatId,
                    text: message,
                    parse_mode: "HTML"
                })
            });
            const data = await response.json();
            return response.ok && data.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function shakeInput() {
        messageInput.classList.add('shake-input');
        setTimeout(() => {
            messageInput.classList.remove('shake-input');
        }, 200);
    }

    sendButton.addEventListener('click', async () => {
        const rawMessage = messageInput.value.trim();
        
        if (!rawMessage) {
            setStatus('error', 'pesan tidak boleh kosong');
            shakeInput();
            clearStatusAuto();
            return;
        }

        const timestamp = new Date().toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const finalText = `Pesan Baru!\n\n${escapeHtml(rawMessage)}\n\n${timestamp}`;

        setStatus('loading', 'tunggu sebentar...');
        sendButton.disabled = true;
        sendButton.style.opacity = '0.6';
        
        const success = await sendToTelegram(finalText);

        if (success) {
            setStatus('success', 'pesan berhasil terkirim!');
            messageInput.value = '';
            updateCharCount();
            sendButton.disabled = false;
            sendButton.style.opacity = '1';
            setTimeout(() => {
                if (statusDiv.className === 'status-message success') {
                    statusDiv.className = 'status-message';
                    statusDiv.innerHTML = '';
                }
            }, 3000);
        } else {
            setStatus('error', 'gagal kirim, coba lagi');
            sendButton.disabled = false;
            sendButton.style.opacity = '1';
            clearStatusAuto();
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
})();