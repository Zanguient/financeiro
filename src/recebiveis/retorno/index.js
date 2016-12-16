
import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import {
  OverlayTrigger, 
  Button, 
  Glyphicon, 
  Panel,  
  Col, 
  Row, 
  Table,
  Tooltip,
} from 'react-bootstrap';

import { Tabs, Tab } from 'react-bootstrap';
import { Image } from 'react-bootstrap';

import { omit } from 'lodash';
import axios from 'axios';

import process from './process.svg';

import Form from './Titulo';

/*! FUNCTION: ARRAY.KEYSORT(); **/
Array.prototype.sortByKey = function(key, desc){
  this.sort(function(a, b) {
    var result = desc ? (a[key] < b[key]) : (a[key] > b[key]);
    return result ? 1 : -1;
  });
  return this;
}

export default class Retorno extends Component {
  constructor(props) {
    super(props);

    this.state = {

      tarefa: {},

      carteira: {
        "id": 0,
        "banco": "",
        "agencia": "0",
        "conta": "0",
        "carteira": 0,
        "nome": "",
        "limite": 0,
        "utilizado": 0,
        "saldo": 0,
        "defasagem": 0,
        "descoberto": 0,
        "iof": 0,
        "juros": 0,
        "bordero": 0
      },

      retorno: [
        {
          "nosso_numero": 0,
          "pedido": 0,
          "cliente": {
            "cnpj": "",
            "inscricao": "",
            "fantasia": "",
            "nome": "",
            "logradouro": "",
            "endereco": "",
            "numero": "",
            "complemento": "",
            "bairro": "",
            "municipio": 0,
            "cidade": "",
            "CEP": "",
            "UF": "",
            "ddd": "",
            "telefone": "",
            "contato": "",
            "desconto": 0
          },
          "parcelas": []
        }
      ],

      // campos de controle, não armazenar
      dialog: null,

      // false = ascending order, true = descending order
      order: {
        nosso_numero: null, 
        vencto: null,
        nome: null,
        parcela: null,
        valor: null, 
      }
    }

    // comandos
    this.handleClose = this.handleClose.bind(this);
    this.handleComplete = this.handleComplete.bind(this);

    // edição do formulario
    this.handleChange = this.handleChange.bind(this);

    this.handleConfirm = this.handleConfirm.bind(this);

    this.handleSelect = this.handleSelect.bind(this);
    this.handleUnselect = this.handleUnselect.bind(this);

    this.handleOrderBy = this.handleOrderBy.bind(this);

  }

  componentWillMount() {
    // carrega os parametros da tarefa
    axios
      .get('http://financeiro:1880/api/tarefa/' + this.props.params.id)
      .then( (response) => {
        console.log(JSON.stringify(response.data, null, 2))
        this.setState({
          tarefa: omit(response.data, 'documento'), 
          carteira: response.data.documento.carteira,
          data: response.data.documento.data,
          retorno: response.data.documento.retorno
        });
      })
      .catch( error => {
        this.setState({dialog: <Error {...error.response.data} onClose={this.handleCloseDialog.bind(this)} />})
      })
  }

  componentWillReceiveProps(props) {
    // carrega os parametros da tarefa
    axios
      .get('http://financeiro:1880/api/tarefa/' + props.params.id)
      .then( (response) => {
        console.log(JSON.stringify(response.data, null, 2))
        this.setState({
          tarefa: omit(response.data, 'documento'), 
          carteira: response.data.documento.carteira,
          data: response.data.documento.data,
          retorno: response.data.documento.retorno
        });
      })
      .catch( error => {
        this.setState({dialog: <Error {...error.response.data} onClose={this.handleCloseDialog.bind(this)} />})
      })    
  }

  handleClose() {
    this.props.router.push('/');
  }

