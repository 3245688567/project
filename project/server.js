//npm install xml2js cors mongoose express
const express = require('express');
const app = express();

const { parseString } = require('xml2js');

const cors = require('cors');
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

          /* console.log(`Event ${i + 1}:`);
          console.log(`  Title (Chinese): ${event.titlec[0]}`);
          console.log(`  Title (English): ${event.titlee[0]}`);
          console.log(`  Date (Chinese): ${event.predateC[0]}`);
          console.log(`  Date (English): ${event.predateE[0]}`);
          console.log(`  Venue ID: ${event.venueid[0]}`);
          console.log('------------------------'); */

        })
      }
    })
  })
  .catch(error => {
    console.error('Error fetching venues:', error);
  });

app.get('/locationAll', (req, res) => {

  Venue.find({})
    .then(async (data) => {
      res.setHeader('Content-Type', 'text/plain');
      res.send(data);
    })
    .catch((error) => console.log(error));
});

const server = app.listen(3001);
