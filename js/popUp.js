'use strict'

function PopUp(obj) {

    //Default settings:
    const settings = {
        content: 'NO CONTENT',
        maskColor: '#343a40',
        maskOpacity: '0.7',
    }

    // Constructor:
    this.obj = obj || settings
    this.openBtn = obj.openBtn
    this.container = obj.container
    this.reloadBtn = obj.reload
    this.content = obj.content || settings.content
    this.maskColor = obj.maskColor || settings.maskColor
    this.maskOpacity = obj.maskOpacity || settings.maskOpacity

    // Styles for elements:
    const maskStyles = `position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; z-index: 1000; transition: opacity ease-in-out 0.5s; background-color: ${this.maskColor}; opacity: 0; display: none;`
    const popupStyles = 'position: fixed; left: 50%; transform:translateX(-50%); top: 3000px; z-index: 2000; background-color: #ffffff;  transition: top ease-in-out 0.5s; display: none; overflow-x: hidden;'

    // Main variables:
    let popupMask
    let popupMaskName = `${this.openBtn}-popupMask`
    let popupWindow
    let popupWindowName = `${this.openBtn}-popupWindow`
    let btnCloseName = `${this.openBtn}-popupClose`

    //For raf-function:
    const maskOpacity = this.maskOpacity

    //Variable parameters for show:
    let popupWindowTop
    let windowHeight

    window.addEventListener('load', () => {
        //Create and add elements to page:
        this.createPopupElements()
        this.addPopupToPage()

        //Set main variables:
        popupMask = document.querySelector(`.${popupMaskName}`)
        popupWindow = document.querySelector(`.${popupWindowName}`)

        // Styles for elements:
        this.addStartStyleToMask()
        this.addStartStyleToPopupWindow()

        // Show popup buttons:
        for (let item of document.querySelectorAll(`.${this.openBtn}`)) {
            // console.log("PopUp -> `.${this.openBtn}`", `.${this.openBtn}`)
            item.addEventListener('click', () => {
                this.showPopup()
            })
        }


        // Reload btn
        if (this.reloadBtn) {

            document.querySelector(`.${this.reloadBtn}`).addEventListener('click', () => {
                for (let item of document.querySelectorAll(`.${this.openBtn}`)) {
                    item.addEventListener('click', () => {
                        this.showPopup()
                        // console.log("PopUp -> this.showPopup()", this.showPopup())
                    })
                    // console.log(item)
                }
            })
        }


        // Hide popup buttons:
        document.querySelector(`.${btnCloseName}`).addEventListener('click', () => {
            for (let item of document.querySelectorAll(`.${this.openBtn}`)) {
                item.addEventListener('click', () => {
                    this.showPopup()
                    // console.log("this.showPopup()", this.showPopup())
                })
                // console.log(item)
            }

            this.hidePopup()
        })
        document.querySelector(`.${btnCloseName}`).addEventListener('mouseover', this.btnAnimationOn)
        document.querySelector(`.${btnCloseName}`).addEventListener('mouseout', this.btnAnimationOut)
    })

    //Resize client device:
    window.addEventListener('resize', () => {
        this.calcParametersForShow()
        this.addVariableStyles()
    })

    this.createPopupElements = function () {
        return `<div class="${popupMaskName}"></div>
                        <div class="container ${popupWindowName} shadow-lg text-center rounded pt-2 pr-2 pb-4 pl-2">
                            <div class="row">
                                <div class="col">
                                    <div class="${btnCloseName} d-flex justify-content-center align-items-center border border-dark rounded-circle ml-auto mb-1" type="button" style="width: 30px; height: 30px; transition: transform ease-in-out 0.3s"><p style="font-size:18px; font-family:'Montserrat', sans-serif; margin:0;">&#10006</p></div>
                                    ${this.content}
                                </div>
                            </div>
                        </div>`
    }

    this.addPopupToPage = function () {
        document.querySelector(`.${this.container}`).innerHTML = this.createPopupElements()
    }

    this.addStartStyleToMask = function () {
        popupMask.setAttribute('style', maskStyles)
    }

    this.addStartStyleToPopupWindow = function () {
        popupWindow.setAttribute('style', popupStyles)
    }

    this.showPopup = function () {
        document.querySelector('body').style.overflow = 'hidden'
        popupMask.style.display = 'block'
        popupWindow.style.display = 'block'
        this.calcParametersForShow()
        this.addVariableStyles()

        this.raf( //Асинхронная работа
            function () {
                popupMask.style.opacity = maskOpacity
                popupWindow.style.top = popupWindowTop + 5 + 'px'
                if (popupWindowTop === 0) {
                    popupWindow.style.height = windowHeight - 10 + 'px'
                }
            }
        )

    }

    this.calcParametersForShow = function () {
        popupWindow.style.height = 'auto' // autoheight for popupWindow

        windowHeight = document.documentElement.clientHeight
        const popupWindowHeight = popupWindow.offsetHeight;

        (windowHeight > popupWindowHeight) ? popupWindowTop = ((windowHeight - popupWindowHeight) / 2) :
            popupWindowTop = 0
    }

    this.raf = function (fn) {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                fn()
            })
        })
    }

    this.hidePopup = function () {
        document.querySelector('body').style.overflow = 'auto'
        popupMask.addEventListener('transitionend', handlerMask)
        popupWindow.addEventListener('transitionend', handlerWindow)
        popupWindow.style.top = 3000 + 'px'
        popupMask.style.opacity = 0

        function handlerMask() {
            popupMask.removeEventListener('transitionend', handlerMask)
            popupMask.style.display = 'none'
        }

        function handlerWindow() {
            popupWindow.removeEventListener('transitionend', handlerWindow)
            popupWindow.style.display = 'none'
        }
    }

    this.btnAnimationOn = function () {
        this.style.transform = 'rotate(180deg)'
    }

    this.btnAnimationOut = function () {
        this.style.transform = 'rotate(-180deg)'
    }

    this.addVariableStyles = function () {
        if (popupWindow.style.display === 'block') {
            popupWindow.style.top = popupWindowTop + 'px'
        }
        if (popupWindowTop === 0) {
            popupWindow.style.height = windowHeight - 10 + 'px'
            popupWindow.style.top = popupWindowTop + 5 + 'px'
            popupWindow.style.overflowY = 'scroll';
        } else {
            popupWindow.style.overflowY = 'hidden';
        }
    }

}