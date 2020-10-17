'use strict'
todoMain()

function todoMain() {

    let inputElemEvent,
        inputElemCategory,
        dateInput,
        timeInput,
        addBtn,
        sortByDateBtn,
        managePanel,
        selectElem,
        eventList = [],
        calendar,
        shortListBtn,
        changeBtn,
        closePopupBtn


    // App start
    // getElements()
    // addListeners()

    let popupAddEvent = new PopUp({
        openBtn: 'start',
        container: 'addEvent',
        // reload: 'updatePopup-popupAddEvent',
        content: `<div class="panel d-flex">
        <div class="todo-input todo-block align-self-stretch w-100">
            <span>Подія</span>
            <input id="inpEvent" type="text" placeholder="Заплануйте нову подію">
            <span>Категорія події:</span>
            <input id="inpCategory" type="text" placeholder="Зазначте категорію події" list="categoryList">

            <datalist id="categoryList">
                <option value="Особиста подія"></option>
                <option value="Робоча подія"></option>
                <option value="ВАЖЛИВО!"></option>
            </datalist>
            <span>Дата:</span>
            <input type="date" id="dateInput">

            <span> Час:</span>
            <input type="time" id="timeInput">
            <span></span>

            <div id="addBtn" class="addBtn updatePopup-popupAddEvent btn btn-primary">Додати подію</div>
            <span></span>
            <div id="sortByDateBtn" class="btn btn-primary">Сортувати за датою</div>

            <span></span>
            <label class="shortListBtn"><input class="mr-3" id="shortListBtn" type="checkbox">Актуальні події напочатку</label>

        </div>
    </div>`,
        maskColor: `#fff`,
        maskOpacity: '0.01',
    })

    //     document.addEventListener('click', function(event){
    // console.log(event.target)
    //     })



    let popup = new PopUp({
        // openBtn: 'showPopup',
        openBtn: 'start2',
        container: 'popup',
        reload: 'updatePopup',
        content: ` <div class="panel panel-popup d-flex">
        <div class="todo-input todo-block align-self-stretch w-100">
            <span>Подія</span>
            <input id="editName" type="text" >
            <span>Категорія події:</span>
            <input id="editCategory" type="text" list="categoryList">

            <datalist id="popupCategoryList">
                <option value="Особиста подія"></option>
                <option value="Робоча подія"></option>
                <option value="ВАЖЛИВО!"></option>
            </datalist>
            <span>Дата:</span>
            <input type="date" id="editDate">

            <span> Час:</span>
            <input type="time" id="editTime">
            <span></span>

            <div id="changeBtn" class="btn btn-primary updatePopup">Зберігти зміни</div>
        </div>
       
    </div>`,
        maskColor: `#fff`,
        maskOpacity: '0.01',
    })


    // let startPopupAddEvCol = document.querySelectorAll('.showPopup')


    window.addEventListener('load', () => {

        let startPopupAddEvCol = document.querySelectorAll('.material-icons')
        console.log("todoMain -> startPopupAddEvCol", startPopupAddEvCol)

        // function getElements() {
        inputElemEvent = document.querySelector('#inpEvent')
        inputElemCategory = document.querySelector('#inpCategory')
        dateInput = document.querySelector('#dateInput')
        timeInput = document.querySelector('#timeInput')
        addBtn = document.querySelector('#addBtn')
        sortByDateBtn = document.querySelector('#sortByDateBtn')
        managePanel = document.querySelector('#eventManagePanel')
        selectElem = document.querySelector('#categoryFilter')
        shortListBtn = document.querySelector('#shortListBtn')
        // }

        // function addListeners() {

        addBtn.addEventListener('click', addEvent)
        sortByDateBtn.addEventListener('click', sortEventListByDate)
        shortListBtn.addEventListener('change', multipleFilter)
        selectElem.addEventListener('change', multipleFilter)

        // managePanel.addEventListener('click', managePanelReduct)
        // }


        changeBtn = document.querySelector('#changeBtn')
        closePopupBtn = document.querySelector('.start2-popupClose')
        console.log("todoMain -> closePopupBtn", closePopupBtn)
        // closePopupBtn.classList.add('updatePopup')
        changeBtn.addEventListener('click', commitEdit)


        initCalendar()
        loadEvents()
        renderAllEvents(eventList)
        updateFilterOptions()
    })


    function addEvent() {

        //Get event name
        const inputValueEvent = inputElemEvent.value
        inputElemEvent.value = ''

        //Get event category
        const inputValueCategory = inputElemCategory.value
        inputElemCategory.value = ''

        //Get date
        const inputValueDate = dateInput.value
        dateInput.value = ''

        //Get time
        const inputValueTime = timeInput.value
        timeInput.value = ''

        console.log(inputValueDate)

        // Create obj for new event
        let eventObj = {
            id: _uuid(),
            name: inputValueEvent,
            category: inputValueCategory,
            date: inputValueDate || '2020-01-01',
            time: inputValueTime,
            isDone: false,
        }

        //Event add for google calendar
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            if (!eventObj.time) {
                var event = {
                    'summary': eventObj.name,
                    'id': eventObj.id,
                    'start': {
                        'date': eventObj.date,
                        'timeZone': 'Europe/Kiev',
                    },
                    'end': {
                        'date': eventObj.date,
                        'timeZone': 'Europe/Kiev',
                    },
                }
            } else {
                var event = {
                    'summary': eventObj.name,
                    'id': eventObj.id,
                    'start': {
                        'dateTime': eventObj.date + 'T' + eventObj.time + ':00',
                        'timeZone': 'Europe/Kiev',
                    },
                    'end': {
                        'dateTime': eventObj.date + 'T' + eventObj.time + ':00',
                        'timeZone': 'Europe/Kiev',
                    },
                }
            }
            // console.log(event);

            var request = gapi.client.calendar.events.insert({
                'calendarId': CAL_ID,
                'resource': event
            })
            request.execute()
            // console.log('event pushed for gCal ' + event.id);
        }
        //-------------------------------------------------------------------


        //Render new event category

        renderEvent(eventObj)


        //Add new event in array eventList
        eventList.push(eventObj)

        //Save event to LocalStorage
        saveEvent()

        //Update filter options
        updateFilterOptions()

        console.log(eventList)
    }

    function updateFilterOptions() {
        let filters = ['Всі категорії'] //by default

        const events = Array.from(document.querySelectorAll('table>tr'))

        events.forEach((item) => {
            const category = item.querySelector('.categoryName').innerText
            filters.push(category)
        })

        let filterSet = new Set(filters)

        selectElem.innerHTML = ''

        for (let item of filterSet) {
            let customFilterElem = document.createElement('option')
            customFilterElem.value = item
            customFilterElem.innerText = item
            selectElem.appendChild(customFilterElem)
        }

    }

    function saveEvent() {
        const stringified = JSON.stringify(eventList)
        localStorage.setItem('eventList', stringified)
    }

    function loadEvents() {
        let eventData = localStorage.getItem('eventList')
        eventList = JSON.parse(eventData)
        if (eventList === null) {
            eventList = []
        }
    }

    function renderAllEvents(arr) {
        arr.forEach(itemObj => {
            renderEvent(itemObj) //Деструктуризация
        })
    }

    function renderEvent({
        id,
        name,
        category,
        date,
        time,
        isDone,
    }) { //Деструктуризация

        //Add a new event (row)
        let eventRow = document.createElement('tr')
        managePanel.appendChild(eventRow)

        //Add a checkbox cell
        let checkboxCell = document.createElement('td')
        let checkboxElem = document.createElement('input')
        checkboxElem.type = 'checkbox'
        checkboxElem.addEventListener('click', doneEvent)
        checkboxElem.dataset.id = id
        if (isDone) {
            eventRow.classList.add('strike')
            checkboxElem.checked = true
        } else {
            eventRow.classList.remove('strike')
            checkboxElem.checked = false
        }
        checkboxCell.appendChild(checkboxElem)
        eventRow.appendChild(checkboxCell)

        //Add a date cell
        let eventDateCell = document.createElement('td')

        let eventDate = document.createElement('span')
        // eventDate.dataset.editable = true
        eventDate.dataset.type = 'date'
        eventDate.dataset.value = date
        eventDate.dataset.id = id

        let dateObj = new Date(date)
        const uaDate = dateObj.toLocaleString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })

        eventDate.innerText = uaDate
        eventDateCell.appendChild(eventDate)
        eventRow.appendChild(eventDateCell)

        //Add a time cell
        let eventTimeCell = document.createElement('td')

        let eventTime = document.createElement('span')
        // eventTime.dataset.editable = true
        // eventTime.dataset.type = 'time'
        // eventTime.dataset.id = id

        eventTime.innerText = time
        eventTimeCell.appendChild(eventTime)
        eventRow.appendChild(eventTimeCell)


        //Add a eventname cell
        let eventNameCell = document.createElement('td')

        let eventName = document.createElement('span')
        // eventName.dataset.editable = true
        // eventName.dataset.type = 'name'
        // eventName.dataset.id = id

        eventName.innerText = name
        eventNameCell.appendChild(eventName)
        eventRow.appendChild(eventNameCell)

        //Add a categoryname cell
        let categoryNameCell = document.createElement('td')

        let categoryName = document.createElement('span')
        // categoryName.dataset.editable = true
        // categoryName.dataset.type = 'category'
        // categoryName.dataset.id = id

        categoryName.className = 'categoryName'
        categoryName.innerText = category
        categoryNameCell.appendChild(categoryName)
        eventRow.appendChild(categoryNameCell)

        //Add a edit cell
        let editCell = document.createElement('td')
        let edit = document.createElement('i')
        edit.dataset.id = id
        edit.innerText = 'edit'
        edit.className = 'material-icons'
        edit.classList.add('showPopup')
        // edit.addEventListener('click', editEvent)
        edit.addEventListener('click', function (event) {
            editEvent(event)
            document.querySelector('.start2').click()
            console.log("todoMain -> document.querySelector('.start2')", document.querySelector('.start2'))

        })
        editCell.appendChild(edit)
        eventRow.appendChild(editCell)

        //Add a basket cell
        let basketCell = document.createElement('td')
        let basket = document.createElement('i')
        basket.dataset.id = id
        basket.innerText = 'delete'
        basket.className = 'material-icons'
        basket.addEventListener('click', deleteEvent)
        basketCell.appendChild(basket)
        eventRow.appendChild(basketCell)

        //Add event to calendar
        addEventToCalendar({
            id: id,
            title: name,
            start: date,
        })

        function deleteEvent() {
            eventRow.remove() // Замыкание!!!
            updateFilterOptions()

            for (let i = 0; i < eventList.length; i++) {
                if (eventList[i].id == this.dataset.id) {
                    eventList.splice(i, 1)
                }
            }

            saveEvent()

            // Fullcalendar
            calendar.getEventById(this.dataset.id).remove()

            // Event delete for google calendar
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
                var request = gapi.client.calendar.events.delete({
                    'calendarId': CAL_ID,
                    'eventId': this.dataset.id,
                })
                request.execute()
                // console.log('id for delete: ' + this.dataset.id);
            }
        }

        function doneEvent() {
            eventRow.classList.toggle('strike')
            for (let item of eventList) {
                if (item.id == this.dataset.id) {
                    item.isDone = !item.isDone
                }
            }

            saveEvent()
        }

        function editEvent(event) {
            console.log('work')
            const currentElemId = event.target.dataset.id
            const currentElem = eventList.find(itemObj => itemObj.id == currentElemId)
            let {
                name,
                category,
                date,
                time
            } = currentElem
            document.querySelector('#editName').value = name
            document.querySelector('#editCategory').value = category
            document.querySelector('#editDate').value = date
            document.querySelector('#editTime').value = time

            changeBtn.dataset.id = id
        }

    }

    function _uuid() {
        var d = Date.now()
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now() // use high precision timer if available
        }
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0
            d = Math.floor(d / 16)
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })
    }
    // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx

    function sortEventListByDate() {
        eventList.sort((a, b) => {
            const aDate = Date.parse(a.date)
            const bDate = Date.parse(b.date)
            return aDate - bDate
        })

        saveEvent()
        clearEvents()
        renderAllEvents(eventList)
        updateFilterOptions()
    }

    function initCalendar() {
        var calendarEl = document.getElementById('calendar');

        calendar = new FullCalendar.Calendar(calendarEl, {
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
            },
            locale: 'uk',
            contentHeight: 'auto',
            themeSystem: 'bootstrap',
            buttonIcons: false, // show the prev/next text
            weekNumbers: true,
            navLinks: true, // can click day/week names to navigate views
            editable: true,
            dayMaxEvents: true, // allow "more" link when too many events
            events: [],
            dateClick: function (info) {
                document.querySelector('.start').click()
            },

        });

        calendar.render();

    }

    function addEventToCalendar(event) {
        calendar.addEvent(event)
    }

    function clearEvents() {
        const events = Array.from(document.querySelectorAll('table>tr'))

        for (let item of events) {
            item.remove()
        }

        // Fullcalendar
        calendar.getEvents().forEach(event => event.remove())
    }

    function multipleFilter() {
        clearEvents()

        if (selectElem.value === 'Всі категорії') {
            if (shortListBtn.checked) {
                let filteredIncompleteArr = eventList.filter(obj => obj.isDone === false)
                renderAllEvents(filteredIncompleteArr)
                let filteredCompleteArr = eventList.filter(obj => obj.isDone === true)
                renderAllEvents(filteredCompleteArr)
            } else {
                renderAllEvents(eventList)
            }
        } else {
            let filteredCategoryArr = eventList.filter(obj => obj.category === selectElem.value)

            if (shortListBtn.checked) {
                let filteredIncompleteArr = filteredCategoryArr.filter(obj => obj.isDone === false)
                console.log("multipleFilter -> filteredIncompleteArr", filteredIncompleteArr)

                if (filteredIncompleteArr.length == 0) {
                    let eventRow = document.createElement('tr')
                    managePanel.appendChild(eventRow)
                    let eventMessageCell = document.createElement('td')
                    eventMessageCell.setAttribute('colspan', '6')
                    let eventMessage = document.createElement('span')
                    eventMessage.innerText = 'У Вас немає актуальних подій за обраною категорією'
                    eventMessageCell.appendChild(eventMessage)
                    eventRow.appendChild(eventMessageCell)
                } else {
                    renderAllEvents(filteredIncompleteArr)
                }

                let filteredCompleteArr = filteredCategoryArr.filter(obj => obj.isDone === true)
                renderAllEvents(filteredCompleteArr)

            } else {
                renderAllEvents(filteredCategoryArr)
            }
        }

    }


    function commitEdit(event) {

        let id = event.target.dataset.id

        let nameObj = document.querySelector('#editName').value
        let category = document.querySelector('#editCategory').value
        let dateObj = document.querySelector('#editDate').value
        console.log("commitEdit -> dateObj", dateObj)
        let time = document.querySelector('#editTime').value

        calendar.getEventById(id).remove()

        eventList.forEach(itemObj => {
            if (itemObj.id == id) {

                itemObj.id = id
                itemObj.name = nameObj
                itemObj.category = category
                itemObj.time = time
                itemObj.date = dateObj

                addEventToCalendar({
                    id: itemObj.id,
                    title: itemObj.name,
                    start: itemObj.date,
                })

            }
        })


        saveEvent()
        clearEvents()
        renderAllEvents(eventList)
        updateFilterOptions()



        console.log(eventList)
    }


    //========================================  Animation keyframes  =====================================================

    const btnShow = document.querySelector('.show-alert-anim')
    const btnShowAnimIcon = document.querySelector('.arrowBtn')

    let showTableFlag = false
    // const btnHideAnim = document.querySelector('.hide-alert-anim')
    const divAlert = document.querySelector('.animTarget-anim')

    btnShow.addEventListener('click', function () {
        show()
        if (!showTableFlag) {
            btnShowAnimIcon.classList.add('arrowBtn-rev')
        } else {
            btnShowAnimIcon.classList.remove('arrowBtn-rev')
        }

        showTableFlag = !showTableFlag
    })



    function show() {

        divAlert.style.display = 'block'

        // Т.к. по умолчанию опасити и так 1 тразишену некуда выполняться
        // Принудительно задаём исходное опасити 0
        divAlert.classList.add('fa-enter')

        // И только после этого (асинхронно) выполняем анимацию, которая уже теперь может работать.
        raf( //Асинхронная работа
            function () {
                divAlert.classList.add('fa-enter-active')
                divAlert.classList.add('fa-enter-to')
                divAlert.classList.remove('fa-enter')
            }
        )

        divAlert.addEventListener('transitionend', handler) // подчищаем класы, удаляем листенер

        //--Toggle--
        btnShow.removeEventListener('click', show) // Запрещаем повторное нажатие 'Show'
        btnShow.addEventListener('click', hide) //Разрешаем работу с кнопкой "Скрыть"

        function handler() {
            divAlert.classList.remove('fa-enter-active')
            divAlert.classList.remove('fa-enter-to')
            divAlert.removeEventListener('transitionend', handler)
        }
    }



    function hide() {

        // Работает и без асинхронности здесь т.к. значение опасити по умолчанию 1 и есть куда совершать транзишн
        // Но резервируем класс если прийдётся работать с другими свойствами, значение по умолчанию которых нам не подойдёт
        divAlert.classList.add('fa-leave')
        divAlert.classList.add('fa-leave-active')
        raf(
            function () {

                divAlert.classList.add('fa-leave-to')
                divAlert.classList.remove('fa-leave')
            }
        )

        divAlert.addEventListener('transitionend', handler) // дисплей: нон, подчищаем класы, удаляем листенер

        //--Toggle--
        btnShow.removeEventListener('click', hide) // Запрещаем повторное нажатие 'Hide'
        btnShow.addEventListener('click', show) //Разрешаем работу с кнопкой "Show"

        function handler() {
            divAlert.style.display = 'none'

            divAlert.classList.remove('fa-leave-active')
            divAlert.classList.remove('fa-leave-to')
            divAlert.removeEventListener('transitionend', handler)
        }
    }

    function raf(fn) { //Откладывает запуск дальнейшего рендеринга до срабатывания предъидущего
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                fn()
            })
        })
    }
}