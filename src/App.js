import React from 'react';
import './App.css';
import { Link, Redirect, Switch, HashRouter, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

class IssueFilter extends React.Component {
  render() {
    return (
      <div>
        <Link to="/issues">All Issues</Link>
        <Separator />
        <Link to="/issues?status=Open">Open Issues</Link>
        <Separator />
        <Link to="/issues?status=Assigned">Assigned Issues</Link>
      </div>
    );
  }
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

const Separator = () => <span>|</span>;

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

class IssueList extends React.Component {

  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
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

  render() {
    return (
      <div>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <IssueTable issues={ this.state.issues } />
        <IssueAdd createIssue={ this.createIssue } />
      </div>
    );
  }
}

IssueList.propTypes = {
  location: PropTypes.object.isRequired
}

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
