const cookieStorage = {
  getItem: (item) => {
    const cookies = document.cookie
      .split(';')
      .map((cookie) => cookie.split('='))
      .reduce((acc, [key, value]) => ({ ...acc, [key.trim()]: value }), {})
    return cookies[item]
  },
  setItem: (item, value) => {
    document.cookie = `${item}=${value}`
  },
}

const storageType = cookieStorage
//const storageType = localStorage
const consentPropertyName = 'jdc_consent'
const shouldShowPopup = () => !storageType.getItem(consentPropertyName)
const saveToStorage = () => storageType.setItem(consentPropertyName, true)
const dontSaveToStorage = () => storageType.setItem(consentPropertyName, false)

const win = window.location.pathname
const home = '/'
const consentPopup = document.getElementById('consent-popup')
const cookieCondition = storageType.consentPropertyName

if (win === home) {
  window.onload = () => {
    const acceptFn = (event) => {
      saveToStorage(storageType)
      consentPopup.classList.add('hidden')
      consentPopup.remove()
    }
    const dontAcceptFn = (event) => {
      dontSaveToStorage(storageType)
      consentPopup.classList.add('hidden')
      consentPopup.remove()
    }
    const acceptBtn = document.getElementById('accept')
    const declineBtn = document.getElementById('decline')
    acceptBtn.addEventListener('click', acceptFn)
    declineBtn.addEventListener('click', dontAcceptFn)
    console.log(shouldShowPopup(storageType))
    if (shouldShowPopup(storageType)) {
      setTimeout(() => {
        consentPopup.classList.remove('hidden')
      }, 2000)
    } else {
      consentPopup.classList.add('hidden')
      consentPopup.remove()
    }
  }
} else {
  consentPopup.remove()
}

// scroll to top btn

var scrollToTopBtn = document.querySelector('.scrollToTopBtn')
var rootElement = document.documentElement
var TOGGLE_RATIO = 0.8

function handleScroll() {
  // do something on scroll
  var scrollTotal = rootElement.scrollHeight - rootElement.clientHeight
  if (rootElement.scrollTop / scrollTotal > TOGGLE_RATIO) {
    //show button
    scrollToTopBtn.classList.add('showBtn')
  } else {
    //hide button
    scrollToTopBtn.classList.remove('showBtn')
  }
}

function scrollToTop() {
  //scroll to top logic
  rootElement.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
scrollToTopBtn.addEventListener('click', scrollToTop)
document.addEventListener('scroll', handleScroll)
