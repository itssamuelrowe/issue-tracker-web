import React from 'react';
import './App.css';

class IssueFilter extends React.Component {
  render() {
    return (
      <div>This is a placeholder for the issue filter.</div>
    );
  }
}

const IssueRow = (props) => {
  const { issue } = props;
  return (
    <tr>
      <td>{ issue._id }</td>
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

class IssueList extends React.Component {

  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    fetch('http://localhost:3000/api/issues').then(response => {
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

function App() {
  return (
    <IssueList />
  );
}

export default App;
