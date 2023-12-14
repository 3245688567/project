//npm install xml2js cors mongoose express bcrypt
const express = require('express');
const app = express();

const { parseString } = require('xml2js');

const cors = require('cors');

const loginHandler = require('./src/backend/userHandler.js');

app.use(cors());
app.use(express.json());


const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/CulturalProgrammes'); // put your own database link here

const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon opening the database successfully
db.once('open', function () {
  console.log("Connection is open...");
});
// ---------------Schema and Model-------------------------
const VenueSchema = mongoose.Schema({
  venueId: {
    type: Number,
    unique: true,
  },
  venueName: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  NoOfEvent: { type: Number, required: true }
});

const EventSchema = mongoose.Schema({
  eventId: {
    type: Number,
    required: [true, "Name is required"],
    unique: true,
  },
  eventTitle: {
    type: String,
    required: true,
  },
  date: {
    type: String,
  },
  Venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  description: { type: String },
  presenter: { type: String },
  price: { type: String },

});

const Event = mongoose.model("Event", EventSchema);
const Venue = mongoose.model("Venue", VenueSchema);
const venuelist = ['3110031', '36310035', '50110014', '75010017', '76810048', '87510008', '87610118', '87810042', '87310051', '87110024'];
//fetch Venue XML
fetch('https://www.lcsd.gov.hk/datagovhk/event/venues.xml')
  .then(async response => await response.text())
  .then(data => {
    const xmldata = data;
    //console.log(xmldata);
    parseString(xmldata, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err.message);
      } else {
        // Accessing the parsed data
        const venues = result.venues.venue;
        venuelist.forEach((id) => {
          // Find the venue with a specific ID
          const targetVenue = venues.find((venue) => venue.$.id === id);

          if (targetVenue) {
            const venueId = parseInt(targetVenue.$.id);
            const venueName = targetVenue.venuee[0];
            const latitude = targetVenue.latitude[0];
            const longitude = targetVenue.longitude[0];

            //check venue exist in mongodb or not
            Venue.findOne({ venueId: venueId })
              .then(async (data) => {
                if (data) {
                  console.log("Venue already there");
                } else {
                  var newVenue = new Venue();
                  newVenue.venueId = venueId;
                  newVenue.venueName = venueName;
                  newVenue.latitude = latitude;
                  newVenue.longitude = longitude;
                  newVenue.NoOfEvent = 0;
                  await newVenue.save();
                }
              });
            // Output the parsed data for the target venue
            /* console.log('Venue ID:', venueId);
            console.log('Venue Name:', venueName);
            console.log('Latitude:', latitude);
            console.log('Longitude:', longitude); */
          } else {
            console.log('Venue not found.');
          }
        })
      }
    })
  })
  .catch(error => {
    console.error('Error fetching venues:', error);
  });
//---------------------------------------------------------------------------------
//fetch events XML
  fetch('https://www.lcsd.gov.hk/datagovhk/event/events.xml')
    .then(async response => await response.text())
    .then(data => {
      const xmldata = data;

      parseString(xmldata, async (err, result) => {
        if (err) {
          console.error('Error parsing XML:', err.message);
        } else {
          venuelist.forEach(async (venueid) => {
            const filteredEvents = result.events.event.filter(event => event.venueid[0] === venueid);

            await Venue.findOneAndUpdate( //update the number of events at venue
              { "venueId": venueid },
              {
                NoOfEvent: filteredEvents.length
              },
              { new: true },
            );
            // Output all events with the specified venueid
            filteredEvents.forEach((event) => {

              //check the event exist in mongodb or not
              Event.findOne({ "eventId": event.$.id })
                .then(async (data) => {
                  const venuedata = await Venue.find({ "venueId": event.venueid[0] });
                  if (data) {
                    await Event.findOneAndUpdate(
                      { "eventId": event.$.id },
                      {
                        eventTitle: event.titlee[0],
                        date: event.predateE[0],
                        Venue: venuedata[0]._id,
                        description: event.desce[0],
                        presenter: event.presenterorge[0],
                        price: event.pricee[0]
                      },
                      { new: true },
                    )
                      //.then((data) => {console.log('the updated data is:', data)})
                      .catch((error) => console.log(error));
                    console.log("Event Updated");
                  } else {

                    var newEvent = new Event();
                    newEvent.eventId = event.$.id;
                    newEvent.eventTitle = event.titlee[0];
                    newEvent.date = event.predateE[0];
                    newEvent.Venue = venuedata[0]._id;
                    await newEvent.save();
                  }
                });
            })
          })
        }
      })
    })
    .catch(error => {
      console.error('Error fetching venues:', error);
    });
    res.setHeader('Content-Type', 'text/plain');
    res.send("Updated");
});

