import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

class App extends React.Component {
  render() {
    return (
      <>
        <BrowserRouter>
          <div>
            <ul>
              <li>
                {' '}
                <Link to="/">Home</Link>{' '}
              </li>
            </ul>
          </div>

          <hr />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/content" element={<Content />} />
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
      <div>
        <h2>Home</h2>
        <Title name="Cultural programmes" />
      </div>
    );
  }
}

class Title extends React.Component {
  render() {
    return (
      <header className="bg-warning">
        <h1 className="display-4 text-center">{this.props.name}</h1>
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

class NoMatch extends React.Component {
  render() {
    return <h2>Page not found</h2>;
  }
}
const root = ReactDOM.createRoot(document.querySelector('#app'));
root.render(<App name="Cultural Programmes" />);
