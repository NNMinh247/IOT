CREATE DATABASE iot;
USE iot;

CREATE TABLE sensors(
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_sensors(
	id INT AUTO_INCREMENT PRIMARY KEY,
    idss INT NOT NULL,
    value FLOAT NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idss) REFERENCES sensors(id) ON DELETE CASCADE
);

CREATE TABLE devices(
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE action_history(
	id INT AUTO_INCREMENT PRIMARY KEY,
    iddv INT NOT NULL,
    action VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'WAIT',
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (iddv) REFERENCES devices (id) ON DELETE CASCADE
);

INSERT INTO sensors(name)
VALUE('Cảm biến nhiệt độ'),
	('Cảm biến độ ẩm'),
	('Cảm biến ánh sáng');
    
INSERT INTO devices(name)
VALUE('Quạt'),
	('Máy bơm'),
    ('Đèn');
    
SELECT * FROM sensors;
SELECT * FROM devices;
SELECT * FROM data_sensors;
SELECT * FROM action_history;

TRUNCATE TABLE data_sensors;
TRUNCATE TABLE action_history;







select
	date(ds.time) as ngay, count(ds.id) as tong
from data_sensors ds
where ds.idss = 1 and value > 25 and MONTH(ds.time) = MONTH (curdate())
group by date(ds.time)
order by tong desc