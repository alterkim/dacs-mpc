import './App.css';
import {Divider, Grid, Header, Table, Button, Form, Segment} from "semantic-ui-react";
import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [to, setTo] = useState();
  const [value, setValue] = useState();
  const [unsignedTx, setUnsignedTx] = useState('');
  const [txHash, setTxHash] = useState('');
  const [keyGen, setKeyGen] = useState(false);

  axios.defaults.baseURL="http://141.223.181.204:3002";

  async function getAddress() {
    try {
      const response = await axios.get('/address');
      setAddress(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function getBalance() {
    try {
      const response = await axios.get('/balance');
      setBalance(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const onClickKeyGenerate = () => {
    setKeyGen(true);
  }

  async function createUTx(to, value) {
    try {
      const response = await axios.get(`/unsignedtx?from=${address}&to=${to}&value=${value}`);
      setUnsignedTx(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const createUnsignedTransaction = (e) => {
    createUTx(to, value);
  }

  const onChangeTo = (e) => {
    setTo(e.target.value);
  }

  const onChangeValue = (e) => {
    setValue(e.target.value);
  }
  
  async function sign() {
    try {
      const response = await axios.get(`/sign?from=${address}&to=${to}&value=${value}&data=${unsignedTx}`);
      console.log(response.data);
      setTxHash(response.data);
      setUnsignedTx('');
    } catch (error) {
      console.error(error);
    }
  }

  const signTransaction = () => {
    sign();
  }


  useEffect(()=>{
    getAddress();
    getBalance();
  },[txHash])

  if(!keyGen) {
    return (
      <Grid textAlign="center" style={{height: '100vh'}} verticalAlign='middle'>
        <Grid.Column style={{maxWidth: 500}}>
          <Header as='h1' color='teal' textAlign='center'>
            DACS Administrator Dashboard
          </Header>
          <h1/>

          <Form size="large">
            <Segment stacked padded>
              <Button fluid size="large" color='red'>Warning : Key is not generated</Button>
              <h3/>
              <Button color="teal" fluid size="large" onClick={onClickKeyGenerate} >
                Generate the Key using MPC
              </Button>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    )
  }

  return (
    <Grid padded textAlign='center' style={{height:'100vh'}} verticalAlign='top'>
    <Grid.Column style={{maxWidth: 1000}}>
      <Header as='h1' color='teal' textAlign='center'>
        DACS Administrator Dashboard
      </Header>
      <Divider/>
      <h2 style={{textAlign: 'left'}}>Wallet Info</h2>
      <Table celled size="large">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan='3'>Administrator Address</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell> {address} </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <h3 style={{textAlign:'left'}}>Protected by (threshold : 2, number : 3) Threshold MPC</h3>

      <h3 style={{textAlign:'left'}}>Balance : {balance} ETH</h3>
      <Divider/>

      <Form onSubmit={createUnsignedTransaction}>
        <Form.Input placeholder='To Address' name='toAddress' value={to} onChange={onChangeTo}/>
        <Form.Input placeholder='Send Amount' name='value' value={value} onChange={onChangeValue}/>
        <Form.Button  color="teal" fluid size="large">Create Transaction</Form.Button>
      </Form>
      <Divider/>
        
      <h3 style={{textAlign:'left'}}>Pending Transaction</h3>
      <Table celled size='large'>
        <Table.Header>
          <Table.Row textAlign='center'>
            <Table.HeaderCell>To</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {(unsignedTx == '')?null:
        <Table.Body>
          <Table.Row textAlign='center'>
            <Table.Cell>{to}</Table.Cell>
            <Table.Cell>{value}</Table.Cell>
          </Table.Row>
        </Table.Body>
        }
      </Table>
      {(unsignedTx == '')?null:<h3 style={{textAlign:'left'}}>Unsigned Trasaction Hash : {unsignedTx}</h3>}
      
      <Button color='teal' fluid size="large" onClick={signTransaction}>Sign &amp; Send Transaction</Button>
      <h3 style={{textAlign:'left'}}>Tx Hash : {txHash}</h3>
      <Divider/>

    </Grid.Column>
  </Grid>
  );
}

export default App;
