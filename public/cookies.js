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
    const acceptBtn = document.getElementById('accept')
    acceptBtn.addEventListener('click', acceptFn)
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
