-- Table for General Record
CREATE TABLE GeneralRecord (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    inspectorName VARCHAR(255),
    transformerStatus VARCHAR(50),
    recommendedAction TEXT,
    additionalRemarks TEXT,
    voltageR FLOAT,
    voltageY FLOAT,
    voltageB FLOAT,
    currentR FLOAT,
    currentY FLOAT,
    currentB FLOAT,
    voltageR2 FLOAT,
    voltageY2 FLOAT,
    voltageB2 FLOAT,
    currentR2 FLOAT,
    currentY2 FLOAT,
    currentB2 FLOAT
);

-- Table for Maintenance Record
CREATE TABLE MaintenanceRecord (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    startTime TIME,
    completionTime TIME,
    supervisedBy VARCHAR(255),
    techI VARCHAR(255),
    techII VARCHAR(255),
    techIII VARCHAR(255),
    helpers VARCHAR(255),
    inspectedBy VARCHAR(255),
    inspectedDate DATE,
    rectifiedBy VARCHAR(255),
    rectifiedDate DATE,
    reInspectedBy VARCHAR(255),
    reInspectedDate DATE,
    css1 VARCHAR(255),
    css1Date DATE,
    allSpotsCorrect BOOLEAN,
    css2 VARCHAR(255),
    css2Date DATE
);

-- Table for Work - Data Sheet
CREATE TABLE WorkDataSheet (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gangLeader VARCHAR(255),
    workDate DATE,
    jobStartedTime TIME,
    serialNo VARCHAR(255),
    kva VARCHAR(50),
    make VARCHAR(255),
    tapPosition VARCHAR(50),
    txCtRation VARCHAR(255),
    manufactureYear VARCHAR(4),
    earthResistance FLOAT,
    neutral FLOAT,
    surgeOrBody VARCHAR(50),
    fdsF1 BOOLEAN,
    fdsF1A FLOAT,
    fdsF2 BOOLEAN,
    fdsF2A FLOAT,
    fdsF3 BOOLEAN,
    fdsF3A FLOAT,
    fdsF4 BOOLEAN,
    fdsF4A FLOAT,
    fdsF5 BOOLEAN,
    fdsF5A FLOAT,
    jobCompletedTime TIME,
    workNotes TEXT
);