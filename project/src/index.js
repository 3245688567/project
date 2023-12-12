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
    console.log('test..');
    await fetch('http://localhost:3001/locationAll', {
      //put your server address here
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({ data: responseData });
      });
  }
  render() {
    const data = this.state.data;
    return (
      <main className="container">
        <h2>Cultural Programmes</h2>
        {data.map((element, index) => (
          <Table i={index} data={element} key={index} />
        ))}
      </main>
    );
  }
}

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: -1 };
  }
  render() {
    let i = this.props.i;
    let data = this.props.data;
    return (
      <div className="m-2">
        <div>
          <h6>{i + 1}.</h6>
          <p>{data.venueName}</p>
          <p>Number of Event : {data.NoOfEvent}</p>
        </div>
      </div>
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
