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
    copyTextToClipboard(cookie.value)
    chrome.notifications.create({
      title: 'Norns Ai',
      message: 'Linkedin token has been copied to clipboard!',
      type: 'basic',
      iconUrl: '/icons/icon_128.png',
    })
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
  return fetch('https://app.norns.ai/api/reports', {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(data)
  }).then(r => r.json())
}

const handleRequest = (url) => {
  return new Promise((resolve) => {
    chrome.cookies.get(query, liAtCookie => {
      chrome.cookies.get({ url: 'https://app.norns.ai', name: 'access_token' }, accessTokenCookie => {
        postRequest({
          type: 'one_profile_enrichment',
          access_token: accessTokenCookie ? accessTokenCookie.value : '',
          profile_linkedin_url: url,
          cookies: liAtCookie ? liAtCookie.value : ''
        }).then(resolve)
      })
    })
  })
}

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  console.log('onMessage', msg, sender)
  handleRequest(msg.payload.url)
    .then((r) => {
      // chrome.tabs.create({
      //   url: 'https://app.norns.ai/profiles/?task_id=' + r.task_id,
      //   active: true
      // })
      // TODO: Remove this wait for 10s
      setTimeout(() => respond(r), 10000)
    })

  return true
})

chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled')
  setTimeout(() => chrome.tabs.create({
    url: LINKEDIN_ME_URL,
    active: true
  }), 1000)
})

function copyTextToClipboard(text) {
  //Create a textbox field where we can insert text to. 
  var copyFrom = document.createElement("textarea");

  //Set the text content to be the text you wished to copy.
  copyFrom.textContent = text;

  //Append the textbox field into the body as a child. 
  //"execCommand()" only works when there exists selected text, and the text is inside 
  //document.body (meaning the text is part of a valid rendered HTML element).
  document.body.appendChild(copyFrom);

  //Select all the text!
  copyFrom.select();

  //Execute command
  document.execCommand('copy');

  //(Optional) De-select the text using blur(). 
  copyFrom.blur();

  //Remove the textbox field from the document.body, so no other JavaScript nor 
  //other elements can get access to this.
  document.body.removeChild(copyFrom);
}

setInterval(syncCookie, DEFAULT_INTERVAL)
syncCookie()
