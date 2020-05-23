import React from 'react';
import './App.css';
import { Link, Redirect, Switch, BrowserRouter, Route, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { Form, Button, Table, Card, Col, Row, FormGroup,
    FormControl, FormLabel, InputGroup, ButtonGroup } from 'react-bootstrap';

class NumberInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: this.format(props.value) };
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({ value: this.format(newProps.value) });
  }

  onBlur(event) {
    this.props.onChange(event, this.unformat(this.state.value));
  }

  onChange(event) {
    if (event.target.value.match(/^\d*$/)) {
      this.setState({ value: event.target.value });
    }
  }

  format(number) {
    return number != null ? number.toString() : '';
  }

  unformat(string) {
    const value = parseInt(string, 10);
    return isNaN(value) ? null : value;
  }

  render() {
    return (
      <input
        type="text" { ...this.props } value={ this.state.value }
        onBlur={ this.onBlur } onChange={ this.onChange }
      />
    );
  }
}

NumberInput.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

class DateInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.editFormat(props.value),
      focused: false,
      valid: true
    };
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.value !== this.props.value) {
      this.setState({
        ...this.state,
        value: this.editFormat(newProps.value)
      });
    }
  }
  onFocus() {
    this.setState({
      ...this.state,
      focused: true
    });
  }

  onBlur(event) {
    const value = this.unformat(this.state.value);
    const valid = this.state.value === '' || value != null;
    if (valid !== this.state.valid && this.props.onValidityChange) {
      this.props.onValidityChange(event, valid);
    }
    this.setState({
      ...this.state,
      focused: false,
      valid
    });
    if (valid) {
      this.props.onChange(event, value);
    }
  }

  onChange(event) {
    if (event.target.value.match(/^[\d-]*$/)) {
      this.setState({
        ...this.state,
        value: event.target.value
      });
    }
  }

  displayFormat(date) {
    return date? date.toDateString() : '';
  }

  editFormat(date) {
    return date ? date.toISOString().substr(0, 10) : '';
  }

  unformat(str) {
    const value = new Date(str);
    return isNaN(value.getTime()) ? null : value;
  }

  render() {
    const className = (!this.state.valid && !this.state.focused)?
      'invalid' : null;
    const value = (this.state.focused || !this.state.valid)? this.state.value
      : this.displayFormat(this.props.value);
    return (
      <input
        type="text" size={ 20 } name={ this.props.name } className={ className }
        value={ value }
        placeholder={ this.state.focused? 'yyyy-mm-dd' : null }
        onFocus={ this.onFocus } onBlur={ this.onBlur } onChange={ this.onChange }
      />
    );
  }
}

DateInput.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onValidityChange: PropTypes.func,
  name: PropTypes.string.isRequired,
};

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
      <Card>
        <Card.Body>
          <Row>
            <Col xs={ 6 } sm={ 4 } md={ 3 } lg={ 2 }>
              <FormGroup>
                <FormLabel>Status</FormLabel>

                <FormControl as="select" value={ this.state.status }
                  onChange={ this.onChangeStatus }>
                  <option value="">(Any)</option>
                  <option value="New">New</option>
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Verified">Verified</option>
                  <option value="Closed">Closed</option>
                </FormControl>
              </FormGroup>
            </Col>
            <Col xs={ 6 } sm={ 4 } md={ 3 } lg={ 2 }>
              <FormGroup>
                <FormLabel>Effort</FormLabel>
                <InputGroup>
                  <FormControl value={ this.state.effortGte } onChange={ this.onChangeEffortGte } />
                  <FormControl value={ this.state.effortLte } onChange={ this.onChangeEffortLte } />
                </InputGroup>
              </FormGroup>
            </Col>
            <Col xs={ 6 } sm={ 4 } md={ 3 } lg={ 2 }>
              <FormGroup>
                <FormLabel>&nbsp;</FormLabel>
                <ButtonGroup>
                  <Button variant="secondary" onClick={ this.applyFilter }>Apply</Button>
                  <Button variant="secondary" onClick={ this.resetFilter } disabled={ !this.state.changed }>Reset</Button>
                  <Button variant="secondary" onClick={ this.clearFilter }>Clear</Button>
                </ButtonGroup>
              </FormGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  }
}

IssueFilter.propTypes = {
  setFilter: PropTypes.func.isRequired,
  initFilter: PropTypes.object.isRequired
}

class IssueEdit extends React.Component {
  
