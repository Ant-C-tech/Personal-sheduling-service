function addGoogleEvent(eventObj) {
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
        }
        else {
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
        console.log('addGoogleEvent '+event);
            
        var request = gapi.client.calendar.events.insert({
            'calendarId': CAL_ID,
            'resource': event
        })
        request.execute()
    }
}
    
function updateGoogleEvent(itemObj) {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        // console.log('updateG: ' + itemObj.name);
       if(!itemObj.time) var event = {
            'summary': itemObj.name,
            // 'id': itemObj.id,
            'start': {
                'date': itemObj.date,
                'timeZone': 'Europe/Kiev',
            },
            'end': {
                'date': itemObj.date,
                'timeZone': 'Europe/Kiev',
            },
        }
        else var event = {
                'summary': itemObj.name,
                // 'id': itemObj.id,
                'start': {
                    'dateTime': itemObj.date + 'T' + itemObj.time + ':00',
                    'timeZone': 'Europe/Kiev',
                },
                'end': {
                    'dateTime': itemObj.date + 'T' + itemObj.time + ':00',
                    'timeZone': 'Europe/Kiev',
                },
            }
        var request = gapi.client.calendar.events.update({
            'calendarId': CAL_ID,
            'eventId': itemObj.id,
            'resource': event
        })
        request.execute()
    }
}
