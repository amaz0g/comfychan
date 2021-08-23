let $ = (selector) => document.querySelector(selector);
let $$ = (selector) => document.querySelectorAll(selector);

let isInThread = (window.location.href.split('/').length > 5);

let posts = {}

HTMLElement.prototype.find = function (selector) {
    return this.querySelector(selector)
}

HTMLElement.prototype.findAll = function (selector) {
    let els = this.querySelectorAll(selector)
    if (els.length == 0) return []
    return els
}

HTMLElement.prototype.insertAfter = function (newNode) {
    this.parentNode.insertBefore(newNode, this.nextSibling);
}

function formatThreadTree () {
    $$('.post').forEach(p => {
        // console.log(p.id)
    
        let blc = p.find('.backlink')
    
        let id = p.id.substr(1)
        posts[id] = {
            post: p,
            replyIds: [], 
        }
    
        if (!blc) {
            console.log('none found')
            return
        }
    
        blc.findAll('a').forEach(bl => {
            // console.log(bl.textContent)
            let blId = bl.textContent.substr(2)
            posts[id].replyIds.push(blId)
        })
    })
    
    function attachReplies (post, replyIds) {
        replyIds.forEach(r => {
            let rp = posts[r]
    
            post.parentNode.appendChild(rp.post.parentNode)
    
            if (rp.replyIds.length > 0) {
                attachReplies(rp.post, rp.replyIds)
            }
        })
    }
    
    for (let p in posts) {
        if (posts[p].replyIds.length > 0) {
            attachReplies(posts[p].post, posts[p].replyIds)
        }
    }    
}


let iframe = document.createElement('iframe')
iframe.id = 'comfyFrame'

function enable () {
    $('body').classList.add('comfyChan');

    iframe.style.minHeight= window.innerHeight + 'px';
    
    if (isInThread) {
        formatThreadTree()
    }

    console.log('hiero')
    
    if (!isInThread) {
        $('body').classList.add('comfyThread');

        $$('.opContainer').forEach(opc => {
            let postRoot = opc.querySelector('.post')
            let postLink = postRoot.querySelector('.replylink')
            console.log(postRoot)   
            let link = document.createElement('button')
            link.url = postLink
            link.showing = false
            link.textContent = "Load Quick >>"
            link.onclick = function () {
                console.log('loading ' + link.url)
                if (link.showing != true) {
                    iframe.src = link.url
                    iframe.style.display = 'block'
                    link.textContent = "Hide Quick >>"
                    link.showing = true
                    return false
                }

                iframe.style.display = 'none'
                link.textContent = "Load Quick >>"
                link.showing = false
                return false
            }
            link.classList.add('comfyLoad')

            postRoot.appendChild(link)
        });
    }

    $('body').prepend(iframe)
}

function disable () {
    $('body').classList.remove('comfyChan');
    iframe.parentNode.removeChild(iframe);
    $$('.comfyLoad').forEach((e) => e.remove())
}

browser.storage.local.get('enabledState').then((is) => {
    let state = (is && is.enabledState && is.enabledState.enabled)? true:false

    if (state) {
        enable()
    }
}, (e) => {
    console.log('has now error setting', e)
})


function receiveStatus(status) {
    console.log(status)

    if (status.enabled) {
        return enable()
    }

    disable()
}

browser.runtime.onMessage.addListener(receiveStatus)
