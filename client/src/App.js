import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

import { Container, Row, Col, Navbar, NavbarBrand, Alert, Card, CardBody, CardTitle, Button, Form, FormFeedback, FormGroup, Input, InputGroup } from 'reactstrap';

class App extends Component {
  constructor() {
    super();

    this.state = {
      machines: [],
      machineShownInInfo: undefined
    }
  }

  componentDidMount() {
    this.getMachines();
  }

  getMachines() {
    fetch('/api/machines/machinelist')
      .then(res => res.json())
      .then(machines => this.setState({ machines }));
  }

  changeMachineShownInInfo = (e, machine) => {
    // Don't change machine info if delete link was clicked on
    if (!e.target.className.includes("linkDeleteMachine")){
      this.setState({
        machineShownInInfo: machine
      });
    }
  }

  addMachine = (machine) =>{
    fetch('/api/machines/addmachine', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(machine)
    }).then(() => {
      this.getMachines();
    });
  }

  deleteMachine = (e, machineId) => {
    e.preventDefault();
    const machineShownInInfo = this.state.machineShownInInfo ? Object.assign({}, this.state.machineShownInInfo) : undefined;

    fetch('/api/machines/deletemachine/' + machineId,{
      method: 'DELETE'
    }).then(() => {
      this.getMachines();

      // If machine shown in info is deleted, we shouldn't see it in the info box anymore.
      if (machineShownInInfo && (machineId === machineShownInInfo._id)){
        this.setState({
          machineShownInInfo: undefined
        });
      }
    });
  }

  render() {
    return (
      <div className="App">
        <Navbar fixed="top">
          <NavbarBrand>
            <img src="http://www.sherwoodwashtub.com/assets/Sign%20Artwork3.jpg" height="50" alt="Sherwood Wash Tub" />
          </NavbarBrand>
          <span className="nav-text text-light">Inventory</span>
        </Navbar>
        <br />
        <Container>
          <Row>
            <Col sm="4">
              <MachineInfo machine={this.state.machineShownInInfo}/><br />
              <AddMachine addMachine={this.addMachine}/>
            </Col>
            <Col>
              <MachineList machines={ this.state.machines } handleRowClick={this.changeMachineShownInInfo} handleRowDelete={this.deleteMachine}/>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

class MachineList extends Component{
  constructor(props) {
    super(props);

    this.state = {
      machines: props.machines,
      handleRowClick: props.handleRowClick,
      handleRowDelete: props.handleRowDelete
    }
  }

  static getDerivedStateFromProps(props, current_state) {
    if (current_state.machines !== props.machines) {
      return {
        machines: props.machines,
        handleRowClick: current_state.handleRowClick,
        handleRowDelete: current_state.handleRowDelete
      }
    }else{
      return current_state;
    }
  }

  render(){
    const machines = this.state.machines;

    return(
      <Card id="machineList">
        <CardBody>
          <CardTitle>Machine List</CardTitle>
          <Alert color="info" hidden={ machines.length !== 0 }>
            Looks like you don't have any machines yet! You can add some using the Add Machine form on the bottom left of this page. 
          </Alert>
          {(machines.length > 0) ? (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Load</th>
                  <th>Delete?</th>
                </tr>
              </thead>
              <tbody>
                { machines.map(machine => { 
                  return (
                    <MachineListRow key={machine._id} machine={machine} handleClick={this.state.handleRowClick} handleDelete={this.state.handleRowDelete}/>
                  ) 
                }) }
              </tbody>
            </table>
          ) : (
            <table></table>
          )}
        </CardBody>
      </Card>
    );
  }
}

class MachineListRow extends Component{
  constructor(props) {
    super(props);

    this.state = {
      machine: props.machine,
      handleClick: props.handleClick,
      handleDelete: props.handleDelete
    };
  }

  render(){
    const machine = this.state.machine;

    return (
      <tr onClick={(e) => { this.state.handleClick(e, machine) }}>
        <td>{machine.type}</td>
        <td>{machine.cost}</td>
        <td>
          <a href="" className="linkDeleteMachine text-danger" onClick={(e) => this.state.handleDelete(e, machine._id)}>Delete</a>
        </td>
      </tr>
    );
  }
}

function MachineInfo (props) {
  const machine = props.machine;

  var noMachine = false;
  if (machine === undefined){
    noMachine = true;
  }else{
    noMachine = false;
  }

  return (
    <Card id="machineInfo">
      <CardBody>
        <CardTitle>
          Machine Info
        </CardTitle>
        <Alert color="danger" hidden="true">
          Error loading machine info
        </Alert>
        <Alert color="info" hidden={ !noMachine }>
          Select a machine from the list to view its info.
        </Alert>
        { !noMachine ? (
            <p>
              <b>Type:</b> { machine.type }<br />
              <b>Load:</b> { machine.load }<br />
              <b>Cost:</b> { machine.cost }<br />
            </p>
          ) : ( 
            <p></p> 
          ) }
        
      </CardBody>
    </Card>
  );
}

function isCurrencyValid(currency){
  if (currency.match(/^[0-9]+\.[0-9]{2}$/)){
    var cash = parseFloat(currency); 
    if (isNaN(cash)){
      return false;
    }else{
      return true;
    }
  }else{
    return false;
  }
}

class AddMachine extends Component{
  constructor(props){
    super(props);

    this.state = {
      type: "", // if you make it undefined, it makes it an uncontrolled component, but we want it controlled
      load: "",
      cost: "",
      loadValid: true,
      costValid: true,
      addMachine: props.addMachine
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event){
    var value = event.target.value;

    // validate values
    if (event.target.name === 'cost'){
      this.setState({costValid: isCurrencyValid(value)});
    }
    else if (event.target.name === 'load'){
      this.setState({loadValid: (value !== '' && !isNaN(parseInt(value, 10)))});
    }

    // update state
    this.setState({
      [event.target.name]: value
    }); 
  }

  handleSubmit(event){
    event.preventDefault();

    // check again in case, for some reason, the 'submit' button isn't disabled
    if (this.state.costValid && this.state.loadValid){
      this.state.addMachine({
        type: this.state.type,
        load: this.state.load,
        cost: this.state.cost
      });
    }
  }

  render(){
    return (
      <Card id="addMachine">
        <CardBody>
          <CardTitle>Add Machine</CardTitle>
          <Form>
            <fieldset>
              <FormGroup>
                <Input 
                  name="type"
                  type="text" 
                  placeholder="Type" 
                  value={this.state.type} 
                  onChange={this.handleChange} 
                  required 
                />
              </FormGroup>
              <FormGroup>
                <InputGroup>
                  <Input 
                    name="load"
                    type="text" 
                    placeholder="Load" 
                    value={this.state.load} 
                    onChange={this.handleChange} 
                    invalid={!this.state.loadValid}
                  />
                  {/* Note: order-1 is workaround for bootstrap bug #25110 */}
                  <FormFeedback className="order-1">Must be a whole number (i.e. "10)</FormFeedback>
                  <div className="input-group-append"><span className="input-group-text">lbs</span></div>
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup>
                  <div className="input-group-prepend"><span className="input-group-text">$</span></div>
                  <Input 
                    name="cost"
                    type="text" 
                    placeholder="0.00"
                    value={this.state.cost} 
                    onChange={this.handleChange}
                    invalid={!this.state.costValid}
                  />
                  {/* Note: order-1 is workaround for bootstrap bug #25110 */}
                  <FormFeedback className="order-last">Must be in valid USD format (i.e. "7.00")</FormFeedback>
                </InputGroup>
              </FormGroup>
              <Button 
                type="submit" 
                color="primary" 
                onClick={this.handleSubmit}
                disabled={(!this.state.costValid || !this.state.loadValid)}
              >Add Machine</Button>
            </fieldset>
          </Form>
        </CardBody>
      </Card>
    );
  }
}
export default App;
