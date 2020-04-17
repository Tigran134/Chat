
$(document).ready(() => {
  let messageContainer = document.querySelector('.messagesWrap')
  messageContainer.addEventListener('click', (e) => {
    let blockInput = e.target.parentNode.querySelector('.form-group')
    if (blockInput) {
      let inputText = blockInput.querySelector('.inputComment')
      let link = e.target.parentNode.querySelector('.message__link')
      if (e.target.classList.contains('message__link')) {
        e.preventDefault()
        blockInput.classList.toggle('d-none')
        inputText.focus()
        e.target.classList.add('d-none')
        console.log(inputText.value)
      } else {
        if (!e.target.classList.contains('d-none')) {
          blockInput.classList.add('d-none')
          link.classList.remove('d-none')
        }
      }
    }
  })
})
