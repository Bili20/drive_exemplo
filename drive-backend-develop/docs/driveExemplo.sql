-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler version: 0.9.4
-- PostgreSQL version: 11.0
-- Project Site: pgmodeler.io
-- Model Author: ---

-- Database creation must be performed outside a multi lined SQL file. 
-- These commands were put in this file only as a convenience.
-- 
-- object: drive | type: DATABASE --
-- DROP DATABASE IF EXISTS drive;
CREATE DATABASE drive;
-- ddl-end --


-- object: exemplo | type: SCHEMA --
-- DROP SCHEMA IF EXISTS exemplo CASCADE;
CREATE SCHEMA exemplo;
-- ddl-end --

SET search_path TO pg_catalog,public,exemplo;
-- ddl-end --

-- object: exemplo.caminho_servidor | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.caminho_servidor CASCADE;
CREATE TABLE exemplo.caminho_servidor (
	id bigserial NOT NULL,
	nome varchar NOT NULL,
	CONSTRAINT caminho_pk PRIMARY KEY (id)
);
-- ddl-end --

-- object: exemplo.anexo | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.anexo CASCADE;
CREATE TABLE exemplo.anexo (
	id bigserial NOT NULL,
	nome_original varchar(200) NOT NULL,
	titulo varchar NOT NULL,
	data_cadastro timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	nome varchar NOT NULL,
	descricao text,
	id_caminho_servidor bigint,
	id_tipo bigint,
	id_sugestao_anexo bigint,
	CONSTRAINT anexo_pk PRIMARY KEY (id)
);
-- ddl-end --

