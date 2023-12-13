import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

var login = 2;   //0=non-user, 1=user, 2=admin, will show different content in "content" page

class App extends React.Component {
  render() {
    return (
      <>
      <Title name="Cultural programmes" />
        <BrowserRouter>
          <div>
          <ul style={{textAlign:"center"}}>
            <a href="/" class="btn btn-primary">Home</a>
            <a href="/content" class="btn btn-secondary">Content</a>
            <a href="/login" class="btn btn-success">Login</a>
          </ul>
          </div>

          <hr />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/content" element={<Content />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </BrowserRouter>
      </>
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

class Title extends React.Component {
  render() {
    return (
      <header className="bg-warning">
        <h1 className="display-4 text-center">{this.props.name}</h1>
        <ul style={{textAlign:"right"}}>
        <p>Username:<button class="btn btn-link" id="logout" onClick={(e)=>{}}>logout</button></p>
        </ul>
      </header>
    );
  }
}

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  async componentDidMount() {
    console.log("test..");
    await fetch('http://localhost:3001/locationAll', { //put your server address here
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
  render() {
    const data =this.state.data;
    if (login === 1) {
    return (
      <main className="container">
        <h2>Cultural Programmes</h2>
        <table class="table table-striped table-hover">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Venues</th>
      <th scope="col">Number of Event</th>
    </tr>
  </thead>
  <tbody>
        {data.map((element, index) => (
          <Table i={index} data ={element} key={index} />
        ))}
      </tbody>
</table>
      </main>
    );
    }
    else if (login===0){
      return (
      <div style={{textAlign:"center"}}>
            <h2>Please click Login button to login</h2>
      </div>
      )
    }

    else if (login===2){
      return (
        <div style={{textAlign:"center"}}>
            <h2>You are now admin and you can do CRUD now</h2>
            <body>
              <form>
                 <label for="Create">Create an Event:</label>
                 <input type="text" id="Create" name="Create" placeholder="Hello Hong Kong" required></input>
                 <br></br>
                 <input type="submit" value="Submit to Create"></input>
              </form>
            </body>
            <script>

            </script>
        </div>
        
      )
    }
  }
}

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sort: 0 };
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

class Login extends React.Component {
  render() {
    if(login===0){
    return (
      <div style={{textAlign:"center"}}>
        <h2>Login</h2>
        


      </div>
    );
    }
    else if(login===1){
      return (
        <div style={{textAlign:"center"}}>
          <h2>You are now successfully login as user</h2>
        </div>
      );
     }
     else if(login===2){
      return (
        <div style={{textAlign:"center"}}>
          <h2>You are now successfully login as admin</h2>
        </div>
      );
      }
  }
}

class NoMatch extends React.Component {
  render() {
    return <h2>Page not found</h2>;
  }
}
const root = ReactDOM.createRoot(document.querySelector('#app'));
root.render(<App name="Cultural Programmes" />);
