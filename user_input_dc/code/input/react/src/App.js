import './App.css';
import React from 'react'
import * as dayjs from 'dayjs'
import * as duration from 'dayjs/plugin/duration';
import { Container, Card, Button, Table, Spinner, Form, InputGroup, ListGroup, Alert, Badge } from 'react-bootstrap'
import { WebsocketProvider, useWebsocketSend, useWebsocketState } from './WebsocketContext'
import APIBackend from './RestAPI'
import { BrowserRouter, Routes, Route, useParams, NavLink } from 'react-router-dom'

dayjs.extend(duration);

function App() {
  return (
    <WebsocketProvider url={'ws://' + document.location.host + '/ws/stateupdates/'}>
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
    </WebsocketProvider>
  )
}

function Routing(props) {
  return (
    <Routes>
      <Route path='/' element={<ListPage {...props} />} />
      <Route path='input/' element={<InputPage {...props} />} />
      <Route path='input/:identifier' element={<InputPage {...props} />} />
    </Routes>
  )
}

function ListPage() {
  let [loaded, setLoaded] = React.useState(false)
  let [pending, setPending] = React.useState(false)
  let [error, setError] = React.useState(null)

  let [list, setList] = React.useState([])

  React.useEffect(() => {
    let do_load = async () => {
      setPending(true)
      let response = await APIBackend.api_get('http://' + document.location.host + '/static/config/list.json');
      if (response.status === 200) {
        setList(response.payload)
        setLoaded(true)
      } else {
        console.log("ERROR LOADING LIST")
        setError("ERROR: Unable to fetch List!")
      }
    }
    if (!loaded && !pending) {
      do_load()
    }
  }, [loaded, pending])

  if (!loaded) {
    return <Container fluid="md">
      <Card className='mt-2 text-center'>
        {error !== null ? <h1>{error}</h1> : <Spinner></Spinner>}
      </Card>
    </Container>
  } else {
    return <Container fluid="md">
      <Card className='mt-2'>
        <Card.Header className='text-center'><h1>{list.title}</h1></Card.Header>
        <Card.Body>
          <ListGroup>
            {list.items.map(item => (
              <ListGroup.Item><NavLink to={"./input/" + item}>{item}</NavLink></ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
      {error !== null ? <Alert variant="danger" className='mt-2 mx-2'>
        {error}
      </Alert> : ""}
    </Container>
  }
}

function InputPage() {
  let params = useParams();
  const identifier = params.identifier
  console.log("identifier: ",identifier)

  let [loaded, setLoaded] = React.useState(false)
  let [pending, setPending] = React.useState(false)
  let [error, setError] = React.useState(null)

  let [config, setConfig] = React.useState({})

  let [variables, setVariables] = React.useState({})
  let [triggers, setTriggers] = React.useState([])
  let [triggered, setTriggered] = React.useState([])
  let [eventList, setEventList] = React.useState([])


  let ws_send = useWebsocketSend()
  let { connected } = useWebsocketState()

  React.useEffect(() => {
    let do_load = async () => {
      setPending(true)
      let response = await APIBackend.api_get('http://' + document.location.host + '/static/config/config.json');
      if (response.status === 200) {
        let conf = response.payload
	console.log("base config ",JSON.stringify(response.payload))
        if (identifier) {
          let response2 = await APIBackend.api_get('http://' + document.location.host + '/static/config/' + identifier + '.json');
          if (response2.status === 200) {
	    console.log("extension config ",JSON.stringify(response2.payload))
            conf = overwriteConfig(conf, response2.payload)
	    console.log("combined config ",JSON.stringify(conf))
          } else {
            console.log("ERROR LOADING IDENTIFIER CONFIG")
            setError("ERROR: Config For " + identifier + " Not Found!")
          }
        }
        setConfig(conf)
        for (let item of conf.variable) {
          if (item.type === "static") {
            setVariable(item.name, item.value)
          }
        }
      } else {
        console.log("ERROR LOADING CONFIG")
        setError("ERROR: Config Not Found!")
      }
      setLoaded(true)
    }
    if (!loaded && !pending) {
      do_load()
    }
  }, [loaded, pending, setConfig])

  React.useEffect(() => {
    const dispatch = async (outputs) => {
      for (let output of outputs) {
        await ws_send({ topic: output.topic, payload: output.payload })
      }
    }

    if (triggers.length > 0) {
      let { outputs, new_triggered } = checkTriggers(triggers, triggered, config.output)
      setTriggers([])
      setTriggered(new_triggered)
      let { rendered_outputs, events, clear } = renderOutputs(outputs, variables, config.variable)
      dispatch(rendered_outputs)
      let new_vars = variables
      Object.keys(clear).forEach(item => {
        new_vars[item] = null
      })
      setVariables(new_vars)
      setEventList(prev => [...events, ...prev])
    }
  }, [triggers, triggered, config.output, config.variable, variables, ws_send])

  let setVariable = (v_name, value) => {
    setVariables(prev => ({ ...prev, [v_name]: value, timestamp: dayjs().format() }))
    setTriggers(prev => ([...prev, v_name]))
  }

  if (!loaded) {
    return <Container fluid="md">
      <Card className='mt-2 text-center'>
        {error !== null ? <h1>{error}</h1> : <Spinner></Spinner>}
      </Card>
    </Container>
  } else {
    return <>
      <Container fluid="md">
        <div className='text-center'>
        {connected ? <Badge bg="success">Connected</Badge> : <Badge bg="danger">Disconnected</Badge>}
        </div>
        <InputBar submit={(value) => (extractVariables(value, config.variable, setVariable))} />
        <VariableDictionary variables={variables} config={config.variable} />
        <EventLog events={eventList} />
        {error !== null ? <Alert variant="danger" className='mt-2 mx-2'>
          {error}
        </Alert> : ""}
      </Container>
    </>
  }
}

function overwriteConfig(original_conf, new_conf) {
  let compiled_conf = {}

  compiled_conf.variable = original_conf.variable
  if (new_conf.variable) {
    for (let new_var of new_conf.variable) {
      let index = compiled_conf.variable.findIndex(elem => elem.name === new_var.name)
      if (index !== -1) {
        compiled_conf.variable.splice(index, 1)
      }
      compiled_conf.variable.push(new_var)
    }
  }

  compiled_conf.output = original_conf.output
  if (new_conf.output) {
    for (let new_var of new_conf.output) {
      let index = compiled_conf.output.findIndex(elem => elem.name === new_var.name)
      if (index !== -1) {
        compiled_conf.output.splice(index, 1)
      }
      compiled_conf.output.push(new_var)
    }
  }
  console.log(JSON.stringify(compiled_conf))
  return compiled_conf
}

function escapeRegex(string) {
  return string.replace("\\", '\\\\');
}

function extractVariables(barcode, var_config = [], setVariable) {
  let found = null
  let value = null
  for (let variable of var_config) {
    if (variable.pattern) {
      let re = new RegExp(escapeRegex(variable.pattern))
      let match = barcode.match(re)
      if (match) {
        found = variable
        value = match[1]
        break
      }
    }
  }
  if (found) {
    setVariable(found.name, value)
    return true
  }
  return false
}

function checkTriggers(triggers, triggered, out_conf = []) {
  let outputs = []
  for (let trigger of triggers) {
    for (let output of out_conf) {
      if (output.triggers.indexOf(trigger) > -1) {
        if (output.trigger_policy === "all") {
          triggered.push(trigger)
          let do_trigger = output.triggers.reduce((acc, item) => (acc && triggered.includes(item)), true)
          if (do_trigger) {
            outputs.push(output)
            output.triggers.forEach(element => {
              if (triggered.indexOf(element) > -1)
                triggered.splice(triggered.indexOf(element), 1)
            });
            // triggered = triggered.filter(elem => (output.triggers.indexOf(elem)===-1))
          }
        } else {
          outputs.push(output)
        }
      }
    }
  }
  return { outputs: outputs, new_triggered: triggered }
}

function renderOutputs(outputs, variables, var_config) {
  let rendered = []
  let events = []
  let clear = {}
  outputs.forEach(output => {
    let msg = {}
    let keys = Object.keys(output.payload)
    keys.forEach(key => {
      let var_key = output.payload[key]
      // if (variables[var_key]) {
      msg[key] = variables[var_key]
      // } else {
      //   console.warn("variable for " + var_key + " not found")
      // }

      if (var_key !== "timestamp") {
        let variable = var_config.find(elem => elem.name === var_key)
        if (variable.type === "single") {
          clear[var_key] = true
        }
      }
    })
    events.push({ type: output.name, timestamp: variables.timestamp, content: msg })
    rendered.push({ topic: output.topic, payload: msg })
  })
  return { rendered_outputs: rendered, events: events, clear: clear }
}

function InputBar({ submit }) {
  let [value, setValue] = React.useState("")
  let [valid, setValid] = React.useState(false)
  let [validated, setValidated] = React.useState(false)

  let do_submit = () => {
    let valid = submit(value)
    setValidated(true)
    setValid(valid)
    if (valid) {
      setValue("")
    }
  }

  let checkEnter = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault()
      do_submit()
    }
  }

  let handleText = (event) => {
    if (validated)
      setValidated(false)
    setValue(event.target.value)
  }

  return <Container fluid>
    <InputGroup className="mt-4">
      <InputGroup.Text id="input-label">Input:</InputGroup.Text>
      <Form.Control
        placeholder="Barcode"
        onChange={handleText}
        onKeyDown={checkEnter}
        value={value}
        aria-label="Barcode"
        aria-describedby="input-label"
        className={validated ? (valid ? "is-valid" : 'is-invalid') : ""}
      />
      <Button variant="outline-primary" type="button" onClick={do_submit}>Submit</Button>
    </InputGroup>
    <div className={validated ? (valid ? "is-valid" : 'is-invalid') : ""} />
    <div className="invalid-feedback">
      Input does not match any recognised patterns
    </div>
  </Container >
}

function VariableDictionary({ variables, config }) {
  let static_v = config.filter(elem => elem.type === "static").map(elem => (elem.name))
  let retained_v = config.filter(elem => elem.type === "retain").map(elem => (elem.name))
  // let single_v = config.filter(elem => elem.type === "single").map(elem => (elem.name))

  let render_table = (keys) => {
    let table = []
    for (let i = 0; i < keys.length; i += 2) {
      table.push(<tr key={i}>
        <th scope="row" className='w-25'>{keys[i]}:</th>
        <td className='w-25'>{variables[keys[i]]}</td>
        {i + 1 < keys.length ? <>
          <th scope="row" className='w-25'>{keys[i + 1]}:</th>
          <td className='w-25'>{variables[keys[i + 1]]}</td>
        </> : ""}
      </tr>)
    }
    return table
  }

  return <Card className='mt-4 mx-2 p-2 pb-0'>
    <h3>Variables</h3>
    <Table borderless>
      <tbody>
        {render_table([...static_v, ...retained_v])}
      </tbody>
    </Table>
  </Card>
}

function EventLog({ events }) {
  return <Card className='mt-4 mx-2 p-2 pb-0'>
    <h3>Sent Events</h3>
    <Table bordered>
      <thead>
        <tr>
          <th className='col-4'>Time</th>
          <th className='col-4'>Type</th>
          <th className='col-4'>Content</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event, index) => (
          <tr key={index}>
            <td>{dayjs(event.timestamp).format('DD/MM/YYYY HH:mm:ss')}</td>
            <td>{event.type}</td>
            <td><MsgContent content={event.content} /></td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Card>
}

function MsgContent({ content }) {
  return <Table className='mb-0 fs-6'>
    {Object.keys(content).map(key => (
      <tr>
        <th scope="row">{key}:</th>
        <td>{content[key]}</td>
      </tr>
    ))}

  </Table>
}

export default App;
