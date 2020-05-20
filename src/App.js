import React from 'react';
import './App.css';
import { Link, Redirect, Switch, HashRouter, Route, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

const Separator = () => <span> | </span>;

class IssueFilter extends React.Component {
  
  constructor() {
    super();
    this.clearFilter = this.clearFilter.bind(this);
    this.setFilterOpen = this.setFilterOpen.bind(this);
    this.setFilterAssigned = this.setFilterAssigned.bind(this);
  }

  setFilterOpen(event) {
    event.preventDefault();
    this.props.setFilter({ status: 'Open' });
  }

  setFilterAssigned(event) {
    event.preventDefault();
    this.props.setFilter({ status: 'Assigned' });
  }

  clearFilter(event) {
    event.preventDefault();
    this.props.setFilter({});
  }

  render() {
    return (
      <div>
        <a href="#" onClick={ this.clearFilter }>All Issues</a>
        <Separator />
        <a href="#" onClick={ this.setFilterOpen }>Open Issues</a>
        <Separator />
        <a href="#" onClick={ this.setFilterAssigned }>Assigned Issues</a>
      </div>
    );
  }
}

IssueFilter.propTypes = {
  setFilter: PropTypes.func.isRequired
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
    const oldQuery = previousProps.location.search;
    const newQuery = this.props.location.search;
    if (oldQuery !== newQuery) {
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
          console.log('Total count of records: ', data._metadata.total_count);
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
    return (
      <div>
        <h1>Issue Tracker</h1>
        <IssueFilter setFilter={ this.setFilter } />
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

function App() {
  return (
    <HashRouter>
      <Switch>
        <Redirect exact={ true } from="/" to="/issues" />
        <Route path="/issues/:id" component={ IssueEdit } />
        <Route path="/issues" component={ IssueList } />
        <Route component={ Error404 } />
      </Switch>
    </HashRouter>
  );
}

export default App;
