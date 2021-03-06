USE [FINANCEIRO]
GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTOS_LIQUIDADOS]    Script Date: 16/02/2017 13:13:23 ******/
DROP PROCEDURE [dbo].[FN_LANCAMENTOS_LIQUIDADOS]
GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTOS_A_CONFERIR]    Script Date: 16/02/2017 13:13:23 ******/
DROP PROCEDURE [dbo].[FN_LANCAMENTOS_A_CONFERIR]
GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTO_REMOVE]    Script Date: 16/02/2017 13:13:23 ******/
DROP PROCEDURE [dbo].[FN_LANCAMENTO_REMOVE]
GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTO_LIQUIDAR]    Script Date: 16/02/2017 13:13:23 ******/
DROP PROCEDURE [dbo].[FN_LANCAMENTO_LIQUIDAR]
GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTO_EDIT]    Script Date: 16/02/2017 13:13:23 ******/
DROP PROCEDURE [dbo].[FN_LANCAMENTO_EDIT]
GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTO_ADD]    Script Date: 16/02/2017 13:13:23 ******/
DROP PROCEDURE [dbo].[FN_LANCAMENTO_ADD]
GO
/****** Object:  StoredProcedure [dbo].[FN_CONTAS_LIST]    Script Date: 16/02/2017 13:13:23 ******/
DROP PROCEDURE [dbo].[FN_CONTAS_LIST]
GO
/****** Object:  StoredProcedure [dbo].[FN_BANCOS_LIST]    Script Date: 16/02/2017 13:13:23 ******/
DROP PROCEDURE [dbo].[FN_BANCOS_LIST]
GO
/****** Object:  StoredProcedure [dbo].[FN_BANCOS_LIST]    Script Date: 16/02/2017 13:13:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO







CREATE PROCEDURE [dbo].[FN_BANCOS_LIST]
AS
BEGIN

	SELECT DISTINCT
		id,
		codigo,
		nome
	FROM 
		FN_BANCOS
	WHERE 
		EXISTS (SELECT 1 FROM FN_CONTAS WHERE FN_BANCOS.id = FN_CONTAS.banco AND FN_CONTAS.ativo = 1)
	ORDER BY 
		codigo, nome

END








GO
/****** Object:  StoredProcedure [dbo].[FN_CONTAS_LIST]    Script Date: 16/02/2017 13:13:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO









CREATE PROCEDURE [dbo].[FN_CONTAS_LIST]
AS
BEGIN

	SELECT DISTINCT
		id,
		codigo,
		nome
	FROM 
		FN_BANCOS
	WHERE 
		EXISTS (SELECT 1 FROM FN_CONTAS WHERE FN_BANCOS.id = FN_CONTAS.banco AND FN_CONTAS.ativo = 1)
	ORDER BY 
		codigo, nome

	SELECT DISTINCT
		--id,
		banco, 
		agencia
	FROM 
		FN_CONTAS
	WHERE 
		LEN(agencia) > 0 AND 
		LEN(conta) > 0 AND
		ativo = 1
	ORDER BY 
		banco, agencia

	SELECT DISTINCT
		id,
		banco, 
		agencia, 
		conta,
		0 AS saldo,
		ativo
	FROM 
		FN_CONTAS
	WHERE 
		LEN(agencia) > 0 AND 
		LEN(conta) > 0 AND
		ativo = 1
	ORDER BY 
		banco, agencia, conta

END










GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTO_ADD]    Script Date: 16/02/2017 13:13:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO









CREATE procedure [dbo].[FN_LANCAMENTO_ADD] 
	@ID INT,
	@CONTA INT,
	@DATA DATE,
	@LIQUIDACAO DATE,
	@DOCUMENTO VARCHAR(50),
	@DESCRICAO VARCHAR(100),
	@VALOR MONEY,
	@OPERACAO CHAR(1),
	@LIQUIDADO BIT
AS
BEGIN
	SET NOCOUNT ON;

	----------------------------- DECLARACAO DE VARIAVEIS -----------------------------
	DECLARE @ERR INT
	DECLARE @ERR_LOG ERR_LOG_TYPE

	DECLARE @NOTIFICACAO TAREFA_NOTIFICACAO_TYPE

	DECLARE @TOPICO NVARCHAR(50)

	BEGIN TRY
		BEGIN TRANSACTION

		IF @LIQUIDADO = 1 AND @LIQUIDACAO IS NULL
		BEGIN
			SET @LIQUIDACAO = GETDATE()
		END
		
		IF @LIQUIDADO = 0 AND NOT @LIQUIDACAO IS NULL
		BEGIN
			SET @LIQUIDACAO = NULL
		END

		IF (@VALOR < 0 AND @OPERACAO = 'C') OR
			(@VALOR > 0 AND @OPERACAO = 'D')
		BEGIN
			SET @VALOR = @VALOR * -1
		END

		INSERT INTO [FINANCEIRO].[dbo].[FN_MOVIMENTO]
			(conta, data, liquidacao, documento, descricao, valor, operacao, liquidado)
		VALUES 
			(@CONTA, @DATA, @LIQUIDACAO, @DOCUMENTO, @DESCRICAO, @VALOR, @OPERACAO, @LIQUIDADO)

		SET @ID = @@IDENTITY

		SET @TOPICO = '/contacorrente/lancamento/novo'

		/************************************ CONFIRMA ALTERACOES ************************************/

		COMMIT TRANSACTION

		------------------- NOTIFICA O SUCESSO DA OPERACAO PARA O CLIENTE -------------------
		INSERT INTO @ERR_LOG (id, datahora, erro, mensagem) 
		SELECT 0, GETDATE(), erro, mensagem FROM ERR WHERE erro = 0

	END TRY
	BEGIN CATCH

		------------------------- REVERTE AS ALTERACOES -------------------------
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION

		---------------------- RETORNA O ERRO PARA O CLIENTE ----------------------
		INSERT @ERR_LOG EXEC @ERR = ERRO_NOTIFICA

	END CATCH

	------------------ RETORNA O RESULTADO DA OPERACAO ------------------
	SELECT * FROM @ERR_LOG

	---------------------- RETORNA AS NOTIFICACOES ----------------------
	SELECT 
		id, conta, data, documento, descricao, valor, operacao, liquidado, @TOPICO AS topico
	FROM 
		[FINANCEIRO].[dbo].[FN_MOVIMENTO]
	WHERE id = @ID

	---------------------- RETORNA O REGISTRO ----------------------
	SELECT  
		id, conta, data, documento, descricao, valor, operacao, liquidado
	FROM 
		[FINANCEIRO].[dbo].[FN_MOVIMENTO]
	WHERE id = @ID

	RETURN @ERR; 

