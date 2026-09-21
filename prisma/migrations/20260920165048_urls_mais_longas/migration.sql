-- ATENÇÃO: nomes de tabela em PascalCase, exatamente como o schema define.
-- O MariaDB do Windows usa lower_case_table_names=1 e guarda tudo minúsculo,
-- então o Prisma gera estas linhas em minúsculas ao comparar com o banco
-- local. No Linux (lower_case_table_names=0) isso falha com
-- "Table 'turismo.destination' doesn't exist". Conferir a caixa dos nomes
-- sempre que gerar uma migração no Windows.

-- AlterTable
ALTER TABLE `Destination` MODIFY `coverImage` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `Package` MODIFY `shortDescription` VARCHAR(255) NOT NULL,
    MODIFY `coverImage` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `PackageImage` MODIFY `url` VARCHAR(500) NOT NULL;