-- object: caminho_servidor_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.anexo DROP CONSTRAINT IF EXISTS caminho_servidor_fk CASCADE;
ALTER TABLE exemplo.anexo ADD CONSTRAINT caminho_servidor_fk FOREIGN KEY (id_caminho_servidor)
REFERENCES exemplo.caminho_servidor (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: exemplo.tag | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.tag CASCADE;
CREATE TABLE exemplo.tag (
	id bigserial NOT NULL,
	nome varchar NOT NULL,
	descricao varchar,
	categoria boolean DEFAULT false,
	foto varchar,
	CONSTRAINT tag_pk PRIMARY KEY (id)
);
-- ddl-end --

-- object: exemplo.tipo | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.tipo CASCADE;
CREATE TABLE exemplo.tipo (
	id bigserial NOT NULL,
	nome varchar NOT NULL,
	CONSTRAINT tipo_pk PRIMARY KEY (id)
);
-- ddl-end --

-- object: exemplo.galeria | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.galeria CASCADE;
CREATE TABLE exemplo.galeria (
	id bigserial NOT NULL,
	titulo varchar NOT NULL,
	data_cadastro timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	publica boolean NOT NULL DEFAULT false,
	id_grupo bigint,
	id_pessoa bigint,
	CONSTRAINT "Galeria_pk" PRIMARY KEY (id)
);
-- ddl-end --

-- object: exemplo.pessoa | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.pessoa CASCADE;
CREATE TABLE exemplo.pessoa (
	id bigserial NOT NULL,
	nome varchar NOT NULL,
	data_cadastro timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	email varchar,
	senha varchar NOT NULL,
	"user" varchar,
	id_grupo bigint,
	CONSTRAINT pessoa_pk PRIMARY KEY (id)
);
-- ddl-end --

-- object: exemplo.grupo | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.grupo CASCADE;
CREATE TABLE exemplo.grupo (
	id bigserial NOT NULL,
	nome varchar NOT NULL,
	CONSTRAINT grupo_pk PRIMARY KEY (id)
);
-- ddl-end --

-- object: grupo_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.pessoa DROP CONSTRAINT IF EXISTS grupo_fk CASCADE;
ALTER TABLE exemplo.pessoa ADD CONSTRAINT grupo_fk FOREIGN KEY (id_grupo)
REFERENCES exemplo.grupo (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: grupo_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.galeria DROP CONSTRAINT IF EXISTS grupo_fk CASCADE;
ALTER TABLE exemplo.galeria ADD CONSTRAINT grupo_fk FOREIGN KEY (id_grupo)
REFERENCES exemplo.grupo (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: exemplo.galerias_anexo | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.galerias_anexo CASCADE;
CREATE TABLE exemplo.galerias_anexo (
	id_galeria bigint NOT NULL,
	id_anexo bigserial NOT NULL

);
-- ddl-end --

-- object: pessoa_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.galeria DROP CONSTRAINT IF EXISTS pessoa_fk CASCADE;
ALTER TABLE exemplo.galeria ADD CONSTRAINT pessoa_fk FOREIGN KEY (id_pessoa)
REFERENCES exemplo.pessoa (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: exemplo.anexo_arquivo | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.anexo_arquivo CASCADE;
CREATE TABLE exemplo.anexo_arquivo (
	capa varchar
-- 	id bigint NOT NULL,
-- 	nome_original varchar(200) NOT NULL,
-- 	titulo varchar NOT NULL,
-- 	data_cadastro timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- 	nome varchar NOT NULL,
-- 	descricao text,
-- 	id_caminho_servidor bigint,
-- 	id_tipo bigint,
-- 	id_sugestao_anexo bigint,

)
 INHERITS(exemplo.anexo);
-- ddl-end --

-- object: tipo_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.anexo DROP CONSTRAINT IF EXISTS tipo_fk CASCADE;
ALTER TABLE exemplo.anexo ADD CONSTRAINT tipo_fk FOREIGN KEY (id_tipo)
REFERENCES exemplo.tipo (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: exemplo.anexo_plataforma | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.anexo_plataforma CASCADE;
CREATE TABLE exemplo.anexo_plataforma (
	url text NOT NULL,
	capa varchar(200)
-- 	id bigint NOT NULL,
-- 	nome_original varchar(200) NOT NULL,
-- 	titulo varchar NOT NULL,
-- 	data_cadastro timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- 	nome varchar NOT NULL,
-- 	descricao text,
-- 	id_caminho_servidor bigint,
-- 	id_tipo bigint,
-- 	id_sugestao_anexo bigint,

)
 INHERITS(exemplo.anexo);
-- ddl-end --

-- object: exemplo.sugestao_anexo | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.sugestao_anexo CASCADE;
CREATE TABLE exemplo.sugestao_anexo (
	id bigserial NOT NULL,
	aprovado boolean NOT NULL DEFAULT false,
	nome varchar NOT NULL,
	data_cadastro timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	id_pessoa bigint,
	id_tipo bigint,
	CONSTRAINT anexo_sugestao_pk PRIMARY KEY (id)
);
-- ddl-end --

-- object: pessoa_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.sugestao_anexo DROP CONSTRAINT IF EXISTS pessoa_fk CASCADE;
ALTER TABLE exemplo.sugestao_anexo ADD CONSTRAINT pessoa_fk FOREIGN KEY (id_pessoa)
REFERENCES exemplo.pessoa (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: sugestao_anexo_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.anexo DROP CONSTRAINT IF EXISTS sugestao_anexo_fk CASCADE;
ALTER TABLE exemplo.anexo ADD CONSTRAINT sugestao_anexo_fk FOREIGN KEY (id_sugestao_anexo)
REFERENCES exemplo.sugestao_anexo (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: anexo_uq | type: CONSTRAINT --
-- ALTER TABLE exemplo.anexo DROP CONSTRAINT IF EXISTS anexo_uq CASCADE;
ALTER TABLE exemplo.anexo ADD CONSTRAINT anexo_uq UNIQUE (id_sugestao_anexo);
-- ddl-end --

-- object: tipo_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.sugestao_anexo DROP CONSTRAINT IF EXISTS tipo_fk CASCADE;
ALTER TABLE exemplo.sugestao_anexo ADD CONSTRAINT tipo_fk FOREIGN KEY (id_tipo)
REFERENCES exemplo.tipo (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: exemplo.tags_anexo | type: TABLE --
-- DROP TABLE IF EXISTS exemplo.tags_anexo CASCADE;
CREATE TABLE exemplo.tags_anexo (
	id_anexo bigserial NOT NULL,
	id_tag bigint NOT NULL

);
-- ddl-end --

-- object: tag_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.tags_anexo DROP CONSTRAINT IF EXISTS tag_fk CASCADE;
ALTER TABLE exemplo.tags_anexo ADD CONSTRAINT tag_fk FOREIGN KEY (id_tag)
REFERENCES exemplo.tag (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: anexo_tags_uq | type: CONSTRAINT --
-- ALTER TABLE exemplo.tags_anexo DROP CONSTRAINT IF EXISTS anexo_tags_uq CASCADE;
ALTER TABLE exemplo.tags_anexo ADD CONSTRAINT anexo_tags_uq UNIQUE (id_anexo,id_tag);
-- ddl-end --

-- object: galeria_fk | type: CONSTRAINT --
-- ALTER TABLE exemplo.galerias_anexo DROP CONSTRAINT IF EXISTS galeria_fk CASCADE;
ALTER TABLE exemplo.galerias_anexo ADD CONSTRAINT galeria_fk FOREIGN KEY (id_galeria)
REFERENCES exemplo.galeria (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: galerias_anexo_uq | type: CONSTRAINT --
-- ALTER TABLE exemplo.galerias_anexo DROP CONSTRAINT IF EXISTS galerias_anexo_uq CASCADE;
ALTER TABLE exemplo.galerias_anexo ADD CONSTRAINT galerias_anexo_uq UNIQUE (id_galeria,id_anexo);
-- ddl-end --


