"use strict";

  document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.bn-number').forEach((element) => {
      element.addEventListener('click', () => {

        const value = element.querySelector('.bn-value').textContent;
        navigator.clipboard.writeText(value).then(() => {
          console.log('copied');

          const tooltip = document.querySelector('.tooltip');
          if (tooltip) {
            tooltip.classList.add('active');
            setTimeout(() => {
              tooltip.classList.remove('active');
            }, 2000);
          }

        }).catch((err) => {
          console.error('Copy error: ', err);
        });
      });
    });

});






document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const dropBox = document.querySelector('.drop-box');
  const chatMessages = document.querySelector('.chat-modal__messages');
  const fileButton = document.querySelector('.chat-modal__file-button'); // Кнопка загрузки файла

  // Функция обработки загрузки изображения
  function handleImageUpload(file) {
      if (file.type.startsWith('image/')) {
          const imageUrl = URL.createObjectURL(file);
          dropBox.innerHTML = '';

          const imageElement = document.createElement('img');
          imageElement.src = imageUrl;
          imageElement.style.maxWidth = '100%';
          imageElement.style.borderRadius = '8px';
          dropBox.appendChild(imageElement);

          setTimeout(() => {
              document.querySelector('.chat-modal').classList.add('active');

              // Добавляем новое сообщение от пользователя с загруженной картинкой
              const newUserMessage = document.createElement('div');
              newUserMessage.className = 'message message--user';
              newUserMessage.innerHTML = `<img src="${imageUrl}" alt="i">`;

              chatMessages.appendChild(newUserMessage);

              // Прокручиваем чат вниз
              chatMessages.scrollTop = chatMessages.scrollHeight;
          }, 1000);
      } else {
          dropBox.textContent = file.name;
      }
  }

  // Открытие выбора файла при клике на drop-box
  dropBox.addEventListener('click', () => {
      fileInput.click();
  });

  // Открытие выбора файла при клике на chat-modal__file-button
  fileButton.addEventListener('click', () => {
      fileInput.click();
  });

  // Обработка загруженного файла
  fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
          handleImageUpload(fileInput.files[0]);
      }
  });
});



// ввод промпта от юзера
document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.querySelector('.chat-modal__messages');
  const messageInput = document.querySelector('.try-ai-area__text');
  const sendButton = document.querySelector('.try-ai-area__button');

  sendButton.addEventListener('click', () => {
      const messageText = messageInput.value.trim();
      
      if (messageText !== '') {
          // Создаем новый элемент сообщения от пользователя
          const newUserMessage = document.createElement('div');
          newUserMessage.className = 'message message--user';
          newUserMessage.innerHTML = `<p>${messageText}</p>`;

          // Добавляем сообщение в чат
          chatMessages.appendChild(newUserMessage);

          // Очищаем поле ввода
          messageInput.value = '';

          // Прокручиваем чат вниз
          chatMessages.scrollTop = chatMessages.scrollHeight;
      }
  });

  // Позволяем отправлять сообщение при нажатии Enter
  messageInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault(); // Предотвращаем перенос строки
          sendButton.click();
      }
  });
});





document.querySelector('.open-link-deepart').addEventListener('click', () => {
  document.querySelector('.chat-modal').classList.add('active');
});

document.querySelector('.close-vt').addEventListener('click', () => {
  document.querySelector('.chat-modal').classList.remove('active');
});