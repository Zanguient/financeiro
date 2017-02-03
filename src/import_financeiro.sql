/****** Script do comando SelectTopNRows de SSMS  ******/
DELETE FINANCEIRO.dbo.FN_BANCOS;
DELETE FINANCEIRO.dbo.FN_CONTAS;
DELETE FINANCEIRO.dbo.FN_MOVIMENTO;

INSERT INTO FINANCEIRO.dbo.FN_BANCOS
	([codigo]
      ,[nome]
      ,[valor_taxa]
      ,[valor_bordero]
      ,[valor_limite]
      ,[financeiro]
      ,[cheque_especial])	
SELECT 
	LTRIM(RTRIM([fnba_Codigo]))
    ,LTRIM(RTRIM([fnba_NomeBanco]))
    ,[fnba_ValorTaxa]
    ,[fnba_ValorBordero]
    ,[fnba_ValorLimite]
    ,[fnba_financeiro]
    ,[fnba_ChequeEspecial]
  FROM [DBALTAMIRA].[dbo].[FN_Bancos]


INSERT INTO FINANCEIRO.dbo.FN_CONTAS
	([banco]
      ,[agencia]
      ,[conta]
      ,[gerente]
      ,[telefone]
      ,[previsao]
      ,[saldo])
SELECT 
	LTRIM(RTRIM([fncc_Banco]))
      ,LTRIM(RTRIM([fncc_Agencia]))
      ,LTRIM(RTRIM([fncc_Conta]))
      ,LTRIM(RTRIM([fncc_Gerente]))
      ,LTRIM(RTRIM([fncc_Telefone]))
      ,[fncc_Previsao]
      ,[fncc_SaldoInicial]
  FROM [DBALTAMIRA].[dbo].[FN_ContaCorrente]

SET IDENTITY_INSERT FINANCEIRO.dbo.FN_MOVIMENTO ON;

INSERT INTO FINANCEIRO.dbo.FN_MOVIMENTO
	(id,
	banco,
	agencia,
	conta,
	data,
	documento,
	descricao,
	valor,
	operacao,
	liquidado)
SELECT 
	[fnmv_Sequencia]
    ,LTRIM(RTRIM([fnmv_Banco]))
    ,LTRIM(RTRIM([fnmv_Agencia]))
    ,LTRIM(RTRIM([fnmv_Conta]))
    ,[fnmv_DataMovimento]
    ,LTRIM(RTRIM([fnmv_NumeroCheque]))
    ,LTRIM(RTRIM([fnmv_Descricao]))
    ,[fnmv_Valor]
    ,[fnmv_Operacao]
    ,CASE WHEN [fnmv_Liquidado] = '1' THEN 1 ELSE 0 END
FROM [DBALTAMIRA].[dbo].[FN_MovimentoCC]

SET IDENTITY_INSERT FINANCEIRO.dbo.FN_MOVIMENTO OFF;