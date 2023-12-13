import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './frontend/LoginPage'

var login = 0;   //0=non-user, 1=user, 2=admin, will show different content in "Content"&"Login"&"Title" page


class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      userType: null,
    };
  }

  componentDidMount() {
    const userType = sessionStorage.getItem("userType");
    if(userType === "user")
      login = 1;
    else if(userType === "admin")
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
            <Route path="/" element={(login === 0) ? <LoginPage /> : <Home />  } />
            <Route path="/content" element={(login === 0) ? <LoginPage /> : <Content /> } />
            <Route path="/home" element={(login === 0) ? <LoginPage /> : <Home /> } />            
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
  };

  render() {
      return (
        <div>
        <header className="bg-warning">
          <h1 className="display-4 text-center">{this.props.name}</h1>
          
          {login===0? '' :
              <>
                <ul style={{textAlign:"right"}}>
                    <p>{login === 1? 'User' : 'Admin' } : {sessionStorage.getItem("userName")}<button class="btn btn-link" id="logout" onClick={this.handleLogout} >logout</button></p>
                </ul>
                <div>
                  <ul style={{textAlign:"center"}}>
                    <a href="/" class="btn btn-primary">Home</a>
                    <a href="/content" class="btn btn-secondary">Content</a>
                  </ul>
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
      <div style={{textAlign:"center"}}>
        <h2>The Introduction of Our Project</h2>
        <p>
        <div class="container mt-3">
            <table class="table">
              <thead class="table-secondary">
                <tr>
                  <th>Company</th>
                  <th>His Career</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Zip2 Corporation (1995-1999)</td>
                  <td>Elon Musk co-founded Zip2, a software company providing business directories and maps for newspapers and the company was later acquired by Compaq for $307 million. This is his first financial success.</td>
                </tr>
                <tr>
                  <td>X.com and PayPal (1999-2002)</td>
                  <td>Elon Musk founded X.com, the Paypal's predecessor. This company later growed rapidly and was acquired by eBay in 2002 for $1.5 billion, becoming another financial success for him.</td>
                </tr>
                <tr>
                  <td>SpaceX (2002-present)</td>
                  <td>In 2002, Elon Musk founded SpaceX, aiming at reducing the cost of space travel and making space travel comes true. This is the world's first privately-funded company to send a spacecraft to orbit and to dock with the International Space Station (ISS).</td>
                </tr>
                <tr>
                  <td>Tesla, Inc. (2004-present)</td>
                  <td>Elon Musk joined Tesla Motors, an electric vehicle company, as chairman and later became the CEO. Company later achieved the greatest sales on electric vehices in the world.</td>
                </tr>
                <tr>
                  <td>Neuralink (2016-present)</td>
                  <td>Elon Musk co-founded Neuralink, a neurotechnology company focusing on inventing the technology of implantable brain-machine interfaces.</td>
                </tr>
                <tr>
                  <td>The Boring Company (2016-present)</td>
                  <td>Elon Musk established The Boring Company aiming to revolutionize the current tunneling and transportation systems. One of the famous idea is Hyperloop.</td>
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
    this.state = { data: [], order: 0,keyword:``};//order: 0=ascending, 1=descending
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
  }
  async search(keyword){
    const data={keyword:keyword};
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
  setkeyword=(keyword)=>{
    this.setState({ keyword: keyword})
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
  render() {
    const data = this.state.data;
    let keyword=this.state.keyword;
    if (login === 1) {
      return (
        <>

          <main className="container">


            <h2>Cultural Programmes</h2>
            <div class="row align-items-center">
              <label class="col-sm-2 col-form-label col-form-label-lg">Search for location:</label>
              <div class="col-sm-4">
                <input type="text" class="form-control" id="search" placeholder=" Keywords in the name" value={this.state.keyword}
                onChange={(e)=>this.setkeyword(e.target.value)}></input>
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
        <div class="container p-5 my-5 border">
        <h3 style={{textAlign:"center"}}>CRUD Stored Events</h3>
        <br></br><br></br>
        <span class="row">
        <span class="col-sm-3">
        <h3>Create an Event</h3>
            <body>
              <br></br>
              <form id="CEvent">
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
                 <input type="text" id="Cedate" name="Cedate" placeholder="1/1/2024"></input>
                 <br></br>
                 <label for="Cevenue">Event Venue Name: </label>
                 <br></br>
                 <input type="text" id="Cevenue" name="Cevenue" required></input>
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
              <form id="REventByID">
                 <label for="Reid">By Event ID: </label>
                 <br></br>
                 <input type="number" id="Reid" name="Reid" placeholder="1234567" required></input>
                 <br></br>
                 <input type="submit" value="Find"></input>
              </form>
              <br></br><br></br>
              <form id="REventByName">
                 <label for="Rename">By Event Name: </label>
                 <br></br>
                 <input type="text" id="Rename" name="Rename" placeholder="Hello Hong Kong" required></input>
                 <br></br>
                 <input type="submit" value="Find"></input>
              </form>
              <br></br><br></br>
              <form id="REventByDate">
                 <label for="Redate">By Event Date: </label>
                 <br></br>
                 <input type="text" id="Redate" name="Redate" placeholder="1/1/2024" required></input>
                 <br></br>
                 <input type="submit" value="Find"></input>
              </form>
              <br></br><br></br>
              <form id="REventByVenue">
                 <label for="Revenue">By Venue: </label>
                 <br></br>
                 <input type="text" id="Revenue" name="Revenue" required></input>
                 <br></br>
                 <input type="submit" value="Find"></input>
              </form>
            </body>
            </span>
            <span class="col-sm-3">
              <h3>Update an Event</h3>
            <body>
              <br></br>
              <form id="UEvent">
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
                 <input type="text" id="Uedate" name="Uedate" placeholder="1/12/2024"></input>
                 <br></br>
                 <label for="Uevenue">Update Event Venue Name: </label>
                 <br></br>
                 <input type="text" id="Uevenue" name="Uevenue"></input>
                 <br></br>
                 <label for="UeDes">Add/Change Event Description: </label>
                 <br></br>
                 <textarea id="UeDes" name="UeDes"></textarea>
                 <br></br>
                 <label for="UePresenter">Add/Change Event Presenter: </label>
                 <input type="text" id="UePresenter" name="UePresenter" placeholder="Colin Tsang"></input>
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
              <form id="DEventByID">
                 <label for="Deid">By Event ID: </label>
                 <br></br>
                 <input type="number" id="Deid" name="Deid" placeholder="1234567" required></input>
                 <br></br>
                 <input type="submit" value="Delete"></input>
              </form>
              <br></br><br></br>
              <form id="DEventByName">
                 <label for="Dename">By Event Name: </label>
                 <br></br>
                 <input type="text" id="Dename" name="Dename" placeholder="Hello Hong Kong" required></input>
                 <br></br>
                 <input type="submit" value="Delete"></input>
              </form>
              </body>
            </span>
            
            </span>
            <script>

        </script>
        </div>
        <div class="container p-5 my-5 border">
        <h3 style={{textAlign:"center"}}>CRUD User Data</h3>
        <br></br><br></br>
        <span class="row">
        <span class="col-sm-3">
        <h3>Create an User</h3>
            <body>
              <br></br>
              <form id="CUser">
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
              <form id="RUser">
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
              <form id="UUser">
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
              <form id="DUser">
                 <label for="DUsername">Username: </label>
                 <br></br>
                 <input type="text" id="DUsername" name="DUsername" placeholder="Colin Tsang" required></input>
                 <br></br><br></br>
                 <input type="submit" value="Delete"></input>
              </form>
              </body>
            </span>
            </span>
        <script>
          
        </script>
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
    let i= this.props.i;
    let data =this.props.data;
    return (
      <tr>
      <th scope="row">{i+1}</th>
      <td>{data.venueName}</td>
      <td>{data.NoOfEvent}</td>
    </tr>
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
