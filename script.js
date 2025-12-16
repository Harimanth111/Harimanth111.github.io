// 🔑 OPENROUTER API KEY
const API_KEY = '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';

// 🗓️ SET START DATE - AB SE 6 MONTHS
const START_DATE = new Date(); // Current date se automatically start
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

// 🔒 CHECK ACCESS FUNCTION
function checkAccess() {
    const now = new Date();
    const timePassed = now - START_DATE;
    console.log('Time passed:', timePassed, 'Limit:', SIX_MONTHS_MS);
    return timePassed < SIX_MONTHS_MS;
}

function checkAccessAndContinue() {
    if (checkAccess()) {
        window.location.href = 'wishes.html';
    } else {
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('expiredContent').style.display = 'block';
    }
}

// 🚫 BLOCK ACCESS ON OTHER PAGES
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    // Skip check on index page
    if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/')) {
        console.log('Index page loaded');
        return;
    }
    
    // Check access on other pages
    if (currentPage.includes('wishes.html') || 
        currentPage.includes('photos.html') || 
        currentPage.includes('ai.html')) {
        if (!checkAccess()) {
            window.location.href = './';
            return;
        }
    }

    // AI CHAT FUNCTIONALITY
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    if (!sendButton || !userInput || !chatMessages) return;

    let conversationHistory = [];

    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const p = document.createElement('p');
        if (!isUser) {
            p.innerHTML = `<strong>Poojitha:</strong> ${text}`;
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
                    'X-Title': 'Poojitha AI'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3.5-sonnet',
                    messages: [
                        {
                            role: 'system',
                            content: `You are Poojitha, a personal AI assistant created for someone special. 

YOUR PERSONALITY:
- Warm, caring, intelligent, and thoughtful
- Always helpful and detailed in your answers
- You give complete, thorough responses like a knowledgeable friend
- You can answer ANY question - technical, creative, personal, educational, anything
- You explain things clearly and completely

YOUR RESPONSE STYLE:
- Start every message with "Poojitha: I am your personal AI."
- Then give a FULL, COMPLETE, DETAILED answer
- Be natural and conversational
- If someone asks for code, write complete working code
- If someone asks for explanation, explain thoroughly
- Never give short or incomplete answers

Remember: You were personally created for this person. Make them feel special while being incredibly helpful.`
                        },
                        ...conversationHistory
                    ],
                    temperature: 0.7,
                    max_tokens: 4000
                })
            });

            if (!response.ok) {
                return await getFallbackResponse(userMessage);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0]) {
                return await getFallbackResponse(userMessage);
            }

            const aiText = data.choices[0].message.content;

            conversationHistory.push({
                role: 'assistant',
                content: aiText
            });

            return aiText;

        } catch (error) {
            console.error('Error:', error);
            return await getFallbackResponse(userMessage);
        }
    }

    async function getFallbackResponse(userMessage) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': window.location.href
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.1-8b-instruct:free',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are Poojitha, a helpful AI assistant. Give detailed, complete answers. Always start with "Poojitha: I am your personal AI." then answer fully.'
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            const data = await response.json();
            
            if (data.choices && data.choices[0]) {
                const text = data.choices[0].message.content;
                
                conversationHistory.push({
                    role: 'assistant',
                    content: text
                });
                
                return text;
            }
            
            return "Poojitha: I am your personal AI. I'm having connection issues right now. Please try again in a moment.";
            
        } catch (error) {
            console.error('Fallback error:', error);
            return "Poojitha: I am your personal AI. I'm experiencing technical difficulties. Please refresh and try again.";
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
