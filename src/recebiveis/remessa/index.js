
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

/*! FUNCTION: ARRAY.KEYSORT(); **/
Array.prototype.sortByKey = function(key, desc){
  this.sort(function(a, b) {
    var result = desc ? (a[key] < b[key]) : (a[key] > b[key]);
    return result ? 1 : -1;
  });
  return this;
}

export default class Remessa extends Component {
  constructor(props) {
    super(props);

    this.state = {
      "empresa": "",
      "numero": 0,
      "emissao": "2011-03-14T00:00:00.000Z",
      "entrega": "2010-10-26T00:00:00.000Z",
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
      "condicao": "",
      "representante": {
        "codigo": "",
        "nome": ""
      },
      "comissao": 0,
      "desconto": 1,
      "totais": {
        "produtos": 0,
        "ipi": 0,
        "total": 0
      },
      "parcelas": [],

      "cobrancas": [],

      "remessas": [],

      // campos de controle, não apagar
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
    this.loadTarefas(this.props.params.id || 0)
  }

  componentWillReceiveProps(nextProps) {
    this.loadTarefas(nextProps.params.id);    
  }
  
  loadTarefas(tarefa) {
    // carrega os parametros da tarefa
    axios
      .get('http://localhost:1880/api/tarefa/' + tarefa)
      .then( (response) => {
        console.log(JSON.stringify(response.data, null, 2));
        this.setState({...response.data.conteudo});
      })
      .catch( error => {
        alert('Erro ao obter a tarefa: ' + tarefa + '.\nErro: ' + error.message);
      })   

  }

  handleClose() {
    browserHistory.push('/');
  }

  handleComplete(data) {
    console.log(JSON.stringify(omit(this.state, ['order', 'dialog']), null, 2));
    // carrega os parametros da tarefa
    axios
      .post('http://localhost:1880/api/financeiro/duplicata/remessa/concluir/' + this.props.params.id, omit(this.state, ['order', 'dialog']))
      .then( (response) => {
        //alert('Tarefa concluida com sucesso');
        //browserHistory.push('/');
      })
      .catch( error => {
        alert('Erro ao concluir a tarefa.\nErro: ' + error.message);
      })
  }

  handleSelect(remessa, index) {
    let remessas = this.state.remessas;
    remessas[index].selected = true;
    this.setState({remessas: remessas})
  }

  handleUnselect(remessa, index) {
    let remessas = this.state.remessas;
    remessas[index].selected = false;
    this.setState({remessas: remessas})
  }

  handleConfirm(item) {
    //this.setState({dialog: <Confirm item={item} onSave={this.handleDelete.bind(this)} onClose={this.handleCloseDialog.bind(this)} />})
  }

  handleCloseDialog() {
    this.setState({dialog: null})
  }

  // formulario
  handleChange(value) {
    this.setState({[value.target.id]: value.target.value});
  }

  handleOrderBy(key) {
    let order = {nosso_numero: null, vencto: null, nome: null, parcela: null, valor: null};
    let remessas = this.state.remessas;
    order[key] = !this.state.order[key];
    this.setState({remessas: remessas.sortByKey(key, order[key]), order: order });
  }

  render() {

    let total = this.state.remessas.reduce( (soma, p) => soma + (p.selected ? p.valor : 0.0), 0.0);

    return (

      <div>

        <Panel header={'Remessa de Cobrança'} bsStyle="primary" >

          <Row style={{borderBottom: 'solid', borderBottomWidth: 1, borderBottomColor: '#337ab7', paddingBottom: 20}}>
            <Col xs={4} md={4} >

              <OverlayTrigger 
                placement="top" 
                overlay={(<Tooltip id="tooltip">Tarefa concluída</Tooltip>)}
              >
                  <Button
                    disabled={!(this.state.remessas.find( p => p.selected) && this.state.carteira !== null)}
                    onClick={this.handleComplete}
                    style={{width: 150}}
                    bsStyle="success"
                  >
                    <Glyphicon glyph="ok" />
                    <div><span>Remessa Enviada</span></div>
                  </Button>
              </OverlayTrigger>

            </Col>
            <Col xs={4} md={2} >

              {/*<OverlayTrigger 
                placement="top" 
                overlay={(<Tooltip id="tooltip">Apenas gravar as alterações</Tooltip>)}
              >

                  <Button
                    onClick={this.handleSave}
                    style={{width: 100}}
                  >
                    <Glyphicon glyph="floppy-disk" />
                    <div><span>Gravar</span></div>
                  </Button>

              </OverlayTrigger>*/}

            </Col>
            <Col xs={4} md={2} >

              {/*<OverlayTrigger 
                placement="top" 
                overlay={(<Tooltip id="tooltip">Calcular Datas das Parcelas</Tooltip>)}
              >

                <Button
                  onClick={this.handleCalc}
                  style={{width: 100}}
                >
                  <Glyphicon glyph="calendar" />
                  <div><span>Calcular</span></div>
                </Button>

              </OverlayTrigger>*/}

            </Col>
            <Col xs={4} md={2} >

              {/*<OverlayTrigger 
                placement="top" 
                overlay={(<Tooltip id="tooltip">Imprimir Espelho desta Duplicata</Tooltip>)}
              >

                <Button
                  disabled={this.state.hasChanges}
                  onClick={this.handlePrint}
                  style={{width: 100}}
                >
                  <Glyphicon glyph="print" />
                  <div><span>Imprimir</span></div>
                </Button>

              </OverlayTrigger>*/}

            </Col>
            <Col xs={4} md={2} >

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

                  {/*<Row>
                    <Col md={4}>Tipo</Col>
                    <Col md={8}>
                      <FormGroup validationState="success">
                        <FormControl id="tipo" componentClass="select" placeholder="Tipo" value={this.state.tipo} onChange={this.handleChange} >
                          <option value="DDP">BANCO DO BRASIL - AG 3333-2 CONTA 2171-7</option>
                          <option value="DDL">BANCO ITAU - AG 0467 CONTA 20912-8</option>
                          <option value="DDM">BANCO BRADESCO - AG 3393 CONTA 20257</option>
                        </FormControl>
                        <FormControl.Feedback />
                      </FormGroup>
                    </Col>
                  </Row>*/}

                  {/*<Row style={{paddingTop: 20}} >
                    <Col xs={12} md={2}>Pedido</Col>
                    <Col xs={12} md={2}>
                      <FormGroup validationState="success">
                        <FormControl type="text" value={this.state.numero} onChange={this.handleChange} />
                        <FormControl.Feedback />
                      </FormGroup>
                    </Col>
                    <Col xs={12} md={2}>Data da Emissão</Col>
                    <Col xs={12} md={2}>
                      <FormGroup validationState="success">
                        <DatePicker ref="emissao" value={this.state.emissao} onChange={this.handleChange} />
                      </FormGroup>
                    </Col>
                    <Col xs={12} md={2}>Data da Entrega</Col>
                    <Col xs={12} md={2}>
                      <FormGroup validationState="success">
                        <DatePicker value={this.state.entrega} onChange={this.handleChange} />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} md={2}>CNPJ/CPF</Col>
                    <Col xs={12} md={3}>
                      <FormGroup validationState="success">
                        <FormControl type="text" style={{textAlign: 'right'}} value={this.state.cliente.cnpj} onChange={this.handleChange} />
                        <FormControl.Feedback />
                      </FormGroup>
                    </Col>
                    <Col xs={12} md={2}>Representante</Col>
                    <Col xs={12} md={5}>
                      <FormGroup validationState="success">
                        <FormControl type="text" value={this.state.representante.nome} onChange={this.handleChange} />
                        <FormControl.Feedback />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} md={2}>Razão Social</Col>
                    <Col xs={12} md={10}>
                      <FormGroup validationState="success">
                        <FormControl type="text" value={this.state.cliente.nome} onChange={this.handleChange} />
                        <FormControl.Feedback />
                      </FormGroup>
                    </Col>
                  </Row>*/}

                  <Row>
                    <Col xs={12} md={12}>
                      <Table striped bordered condensed hover>
                        <thead>
                          <tr>
                            <th style={{width: '10%'}}>Pedido</th><td style={{width: '90%'}}><b>{this.state.numero}</b></td>
                          </tr>
                          <tr>
                            <th style={{width: '10%'}}>Cliente</th><td style={{width: '90%'}}><b>{this.state.cliente.nome}</b></td>
                          </tr>
                        </thead>
                      </Table>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} md={8}>
                      <Table striped bordered condensed hover>
                        <thead>
                          <tr>
                            <th>CARTEIRA</th>
                            <th style={{textAlign: 'right'}}>LIMITE</th>
                            <th style={{textAlign: 'right'}}>UTILIZADO</th>
                            <th style={{textAlign: 'right'}}>SALDO</th>
                            <th style={{textAlign: 'right'}}>DEFASAGEM</th>
                            <th style={{textAlign: 'right'}}>ENVIAR</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{textAlign: 'left'}}>{(this.state.carteira && this.state.carteira.nome) || ''}</td>
                            <td style={{textAlign: 'right'}}>R$ {Number(this.state.carteira.limite).toLocaleString()}</td>
                            <td style={{textAlign: 'right'}}>R$ {Number(this.state.carteira.utilizado).toLocaleString()}</td>
                            <td style={{textAlign: 'right'}}>R$ {Number(this.state.carteira.saldo).toLocaleString()}</td>
                            <td style={{textAlign: 'right'}}>R$ {Number(this.state.carteira.defasagem).toLocaleString()}</td>
                            <td style={{textAlign: 'right'}}>R$ {Number(this.state.carteira.descoberto).toLocaleString()}</td>
                          </tr>                              
                        </tbody>
                      </Table>
                    </Col>
                    <Col xs={12} md={4}>
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
                              <td style={{textAlign: 'right'}}><b>R$ {Number(total).toLocaleString()}</b></td>
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
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} md={12}>
                      <Table striped bordered condensed hover>
                        <thead>
                          <tr>
                            <th style={{textAlign: 'center'}}><a href="#" onClick={this.handleOrderBy.bind(null, 'nosso_numero')}>Número</a> {this.state.order.nosso_numero !== null ? this.state.order.nosso_numero ? (<Glyphicon glyph="chevron-up" />) : <Glyphicon glyph="chevron-down" /> : null}</th>
                            <th style={{textAlign: 'center'}}><a href="#" onClick={this.handleOrderBy.bind(null, 'vencto')}>Vencimento</a> {this.state.order.vencto !== null ? this.state.order.vencto ? (<Glyphicon glyph="chevron-up" />) : <Glyphicon glyph="chevron-down" /> : null}</th>
                            <th style={{textAlign: 'center'}}><a href="#" onClick={this.handleOrderBy.bind(null, 'parcela')}>Parcela</a> {this.state.order.parcela !== null ? this.state.order.parcela ? (<Glyphicon glyph="chevron-up" />) : <Glyphicon glyph="chevron-down" /> : null}</th>
                            <th style={{textAlign: 'center'}}>Prazo</th>
                            <th style={{textAlign: 'right'}}><a href="#" onClick={this.handleOrderBy.bind(null, 'valor')}>Valor da Parcela</a> {this.state.order.valor !== null ? this.state.order.valor ? (<Glyphicon glyph="chevron-up" />) : <Glyphicon glyph="chevron-down" /> : null}</th>
                            <th>CARTEIRA</th>
                            <th>Data Envio</th>
                            <th style={{width: '1%'}}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.remessas.map( (remessa, index) => {
                            return (
                              <tr key={'tr-' + index} style={{background: !remessa.envio && remessa.selected ? 'gold' : ''}} >
                                <td style={{textAlign: 'center'}}>{remessa.nosso_numero}</td>
                                <td style={{textAlign: 'center'}}>{new Date(remessa.vencto).toLocaleDateString()}</td>
                                <td style={{textAlign: 'center'}}>{remessa.parcela}/{this.state.remessas.length}</td>
                                <td style={{textAlign: 'center'}}>{remessa.remessa === 1 && remessa.tipo === "DDP" ? 'SINAL' : remessa.tipo === 'DDP' ? remessa.prazo + ' dia(s) do PEDIDO' :  remessa.prazo + ' dia(s) da ENTREGA'}</td>
                                <td style={{textAlign: 'right'}}>R$ {Number(remessa.valor).toLocaleString()}</td>
                                <td >{remessa.envio && remessa.carteira.nome}</td>
                                <td style={{textAlign: 'center'}}>{remessa.carteira && new Date(remessa.envio).toLocaleDateString()}</td>
                                <td>
                                  {!remessa.envio ? (!remessa.selected ? 
                                    (<Button bsStyle="success" style={{width: '33px', marginRight: '4px'}} bsSize="small" onClick={this.handleSelect.bind(null, remessa, index)} ><Glyphicon glyph="ok" /></Button>) :                                 
                                    (<Button bsStyle="danger" style={{width: '33px'}} bsSize="small" onClick={this.handleUnselect.bind(null, remessa, index)} ><Glyphicon glyph="remove" /></Button>)) : null
                                  }
                                </td>
                              </tr>                              
                            )
                          }
                            
                          )}
                        </tbody>
                      </Table>
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
