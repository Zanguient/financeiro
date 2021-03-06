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
	liquidacao,
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
	,CASE WHEN [fnmv_Liquidado] = '1' THEN [fnmv_DataMovimento] ELSE NULL END
    ,LTRIM(RTRIM([fnmv_NumeroCheque]))
    ,LTRIM(RTRIM([fnmv_Descricao]))
    ,[fnmv_Valor]
    ,[fnmv_Operacao]
    ,CASE WHEN [fnmv_Liquidado] = '1' THEN 1 ELSE 0 END
FROM 
	[DBALTAMIRA].[dbo].[FN_MovimentoCC]
WHERE
	--LEN(LTRIM(RTRIM([fnmv_Agencia]))) > 0 AND LEN(LTRIM(RTRIM([fnmv_Conta]))) > 0 AND
	EXISTS (SELECT * FROM FINANCEIRO.dbo.FN_CONTAS C WHERE C.banco = LTRIM(RTRIM([fnmv_Banco])) AND C.agencia = LTRIM(RTRIM([fnmv_Agencia])) AND C.conta = LTRIM(RTRIM([fnmv_Conta])))

-- atribui 'x' para conta vazia
UPDATE FINANCEIRO.dbo.FN_CONTAS 
	SET conta = 'x'
FROM 
	FINANCEIRO.dbo.FN_CONTAS
WHERE
	banco = '104' AND agencia = 'MAXMIR' AND conta = ''

UPDATE FINANCEIRO.dbo.FN_MOVIMENTO
	SET conta = 'x'
FROM 
	FINANCEIRO.dbo.FN_MOVIMENTO
WHERE
	banco = '104' AND agencia = 'MAXMIR' AND conta = ''

-- muda o banco de nossa caixa para banco do brasil
UPDATE FINANCEIRO.dbo.FN_CONTAS 
	SET banco = '001'
FROM 
	FINANCEIRO.dbo.FN_CONTAS
WHERE
	banco = '151' AND agencia = 'ALTAMIRA' AND conta = '11029'

UPDATE FINANCEIRO.dbo.FN_MOVIMENTO
	SET banco = '001'
FROM
	FINANCEIRO.dbo.FN_MOVIMENTO
WHERE
	banco = '151' AND agencia = 'ALTAMIRA' AND conta = '11029'

-- inativa conta: 104 - caixa e. federal - ALTAMIRA - 256-4  
UPDATE FINANCEIRO.dbo.FN_CONTAS 
	SET ativo = 0
FROM 
	FINANCEIRO.dbo.FN_CONTAS
WHERE
	banco = '104' AND agencia = 'ALTAMIRA' AND conta = '256-4'

-- corrige nome empresa para ALTAMIRA: 104 - caixa e. federal - 1603 - 1681-6  
UPDATE FINANCEIRO.dbo.FN_CONTAS 
	SET agencia = 'ALTAMIRA'
FROM 
	FINANCEIRO.dbo.FN_CONTAS
WHERE
	banco = '104' AND agencia = '1603' AND conta = '1681-6'

UPDATE FINANCEIRO.dbo.FN_MOVIMENTO
	SET agencia = 'ALTAMIRA'
FROM
	FINANCEIRO.dbo.FN_MOVIMENTO
WHERE
	banco = '104' AND agencia = '1603' AND conta = '1681-6'

SET IDENTITY_INSERT FINANCEIRO.dbo.FN_MOVIMENTO OFF;