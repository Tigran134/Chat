$(document).ready(() => {

  const socket = io.connect('http://localhost:3000')
  socket.on('connected', function (msg) {
    console.log(msg)
  })
  //Отправка сообщения по нажатию на Enter
  let sendOnMessage = () => {
    let textArea = $('#sendMessage');
    let messageTextArea = textArea.val().trim()
    //Формирование и отправка на сервер сообщения 
    if (messageTextArea !== '') {
      socket.emit('msg', messageTextArea);
      textArea.val('')
    }
  }
  $('#sendMessage_chat').on('click', e => {
    e.preventDefault()
    sendOnMessage()
  })

  $('#sendMessage_chat').on('keypress', e => {
    if (e.keyCode === 13) {
      e.preventDefault()
      sendOnMessage()
    }
  })

  socket.on("message", addMessage);

  function addMessage(message) {
    moment.lang('ru')
    let containerForTemplate = document.querySelector('.messagesWrap')
    let template = tpltMessage.content.cloneNode(true)
    template.querySelector('.message__name').innerText = message.username
    template.querySelector('.message__text').innerText = message.content
    template.querySelector('.message__time').innerText = moment().startOf(message.date).fromNow();
    template.querySelector('.message__count').innerText = message.likes
    template.querySelector('.chat-message').setAttribute('id', message._id)
    if (document.querySelector('.wrapNo-message')) {
      document.querySelector('.wrapNo-message').style.display = 'none'
    }
    containerForTemplate.appendChild(template)


  }

  //COMMENTS!!!!!!!!!!!!!!!!!!!
  $('.messagesWrap').on('click', e => {
    if (e.target.classList.contains('btnComment')) {
      e.preventDefault()
      let parent = e.target.parentNode
      let id = e.target.closest('.chat-message').getAttribute('id')
      let text = parent.querySelector('.inputComment').value
      if (text !== '') {
        socket.emit('cmt', {
          content: text,
          id: id,
        });
      }
      parent.querySelector('.inputComment').value = ''
    }
  })
  socket.on("comment", addComment);
})

function addComment(message) {
  let blockMessage = document.getElementById(`${message.parentId}`)
  let containerForTemplate = blockMessage.querySelector('.message__answer')
  let template = tpltAnswer.content.cloneNode(true)
  template.querySelector('.message__name').innerText = message.username
  template.querySelector('.message__text').innerText = message.content
  template.querySelector('.message__time').innerText = moment().startOf(message.date).fromNow();
  template.querySelector('.message__count').innerText = message.likes
  template.querySelector('.chat-message').setAttribute('id', message._id)
  containerForTemplate.appendChild(template)
}

//COMMENTS !!!!!!!!!!!!!!!!!!!!!!!!!!!!! END