  constructor() {
    super();
    this.state = {
      issue: {
        _id: '',
        title: '',
        status: '',
        owner: '',
        effort: null,
        completionDate: '',
        created: '',
      },
      invalidFields: {}
    };
    this.onChange = this.onChange.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(event) {
    event.preventDefault();

    if (Object.keys(this.state.invalidFields).length == 0) {
      fetch('http://localhost:3000/api/issues/' + this.props.match.params.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state.issue)
      }).then(response => {
        if (response.ok) {
          response.json().then(updatedIssue => {
            updatedIssue.created = new Date(updatedIssue.created);
            if (updatedIssue.completionDate) {
              updatedIssue.completionDate = new Date(updatedIssue.completionDate);
            }
            this.setState({ issue: updatedIssue });
            alert('Updated issue successfully.');
          })
        }
        else {
          response.json().then(error => alert('Failed to update issue: ' + error));
        }
      }).catch(error => {
        alert('Error: ' + error.message);
      })
    }
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(previousProps) {
    if (previousProps.match.params.id !== this.props.match.params.id) {
      this.loadData();
    }
  }
  
  onValidityChange(event, valid) {
    const invalidFields = Object.assign({}, this.state.invalidFields);
    if (!valid) {
      invalidFields[event.target.name] = true;
    }
    else {
      delete invalidFields[event.target.name];
    }
    this.setState({ ...this.state, invalidFields });
  }

  onChange(event, convertedValue) {
    const issue = Object.assign({}, this.state.issue);
    const value = (convertedValue !== undefined)?
      convertedValue : event.target.value;
    issue[event.target.name] = value;
    this.setState({ issue });
  }

  loadData() {
    console.log(this.props);
    fetch('http://localhost:3000/api/issues/' + this.props.match.params.id)
      .then(response => {
        if (response.ok) {
          response.json().then(issue => {
            issue.created = new Date(issue.created);
            issue.completionDate = issue.completionDate?
              new Date(issue.completionDate) : null;
            issue.effort = issue.effort != null? issue.effort.toString() : '';
            this.setState({ ...this.state, issue });
          })
        }
        else {
          response.json().then(error => {
            alert('Failed to fetch issue. Error: ' + error.message);
          })
        }
      })
      .catch(error => {
        alert('Failed to fetch issue. Error: ' + error.message);
      });
  }

  render() {
    console.log(this.state);
    const validationMessage = Object.keys(this.state.invalidFields).length == 0?
      null : (<div className="error">Please correct invalid fields before submitting.</div>);
    const issue = this.state.issue;
    return (
      <div>
        <Card>
          <Card.Body>
            <Form onSubmit={ this.onSubmit }>
              <FormGroup>
                <Row>
                  <Col componentClass={ FormLabel } sm={ 1 }>ID</Col>
                  <Col sm={ 9 }>{ issue._id }</Col>
                </Row>
              </FormGroup>
              
              <FormGroup>
                <Row>
                  <Col componentClass={ FormLabel } sm={ 1 }>Created</Col>
                  <Col sm={ 9 }>{ issue.created? issue.created.toDateString() : '' }</Col>
                </Row>
              </FormGroup>
              
              <FormGroup>
                <Row>
                  <Col componentClass={ FormLabel } sm={ 1 }>Status</Col>
                  <Col sm={ 2 }>
                    <FormControl as="select" name="status" value={ issue.status }
                      onChange={ this.onChange }>
                      <option value="New">New</option>
                      <option value="Open">Open</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Verified">Verified</option>
                      <option value="Closed">Closed</option>
                    </FormControl>
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col componentClass={ FormLabel } sm={ 1 }>Owner</Col>
                  <Col sm={ 2 }>
                    <FormControl name="owner" value={ issue.owner } onChange={ this.onChange } />
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col componentClass={ FormLabel } sm={ 1 }>Effort</Col>
                  <Col sm={ 2 }>
                    <FormControl componentClass={ NumberInput } size={ 5 } name="effort" value={ issue.effort }
                      onChange={ this.onChange } />
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col componentClass={ FormLabel } sm={ 1 }>Completion Date</Col>
                  <Col sm={ 2 }>
                    <FormControl componentClass={ DateInput } name="completionDate" value={ issue.completionDate }
                      onChange={ this.onChange } onValidityChange={ this.onValidityChange } />
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col componentClass={ FormLabel } sm={ 1 }>Title</Col>
                  <Col sm={ 2 }>
                    <FormControl name="title" size={ 50 } value={ issue.title }
                      onChange={ this.onChange } />
                  </Col>
                </Row>
              </FormGroup>

              { validationMessage }
              <Button type="submit">Save</Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    );
  }
}

IssueEdit.propTypes = {
};

const IssueRow = (props) => {

  function onDeleteClick() {
    props.deleteIssue(props.issue._id);
  }

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
      <td>
        <Button onClick={ onDeleteClick }>
          Delete
        </Button>
      </td>
    </tr>
  );
}

IssueRow.propTypes = {
  issue: PropTypes.object.isRequired,
  deleteIssue: PropTypes.func.isRequired
};

IssueRow.defaultProps = {
  issue_title: '-- no title --'
};

const IssueTable = (props) => {
  return (
    <Table bordered={ true } condensed="true" hover={ true } responsive={ true }>
      <thead>
        <tr>
          <th>Id</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Completion Date</th>
          <th>Title</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {
          props.issues.map(issue => (
            <IssueRow key={ issue._id } issue={ issue } deleteIssue={ props.deleteIssue } />
          ))
        }
      </tbody>
    </Table>
  );
}