END










GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTO_EDIT]    Script Date: 16/02/2017 13:13:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO










CREATE procedure [dbo].[FN_LANCAMENTO_EDIT] 
	@ID INT,
	@CONTA INT,
	@DATA DATE,
	@LIQUIDACAO DATE,
	@DOCUMENTO VARCHAR(50),
	@DESCRICAO VARCHAR(100),
	@VALOR MONEY,
	@OPERACAO CHAR(1),
	@LIQUIDADO BIT
AS
BEGIN
	SET NOCOUNT ON;

	----------------------------- DECLARACAO DE VARIAVEIS -----------------------------
	DECLARE @ERR INT
	DECLARE @ERR_LOG ERR_LOG_TYPE

	DECLARE @NOTIFICACAO TAREFA_NOTIFICACAO_TYPE

	DECLARE @TOPICO NVARCHAR(50)

	BEGIN TRY
		BEGIN TRANSACTION

		IF @LIQUIDADO = 1 AND @LIQUIDACAO IS NULL
		BEGIN
			SET @LIQUIDACAO = GETDATE()
		END
		
		IF @LIQUIDADO = 0 AND NOT @LIQUIDACAO IS NULL
		BEGIN
			SET @LIQUIDACAO = NULL
		END

		IF (@VALOR < 0 AND @OPERACAO = 'C') OR
			(@VALOR > 0 AND @OPERACAO = 'D')
		BEGIN
			SET @VALOR = @VALOR * -1
		END

		UPDATE [FINANCEIRO].[dbo].[FN_MOVIMENTO] SET
			conta = @CONTA,
			data = @DATA,
			liquidacao = @LIQUIDACAO,
			documento = @DOCUMENTO,
			descricao = @DESCRICAO,
			valor = @VALOR,
			operacao = @OPERACAO,
			liquidado = @LIQUIDADO,
			alterado = GETDATE()
		WHERE 
			id = @ID

		SET @TOPICO = '/contacorrente/lancamento/atualizado'

		/************************************ CONFIRMA ALTERACOES ************************************/

		COMMIT TRANSACTION

		------------------- NOTIFICA O SUCESSO DA OPERACAO PARA O CLIENTE -------------------
		INSERT INTO @ERR_LOG (id, datahora, erro, mensagem) 
		SELECT 0, GETDATE(), erro, mensagem FROM ERR WHERE erro = 0

	END TRY
	BEGIN CATCH

		------------------------- REVERTE AS ALTERACOES -------------------------
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION

		---------------------- RETORNA O ERRO PARA O CLIENTE ----------------------
		INSERT @ERR_LOG EXEC @ERR = ERRO_NOTIFICA

	END CATCH

	------------------ RETORNA O RESULTADO DA OPERACAO ------------------
	SELECT * FROM @ERR_LOG

	---------------------- RETORNA AS NOTIFICACOES ----------------------
	SELECT 
		id, conta, data, documento, descricao, valor, operacao, liquidado, @TOPICO AS topico
	FROM 
		[FINANCEIRO].[dbo].[FN_MOVIMENTO]
	WHERE id = @ID

	---------------------- RETORNA O REGISTRO ----------------------
	SELECT  
		id, conta, data, documento, descricao, valor, operacao, liquidado
	FROM 
		[FINANCEIRO].[dbo].[FN_MOVIMENTO]
	WHERE id = @ID

	RETURN @ERR; 

