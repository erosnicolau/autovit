// ==UserScript==
// @name         Autovit
// @namespace    https://www.autovit.ro/
// @version      0.1.3
// @description  Hide unwanted ads
// @author       Eros Nicolau
// @match        https://www.autovit.ro/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict'
    console.clear()
    let ls = window.localStorage

    // Define the dealers to filter out
    let blockedDealers = [
        'leasingautomobile1',
        'elitecarsleasing',
        'elitecarsleasingotp',
        'elitecarsleasingbc'
    ]

    // Add the hide icons to the listing ads and hide the unwanted dealers
    let cadAds = document.querySelectorAll('.adListingItem')
    cadAds.length > 0 && [...cadAds].map(e => {
        //Add the monkey
        addMonkey(e, e.dataset.adId)
        // Get the dealer Ads
        let links = [...e.querySelectorAll('a[href]')]
        links.map(e => {
            let url = e.getAttribute('href').split('//')[1]
            if (url != undefined) {
                url = url.split('.')[0]
                if(url != 'www'){
                    if (blockedDealers.includes(url)) {
                        // Hide the unwanted dealers
                        let theAd = e.closest('article')
                        theAd.style.display = 'none';
                        theAd.previousSibling.style.display = 'none';
                    }
                }
            }
        })
    })

    // Check to see if you're on a car page; If so, then add the hide icon to the Details box
    try { if (ad_id) addMonkey(document.querySelector('.offer-summary'), ad_id) } catch (e){}

    // Look into localStorage and hide all the cars that match the hidden cars list
    let currentCars = JSON.parse(ls.getItem("Hidden Cars")) || [];
    if (currentCars.length > 0) {
        currentCars.map(c => {
            let that = document.querySelector('[data-hiddenid="'+c+'"]')
            that && toggleCar(that, [...that.classList].includes('hiddenButton'))
        })
    }

    function addMonkey(e, id){
        let tlink = document.createElement('a'),
            link = e.parentNode.insertBefore(tlink, e);
        link.setAttribute('href','#')
        link.setAttribute('data-hiddenid', id);
        link.classList.add('hideMe')
        link.innerText = '🙈'
        link.addEventListener("click", function(el){
            el.preventDefault()
            let that = el.target
            toggleCar(that, [...that.classList].includes('hiddenButton'))
        }, false);
    }

    function toggleCar(el, hidden){
        let id = el.getAttribute('data-hiddenid')
        let currentCars = JSON.parse(ls.getItem("Hidden Cars")) || [];
        if(hidden == true){
            el.nextSibling.classList.remove("hiddenAd")
            el.classList.remove('hiddenButton')
            ls.setItem("Hidden Cars", JSON.stringify(currentCars.filter(e => e != id)))
        }
        else {
            el.nextSibling.classList.add("hiddenAd")
            el.classList.add("hiddenButton")
            !currentCars.includes(id) && ls.setItem("Hidden Cars", JSON.stringify([id, ...currentCars]))
        }
    }

    // Add custom CSS
    var head = document.head || document.getElementsByTagName("head")[0],
        style = document.createElement("style"),
        customCSS = ''
    head.appendChild(style)
    style.type = "text/css"
    customCSS += ".hideMe {font-size: 24px; cursor: pointer; float: right; transform: translate(16px, 47px); z-index: 2; position: relative}"
    customCSS += ".hideMe:hover {opacity: .5}"
    customCSS += "[class*=ad-slot], .adsbygoogle, .rightBranding {display: none !important}"
    customCSS += ".hiddenAd {height: 45px; min-height: unset !important; overflow: hidden; opacity: 0.15}"
    customCSS += ".hiddenAd .tags, .hiddenAd h3, .hiddenAd .favorite-box {display: none;}"
    customCSS += ".hiddenButton {opacity: 0.15}"
    if (style.styleSheet) style.styleSheet.cssText = customCSS
    else style.appendChild(document.createTextNode(customCSS))

})();
