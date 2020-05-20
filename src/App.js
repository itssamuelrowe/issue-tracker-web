import React from 'react';
import './App.css';
import { Link, Redirect, Switch, BrowserRouter, HashRouter, Route, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';

const Separator = () => <span> | </span>;

class IssueFilter extends React.Component {
  
  constructor(props) {
    super();
    this.state = {
      status: props.initFilter.status || '',
      effortGte: props.initFilter.effortGte || '',
      effortLte: props.initFilter.effortLte || '',
      changed: false
    };
    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeEffortGte = this.onChangeEffortGte.bind(this);
    this.onChangeEffortLte = this.onChangeEffortLte.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      status: newProps.initFilter.status || '',
      effortGte: newProps.initFilter.effortGte || '',
      effortLte: newProps.initFilter.effortLte || '',
      changed: false
    });
  }

  resetFilter() {
    const props = this.props;
    this.setState({
      status: props.initFilter.status || '',
      effortGte: props.initFilter.effortGte || '',
      effortLte: props.initFilter.effortLte || '',
      changed: false
    });
  }

  clearFilter() {
    this.props.setFilter({});
  }

  applyFilter() {
    const newFilter = {};
    if (this.state.status) {
      newFilter.status = this.state.status;
    }
    if (this.state.effortGte) {
      newFilter.effortGte = this.state.effortGte;
    }
    if (this.state.effortLte) {
      newFilter.effortLte = this.state.effortLte;
    }
    this.props.setFilter(newFilter);
  }

  onChangeStatus(event) {
    this.setState({
      ...this.state,
      status: event.target.value,
      changed: true
    });
  }

  onChangeEffortGte(event) {
    const effort = event.target.value;
    if (effort.match(/^\d*$/)) {
      this.setState({
        ...this.state,
        effortGte: effort,
        changed: true
      });
    }
  }

  onChangeEffortLte(event) {
    const effort = event.target.value;
    if (effort.match(/^\d*$/)) {
      this.setState({
        ...this.state,
        effortLte: effort,
        changed: true
      });
    }
  }

  render() {
    return (
      <div>
        Status:
        <select value={ this.state.status } onChange={ this.onChangeStatus }>
          <option value="">(Any)</option>
          <option value="New">New</option>
          <option value="Open">Open</option>
          <option value="Assigned">Assigned</option>
          <option value="Fixed">Fixed</option>
          <option value="Verified">Verified</option>
          <option value="Closed">Closed</option>
        </select>
        &nbsp;Effort between:
        <input size={ 5 } value={ this.state.effortGte } onChange={ this.onChangeEffortGte } />
        &nbsp;-&nbsp;
        <input size={ 5 } value={ this.state.effortLte } onChange={ this.onChangeEffortLte } />
        <button onClick={ this.applyFilter }>Apply</button>
        <button onClick={ this.resetFilter } disabled={ !this.state.changed }>Reset</button>
        <button onClick={ this.clearFilter }>Clear</button>
      </div>
    );
  }
}

IssueFilter.propTypes = {
  setFilter: PropTypes.func.isRequired,
  initFilter: PropTypes.object.isRequired
}

class IssueEdit extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div>This is a placeholder for the issue edit page.</div>
        <Link to="/issues">Back to issues</Link>
      </React.Fragment>
    );
  }
}

IssueEdit.propTypes = {
  params: PropTypes.object.isRequired
};

const IssueRow = (props) => {
  const { issue } = props;
  return (
    <tr>
      <td><Link to={ '/issues/' + issue._id }>{ issue._id.substr(-4) }</Link></td>
      <td>{ issue.status }</td>
      <td>{ issue.owner }</td>
      <td>{ issue.created.toDateString() }</td>
      <td>{ issue.effort }</td>
      <td>{ issue.completionDate? issue.completionDate.toDateString() : '' }</td>
      <td>{ issue.title }</td>
    </tr>
  );
}


IssueRow.propTypes = {
};

IssueRow.defaultProps = {
  issue_title: '-- no title --'
};

const IssueTable = (props) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Completion Date</th>
          <th>Title</th>
        </tr>
      </thead>
      <tbody>
        {
          props.issues.map(issue => (
            <IssueRow key={ issue._id } issue={ issue } />
          ))
        }
      </tbody>
    </table>
  );
}

