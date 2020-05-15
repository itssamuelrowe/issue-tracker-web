import React from 'react';
import logo from './logo.svg';
import './App.css';
import PropTypes from 'prop-types';

const issues = [
  {
    id: 1,
    status: 'Open',
    owner: 'Ravan',
    created: new Date('2016-08-15'),
    effort: 5,
    completionDate: undefined,
    title: 'Error in console when clicking Add',
  },
  {
    id: 2,
    status: 'Assigned',
    owner: 'Eddie',
    created: new Date('2016-08-16'),
    effort: 14,
    completionDate: new Date('2016-08-30'),
    title: 'Missing bottom border on panel',
  },
];

class IssueFilter extends React.Component {
  render() {
    return (
      <div>This is a placeholder for the issue filter.</div>
    );
  }
}

class IssueRow extends React.Component {
  render() {
    const { issue } = this.props;
    const borderedStyle = { border: "1px solid silver", padding: 4 };
    return (
      <tr>
        <td>{ issue.id }</td>
        <td>{ issue.status }</td>
        <td>{ issue.owner }</td>
        <td>{ issue.created.toDateString() }</td>
        <td>{ issue.effort }</td>
        <td>{ issue.completionDate? issue.completionDate.toDateString() : '' }</td>
        <td>{ issue.title }</td>
      </tr>
    );
  }
}

IssueRow.propTypes = {
  issue_id: PropTypes.number.isRequired
};

IssueRow.defaultProps = {
  issue_title: '-- no title --'
};

class IssueTable extends React.Component {
  render() {
    const borderedStyle = { border: "1px solid silver", padding: 6 };
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
            this.props.issues.map(issue => (
              <IssueRow key={ issue.id } issue={ issue } />
            ))
          }
        </tbody>
      </table>
    );
  }
}

class IssueAdd extends React.Component {
  render() {
    return (
      <div>This is a placeholder for the issue entry form.</div>
    );
  }
}

class IssueList extends React.Component {

  render() {
    return (
      <div>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable issues={ issues } />
        <hr />
        <IssueAdd />
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
