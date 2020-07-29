const LINKEDIN_REGEX = /https:\/\/(www\.|)linkedin\.com\/in\/([^\/]+)\/?/

console.log('......Injected in Norns.ai Extension..... ')

const getUrl = () => document.location.href
const getNornsAiButtonEl = () => document.querySelector('#norns-ai-button')

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

// const isMyProfileUrl = (url) => {
//   return false
// }

const isProfileUrl = (url) => {
  return LINKEDIN_REGEX.test(url)
}

// const handleMyProfilePage = (url) => {
//   const buttonMyProfileContainer = document.querySelector('.ph5.pb5 .mt3.mb1 > div') // section
//   console.log('handleMyProfilePage', buttonMyProfileContainer)
//   // buttonMyProfileContainer.appendChild('<button> Click </button>')
// }

const clearButtonIfExists = () => {
  const buttonEl = getNornsAiButtonEl()
  if (buttonEl) {
    buttonEl.remove()
  }
}

const applyDefaultState = (button) => {
  button.innerText = 'Get Insights'
  button.onclick = handleClick

  return button
}

const applyLoadingState = (button) => {
  button.innerText = 'Getting Insights...'
  button.onclick = function() {}

  return button
}

const applyFinalState = (button, options) => {
  button.innerText = 'View Insights'
  button.onclick = () => window.open('https://app.norns.ai/profiles/?task_id=' + options.task_id)

  return button
}

const handleClick = () => {
  const payload = { 
    name: 'postRequest', 
    payload: { url: getUrl() }
  }  

  applyLoadingState(getNornsAiButtonEl())

  chrome.runtime.sendMessage(payload, {}, (r) => {
    console.log(r)
    applyFinalState(getNornsAiButtonEl(), r)
  })
}

const createButtonEl = () => {
  let button = document.createElement('button')
  button.innerText = 'Get Insights'
  button.style.backgroundColor = '#0168fa'
  button.id = 'norns-ai-button'
  button.className = 'message-anywhere-button pv-s-profile-actions pv-s-profile-actions--message ml2 artdeco-button artdeco-button--2 artdeco-button--primary'
  button.style.color = ''

  applyDefaultState(button)

  return button
}

const handleProfilePage = (url) => {
  const buttonProfileContainer = document.querySelector('.ph5.pb5 .mt3.mb1 > div > div')
  const buttonMyProfileContainer = document.querySelector('.ph5.pb5 .mt3.mb1 > div > section')

  console.log('handleProfilePage', buttonProfileContainer)
  const button = createButtonEl()

  // buttonProfileContainer.appendChild(button)
  buttonProfileContainer.insertBefore(button, buttonProfileContainer.childNodes[0])

}

watchHref((newVal, oldVal) => {
  console.log('href is ', newVal, oldVal)
  let isProfile = isProfileUrl(newVal)
  
  clearButtonIfExists()
  
  console.log('isProfileUrl(newVal)', isProfile)

  if (isProfile) {
    return handleProfilePage(newVal)
  }

})
