const ABOUT_URL = 'https://www.norns.ai/intelligence'
const CALLBACK_URL = 'https://app.norns.ai/reports'
const MANUAL_URL = 'https://www.norns.ai/intelligence/linkedin-manual'
const LINKEDIN_LOGIN_URL = 'https://www.linkedin.com/login'
const LINKEDIN_ME_URL = 'https://www.linkedin.com/me/'
const DEFAULT_INTERVAL = 10 * 1000

const query = {
  url: 'https://www.linkedin.com',
  name: 'li_at'
}

chrome.contextMenus.create({
  id: 'about-extension',
  contexts: ['browser_action'],
  title: 'About',
  onclick: () => {
    chrome.tabs.create({
      url: ABOUT_URL,
      active: true
    })
  }
})

chrome.contextMenus.create({
  id: 'li_at',
  contexts: ['browser_action'],
  title: 'My LinkedIn Token',
  onclick: () => {
    chrome.cookies.get(query, cookie => {
      if (cookie && cookie.value) {
        return alert("linkedin token: \n\n" + cookie.value)
      }

      chrome.tabs.create({
        url: LINKEDIN_LOGIN_URL,
        active: true
      })
    }) 
  }
})

chrome.browserAction.onClicked.addListener(() => {
  chrome.cookies.get(query, cookie => {
    return cookie ? handleToken(cookie) : handleError()
  })
})

const syncCookie = () => {
  chrome.cookies.get(query, cookie => {
    // console.log('Cookie', cookie)
    if (!cookie) {
      // console.warn('li_at cookie not found')
      return
    }

    return setCookieWithToken(cookie)
  })
}

const setCookieWithToken = (cookie) => {
  return chrome.cookies.set({ 
    url: 'https://www.norns.ai/*',
    name: 'exported_li_at',
    path: '/',
    domain: '.norns.ai',
    value: cookie.value,
    secure: true,
    httpOnly: false,
    expirationDate: cookie.expirationDate
  })
}

const handleToken = (cookie) => {
    setCookieWithToken(cookie)
    setTimeout(() => chrome.tabs.create({
      url: CALLBACK_URL,
      active: true
    }), 100)
}

const handleError = () => {
  chrome.tabs.create({
    url: MANUAL_URL,
    active: true
  })
}

const postRequest = (data) => {
  return fetch({
    method: 'POST',
    url: 'https://app.norns.ai/api/reqports',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}

const handleRequest = (url) => {
  chrome.cookies.get(query, liAtCookie => {
    chrome.cookies.get({ url: 'https://www.norns.ai/', name: 'access_token' }, accessTokenCookie => {
      postRequest({
        type: 'one_profile_enrichment',
        access_token: accessTokenCookie ? accessTokenCookie.value : '',
        profile_linkedin_url: url,
        cookies: liAtCookie ? liAtCookie.value : ''
      })
    })
  })
}

chrome.runtime.onMessage.addListener(() => {
  handleRequest('url')
})

chrome.runtime.onInstalled.addListener(() => chrome.tabs.create({
  url: LINKEDIN_ME_URL,
  active: true
}))

setInterval(syncCookie, DEFAULT_INTERVAL)
syncCookie()