  handleComplete(data) {
    console.log(JSON.stringify({
      ...this.state.tarefa, 
      documento: { 
        carteira: this.state.carteira, 
        retorno: this.state.retorno
      }
    }, null, 2));

    // carrega os parametros da tarefa
    axios
      .post('http://financeiro:1880/api/financeiro/recebiveis/retorno/tarefa/' + this.props.params.id, {
        ...this.state.tarefa, 
        documento: { 
          carteira: this.state.carteira, 
          retorno: this.state.retorno
        }
      })
      .then( (response) => {
        console.log(response.data);
        this.props.router.push('/');
      })
      .catch( error => {
        this.setState({dialog: <Error 
          erro={error.response ? error.response.data.erro : 0} 
          mensagem={error.message + (error.response.data.mensagem || JSON.stringify(error.response.data, null, 2))} 
          onClose={this.handleCloseDialog.bind(this)} />})
      })
  }

  handleSelect(retorno) {
    this.setState({dialog: <Form {...retorno} onClose={this.handleCloseDialog.bind(this)} onSave={this.handleSelectSave.bind(this)} />})
  }

  handleSelectSave(retorno) {
    this.setState({
      dialog: undefined,
      retorno: this.state.retorno.map( (r, i) => {
        
        if (retorno.retorno_index === i) {
          r.parcelas[retorno.parcela_index].selected = true;
        } 

        return r;
      })
    })
  }

  handleUnselect() {

  }

  handleConfirm(item) {
    //this.setState({dialog: <Confirm item={item} onSave={this.handleDelete.bind(this)} onClose={this.handleCloseDialog.bind(this)} />})
  }

  handleCloseDialog() {
    this.setState({dialog: undefined})
  }

  // formulario
  handleChange(value) {
    this.setState({[value.target.id]: value.target.value});
  }

  handleOrderBy(key) {
    let order = {nosso_numero: null, vencto: null, nome: null, parcela: null, valor: null};
    let retornos = this.state.retornos;
    order[key] = !this.state.order[key];
    this.setState({retornos: retornos.sortByKey(key, order[key]), order: order });
  }

