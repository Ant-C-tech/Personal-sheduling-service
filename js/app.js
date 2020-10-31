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
        closePopupBtn,
        deleteBtn,
        doneBtn


    let popupAddEvent = new PopUp({
        openBtn: 'showPopUpAddEvent',
        container: 'addEvent',
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

        </div>
    </div>`,
        maskColor: `#d6e6f9`,
        maskOpacity: '0.6',
    })


    let popup = new PopUp({
        openBtn: 'start2',
        container: 'popup',
        reload: 'updatePopup',
        content: ` <div class="panel panel-popup d-flex">
        <div class="todo-input todo-block align-self-stretch w-100">
            <span>Подія</span>
            <input id="editName" type="text" >
            <span>Категорія події:</span>
            <input id="editCategory" type="text" list="popupCategoryList">

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
            <div id="doneBtn" class="btn btn-primary">Змінити статус "Виконано" обраної події</div>
            <div id="deleteBtn" class="btn btn-primary updatePopup">Видалити подію</div>
        </div>
       
    </div>`,
        maskColor: `#d6e6f9`,
        maskOpacity: '0.6',
    })


    window.addEventListener('load', () => {

        //Elements
        inputElemEvent = document.querySelector('#inpEvent')
        inputElemCategory = document.querySelector('#inpCategory')
        dateInput = document.querySelector('#dateInput')
        timeInput = document.querySelector('#timeInput')
        addBtn = document.querySelector('#addBtn')
        sortByDateBtn = document.querySelector('#sortByDateBtn')
        managePanel = document.querySelector('#eventManagePanel')
        selectElem = document.querySelector('#categoryFilter')
        shortListBtn = document.querySelector('#shortListBtn')
        changeBtn = document.querySelector('#changeBtn')
        closePopupBtn = document.querySelector('.start2-popupClose')


        //Listeners
        addBtn.addEventListener('click', addEvent)
        shortListBtn.addEventListener('change', multipleFilter)
        selectElem.addEventListener('change', multipleFilter)
        changeBtn.addEventListener('click', commitEdit, {
            once: true,
        })


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

        // Create obj for new event
        let eventObj = {
            id: _uuid(),
            name: inputValueEvent,
            category: inputValueCategory,
            date: inputValueDate || '2020-01-01',
            time: inputValueTime,
            isDone: false,
        }

        //====================== Add event for google calendar==================
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

            var request = gapi.client.calendar.events.insert({
                'calendarId': CAL_ID,
                'resource': event
            })
            request.execute()
        }
        //=======================================================================


        //Render new event category
        renderEvent(eventObj)

        //Add new event in array eventList
        eventList.push(eventObj)

        updateEventList()

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
        eventRow.dataset.id = id
        managePanel.appendChild(eventRow)


        //Add a checkbox cell
        let checkboxCell = document.createElement('td')
        let checkboxElem = document.createElement('input')
        checkboxElem.type = 'checkbox'
        checkboxElem.addEventListener('click', doneEvent)
        checkboxElem.addEventListener('click', () => {
            if (shortListBtn.checked) {
                multipleFilter()
            }
        })
        checkboxElem.addEventListener('click', updateEventList)
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
        // eventDate.dataset.value = date
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
        eventTime.dataset.type = 'time'
        eventTime.dataset.id = id

        eventTime.innerText = time
        eventTimeCell.appendChild(eventTime)
        eventRow.appendChild(eventTimeCell)


        //Add a eventname cell
        let eventNameCell = document.createElement('td')

        let eventName = document.createElement('span')
        // eventName.dataset.editable = true
        eventName.dataset.type = 'name'
        eventName.dataset.id = id

        eventName.innerText = name
        eventNameCell.appendChild(eventName)
        eventRow.appendChild(eventNameCell)

        //Add a categoryname cell
        let categoryNameCell = document.createElement('td')

        let categoryName = document.createElement('span')
        // categoryName.dataset.editable = true
        categoryName.dataset.type = 'category'
        categoryName.dataset.id = id

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
        edit.addEventListener('click', function (event) {
            editEvent(event)
            document.querySelector('.start2').click()
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

        let eventColor = '#80deea'
        checkCalendarEventColor()
        //Add event to calendar
        addEventToCalendar({
            id: id,
            title: (isDone) ? `ВИКОНАНО!: ${name}` : name,
            start: `${date}T${time}`,
            color: eventColor,
        })

        function checkCalendarEventColor() {
            if (category === 'ВАЖЛИВО!') {
                eventColor = '#ff8a80'
            }
            if (isDone) {
                eventColor = '#e0f7fa'
            }
        }

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

            // Delete event for google calendar
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
                var request = gapi.client.calendar.events.delete({
                    'calendarId': CAL_ID,
                    'eventId': this.dataset.id,
                })
                request.execute()
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
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            locale: 'uk',
            contentHeight: 'auto',
            themeSystem: 'standard',
            initialDate: new Date(),
            buttonIcons: false, // show the prev/next text
            weekNumbers: true,
            navLinks: true, // can click day/week names to navigate views
            editable: true,
            dateClick: function (info) {
                preFillAddForm(info)
                document.querySelector('.showPopUpAddEvent').click()
            },
            eventDrop: function (info) {
                // console.log(info.event);
                calendarEventDragged(info.event)
            },
            dayMaxEvents: true, // allow "more" link when too many events
            events: [],
            eventClick: function (info) {
                editEvent(info.event)
                document.querySelector('.start2').click()
            },
            eventBackgroundColor: '#B2EBF2',
            eventBorderColor: ' #607D8B',
            eventTextColor: ' #607D8B',
            eventTimeFormat: {
                hour: 'numeric',
                minute: '2-digit',
                // second: false,
                omitZeroMinute: false,
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

                let filteredCompleteArr = eventList.filter(obj => obj.isDone === true)
                renderAllEvents(filteredCompleteArr)
            } else {
                renderAllEvents(eventList)
            }
        } else {
            let filteredCategoryArr = eventList.filter(obj => obj.category === selectElem.value)

            if (shortListBtn.checked) {
                let filteredIncompleteArr = filteredCategoryArr.filter(obj => obj.isDone === false)

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

    function editEvent(event) {
        let currentElemId
        if (event.target) { //our own event
            currentElemId = event.target.dataset.id
        } else { // calendar event
            currentElemId = event.id
        }

        changeBtn.dataset.id = currentElemId
        preFillEditForm(currentElemId)
    }

    function preFillEditForm(currentElemId) {
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

        doneBtn = document.querySelector('#doneBtn')
        doneBtn.addEventListener('click', function () {
            makeDoneCurrentEvent2(currentElemId)
        }, {
            once: true,
        })

        deleteBtn = document.querySelector('#deleteBtn')
        deleteBtn.addEventListener('click', function () {
            deleteCurrentEvent(currentElemId)
        }, {
            once: true,
        })
    }

    function preFillAddForm(event) {

        const dateRegExp = /^.{10}/g
        const newEventDate = event.dateStr.match(dateRegExp)
        const timeRegExp = /(?<=T).{5}/g
        const newEventTime = event.dateStr.match(timeRegExp)

        document.querySelector('#dateInput').value = newEventDate[0]
        if (newEventTime != null) {
            document.querySelector('#timeInput').value = newEventTime[0]
        }

    }

    function commitEdit(event) {

        let id = event.target.dataset.id

        let nameObj = document.querySelector('#editName').value
        let category = document.querySelector('#editCategory').value
        let dateObj = document.querySelector('#editDate').value
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

        updateEventList()

    }

    function calendarEventDragged(event) {
        const druggedElementId = event.id
        const druggedElementDateObj = new Date(event.start)
        const eventNewYear = druggedElementDateObj.getFullYear()
        let eventNewMonth = druggedElementDateObj.getMonth() + 1
        if (eventNewMonth.toString().length < 2) {
            eventNewMonth = `0${eventNewMonth}`
        }
        let eventNewDay = druggedElementDateObj.getDate()
        if (eventNewDay.toString().length < 2) {
            eventNewDay = `0${eventNewDay}`
        }
        const eventNewDate = `${eventNewYear}-${eventNewMonth}-${eventNewDay}`

        eventList.forEach(itemObj => {
            if (itemObj.id == druggedElementId) {
                itemObj.date = eventNewDate
            }
        })

        updateEventList()
    }

    function makeDoneCurrentEvent2(id) {
        eventList.forEach(itemObj => {
            if (itemObj.id === id) {
                itemObj.isDone = !itemObj.isDone
            }
        })

        updateEventList()
    }

    function deleteCurrentEvent(id) {

        eventList.forEach(function (item, index, object) {
            if (item.id === id) {
                object.splice(index, 1);
            }
        })

        updateEventList()
    }

    function updateEventList() {
        saveEvent()
        let currentFilter = ''
        if (selectElem.value !== 'Всі категорії') {
            currentFilter = selectElem.value
        }
        clearEvents()
        renderAllEvents(eventList)

        // Sort events by date
        sortEventListByDate()

        if (currentFilter !== '') {
            selectElem.value = currentFilter
            multipleFilter()
        }

        if (shortListBtn.checked) {
            multipleFilter()
        }
    }


    //========================================  Animation for event list  =====================================================

    const btnShow = document.querySelector('.show-alert-anim')
    const btnShowAnimIcon = document.querySelector('.arrowBtn')
    const divAlert = document.querySelector('.animTarget-anim')

    let showTableFlag = false

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

        divAlert.classList.add('fa-enter')

        raf(
            function () {
                divAlert.classList.add('fa-enter-active')
                divAlert.classList.add('fa-enter-to')
                divAlert.classList.remove('fa-enter')
            }
        )

        divAlert.addEventListener('transitionend', handler)

        btnShow.removeEventListener('click', show)
        btnShow.addEventListener('click', hide)

        function handler() {
            divAlert.classList.remove('fa-enter-active')
            divAlert.classList.remove('fa-enter-to')
            divAlert.removeEventListener('transitionend', handler)
        }
    }



    function hide() {

        divAlert.classList.add('fa-leave')
        divAlert.classList.add('fa-leave-active')
        raf(
            function () {

                divAlert.classList.add('fa-leave-to')
                divAlert.classList.remove('fa-leave')
            }
        )

        divAlert.addEventListener('transitionend', handler)

        //--Toggle--
        btnShow.removeEventListener('click', hide)
        btnShow.addEventListener('click', show)

        function handler() {
            divAlert.style.display = 'none'

            divAlert.classList.remove('fa-leave-active')
            divAlert.classList.remove('fa-leave-to')
            divAlert.removeEventListener('transitionend', handler)
        }
    }

    function raf(fn) {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                fn()
            })
        })
    }
}