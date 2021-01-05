CREATE DATABASE biblioteca_grupog;

USE biblioteca_grupog;

--Tabla Persona
CREATE TABLE persona(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    alias VARCHAR(50)
);

-- Tabla Libro
CREATE TABLE libro(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    categoria_id INT NOT NULL,
    persona_id INT,
    CONSTRAINT fk_persona FOREIGN KEY (persona_id) REFERENCES persona(id),
    CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);

-- Tabla Categoria
CREATE TABLE categoria(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