  render() {

    let total = this.state.retorno.reduce( (total, r) => total + r.parcelas.reduce( (subtotal, p) => subtotal + (p.selected ? p.valor : 0.0), 0.0), 0.0);

    return (

      <div>

        <Panel header={'Retorno de Cobrança'} bsStyle="primary" >

          <Row style={{borderBottom: 'solid', borderBottomWidth: 1, borderBottomColor: '#337ab7', paddingBottom: 20}}>
            <Col xs={4} md={4} >

              <OverlayTrigger 
                placement="top" 
                overlay={(<Tooltip id="tooltip">Tarefa concluída</Tooltip>)}
              >
                  <Button
                    disabled={!!this.state.retorno.find( r => r.parcelas.find( p => !p.selected))}
                    onClick={this.handleComplete}
                    style={{width: 150}}
                    bsStyle="success"
                  >
                    <Glyphicon glyph="ok" />
                    <div><span>Emitir Borderô</span></div>
                  </Button>
              </OverlayTrigger>

            </Col>

            <Col xs={4} md={4} />

            <Col xs={4} md={4} style={{textAlign: 'right'}} >

              <OverlayTrigger 
                placement="top" 
                overlay={(<Tooltip id="tooltip">Deixar para fazer depois</Tooltip>)}
              >
                  <Button
                    onClick={this.handleClose}
                    style={{width: 120}}
                  >
                    <Glyphicon glyph="time" />
                    <div><span>Fazer depois</span></div>
                  </Button>

              </OverlayTrigger>

            </Col>
          </Row>

          <Row>
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
              <Tab eventKey={1} title="Formulário">
                <div style={{margin: 20}}>

                  <Row>
                    <Col xs={12} md={12}>
                      <Table striped bordered condensed hover style={{borderCollapse: 'collapse'}}>
                        <thead>
                          <tr>
                            <th>Carteira</th>
                            <th style={{textAlign: 'right'}}>Limite</th>
                            <th style={{textAlign: 'right'}}>Utilizado</th>
                            <th style={{textAlign: 'right'}}>Saldo</th>
                            <th style={{textAlign: 'right'}}>Defasagem</th>
                            <th style={{textAlign: 'right'}}>Enviar</th>
                            <th style={{textAlign: 'right'}}>Remessa</th>
                            <th style={{textAlign: 'right'}}>Retorno</th>
                          </tr>
                        </thead>
                        <tbody>
                            <tr>
                              <td style={{textAlign: 'left'}}><h2><b>{this.state.carteira.nome}</b></h2></td>
                              <td style={{textAlign: 'right'}}><b>{Number(this.state.carteira.limite.toFixed(2)).toLocaleString()}</b></td>
                              <td style={{textAlign: 'right'}}><b>{Number(this.state.carteira.utilizado.toFixed(2)).toLocaleString()}</b></td>
                              <td style={{textAlign: 'right'}}><b>{Number(this.state.carteira.saldo.toFixed(2)).toLocaleString()}</b></td>
                              <td style={{textAlign: 'right'}}><b>{Number(this.state.carteira.defasagem.toFixed(2)).toLocaleString()}</b></td>
                              <td style={{textAlign: 'right'}}><b>{Number(this.state.carteira.descoberto.toFixed(2)).toLocaleString()}</b></td>
                              <td style={{textAlign: 'right'}}><b>{Number(this.state.carteira.retorno_total || 0).toLocaleString()}</b></td>
                              <td style={{textAlign: 'right'}}><b>{Number(this.state.carteira.retorno).toLocaleString()}</b></td>
                            </tr>                              
                        </tbody>
                      </Table>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} md={12}>
                      <Table striped bordered condensed hover>
                        <thead>
                          <tr>
                            <th style={{textAlign: 'center'}}>Número</th>
                            <th style={{textAlign: 'center'}}>Pedido</th>
                            <th style={{textAlign: 'center'}}>Vencimento</th>
                            <th style={{textAlign: 'center'}}>Parcela</th>
                            <th style={{textAlign: 'center'}}>Prazo</th>
                            <th style={{textAlign: 'right'}}>Valor da Parcela</th>
                            <th style={{width: '110px'}} ></th>
                          </tr>
                        </thead>

                          {this.state.retorno.map( (r, index) => <Titulo key={'titulo-' + r.nosso_numero} {...r} index={index} handleSelect={this.handleSelect} handleUnselect={this.handleUnselect} /> )}
                        
                      </Table>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col xs={0} md={8}></Col>
                    <Col xs={12} md={4}>
                      {this.state.retorno.find( retorno => retorno.parcelas.find( parcela => parcela.selected)) && this.state.carteira !== null ? 

                        <Table striped bordered condensed hover>
                          <thead>
                            <tr>
                              <th style={{textAlign: 'right'}}>DESCONTOS</th>
                              <th style={{textAlign: 'right'}}>VALOR</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{textAlign: 'right'}}><b>Valor Bruto</b></td>
                              <td style={{textAlign: 'right'}}><b>R$ {Number(total.toFixed(2)).toLocaleString()}</b></td>
                            </tr>
                            <tr>
                              <td style={{textAlign: 'right'}}><b>IOF ({Number((this.state.carteira.iof / 100).toFixed(2)).toLocaleString()}%)</b></td>
                              <td style={{textAlign: 'right'}}><b>R$ {Number((total * (this.state.carteira.iof / 100)).toFixed(2)).toLocaleString()}</b></td>
                            </tr>
                            <tr>
                              <td style={{textAlign: 'right'}}><b>Juros ({Number((this.state.carteira.juros / 100).toFixed(2)).toLocaleString()}%)</b></td>
                              <td style={{textAlign: 'right'}}><b>R$ {Number((total * (this.state.carteira.juros / 100)).toFixed(2)).toLocaleString()}</b></td>
                            </tr>
                            <tr>
                              <td style={{textAlign: 'right'}}><b>Taxa do Borderô</b></td>
                              <td style={{textAlign: 'right'}}><b>R$ {Number((this.state.carteira.bordero).toFixed(2)).toLocaleString()}</b></td>
                            </tr>
                            <tr>
                              <td style={{textAlign: 'right'}}><b>Valor Líquido</b></td>
                              <td style={{textAlign: 'right'}}><b>R$ {Number((total - (total * ((this.state.carteira.iof + this.state.carteira.juros) / 100) + this.state.carteira.bordero)).toFixed(2)).toLocaleString()}</b></td>
                            </tr>
                          </tbody>
                        </Table>
                          
                        : null
                      }
                    </Col>
                  </Row>              
                </div>
              </Tab>
              <Tab eventKey={2} title="Procedimento">
                <Image src={process} style={{width: '100%', height: '100%'}} />
              </Tab>
            </Tabs>
          </Row>
        </Panel>

