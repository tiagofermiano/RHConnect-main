-- backend/db/schema.sql
-- Banco de dados para sistema de cadastro de currículos com autenticação

CREATE DATABASE IF NOT EXISTS recrutamento_curriculos;
USE recrutamento_curriculos;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(40) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    consentiu_termos TINYINT(1) NOT NULL DEFAULT 0,
    data_consentimento DATETIME NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS curriculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    vaga VARCHAR(150) NOT NULL,
    curriculo_link VARCHAR(255) NOT NULL,
    consentiu_termos TINYINT(1) NOT NULL DEFAULT 0,
    data_consentimento DATETIME NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