class IssueAdd extends React.Component {
  
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    var form = document.forms.issueAdd;
    this.props.createIssue({
      owner: form.owner.value,
      title: form.title.value,
      status: 'New',
      created: new Date()
    });
    form.owner.value = '';
    form.title.value = '';
  }

  render() {
    return (
      <div>
        <form name="issueAdd" onSubmit={ this.handleSubmit }>
          <input type="text" name="owner" placeholder="Owner" />
          <input type="text" name="title" placeholder="Title" />
          <button>Add</button>
        </form>
      </div>
    );
  }
}

function encodeQuery(object) {
  const string = [];
  for (var key in object)
    if (object.hasOwnProperty(key)) {
      string.push(encodeURIComponent(key) + '=' + encodeURIComponent(object[key]));
    }
  return string.join('&');
}

class IssueList extends React.Component {

  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
    this.setFilter = this.setFilter.bind(this);
  }

  componentDidUpdate(previousProps) {
    const oldQuery = queryString.parse(previousProps.location.search);
    const newQuery = queryString.parse(this.props.location.search);

    if ((oldQuery.status !== newQuery.status) ||
      (oldQuery.effortGte !== newQuery.effortGte) ||
      (oldQuery.effortLte !== newQuery.effortLte)) {
      this.loadData();
    }
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    fetch('http://localhost:3000/api/issues' + this.props.location.search).then(response => {
      if (response.ok) {
        response.json().then(data => {
          console.log('Total count of records: ', data._metadata.totalCount);
          data.records.forEach(issue => {
            issue.created = new Date(issue.created);
            if (issue.completionDate) {
              issue.completionDate = new Date(issue.completionDate);
            }
          });
          this.setState({ issues: data.records });
        });
      }
      else {
        response.json().then(error => alert('Failed to fetch issues: ' + error.message));
      }
    }).catch(error => alert('Failed to fetch data from server', error));
  }

  createIssue(newIssue) {
    fetch('http://localhost:3000/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIssue)
    }).then(response => {
      if (response.ok) {
        response.json().then(updatedIssue => {
          updatedIssue.created = new Date(updatedIssue.created);
          if (updatedIssue.completionDate) {
            updatedIssue.completionDate = new Date(updatedIssue.completionDate);
          }
          const newIssues = this.state.issues.concat(updatedIssue);
          this.setState({ issues: newIssues });
        });
      }
      else {
        response.json().then(error => {
          alert('Failed to add issue: ' + error.message);
        })
      }
    }).catch(error => {
      alert('Error: Failed to send data to server. (' + error.message + ')');
    });
  }

  setFilter(filter) {
    console.log(filter);
    this.props.history.push({
      location: this.props.location.pathname,
      search: encodeQuery(filter)
    });
  }

  render() {
    const newQuery = queryString.parse(this.props.location.search);

    return (
      <div>
        <IssueFilter setFilter={ this.setFilter } initFilter={ newQuery } />
        <IssueTable issues={ this.state.issues } />
        <IssueAdd createIssue={ this.createIssue } />
      </div>
    );
  }
}

IssueList.propTypes = {
  location: PropTypes.object.isRequired,
  router: PropTypes.object
}

IssueList = withRouter(IssueList);

const Error404 = (props) => <div>404 Error: Cannot find the requested page.</div>;

function App(props) {
  return (
    <div className="root">
      <div className="header">
        <h1>Issue Tracker</h1>
      </div>
      <div className="content">
        { props.children }
      </div>
      <div className="footer">
        A simple issue tracker built using the MERN stack.
      </div>
    </div>
  );
}

App.propTypes = {
  children: PropTypes.object.isRequired
}

function RoutedApp() {
  return (
    <BrowserRouter>
      <Route path="/">
        <App>
          <Switch>
            <Route path="/issues/:id">
              <IssueEdit />
            </Route>
            <Route path="/issues">
              <IssueList />
            </Route>
            <Route path="*">
              <Error404 />
            </Route>
          </Switch>
        </App>
      </Route>
      <Redirect exact={ true } from="/" to="/issues" />
    </BrowserRouter>
  );
}

export default RoutedApp;
