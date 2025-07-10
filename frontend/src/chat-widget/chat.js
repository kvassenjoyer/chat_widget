// Ждём полной загрузки DOM, затем загружаем содержимое chat.html и инициализируем чат
document.addEventListener('DOMContentLoaded', () => {
  fetch('../src/chat-widget/chat.html')
    .then((res) => {
      if (!res.ok) throw new Error('Ошибка загрузки chat.html');
      return res.text();
    })
    .then((html) => {
      // Парсим HTML как документ
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const chatBox = doc.getElementById('chat-box');

      if (chatBox) {
        // Вставляем chat-box в контейнер на главной странице
        document.getElementById('chat-box-container').appendChild(chatBox);
        // Запускаем инициализацию чат-логики
        initializeChat();
      } else {
        console.error('В chat.html нет элемента с id="chat-box"');
      }
    })
    .catch((err) => {
      console.error('Ошибка загрузки chat.html:', err);
    });
});

let agentIsTyping = false; // Флаг, указывающий, печатает ли агент

function initializeChat() {
  // Получаем основные элементы интерфейса
  const chatButton = document.getElementById('chat-button');
  const chatBox = document.getElementById('chat-box');
  const chatInput = document.getElementById('chat-text');
  const chatMessages = document.getElementById('chat-messages');
  const chatSend = document.getElementById('chat-send');

  // Обработчик клика по кнопке для открытия/закрытия чата
  chatButton.addEventListener('click', () => {
    const isVisible = chatBox.style.display === 'flex';
    chatBox.style.display = isVisible ? 'none' : 'flex';
  });

  // Отправка сообщения по кнопке "Отправить"
  chatSend.addEventListener('click', sendMessage);

  // Отправка сообщения по нажатию Enter в поле ввода
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Функция отправки сообщения пользователя
  function sendMessage() {
    if (agentIsTyping) return; // Запретить отправку, если агент ещё отвечает

    const text = chatInput.value.trim();
    if (!text) return; // Игнорировать пустые сообщения

    appendMessage('user', text); // Добавить сообщение пользователя в чат
    chatInput.value = ''; // Очистить поле ввода

    document.getElementById('chat-suggestions').style.display = 'none'; // Скрыть подсказки после 1-ого сообщения

    // Заблокировать ввод, пока агент "печатает"
    chatInput.disabled = true;
    chatSend.disabled = true;

    simulateAgentReply(text); // Симуляция ответа агента
  }

  // Добавление сообщения в блок сообщений
  function appendMessage(senderType, text) {
    const chatMessages = document.getElementById('chat-messages');

    let messageElement;
    if (senderType === 'agent') {
      messageElement = createAgentMessage(text);
    } else {
      messageElement = createUserMessage(text);
    }

    chatMessages.appendChild(messageElement);

    // Прокрутка вниз после добавления сообщения
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Да, это поэтапное создаение блока HTML кода (для сообщения агента) в JS функции 
  // Согласен, это плохо читаемо, зато безопаснее, чем использование innerHTML
  function createAgentMessage(text) {
    const message = document.createElement('div');
    message.classList.add('message', 'agent');

    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'agent-avatar';

    const avatar = document.createElement('img');
    avatar.src = '../src/chat-widget/images/avatar.jpg';
    avatar.alt = 'Алиса';
    avatarWrapper.appendChild(avatar);

    const content = document.createElement('div');
    content.className = 'agent-content';

    const name = document.createElement('strong');
    name.textContent = 'Алиса';

    const messageText = document.createElement('div');
    messageText.textContent = text;

    content.appendChild(name);
    content.appendChild(messageText);

    message.appendChild(avatarWrapper);
    message.appendChild(content);

    return message;
  }

  // Аналогичное создаение блока HTML кода для сообщения пользователя
  function createUserMessage(text) {
    const message = document.createElement('div');
    message.classList.add('message', 'user');

    const content = document.createElement('div');
    content.className = 'user-content';
    content.textContent = text;

    message.appendChild(content);
    return message;
  }

  // Симуляция ответа агента с анимацией "печатает"
  function simulateAgentReply(userInput) {
    agentIsTyping = true;
    const agentStatus = document.getElementById('agent-status');

    showTypingDots(agentStatus);

    setTimeout(() => {
      agentStatus.textContent = ''; // Убираем индикатор печати
      appendMessage('agent', 'Спасибо за ваше сообщение!');
      agentIsTyping = false;

      // Разблокируем ввод и фокусируемся на поле ввода
      chatInput.disabled = false;
      chatSend.disabled = false;
      chatInput.focus();
    }, 1500);
  }

  function showTypingDots(container) {
    container.textContent = 'печатает';

    const dot1 = document.createElement('span');
    dot1.className = 'dot1';
    dot1.textContent = '.';

    const dot2 = document.createElement('span');
    dot2.className = 'dot2';
    dot2.textContent = '.';

    const dot3 = document.createElement('span');
    dot3.className = 'dot3';
    dot3.textContent = '.';

    container.append(dot1, dot2, dot3);
  }


  // Обработчики кликов по быстрым подсказкам
  const suggestionButtons = document.querySelectorAll('.chat-suggestion');

  suggestionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (agentIsTyping) return; // Не даём отправить подсказку, если агент печатает
      chatInput.value = button.textContent;
      sendMessage();
    });
  });
}

// Обработчик клика вне области чата, чтобы закрыть его
document.addEventListener('click', (e) => {
  const chatBox = document.getElementById('chat-box');
  const chatButton = document.getElementById('chat-button');

  if (!chatBox || chatBox.style.display !== 'flex') return;

  const clickedOutside = !chatBox.contains(e.target) && !chatButton.contains(e.target);

  if (clickedOutside) {
    chatBox.style.display = 'none';
  }
});