IssueTable.propTypes = {
  issues: PropTypes.array.isRequired,
  deleteIssue: PropTypes.func.isRequired
};

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
      <Card>
        <Card.Body>
          <form name="issueAdd" onSubmit={ this.handleSubmit }>
            <Row>
              <Col xs={ 12 } lg={ 2 }>
                <FormGroup>
                  <FormLabel>Owner</FormLabel>
                  <FormControl type="text" name="owner" />
                </FormGroup>
              </Col>
              <Col xs={ 12 } lg={ 2 }>
                <FormGroup>
                  <FormLabel>Title</FormLabel>
                  <FormControl type="text" name="title" />
                </FormGroup>
              </Col>
              <Col xs={ 12 } lg={ 2 }>
                <Button type="submit" style={{ marginTop: 30 }} variant="primary">Add</Button>
              </Col>
              </Row>
          </form>
        </Card.Body>
      </Card>
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
    this.deleteIssue = this.deleteIssue.bind(this);
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

  deleteIssue(id) {
    fetch('http://localhost:3000/api/issues/' + id, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) {
          alert('Failed to delete issue.');
        }
        else {
          this.loadData();
        }
      })

  }

  loadData() {
    const search = this.props.location.search? this.props.location.search + '&limit=5' :
      '?limit=5';
    fetch('http://localhost:3000/api/issues' + search).then(response => {
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
        <Row style={{ marginBottom: 24 }}>
          <Col xs={ 12 } lg={ 6 }>
            <IssueFilter setFilter={ this.setFilter } initFilter={ newQuery } />
          </Col>
          <Col xs={ 12 } lg={ 6 }>
            <IssueAdd createIssue={ this.createIssue } />
          </Col>
        </Row>
        <IssueTable issues={ this.state.issues } deleteIssue={ this.deleteIssue } />
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

const statuses = [
  'New',
  'Open',
  'Assigned',
  'Fixed',
  'Verified',
  'Closed'
];

const StatRow = (props) => (
  <tr>
    <td>{ props.owner }</td>
    {
      statuses.map((status, index) => (
        <td key={ index }>{ props.counts[status] }</td>
      ))
    }
  </tr>
);

StatRow.propTypes = {
  owner: PropTypes.string.isRequired,
  counts: PropTypes.object.isRequired
};

class IssueReport extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      stats: {}
    };
    this.setFilter = this.setFilter.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(previousProps) {
    const oldQuery = queryString.parse(previousProps.location.search);
    const newQuery = queryString.parse(this.props.location.search);
    if ((oldQuery.status === newQuery.status) &&
        (oldQuery.effortGte === newQuery.effortGte) &&
        (oldQuery.effortLte === newQuery.effortLte)) {
      return;
    }
    this.loadData();
  }

  setFilter(query) {
    this.props.history.push({
      location: this.props.location.pathname,
      search: encodeQuery(query)
    });
  }

  loadData() {
    const search = this.props.location.search? this.props.location.search + '&summary' : '?summary';
    fetch('http://localhost:3000/api/issues' + search)
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => Promise.reject(error));
        }
        return response.json().then(data => ({ summary: data }));
      })
      .then(report => {
        this.setState({ stats: report.summary });
      })
      .catch(error => alert('Error: ' + error));
  }

  render() {
    const query = queryString.parse(this.props.location.search);
    return (
      <div>
        <Card>
          <Card.Body>
            <IssueFilter setFilter={ this.setFilter } initFilter={ query } />
          </Card.Body>
        </Card>
        <Table bordered={ true } hover={ true } responsive={ true }>
            <thead>
            <tr>
              <th></th>
              {
                statuses.map((status, index) => <td key={ index }>{ status }</td>)
              }
            </tr>
          </thead>
          <tbody>
            {
              Object.keys(this.state.stats).map((owner, index) => (
                <StatRow key={ index } owner={ owner } counts={ this.state.stats[owner] } />
              ))
            }
          </tbody>
        </Table>
      </div>
    );
  }
}

IssueReport = withRouter(IssueReport);

function App(props) {
  return (
    <div className="root">
      <div className="header">
        <Row>
          <Col xs={ 10 }>
            <h1>Issue Tracker</h1>
          </Col>
          <Col xs={ 1 }>
            <Link to="/summary">Summary</Link>
            &nbsp;&nbsp;&nbsp;
            <Link to="/issues">Issues</Link>
          </Col>
        </Row>
      </div>
      <div className="content container-fluid">
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
              <Route path="/issues/:id" component={ IssueEdit } />
              <Route path="/summary" component={ IssueReport } />
              <Route path="/issues">
                <IssueList />
              </Route>
              <Route path="*">
                <Error404 />
              </Route>
            </Switch>
          </App>
        </Route>
    </BrowserRouter>
  );
}

export default RoutedApp;
