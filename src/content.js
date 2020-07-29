const LINKEDIN_REGEX = /https:\/\/(www\.|)linkedin\.com\/in\/([^\/]+)\//gm

console.log('......Injected in Norns.ai Extension..... ')

const getUrl = () => document.location.href

const watchHref = (handler) => {
  let newVal = getUrl()
  let oldVal = null

  handler(newVal, oldVal)

  setInterval(() => {
    oldVal = newVal
    newVal = getUrl()

    if (newVal === oldVal) {
      return
    }

    handler(newVal, oldVal)
  }, 1000)
}

const isMyProfileUrl = (url) => {
  return false
}

const isOtherProfileUrl = (url) => {
  return true
}

const handleMyProfilePage = (url) => {
  const buttonMyProfileContainer = document.querySelector('.ph5.pb5 .mt3.mb1 > div') // section
  console.log('handleMyProfilePage', buttonMyProfileContainer)
  // buttonMyProfileContainer.appendChild('<button> Click </button>')
}

const handleClick = () => {
  const payload = { 
    name: 'postRequest', 
    payload: { url: getUrl() }
  }  

  chrome.runtime.sendMessage(payload, {}, (r) => console.log(r))
}

const createButtonEl = () => {
  let button = document.createElement('button')
  button.innerText = 'Get Insights'
  button.style.backgroundColor = '#0168fa'
  button.className = 'message-anywhere-button pv-s-profile-actions pv-s-profile-actions--message ml2 artdeco-button artdeco-button--2 artdeco-button--primary'
  button.onclick = handleClick
  button.style.color = ''
  
  return button
}

const handleOtherProfilePage = (url) => {
  const buttonProfileContainer = document.querySelector('.ph5.pb5 .mt3.mb1 > div > div')
  const buttonMyProfileContainer = document.querySelector('.ph5.pb5 .mt3.mb1 > div > section')

  console.log('handleOtherProfilePage', buttonProfileContainer)
  const button = createButtonEl()

  // buttonProfileContainer.appendChild(button)
  buttonProfileContainer.insertBefore(button, buttonProfileContainer.childNodes[0])

}

watchHref((newVal, oldVal) => {
  console.log('href is ', newVal, oldVal)

  if (isMyProfileUrl(newVal)) {
    return handleMyProfilePage(newVal)
  }

  if (isOtherProfileUrl(newVal)) {
    return handleOtherProfilePage(newVal)
  }

})
