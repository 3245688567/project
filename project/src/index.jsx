import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './frontend/LoginPage'

var login = 0;   //0=non-user, 1=user, 2=admin, will show different content in "Content"&"Title"


class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      userType: null,
    };
  }

  componentDidMount() {
    const userType = sessionStorage.getItem("userType");
    if (userType === "user")
      login = 1;
    else if (userType === "admin")
      login = 2;
    else
      login = 0;
    this.setState({ userType });
  }

  render() {

    return (
      <>
        <Title name="Cultural programmes" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={(login === 0) ? <LoginPage /> : <Home />} />
            <Route path="/content" element={(login === 0) ? <LoginPage /> : <Content />} />
            <Route path="/home" element={(login === 0) ? <LoginPage /> : <Home />} />
            <Route path="/detail/*" element={(login === 0) ? <LoginPage /> : <Detail />} />
            <Route path="/user" element={(login === 0) ? <LoginPage /> : <User/>} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </BrowserRouter>
      </>
    );
  }
}

class Title extends React.Component {
  handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
    login = 0;
  };

  render() {
    return (
      <div>
        <header className="bg-warning" style={{ minHeight: '150px' }}>
          <h1 className="display-4 text-center" style={{ padding: '30px' }}>{this.props.name}</h1>

          {login === 0 ? <></> :
            <>
              <div style={{ textAlign: 'center' }}>
                <span>
                  <a href="/" className="btn btn-primary">Home</a>
                  <a href="/content" className="btn btn-secondary">Content</a>
                  <a href="/user" className="btn btn-info">User info</a>
                </span>
                <span style={{ position: 'absolute', right: '5px' }}>
                  {login === 1 ? 'User' : 'Admin'}: {sessionStorage.getItem("userName")}    <button className="btn btn-link" id="logout" onClick={this.handleLogout}>Logout</button>
                </span>
              </div>
              <hr />
            </>
          }
        </header>
      </div>
    );
  }
}

class Home extends React.Component {
  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <h2>The Introduction of Our Project</h2>
        <iframe src="https://www.google.com/maps/d/u/0/embed?mid=1q91avWMQOpqfN4dhchhg9LyKJlPdbDE&ehbc=2E312F&noprof=1" width="640" height="480"></iframe>
        <br></br>
        <p>
          <div class="container mt-3">
            <table class="table">
              <thead class="table-secondary">
                <tr>
                  <th>Catogories</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Our Group Members</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Work Distribution</td>
                  <td></td>
                </tr>
                <tr>
                  <td>DataSet</td>
                  <td></td>
                </tr>
                <tr>
                  <td>The Usage of Different Files</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Schema and Model</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Addtional Features</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </p>
      </div>
    );
  }
}


class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [], order: 0, keyword: ``, updatetime: 0 };//order: 0=ascending, 1=descending
  }

  async componentDidMount() {
    console.log("test..");
    await fetch('http://localhost:3001/locationAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({ data: responseData })
      }
      );

    await fetch('http://localhost:3001/update', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    this.setState({ updatetime: new Date() })

  }
  async search(keyword) {
    const data = { keyword: keyword };
    console.log(data);
    await fetch('http://localhost:3001/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({ data: responseData })
      }
      );
  }
  setkeyword = (keyword) => {
    this.setState({ keyword: keyword })
  }
  SortTable(data) {
    console.log("sort...");
    if (this.state.order === 0) {
      data.sort(this.ascending);
      this.setState({ order: 1 })
    }
    if (this.state.order === 1) {
      data.sort(this.descending);
      this.setState({ order: 0 })
    }
  }
  ascending(a, b) {
    if (a.NoOfEvent < b.NoOfEvent) {
      return -1;
    }
    if (a.NoOfEvent > b.NoOfEvent) {
      return 1;
    }
    return 0;
  }
  descending(b, a) {
    if (a.NoOfEvent < b.NoOfEvent) {
      return -1;
    }
    if (a.NoOfEvent > b.NoOfEvent) {
      return 1;
    }
    return 0;
  }

//CRUD stored events
//C