END











GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTO_LIQUIDAR]    Script Date: 16/02/2017 13:13:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[FN_LANCAMENTO_LIQUIDAR]
	@ID INT,
	@LIQUIDADO BIT
AS
BEGIN
	SET NOCOUNT ON;

	----------------------------- DECLARACAO DE VARIAVEIS -----------------------------
	DECLARE @ERR INT
	DECLARE @ERR_LOG ERR_LOG_TYPE

	DECLARE @NOTIFICACAO TAREFA_NOTIFICACAO_TYPE

	DECLARE @TOPICO NVARCHAR(50)

	BEGIN TRY
		BEGIN TRANSACTION

		UPDATE 
			FN_MOVIMENTO
		SET
			liquidacao = GETDATE(),
			liquidado = @LIQUIDADO,
			alterado = GETDATE()
		FROM
			FN_MOVIMENTO
		WHERE
			id = @ID AND
			liquidado <> @LIQUIDADO

		SET @TOPICO = '/contacorrente/lancamento/liquidado/'

		/************************************ CONFIRMA ALTERACOES ************************************/

		COMMIT TRANSACTION

		------------------- NOTIFICA O SUCESSO DA OPERACAO PARA O CLIENTE -------------------
		INSERT INTO @ERR_LOG (id, datahora, erro, mensagem) 
		SELECT 0, GETDATE(), erro, mensagem FROM ERR WHERE erro = 0

	END TRY
	BEGIN CATCH

		------------------------- REVERTE AS ALTERACOES -------------------------
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION

		---------------------- RETORNA O ERRO PARA O CLIENTE ----------------------
		INSERT @ERR_LOG EXEC @ERR = ERRO_NOTIFICA

	END CATCH

	------------------ RETORNA O RESULTADO DA OPERACAO ------------------
	SELECT * FROM @ERR_LOG

	---------------------- RETORNA AS NOTIFICACOES ----------------------
	SELECT 
		id, conta, data, documento, descricao, valor, operacao, liquidado, @TOPICO AS topico
	FROM 
		[FINANCEIRO].[dbo].[FN_MOVIMENTO]
	WHERE id = @ID

	---------------------- RETORNA O REGISTRO ----------------------
	SELECT  
		id, conta, data, documento, descricao, valor, operacao, liquidado
	FROM 
		[FINANCEIRO].[dbo].[FN_MOVIMENTO]
	WHERE id = @ID

	RETURN @ERR; 

END






GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTO_REMOVE]    Script Date: 16/02/2017 13:13:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





CREATE PROCEDURE [dbo].[FN_LANCAMENTO_REMOVE]
	@ID INT
