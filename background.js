function notifyTabs (status) {
    let notify = (tabs) => {
        for (let tab of tabs) {
            console.log(tab)
            browser.tabs.sendMessage(tab.id, {enabled: status}, (e) => { console.log (e) })
        }
    }

    browser.tabs.query({ url: "https://boards.4chan.org/*"}).then(notify)
    browser.tabs.query({ url: "https://boards.4channel.org/*"}).then(notify)
}

browser.storage.local.get('enabledState').then((is) => {

    let state = (is && is.enabledState && is.enabledState.enabled)? 'on':'off'
    browser.browserAction.setIcon({ path: 'icons/' + state + '.ico' })

    console.log('bootup', is.enabledState)
}, (e) => {
    console.log('has now error setting', e)
})

let toggle = (tab) => {

    browser.storage.local.get('enabledState').then((is) => {
        console.log(is)

        let isEnabled = true
        if (is.enabledState) {
            isEnabled = !is.enabledState.enabled
        }
        let state = (isEnabled)? 'on':'off'

        browser.browserAction.setIcon({ path: 'icons/' + state + '.ico' })

        let enabledState = { enabled: isEnabled }
        browser.storage.local.set({ enabledState }).then(() => {
            console.log('isEnabled', isEnabled)
            notifyTabs(isEnabled)
        }, (e) => {
            console.log('setting', e)
        })
    }, (e) => {
        console.log('has now error', e)
    })
}

browser.browserAction.onClicked.addListener(toggle);
