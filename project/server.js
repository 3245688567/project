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
app.get('/update', (req, res) => {
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
      CMessage += ('event is already added');
      res.contentType('text/plain');
      res.status(404).send(CMessage);
    }
    else {
      Venue.findOne({venueId:{ $eq: vid }})
      .then((dataV) => {
        if (!dataV){
          CMessage += ('invalid venue');
          res.contentType('text/plain');
          res.status(404).send(CMessage);
        }
        else{
          console.log(dataV.NoOfEvent);
          Venue.findOneAndUpdate(
            {venueId:{ $eq: vid }},
            {NoOfEvent: dataV.NoOfEvent + 1},
            {new: true})
          .then((dataV2) => {
            console.log(dataV2.NoOfEvent);
            let newEvent = new Event({
            eventId: eid,
            eventTitle: etitle,
            date: edate,
            Venue: dataV._id,
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
            CMessage += ("One event is created");
            res.contentType('text/plain');
            res.status(200).send(CMessage);
          })
        }
      })
    }
  })

})

//R
app.get('/event/byid/:eventID',  (req, res) => {
  let eID = req.params.eventID;
  let RMessage = "";
  Event.findOne({eventId:{ $eq: eID }})
  .populate("Venue")
  .then((data) => {
    if (!data){
      RMessage += ('no such data');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      RMessage += ("{\n\"eventId\":"+ eID +
      ",\n\"eventTitle\":"+ data.eventTitle + 
      ",\n\"date\":"+ data.date +
      ",\n\"Venue\":" +
      "\n{\n\"venueId\":"+ data.Venue.venueId +
      ",\n\"venueName\":"+ data.Venue.venueName +
      ",\n\"latitude\":"+ data.Venue.latitude +
      ",\n\"longtitude\":"+ data.Venue.longitude +
      ",\n\"NoOfEvent\":"+ data.Venue.NoOfEvent +
      "\n}\n\"description\":"+ data.description +
      ",\n\"presenter\":"+ data.presenter +
      ",\n\"price\":"+ data.price +
      "\n}");
      res.contentType('text/plain')
      res.status(200).send(RMessage);
    }

})
.catch((error) => console.log(error));
})

app.get('/event/byname/:eventName',  (req, res) => {
  let eName = req.params.eventName;
  let RMessage = "";
  Event.findOne({eventTitle: eName })
  .populate("Venue")
  .then((data) => {
    if (!data){
      RMessage += ('no such data');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      RMessage += ("{\n\"eventId\":"+ data.eventId +
      ",\n\"eventTitle\":"+ data.eventTitle + 
      ",\n\"date\":"+ data.date +
      ",\n\"Venue\":" +
      "\n{\n\"venueId\":"+ data.Venue.venueId +
      ",\n\"venueName\":"+ data.Venue.venueName +
      ",\n\"latitude\":"+ data.Venue.latitude +
      ",\n\"longtitude\":"+ data.Venue.longitude +
      ",\n\"NoOfEvent\":"+ data.Venue.NoOfEvent +
      "\n}\n\"description\":"+ data.description +
      ",\n\"presenter\":"+ data.presenter +
      ",\n\"price\":"+ data.price +
      "\n}");
      res.contentType('text/plain')
      res.status(200).send(RMessage);
    }

})
.catch((error) => console.log(error));
})

app.get('/event/bydate/:eventDate',  (req, res) => {
  let eDate = req.params.eventDate;
  let RMessage = "";
  Event.find({date: eDate })
  .populate("Venue")
  .then((data) => {
    if (data==""){
      RMessage += ('no such data');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      for(let i = 0; i<data.length; i++){
      RMessage += ("{\n\"eventId\":"+ data[i].eventId +
      ",\n\"eventTitle\":"+ data[i].eventTitle + 
      ",\n\"date\":"+ data[i].date +
      ",\n\"Venue\":" +
      "\n{\n\"venueId\":"+ data[i].Venue.venueId +
      ",\n\"venueName\":"+ data[i].Venue.venueName +
      ",\n\"latitude\":"+ data[i].Venue.latitude +
      ",\n\"longtitude\":"+ data[i].Venue.longitude +
      ",\n\"NoOfEvent\":"+ data[i].Venue.NoOfEvent +
      "\n}\n\"description\":"+ data[i].description +
      ",\n\"presenter\":"+ data[i].presenter +
      ",\n\"price\":"+ data[i].price +
      "\n}\n");
      }
      res.contentType('text/plain')
      res.status(200).send(RMessage);
    }

})
.catch((error) => console.log(error));
})