async CreateEvent(event) {
  event.preventDefault();
  const eventid = event.target.elements.Ceid.value;
  const eventtitle = event.target.elements.Cetitle.value;
  const eventdate = event.target.elements.Cedate.value;
  const eventvenueid = event.target.elements.Cevenue.value;
  const eventdescription = event.target.elements.CeDes.value;
  const eventpresenter = event.target.elements.CePresenter.value;
  const eventprice = event.target.elements.CePrice.value;
  const data = {
      eventid: eventid,
      eventtitle: eventtitle,
      eventdate: eventdate,
      eventvenueid: eventvenueid,
      eventdescription: eventdescription,
      eventpresenter: eventpresenter,
      eventprice: eventprice
  };

  const response = await fetch('http://localhost:3001/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const resultPage = await response.text();
  alert(resultPage);
};

//R

async ReadEventByID(event) {
  event.preventDefault();
  const evid = event.target.elements.Reid.value;
  const response = await fetch('http://localhost:3001/event/byid/' + evid, {
    method: 'GET',
  });
  const resultPage = await response.text();
  alert(resultPage);

  };

async ReadEventByName(event) {
  event.preventDefault();
  const evname = event.target.elements.Rename.value;
  const response = await fetch('http://localhost:3001/event/byname/' + evname, {
      method: 'GET',
  });
  const resultPage = await response.text();
  alert(resultPage);
  };

async ReadEventByDate(event) {
  event.preventDefault();
  const evdate = event.target.elements.Redate.value;
  const response = await fetch('http://localhost:3001/event/bydate/' + evdate, {
      method: 'GET',
  });
  const resultPage = await response.text();
  alert(resultPage);
  };


async ReadEventByVenue(event) {
  event.preventDefault();
  const evvenue = event.target.elements.Revenue.value;
  const response = await fetch('http://localhost:3001/event/byvenue/' + evvenue, {
      method: 'GET',
  });
  const resultPage = await response.text();
  alert(resultPage);
  };

//U
async UpdateEvent(event) {
  event.preventDefault();
  const eventid = event.target.elements.Ueid.value;
  const eventtitle = event.target.elements.Uetitle.value;
  const eventdate = event.target.elements.Uedate.value;
  const eventvenueid = event.target.elements.Uevenue.value;
  const eventdescription = event.target.elements.UeDes.value;
  const eventpresenter = event.target.elements.UePresenter.value;
  const eventprice = event.target.elements.UePrice.value;
  const data = {
      eventid: eventid,
      eventtitle: eventtitle,
      eventdate: eventdate,
      eventvenueid: eventvenueid,
      eventdescription: eventdescription,
      eventpresenter: eventpresenter,
      eventprice: eventprice
  };

  // use PUT method to send a request to the server
  const response = await fetch('http://localhost:3001/event/' + eventid, { //put your server address here
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  // render a new page if a response is received
  const resultPage = await response.text();
  alert(resultPage);
};

//D
async DeleteEventByID(event) {
  event.preventDefault();
  const eventID = event.target.elements.Deid.value;
  const data = {
    eventID: eventID
  };

  // use Delete method to send a request to the server
  const response = await fetch('http://localhost:3001/event/byid/'+ eventID, { //put your server address here
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  // render a new page if a response is received
  const resultPage = await response.text();
  alert(resultPage);
};

async DeleteEventByName(event) {
  event.preventDefault();
  const eventtitle = event.target.elements.Dename.value;
  const data = {
      eventtitle: eventtitle
  };

  // use Delete method to send a request to the server
  const response = await fetch('http://localhost:3001/event/byname/'+ eventtitle, { //put your server address here
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  // render a new page if a response is received
  const resultPage = await response.text();
  alert(resultPage);
};






//CRUD stored users

//C
async CreateUser(event) {
  event.preventDefault();
  const username = event.target.elements.CUsername.value;
  const password = event.target.elements.CPw.value;

  const data = {
      username: username,
      password: password
  };

  // use POST method to send a request to the server
  const response = await fetch('http://localhost:3001/user', { //put your server address here
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  // render a new page if a response is received
  const resultPage = await response.text();
  alert(resultPage);
};

//R
async ReadUser(event) {
  event.preventDefault();
  const username = event.target.elements.RUsername.value;
  const response = await fetch('http://localhost:3001/user/' + username, {
    method: 'GET',
  });
  const resultPage = await response.text();
  alert(resultPage);
  };





//U
async UpdateUser(event) {
  event.preventDefault();
  const username = event.target.elements.UUsername.value;
  const newusername = event.target.elements.UNewUser.value;
  const newpassword = event.target.elements.UPw.value;
  
  const data = {
      username: username,
      newusername: newusername,
      newpassword: newpassword,
  };

  // use PUT method to send a request to the server
  const response = await fetch('http://localhost:3001/user/' + username, { //put your server address here
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  // render a new page if a response is received
  const resultPage = await response.text();
  alert(resultPage);
};


//D
async DeleteUser(event) {
  event.preventDefault();
  const username = event.target.elements.DUsername.value;
  const data = {
      username: username
  };

  // use Delete method to send a request to the server
  const response = await fetch('http://localhost:3001/user/'+ username, { //put your server address here
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  // render a new page if a response is received
  const resultPage = await response.text();
  alert(resultPage);
};


  render() {
    const data = this.state.data;
    let keyword = this.state.keyword;
    if (login === 1) {
      return (
        <>

          <main className="container">
            <div class="row">
              <h2 class="col-sm-8">Cultural Programmes</h2>
              <h6 class="col-sm-2 align-items-right">Last updated on: {this.state.updatetime.toLocaleString()}</h6>
            </div>
            <div class="row align-items-center">
              <label class="col-sm-2 col-form-label col-form-label-lg">Search for location:</label>
              <div class="col-sm-4">
                <input type="text" class="form-control" id="search" placeholder=" Keywords in the name" value={this.state.keyword}
                  onChange={(e) => this.setkeyword(e.target.value)}></input>
              </div>
              <div class="col-sm-4">
                <button type="submit" class="btn btn-warning mb-2" onClick={(e) => this.search(keyword)}>Search</button>
              </div>
            </div>

            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Venues</th>
                  <th scope="col" onClick={() => this.SortTable(data)}>Number of Event ⇅</th>
                </tr>
              </thead>
              <tbody>
                {data.map((element, index) => (
                  <Table i={index} data={element} key={index} order={this.order} />
                ))}
              </tbody>
            </table>
          </main>
        </>
      );
    }
    else if (login === 2) {
      return (
        <section>
        <h2 style={{textAlign:"center"}}>You are now an admin and you can do CRUD now</h2>
        <br></br>
        <div>{this.state.result}</div>
        <div class="container p-5 my-5 border">
        <h3 style={{textAlign:"center"}}>CRUD Stored Events</h3>
        <br></br><br></br>
        <span class="row">
        <span class="col-sm-3">
        <h3>Create an Event</h3>
            <body>
              <br></br>
              <form id="CEvent" onSubmit={this.CreateEvent}>
                 <label for="Ceid">Event ID: </label>
                 <br></br>
                 <input type="number" id="Ceid" name="Ceid" placeholder="1234567" required></input>
                 <br></br>
                 <label for="Cetitle">Event Title: </label>
                 <br></br>
                 <input type="text" id="Cetitle" name="Cetitle" placeholder="Hello Hong Kong" required></input>
                 <br></br>
                 <label for="Cedate">Event Date: </label>
                 <br></br>
                 <input type="text" id="Cedate" name="Cedate" placeholder="15 December 2023 (Fri) 7:45pm"></input>
                 <br></br>
                 <label for="Cevenue">Event Venue ID: </label>
                 <br></br>
                 <input type="number" id="Cevenue" name="Cevenue" placeholder="36310035" required></input>
                 <br></br>
                 <label for="CeDes">Event Description: </label>
                 <br></br>
                 <textarea id="CeDes" name="CeDes"></textarea>
                 <br></br>
                 <label for="CePresenter">Event Presenter: </label>
                 <br></br>
                 <input type="text" id="CePresenter" name="CePresenter" placeholder="Colin Tsang"></input>
                 <br></br>
                 <label for="CePrice">Event Price: </label>
                 <br></br>
                 <input type="text" id="CePrice" name="CePrice" placeholder="FOR FREE"></input>
                 <br></br><br></br><br></br>
                 <input type="submit" value="Create"></input>
              </form>
            </body>
            </span>
            <span class="col-sm-3">
        <h3>Read(Find) Events</h3>
            <body>
              <br></br>
              <form id="REventByID" onSubmit={this.ReadEventByID}>
                 <label for="Reid">By Event ID: </label>
                 <br></br>
                 <input type="number" id="Reid" name="Reid" placeholder="1234567" required></input>
                 <br></br>
                 <input type="submit" value="Find"></input>
              </form>
              <br></br><br></br>
              <form id="REventByName" onSubmit={this.ReadEventByName}>
                 <label for="Rename">By Event Name: </label>
                 <br></br>
                 <input type="text" id="Rename" name="Rename" placeholder="Hello Hong Kong" required></input>
                 <br></br>
                 <input type="submit" value="Find"></input>
              </form>
              <br></br><br></br>
              <form id="REventByDate" onSubmit={this.ReadEventByDate}>
                 <label for="Redate">By Event Date: </label>
                 <br></br>
                 <input type="text" id="Redate" name="Redate" placeholder="15 December 2023 (Fri) 7:45pm" required></input>
                 <br></br>
                 <input type="submit" value="Find"></input>
              </form>
              <br></br><br></br>
              <form id="REventByVenue" onSubmit={this.ReadEventByVenue}>
                 <label for="Revenue">By Venue ID: </label>
                 <br></br>
                 <input type="number" id="Revenue" name="Revenue" placeholder="36310035" required></input>
                 <br></br>
                 <input type="submit" value="Find"></input>
              </form>
            </body>
            </span>
            <span class="col-sm-3">
              <h3>Update an Event</h3>
            <body>
              <br></br>
              <form id="UEvent" onSubmit={this.UpdateEvent}>
                 <label for="Ueid">Corresponding Event ID: </label>
                 <br></br>
                 <input type="number" id="Ueid" name="Ueid" placeholder="1234567" required></input>
                 <br></br>
                 <label for="Uetitle">Change Event Title: </label>
                 <br></br>
                 <input type="text" id="Uetitle" name="Uetitle" placeholder="Goodbye Hong Kong"></input>
                 <br></br>
                 <label for="Uedate">Add/Change Event Date: </label>
                 <br></br>
                 <input type="text" id="Uedate" name="Uedate" placeholder="30 December 2023 (Sat) 10:45pm"></input>
                 <br></br>
                 <label for="Uevenue">Update Event Venue ID: </label>
                 <br></br>
                 <input type="number" id="Uevenue" name="Uevenue" placeholder="50110014"></input>
                 <br></br>
                 <label for="UeDes">Add/Change Event Description: </label>
                 <br></br>
                 <textarea id="UeDes" name="UeDes" placeholder="GPA=4.0"></textarea>
                 <br></br>
                 <label for="UePresenter">Add/Change Event Presenter: </label>
                 <input type="text" id="UePresenter" name="UePresenter" placeholder="John Doe"></input>
                 <br></br>
                 <label for="CePrice">Add/Change Event Price: </label>
                 <br></br>
                 <input type="text" id="UePrice" name="UePrice" placeholder="$90"></input>
                 <br></br><br></br><br></br>
                 <input type="submit" value="Update"></input>
              </form>
            </body>
            </span>
            
            <span class="col-sm-3">
        <h3>Delete an Event</h3>
        <body>
              <br></br>
              <form id="DEventByID" onSubmit={this.DeleteEventByID}>
                 <label for="Deid">By Event ID: </label>
                 <br></br>
                 <input type="number" id="Deid" name="Deid" placeholder="1234567" required></input>
                 <br></br>
                 <input type="submit" value="Delete"></input>
              </form>
              <br></br><br></br>
              <form id="DEventByName" onSubmit={this.DeleteEventByName}>
                 <label for="Dename">By Event Name: </label>
                 <br></br>
                 <input type="text" id="Dename" name="Dename" placeholder="Goodbye Hong Kong" required></input>
                 <br></br>
                 <input type="submit" value="Delete"></input>
              </form>
              </body>
            </span>
            
            </span>
        </div>
        <div class="container p-5 my-5 border">
        <h3 style={{textAlign:"center"}}>CRUD User Data</h3>
        <br></br><br></br>
        <span class="row">
        <span class="col-sm-3">
        <h3>Create an User</h3>
            <body>
              <br></br>
              <form id="CUser" onSubmit={this.CreateUser}>
                 <label for="CUsername">Username: </label>
                 <br></br>
                 <input type="text" id="CUsername" name="CUsername" placeholder="Colin Tsang" required></input>
                 <br></br>
                 <label for="CPw">Password: </label>
                 <br></br>
                 <input type="text" id="CPw" name="CPw" required></input>
                 <br></br><br></br>
                 <input type="submit" value="Create"></input>
              </form>
            </body>
            </span>
            <span class="col-sm-3">
        <h3>Read(Find) Users</h3>
            <body>
              <br></br>
              <form id="RUser" onSubmit={this.ReadUser}>
                 <label for="RUsername">By Username: </label>
                 <br></br>
                 <input type="text" id="RUsername" name="RUsername" placeholder="Colin Tsang" required></input>
                 <br></br><br></br>
                 <input type="submit" value="Find"></input>
              </form>
            </body>
            </span>
            <span class="col-sm-3">
            <h3>Update an User</h3>
            <body>
              <br></br>
              <form id="UUser" onSubmit={this.UpdateUser}>
                 <label for="UUsername">Corresponding Username: </label>
                 <br></br>
                 <input type="text" id="UUsername" name="UUsername" placeholder="Colin Tsang" required></input>
                 <br></br>
                 <label for="UNewUser">Change Username: </label>
                 <br></br>
                 <input type="text" id="UNewUser" name="UNewUser" placeholder="John Doe"></input>
                 <br></br>
                 <label for="UPw">Change Password: </label>
                 <br></br>
                 <input type="text" id="UPw" name="UPw"></input>
                 <br></br><br></br>
                 <input type="submit" value="Update"></input>
              </form>
            </body>
            </span>
            
            <span class="col-sm-3">
        <h3>Delete an User</h3>
        <body>
              <br></br>
              <form id="DUser" onSubmit={this.DeleteUser}>
                 <label for="DUsername">Username: </label>
                 <br></br>
                 <input type="text" id="DUsername" name="DUsername" placeholder="John Doe" required></input>
                 <br></br><br></br>
                 <input type="submit" value="Delete"></input>
              </form>
              </body>
            </span>
            </span>
        </div>
        </section>

      )
    }
  }
}

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sort: this.props.order };
  }

  render() {
    let i = this.props.i;
    let data = this.props.data;
    return (
      <>
        <tr>
          <th scope="row" >{i + 1}</th>
          <td>{data.venueName}</td>
          <td>{data.NoOfEvent}</td>
          <td><Link to={`/detail/?id=${data.venueId}`}
            className="btn btn-light"
          >Detail</Link></td>
        </tr>
      </>
    );
  }
}

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [], venuedata: [] ,add:0};
  }

  async componentDidMount() {
    const string = window.location.search;
    const params = new URLSearchParams(string);
    const data = { venueId: params.get('id') };
    await fetch('http://localhost:3001/locationOne', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((venueData) => {
        this.setState({ venuedata: venueData })
      }
      );

    await fetch('http://localhost:3001/searchevent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({ data: responseData })
      }
      );
  }
  
  async favhandler(add,venueId,username){
      const data={
        venueId:venueId,
        username:username
      };
      await fetch('http://localhost:3001/addfav', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
     .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData.exist);
        if(responseData.exist) alert("This location have been added to your favourite list.");
        else alert("This location is added to your favourite list sucessfully.");
      }
      ); 
  }

  render() {
    const data = this.state.data;
    const add =this.state.add;
    const string = window.location.search;
    const params = new URLSearchParams(string);
    const id = params.get('id');
    const name =sessionStorage.getItem("userName");
    const map=
      {"3110031":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2606.4471659461756!2d114.12742562506205!3d22.501446684472494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403f6111d440b2b%3A0x7b981328cc89734!2z5YyX5Y2A5aSn5pyD5aCC!5e0!3m2!1szh-TW!2shk!4v1702571697439!5m2!1szh-TW!2shk",
      "36310035":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3689.2679684582395!2d114.1850681461801!3d22.381253287609518!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340407ad20c0e0b9%3A0x63a6cd3b60321f72!2z5rKZ55Sw5aSn5pyD5aCC!5e0!3m2!1szh-TW!2shk!4v1702571728385!5m2!1szh-TW!2shk",
      "50110014":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.578647195748!2d114.16779741088216!3d22.293945443041025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340400f3b16783a7%3A0xda44b020c9d402c9!2z6aaZ5riv5paH5YyW5Lit5b-D!5e0!3m2!1szh-TW!2shk!4v1702571854394!5m2!1szh-TW!2shk",
      "75010017":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.8138204221436!2d114.21943481088194!3d22.2850413433636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404017143647dfb%3A0x467b09e91aa326b!2z6aaZ5riv6Zu75b2x6LOH5paZ6aSo!5e0!3m2!1szh-TW!2shk!4v1702571869126!5m2!1szh-TW!2shk",
      "76810048":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59023.82265039324!2d113.91266875018624!3d22.391775299999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403fb3d84532b93%3A0x87c98bcf1b8bb83!2z5bGv6ZaA5aSn5pyD5aCC!5e0!3m2!1szh-TW!2shk!4v1702571763937!5m2!1szh-TW!2shk",
      "87510008":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.8876890002775!2d114.15905581088192!3d22.282243843465015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404006400f23fbd%3A0xdea5d17c31b69b5f!2z6aaZ5riv5aSn5pyD5aCC!5e0!3m2!1szh-TW!2shk!4v1702571782995!5m2!1szh-TW!2shk",
      '87610118':"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.0438651612562!2d114.1834789608826!3d22.31418074230737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340400d96f479aed%3A0x560cdcd5b3daa2d4!2z6auY5bGx5YqH5aC0!5e0!3m2!1szh-TW!2shk!4v1702571820387!5m2!1szh-TW!2shk",
      '87810042':"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.7838427161446!2d114.14718441088189!3d22.286176543322437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404007e9c24b3a5%3A0x83ed51f800bfdd6b!2z5LiK55Kw5paH5aib5Lit5b-D!5e0!3m2!1szh-TW!2shk!4v1702571834528!5m2!1szh-TW!2shk",
      "87310051":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3687.6683170464116!2d114.02036131088573!3d22.441506537677142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403fa751d5bf8d1%3A0x4ab5818262ecb8b6!2z5YWD5pyX5YqH6Zmi!5e0!3m2!1szh-TW!2shk!4v1702571884808!5m2!1szh-TW!2shk",
      "87110024":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3689.9132569280487!2d114.12361171088367!3d22.356903940756414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403f8bc20c11343%3A0xd855aaf56545d2cb!2z6JG16Z2S5YqH6Zmi!5e0!3m2!1szh-TW!2shk!4v1702571905602!5m2!1szh-TW!2shk"}
    ;
    console.log(map);

    return (
      <div class="container">
        <div class="row">
          <div class="col-sm-8"><h2>{this.state.venuedata.venueName}</h2></div>
          <div class="col-sm-2"><button class="btn btn-danger" onClick={() =>this.favhandler(add,id,name)}>Favourite ♡</button></div>
        </div>
        <iframe src={map[id]} width="400" height="300" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        <br></br>
        
        <h3>All event detail: </h3>
        <div class="col-sm-10">
          <table class="table table-borderless table-hover">
            {data.map((data, index) => (
              <div>
                <tr>
                  <th scope="row">Event title:</th>
                  <td>{data.eventTitle}</td>
                </tr>
                <tr>
                  <th scope="row">Date:</th>
                  <td>{data.date}</td>
                </tr>
                <tr>
                  <th scope="row">Description:</th>
                  <td>{data.description}</td>
                </tr>
                <tr>
                  <th scope="row">Presenter</th>
                  <td>{data.presenter}</td>
                </tr>
                <tr>
                  <th scope="row">Price:</th>
                  <td>{data.price}</td>
                </tr>
                <button class="btn btn-primary">Like &#128077;</button>
                <hr/>
              </div>
            ))}
          </table>
        </div>
        <div id="map" class="col-sm-5"></div>
      </div>
    )
  }
}

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: []};
  }
   async componentDidMount() {
    const name =sessionStorage.getItem("userName");
    const data = { name:name }; 
    await fetch('http://localhost:3001/loaduser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((resData) => {
        this.setState({ data: resData })
      }
      );
  } 
  render() {
    const data=this.state.data;
    return (
      <>
      <div class="container">
        <h2> favourite locations</h2>
        {data.map((element, index) => (
                  <tr>
                  <th scope="row" >{index + 1}. </th>
                  <td>{element}</td>
                </tr>
                ))}
      </div>
      </>
    );
  }
}

class NoMatch extends React.Component {
  render() {
    return <h2>Page not found</h2>;
  }
}
const root = ReactDOM.createRoot(document.querySelector('#app'));
root.render(<App name="Cultural Programmes" />);