app.get('/locationAll', (req, res) => {
  Venue.find({})
    .then(async (data) => {
      res.setHeader('Content-Type', 'text/plain');
      res.send(data);
    })
    .catch((error) => console.log(error));
});
app.post('/locationOne', (req, res) => {
  Venue.findOne({venueId:req.body.venueId})
    .then(async (data) => {
      res.setHeader('Content-Type', 'text/plain');
      res.send(data);
    })
    .catch((error) => console.log(error));
});
app.post('/search', (req, res) => {
  let keyword=req.body.keyword;
  Venue.find({venueName:{ $regex: keyword, $options: 'i' }})
    .then(async (data) => {
      res.setHeader('Content-Type', 'text/plain');
      res.send(data);
    })
    .catch((error) => console.log(error));
});
app.post('/searchevent', (req, res) => {
  const venueId = req.body.venueId;
  Venue.findOne({ venueId: venueId })
    .then(async (data) => {
      const id = data._id;
      const name=data.venueName;
      await Event.find({ Venue: id })
        .then((eventdata) => {
          
          res.setHeader('Content-Type', 'text/plain');
          res.send(eventdata);
        })
    })
    .catch((error) => console.log(error));
});

app.post('/register', (req, res) => {
  return loginHandler.register(req, res);
})

app.post('/login', (req, res) => {
  return loginHandler.login(req, res);
})

//CRUD stored events
//C
app.post('/event/', (req, res) => {
  const eid = req.body.eventid;
  const etitle = req.body.eventtitle;
  const edate = req.body.eventdate;
  const vid = req.body.eventvenueid;
  const edes = req.body.eventdescription;
  const epresenter = req.body.eventpresenter;
  const eprice = req.body.eventprice;
  let CMessage = "";

  Event.findOne({eventId:{ $eq: eid }})
  .populate("Venue")
  .then((data) => {
    if (data){
      CMessage += ('event is already added<br></br><br></br><a href="/content">return to "Content"</a>');
      res.contentType('text/plain');
      res.status(404).send(CMessage);
    }
    else {
      Venue.findOne({venueId:{ $eq: vid }})
      .then((dataV) => {
        if (dataV === ""){
          CMessage += ('invalid venue<br></br><br></br><a href="/content">return to "Content"</a>');
          res.contentType('text/plain');
          res.status(404).send(CMessage);
        }
        else{
          Venue.findOneAndUpdate(
            {venueId:{ $eq: vid }},
            {NoOfEvent: dataV[0].NoOfEvent+1},
            {new: true})
          let newEvent = new Event({
            eventID: eid,
            eventTitle: etitle,
            date: edate,
            Venue: quota,
            description: edes,
            presenter: epresenter,
            price: eprice
            });
          
            //Saving this new event to database
            newEvent
            .save()
            .then(() => {
              console.log("a new event created successfully");
            })
            .catch((error) => {
              console.log("fail to create the event");
              console.log(error);
            });
            CMessage += (
            "The following event is created:<br></br>{<br></br>\"eventId\":"+ eid +
            ",<br></br>\"eventTitle\":"+ etitle + 
            ",<br></br>\"date\":"+ edate +
            ",<br></br>\"Venue\":" +
            "<br></br>{<br></br>\"venueId\":"+ vid +
            ",<br></br>\"venueName\":"+ dataV[0].venueName +
            ",<br></br>\"latitude\":"+ dataV[0].latitude +
            ",<br></br>\"longtitude\":"+ dataV[0].longitude +
            ",<br></br>\"NoOfEvent\":"+ dataV[0].NoOfEvent +
            "<br></br>}<br></br>\"description\":"+ edes +
            ",<br></br>\"presenter\":"+ epresenter +
            ",<br></br>\"price\":"+ eprice +
            "<br></br>}<br></br>"+
            "<br></br><a href='/content'>return to 'Content'</a>");
            res.contentType('text/plain');
            res.status(200).send(CMessage);
        }
      })
    }
  })

})