AS
BEGIN
	SET NOCOUNT ON;

	----------------------------- DECLARACAO DE VARIAVEIS -----------------------------
	DECLARE @ERR INT
	DECLARE @ERR_LOG ERR_LOG_TYPE

	DECLARE @NOTIFICACAO TAREFA_NOTIFICACAO_TYPE

	DECLARE @TOPICO NVARCHAR(50)

	CREATE TABLE #MOVIMENTO (
		[id] [int] NOT NULL,
		[conta] [int] NOT NULL,
		[data] [date] NOT NULL,
		[liquidacao] [date] NULL,
		[documento] [varchar](50) NULL,
		[descricao] [varchar](100) NOT NULL,
		[valor] [money] NOT NULL,
		[operacao] [char](1) NOT NULL,
		[liquidado] [bit] NOT NULL,
		[observacao] [nvarchar](MAX) NULL,
		[criado] [datetime2](7) NOT NULL,
		[alterado] [datetime2](7) NULL
	)

	BEGIN TRY
		BEGIN TRANSACTION

		INSERT INTO #MOVIMENTO
		SELECT * FROM FN_MOVIMENTO WHERE ID = @ID

		DELETE 
			FN_MOVIMENTO
		WHERE
			id = @ID

		SET @TOPICO = '/contacorrente/lancamento/excluido/'

		/************************************ CONFIRMA ALTERACOES ************************************/

		COMMIT TRANSACTION

		------------------- NOTIFICA O SUCESSO DA OPERACAO PARA O CLIENTE -------------------
		INSERT INTO @ERR_LOG (id, datahora, erro, mensagem) 
		SELECT 0, GETDATE(), erro, mensagem FROM ERR WHERE erro = 0

	END TRY
	BEGIN CATCH

		------------------------- REVERTE AS ALTERACOES -------------------------
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION

		---------------------- RETORNA O ERRO PARA O CLIENTE ----------------------
		INSERT @ERR_LOG EXEC @ERR = ERRO_NOTIFICA

	END CATCH

	------------------ RETORNA O RESULTADO DA OPERACAO ------------------
	SELECT * FROM @ERR_LOG

	---------------------- RETORNA AS NOTIFICACOES ----------------------
	SELECT 
		id, conta, data, documento, descricao, valor, operacao, liquidado, @TOPICO AS topico
	FROM 
		#MOVIMENTO
	WHERE id = @ID

	SELECT 
		id, conta, data, documento, descricao, valor, operacao, liquidado
	FROM 
		#MOVIMENTO
	WHERE id = @ID

	RETURN @ERR; 

END









GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTOS_A_CONFERIR]    Script Date: 16/02/2017 13:13:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO












CREATE PROCEDURE [dbo].[FN_LANCAMENTOS_A_CONFERIR]
	@CONTA		INT
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRANSACTION

	SELECT 
		0 AS id, 
		@CONTA AS conta, 
		GETDATE() AS data,
		GETDATE() AS liquidacao, 
		'' AS documento, 
		1 AS liquidado, 
		'SALDO ANTERIOR' AS descricao, 
		SUM(valor) AS valor, 
		CASE WHEN SUM(valor) < 0 THEN 'D' ELSE 'C' END AS operacao
	FROM
		FN_MOVIMENTO
	WHERE 
		conta = @CONTA AND
		liquidado = 1
	UNION		
	SELECT  
		[id],
		[conta],
		[data],
		[liquidacao],
		[documento],
		[liquidado],
		[descricao],
		[valor],
		[operacao]
	FROM 
		FN_MOVIMENTO
	WHERE 
		conta = @CONTA AND
		liquidado = 0
	ORDER BY
		data, liquidacao 

	COMMIT TRANSACTION
END












GO
/****** Object:  StoredProcedure [dbo].[FN_LANCAMENTOS_LIQUIDADOS]    Script Date: 16/02/2017 13:13:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO











CREATE PROCEDURE [dbo].[FN_LANCAMENTOS_LIQUIDADOS]
	@CONTA		INT
AS
BEGIN
	SET NOCOUNT ON;

	SELECT TOP 500 
		[id],
		[conta],
		[data],
		[liquidacao],
		[documento],
		[liquidado],
		[descricao],
		[valor],
		[operacao]
	FROM 
		FN_MOVIMENTO
	WHERE 
		conta = @CONTA AND
		liquidado = 1 AND
		liquidacao >= DATEADD(month, -6, GETDATE())
	ORDER BY
		liquidacao DESC, data DESC 

END












GO
