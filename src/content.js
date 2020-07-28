const LINKEDIN_REGEX = /https:\/\/(www\.|)linkedin\.com\/in\/([^\/]+)\//gm

console.log('......Injected in Norns.ai Extension..... ')
console.log(window.location.href)

const getUrl = () => document.location.href

const watchHref = (handler) => {
  let newVal = getUrl()
  let oldVal = null

  setInterval(() => handler(newVal, oldVal), 10000)
}

const isMyProfileUrl = (url) => {
  return true
}

const isOtherProfileUrl = (url) => {
  return false
}

const handleMyProfilePage = (url) => {
  const buttonMyProfileContainer = document.querySelector('.ph5.pb5 .mt3.mb1 > div') // section
  console.log('handleMyProfilePage', buttonMyProfileContainer)
  // buttonMyProfileContainer.appendChild('<button> Click </button>')
}

const handleOtherProfilePage = (url) => {
  const buttonProfileContainer = document.querySelector('.ph5.pb5 .mt3.mb1 > div > div')
  console.log('handleOtherProfilePage', buttonProfileContainer)
}

const handleClick = () => {
  const payload = { 
    name: 'postRequest', 
    payload: { url: getUrl() }
  }  

  // chrome.tabs.query({currentWindow: true,active: true}, (tabs) => {
  //   chrome.tabs.sendMessage(tab[0].id, payload)
  // })
  chrome.runtime.sendMessage(payload, {}, (r) => console.log(r))
}


watchHref((newVal, oldVal) => {
  console.log('href is ', newVal, oldVal)

  if (newVal === oldVal) {
    return
  }

  if (isMyProfileUrl(newVal)) {
    return handleMyProfilePage(newVal)
  }

  if (isOtherProfileUrl(newVal)) {
    return handleOtherProfilePage(newVal)
  }

})

handleClick()