//R
app.get('/event/:eventID',  (req, res) => {
  let eID = req.params.eventID;
  let RMessage = "";
  Event.findOne({eventId:{ $eq: eID }})
  .populate("Venue")
  .then((data) => {
    if (data === ""){
      RMessage += ('no such data<br></br><br></br><a href="/content">return to "Content"</a>');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      RMessage += ("{<br></br>\"eventId\":"+ data[0].eventId +
      ",<br></br>\"eventTitle\":"+ data[0].eventTitle + 
      ",<br></br>\"date\":"+ data[0].date +
      ",<br></br>\"Venue\":" +
      "<br></br>{<br></br>\"venueId\":"+ data[0].Venue.venueId +
      ",<br></br>\"venueName\":"+ data[0].Venue.venueName +
      ",<br></br>\"latitude\":"+ data[0].Venue.latitude +
      ",<br></br>\"longtitude\":"+ data[0].Venue.longitude +
      ",<br></br>\"NoOfEvent\":"+ data[0].Venue.NoOfEvent +
      "<br></br>}<br></br>\"description\":"+ data[0].Venue.description +
      ",<br></br>\"presenter\":"+ data[0].Venue.presenter +
      ",<br></br>\"price\":"+ data[0].Venue.price +
      "<br></br>}<br></br>"+
      "<br></br><a href='/content'>return to 'Content'</a>");
      res.contentType('text/plain')
      res.status(200).send(RMessage);
    }

})
.catch((error) => console.log(error));
})

app.get('/event/:eventName',  (req, res) => {
  let eName = req.params.eventName;
  let RMessage = "";
  Event.findOne({eventTitle:{ $eq: eName }})
  .populate("Venue")
  .then((data) => {
    if (data === ""){
      RMessage += ('no such data<br></br><br></br><a href="/content">return to "Content"</a>');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      RMessage += ("{<br></br>\"eventId\":"+ data[0].eventId +
      ",<br></br>\"eventTitle\":"+ data[0].eventTitle + 
      ",<br></br>\"date\":"+ data[0].date +
      ",<br></br>\"Venue\":" +
      "<br></br>{<br></br>\"venueId\":"+ data[0].Venue.venueId +
      ",<br></br>\"venueName\":"+ data[0].Venue.venueName +
      ",<br></br>\"latitude\":"+ data[0].Venue.latitude +
      ",<br></br>\"longtitude\":"+ data[0].Venue.longitude +
      ",<br></br>\"NoOfEvent\":"+ data[0].Venue.NoOfEvent +
      "<br></br>}<br></br>\"description\":"+ data[0].Venue.description +
      ",<br></br>\"presenter\":"+ data[0].Venue.presenter +
      ",<br></br>\"price\":"+ data[0].Venue.price +
      "<br></br>}<br></br>"+
      "<br></br><a href='/content'>return to 'Content'</a>");
      res.contentType('text/plain')
      res.status(200).send(RMessage);
    }

})
.catch((error) => console.log(error));
})

app.get('/event/:eventDate',  (req, res) => {
  let eDate = req.params.eventDate;
  let RMessage = "";
  Event.find({date:{ $eq: eDate }})
  .populate("Venue")
  .then((data) => {
    if (data === ""){
      RMessage += ('no such data<br></br><br></br><a href="/content">return to "Content"</a>');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      for(let i = 0; i<data.length; i++){
      RMessage += ("{<br></br>\"eventId\":"+ data[i].eventId +
      ",<br></br>\"eventTitle\":"+ data[i].eventTitle + 
      ",<br></br>\"date\":"+ data[i].date +
      ",<br></br>\"Venue\":" +
      "<br></br>{<br></br>\"venueId\":"+ data[i].Venue.venueId +
      ",<br></br>\"venueName\":"+ data[i].Venue.venueName +
      ",<br></br>\"latitude\":"+ data[i].Venue.latitude +
      ",<br></br>\"longtitude\":"+ data[i].Venue.longitude +
      ",<br></br>\"NoOfEvent\":"+ data[i].Venue.NoOfEvent +
      "<br></br>}<br></br>\"description\":"+ data[i].Venue.description +
      ",<br></br>\"presenter\":"+ data[i].Venue.presenter +
      ",<br></br>\"price\":"+ data[i].Venue.price +
      "<br></br>}<br></br>");
      }
      RMessage +="<br></br><a href='/content'>return to 'Content'</a>";
      res.contentType('text/plain')
      res.status(200).send(RMessage);
    }

})
.catch((error) => console.log(error));
})