        {this.state.dialog}

      </div>

    );
  }
}

const Titulo = (retorno) =>
  <tbody>
    <tr>
      <td colSpan={8}><h4><b>{retorno.cliente.nome}</b></h4></td>
    </tr>
    {retorno.parcelas.map ( (parcela, index) =>
      <Parcela key={'parcela-' + retorno.nosso_numero + '-' + index} {...parcela} nosso_numero={retorno.nosso_numero} pedido={retorno.pedido} cliente={retorno.cliente} retorno_index={retorno.index} parcela_index={index} handleSelect={retorno.handleSelect} handleUnselect={retorno.handleUnselect} />
    )}
  </tbody>

const Parcela = (parcela) =>
  <tr>
    <td style={{textAlign: 'center'}}>{parcela.nosso_numero}</td>
    <td style={{textAlign: 'center'}}><b>{parcela.pedido}</b></td>
    <td style={{textAlign: 'center'}}>{new Date(parcela.vencto).toLocaleDateString()}</td>
    <td style={{textAlign: 'center'}}>{parcela.parcela}</td>
    <td style={{textAlign: 'center'}}>{parcela.parcela === 1 && parcela.tipo === "DDP" ? 'SINAL' : parcela.tipo === 'DDP' ? parcela.prazo + ' dia(s) do PEDIDO' :  parcela.prazo + ' dia(s) da ENTREGA'}</td>
    <td style={{textAlign: 'right'}}><b>R$ {Number(parcela.valor).toLocaleString()}</b></td>
    
    {!parcela.selected ?
      (<td><OverlayTrigger placement="bottom" overlay={<Tooltip id={'tooltip_aceito' + parcela.parcela_index} >Aceito</Tooltip>}>
        <Button bsStyle="success" style={{width: '33px', marginRight: '4px'}} bsSize="small" onClick={parcela.handleSelect.bind(null, parcela)}>
          <Glyphicon glyph="thumbs-up" />
        </Button>
      </OverlayTrigger>
      <OverlayTrigger placement="bottom" overlay={<Tooltip id={'tooltip_naceito' + parcela.parcela_index}>Não Aceito</Tooltip>}>
        <Button bsStyle="danger" style={{width: '33px'}} bsSize="small" onClick={parcela.handleSelect.bind(null, parcela)}>
          <Glyphicon glyph="thumbs-down" />
        </Button>
      </OverlayTrigger></td>) 

      :

      (<td><OverlayTrigger placement="bottom" overlay={<Tooltip id={'tooltip_ok' + parcela.parcela_index} >Desfazer</Tooltip>}>
        <Button bsStyle="success" style={{width: '33px', marginRight: '4px'}} bsSize="small" onClick={parcela.handleUnselect.bind(null, parcela)}>
          <Glyphicon glyph="ok" />
        </Button>
      </OverlayTrigger></td>)
    }
    
  </tr>

