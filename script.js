// 🔑 OPENROUTER API KEY
const API_KEY = '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';

document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    if (!sendButton || !userInput || !chatMessages) return;

    let conversationHistory = [];

    const systemPrompt = `You are Poojitha, a personal AI assistant created specially for one person. You are warm, caring, thoughtful, and always start your responses with "Poojitha: I am your personal AI." followed by your answer. You subtly remind the user that you were personally created for them. Be helpful, kind, and make every response feel personal and meaningful.`;

    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const p = document.createElement('p');
        if (!isUser) {
            const cleanText = text.replace(/^Poojitha:\s*I am your personal AI\.\s*/i, '');
            p.innerHTML = `<strong>Poojitha:</strong> ${cleanText}`;
        } else {
            p.textContent = text;
        }
        
        messageDiv.appendChild(p);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
    }

    async function getAIResponse(userMessage) {
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Personal AI'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3.5-sonnet',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        ...conversationHistory
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const aiText = data.choices[0].message.content;

            conversationHistory.push({
                role: 'assistant',
                content: aiText
            });

            return aiText;

        } catch (error) {
            console.error('Error:', error);
            return "Poojitha: I am your personal AI. I'm having trouble connecting right now. Please try again in a moment.";
        }
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        sendButton.disabled = true;
        userInput.disabled = true;

        addMessage(message, true);
        userInput.value = '';

        showTypingIndicator();

        const aiResponse = await getAIResponse(message);

        removeTypingIndicator();
        addMessage(aiResponse, false);

        sendButton.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !sendButton.disabled) {
            sendMessage();
        }
    });
});