app.get('/event/:eventVenue',  (req, res) => {
  let eVenue = req.params.eventVenue;
  let RMessage = "";
  Venue.findOne({venueId:{ $eq: eVenue }})
  .then((dataV) => {
    if (dataV === ""){
      RMessage += ('no such venue<br></br><br></br><a href="/content">return to "Content"</a>');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      Event.find({Venue:{ $eq: eVenue }})
      .populate("Venue")
      .then((data) => {
    if (data === ""){
      RMessage += ('no such data<br></br><br></br><a href="/content">return to "Content"</a>');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      for(let i = 0; i<data.length; i++){
      RMessage += ("{<br></br>\"eventId\":"+ data[i].eventId +
      ",<br></br>\"eventTitle\":"+ data[i].eventTitle + 
      ",<br></br>\"date\":"+ data[i].date +
      ",<br></br>\"Venue\":" +
      "<br></br>{<br></br>\"venueId\":"+ data[i].Venue.venueId +
      ",<br></br>\"venueName\":"+ data[i].Venue.venueName +
      ",<br></br>\"latitude\":"+ data[i].Venue.latitude +
      ",<br></br>\"longtitude\":"+ data[i].Venue.longitude +
      ",<br></br>\"NoOfEvent\":"+ data[i].Venue.NoOfEvent +
      "<br></br>}<br></br>\"description\":"+ data[i].Venue.description +
      ",<br></br>\"presenter\":"+ data[i].Venue.presenter +
      ",<br></br>\"price\":"+ data[i].Venue.price +
      "<br></br>}<br></br>")
      }
      RMessage += ("<br></br><a href='/content'>return to 'Content'</a>");
      res.contentType('text/plain')
      res.status(200).send(RMessage);
    
    }
})
.catch((error) => console.log(error));
    }
    
})
})


//U
app.put('/event/:eventID', (req, res) => {
  let eid = req.params.eventID;
  const etitle = req.body.eventtitle;
  const edate = req.body.eventdate;
  const vid = req.body.eventvenueid;
  const edes = req.body.eventdescription;
  const epresenter = req.body.eventpresenter;
  const eprice = req.body.eventprice;
  let UMessage = "";
  Event.findOne({eventId:{ $eq: eid }})
  .populate("Venue")
  .then((data) => {
    if (data === ""){
      UMessage += ('event is not existed<br></br><br></br><a href="/content">return to "Content"</a>');
      res.contentType('text/plain');
      res.status(404).send(UMessage);
    }
    else {
      Venue.findOne({venueId:{ $eq: vid }})
      .then((dataV) => {
        if (dataV === ""){
          UMessage += ('invalid venue<br></br><br></br><a href="/content">return to "Content"</a>');
          res.contentType('text/plain');
          res.status(404).send(UMessage);
        }
        else{
          if(vid !== ""){
          Venue.findOneAndUpdate(
            {venueId:{ $eq: data[0].Venue.venueId }},
            {NoOfEvent: data[0].Venue.NoOfEvent-1},
            {new: true})
          Venue.findOneAndUpdate(
            {venueId:{ $eq: vid }},
            {NoOfEvent: dataV[0].NoOfEvent+1},
            {new: true})
          }
          if(etitle !== "")
          Event.findOneAndUpdate(
            {venueId:{ $eq: eid }},
            {eventtitle: etitle},
            {new: true})
          if(edate !== "")
          Event.findOneAndUpdate(
            {venueId:{ $eq: eid }},
            {date: edate},
            {new: true})
          if(vid !== "")
          Event.findOneAndUpdate(
            {venueId:{ $eq: eid }},
            {Venue: dataV[0]._id},
            {new: true})
          if(edes !== "")
          Event.findOneAndUpdate(
            {venueId:{ $eq: eid }},
            {description: edes},
            {new: true})
          if(epresenter !== "")
          Event.findOneAndUpdate(
            {venueId:{ $eq: eid }},
            {presenter: epresenter},
            {new: true})
          if(eprice !== "")
          Event.findOneAndUpdate(
            {venueId:{ $eq: eid }},
            {price: eprice},
            {new: true})

          UMessage += ('You have successfully update an event.<br></br><br></br><a href="/content">return to "Content"</a>');
          res.contentType('text/plain');
          res.status(200).send(UMessage);
        }
      })
    }
  })



})
//D
app.delete('/event/:eventID', (req, res) => {
  const eventID = req.params.eventID;
  Event.find({eventId: {$eq: eventID}})
  .then((data) => {
    if (data === ""){
      res.contentType('text/plain');
      res.status(404).send("no such data");
    }
  
    else {
      Event.findOneAndDelete(
        { eventId: {$eq: eventID} }, 
        )
        .then((data) => {
          res.contentType('text/plain');
          res.status(204).send('The deleted data is:', data);
        })
        .catch((error) => console.log(error));
        
    }

})
})

app.delete('/event/:eventtitle', (req, res) => {
  const eventtitle = req.params.eventtitle;
  Event.find({eventTitle: {$eq: eventtitle}})
  .then((data) => {
    if (data === ""){
      res.contentType('text/plain');
      res.status(404).send("no such data");
    }
  
    else {
      Event.findOneAndDelete(
        { eventTitle: {$eq: eventtitle} }, 
        )
        .then((data) => {
          res.contentType('text/plain');
          res.status(204).send('The deleted data is:', data);
        })
        .catch((error) => console.log(error));
        
    }

})
})















const server = app.listen(3001);