app.get('/event/byvenue/:eventVenue',  (req, res) => {
  let eVenue = req.params.eventVenue;
  let RMessage = "";
  Venue.findOne({venueId:{ $eq: eVenue }})
  .then((dataV) => {
    if (!dataV){
      RMessage += ('no such venue');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      Event.find({Venue:{ $eq: dataV._id }})
      .populate("Venue")
      .then((data) => {
    if (data == ""){
      RMessage += ('no such data');
      res.contentType('text/plain');
      res.status(404).send(RMessage);
    }
    else {
      for(let i = 0; i<data.length; i++){
        RMessage += ("{\n\"eventId\":"+ data[i].eventId +
        ",\n\"eventTitle\":"+ data[i].eventTitle + 
        ",\n\"date\":"+ data[i].date +
        ",\n\"Venue\":" +
        "\n{\n\"venueId\":"+ data[i].Venue.venueId +
        ",\n\"venueName\":"+ data[i].Venue.venueName +
        ",\n\"latitude\":"+ data[i].Venue.latitude +
        ",\n\"longtitude\":"+ data[i].Venue.longitude +
        ",\n\"NoOfEvent\":"+ data[i].Venue.NoOfEvent +
        "\n}\n\"description\":"+ data[i].description +
        ",\n\"presenter\":"+ data[i].presenter +
        ",\n\"price\":"+ data[i].price +
        "\n}\n");
      }
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
  let etitle = req.body.eventtitle;
  let edate = req.body.eventdate;
  let vid = req.body.eventvenueid;
  let edes = req.body.eventdescription;
  let epresenter = req.body.eventpresenter;
  let eprice = req.body.eventprice;
  let UMessage = "";
  Event.findOne({eventId:{ $eq: eid }})
  .populate("Venue")
  .then((data) => {
    if (!data){
      UMessage += ('event is not existed');
      res.contentType('text/plain');
      res.status(404).send(UMessage);
    }
    else {
      if(etitle === "") etitle = data.eventTitle;
      if(edate === "") edate = data.date;
      if(vid === "") etitle = data.Venue.venueId;
      if(edes === "") edes = data.description;
      if(epresenter === "") epresenter = data.presenter;
      if(eprice === "") eprice = data.price;

      Venue.findOne({venueId:{ $eq: vid }})
      .then((dataV) => {
        if (!dataV){
          UMessage += ('invalid venue');
          res.contentType('text/plain');
          res.status(404).send(UMessage);
        }
        else{
          Venue.findOneAndUpdate(
            {venueId:{ $eq: data.Venue.venueId }},
            {NoOfEvent: data.Venue.NoOfEvent - 1},
            {new: true})
          .then((dataV2)=>{
          Venue.findOneAndUpdate(
            {venueId:{ $eq: vid }},
            {NoOfEvent: dataV.NoOfEvent + 1},
            {new: true})
          .then((dataV3)=>{
          Event.findOneAndUpdate(
            {eventId:{ $eq: eid }},
            {eventTitle: etitle, date: edate, Venue: dataV._id, description:edes, presenter: epresenter, price: eprice},
            {new: true})
          .then((dataE)=>{
          UMessage += ('You have successfully update an event.');
          res.contentType('text/plain');
          res.status(200).send(UMessage);
        })})})
        }
      })
    }
  })



})
//D
app.delete('/event/byid/:eventID', (req, res) => {
  const eventID = req.params.eventID;
  Event.findOne({eventId: {$eq: eventID}})
  .then((data) => {
    if (!data){
      res.contentType('text/plain');
      res.send("no such data");
    }
  
    else {
      Event.findOneAndDelete(
        { eventId: {$eq: eventID} }, 
        )
        .then((dataE) => {
          res.contentType('text/plain');
          res.send('The data is deleted successfully');
        })
        .catch((error) => console.log(error));
        
    }

})
})

app.delete('/event/byname/:eventtitle', (req, res) => {
  const eventtitle = req.params.eventtitle;
  Event.findOne({eventTitle: {$eq: eventtitle}})
  .then((data) => {
    if (!data){
      res.contentType('text/plain');
      res.send("no such data");
    }
  
    else {
      Event.findOneAndDelete(
        { eventTitle: {$eq: eventtitle} }, 
        )
        .then((dataE) => {
          res.contentType('text/plain');
          res.send('The data is deleted successfully');
        })
        .catch((error) => console.log(error));
        
    }

})
})

//CRUD stored users
//C
app.post('/user/', (req, res) => {
  return loginHandler.CreateUser(req, res);
});

//R
app.get('/user/:username', (req, res) => {
  return loginHandler.ReadUser(req, res);
});

//U
app.put('/user/:username', (req, res) => {
  return loginHandler.UpdateUser(req, res);
});
//D
app.delete('/user/:username', (req, res) => {
  return loginHandler.DeleteUser(req, res);
});

app.post('/addfav', (req, res) => {
  return loginHandler.addfav(req, res);
});

app.post('/loaduser', async (req, res) => {
  let fav= await loginHandler.user(req, res);
  const resdata=[];
  await Promise.all(fav.map(async (favItem) => {
    let num = Number(favItem);
    let data = await Venue.findOne({ venueId: num });

    if (data) {
      resdata.push(data.venueName);
    }
  }));

  res.setHeader('Content-Type', 'application/json');
  res.send(resdata);
});

const server = app.listen(3001);
