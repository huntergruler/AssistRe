Create table Agents (
    userid int auto_increment not null,
    usertype varchar(255) not null,
    firstname varchar(255) not null,
    lastname varchar(255) not null,
    address varchar(255) not null,
    city varchar(255) not null,
    state varchar(255) not null,
    zip varchar(255) not null,
    email varchar(255) not null,
    phonenumber varchar(255) not null,
    emailverified boolean not null,
    userphoto varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    password varchar(255) not null,
    primary key (userid)
);

drop table Buyers
;

CREATE TABLE Buyers (
    userid int NOT NULL AUTO_INCREMENT,
    buyerType varchar(25) NOT NULL,
    firstName varchar(25) NOT NULL,
    lastName varchar(25) NOT NULL,
    address varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    city varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    state varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    zip varchar(5) NOT NULL,
    email varchar(30) NOT NULL,
    phoneNumber varchar(15) NOT NULL,
    propertyType varchar(25) NOT NULL,
    bedrooms_min int NOT NULL DEFAULT 0,
    bedrooms_max int NOT NULL DEFAULT 0,
    bathrooms_min int NOT NULL DEFAULT 0,
    bathrooms_max int NOT NULL DEFAULT 0,
    squareFootage_min int NOT NULL DEFAULT 0,
    squareFootage_max int NOT NULL DEFAULT 0,
    price_min int NOT NULL DEFAULT 0,
    price_max int NOT NULL DEFAULT 0,
    timeFrame varchar(25) NOT NULL,
    prequalified tinyint(1) NOT NULL,
    prequalifiedFile varchar(255) DEFAULT NULL,
    emailverified tinyint(1) NOT NULL,
    verificationtoken varchar(50) DEFAULT NULL,
    userPhoto varchar(255) NOT NULL,
    preferredLanguages varchar(100) DEFAULT NULL,
    entrytimestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatetimestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    password varchar(255) NOT NULL,
    lastlogin timestamp NULL DEFAULT NULL,
    resettoken varchar(50) DEFAULT NULL,
    resettokenexpire timestamp NULL DEFAULT NULL,
    PRIMARY KEY (userid),
    UNIQUE KEY email (email)
) ENGINE = InnoDB AUTO_INCREMENT = 1000000001 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

create table UserTypes (
    usertypeid int auto_increment not null,
    usertype varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (usertypeid)
);

insert into
    UserTypes (
        usertype,
        entrytimestamp,
        updatetimestamp
    )
values ('Buyer', now(), now());

insert into
    UserTypes (
        usertype,
        entrytimestamp,
        updatetimestamp
    )
values ('Seller', now(), now());

insert into
    UserTypes (
        usertype,
        entrytimestamp,
        updatetimestamp
    )
values ('Agent', now(), now());

create table BuyerRequestDetails (
    buyerrequestid int auto_increment not null,
    userid int not null,
    propertytype varchar(255) not null,
    minprice decimal(10, 2) not null,
    maxprice decimal(10, 2) not null,
    minbedrooms int not null,
    maxbedrooms int not null,
    minbathrooms int not null,
    maxbathrooms int not null,
    minsqft int not null,
    maxsqft int not null,
    onlycommisionedproperties boolean not null,
    propertydesc varchar(255) not null,
    levelofservice varchar(255) not null,
    prequalified boolean not null,
    prequalifiedamount varchar(255) not null,
    prequalletter BLOB null,
    purchasetimeline varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (buyerrequestid),
    foreign key (userid) references Agents (userid)
);

create table PurchaseTimeLineTypes (
    purchasetimelineid int auto_increment not null,
    purchasetimeline varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (purchasetimelineid)
);

Insert into
    PurchaseTimeLineTypes (
        purchasetimeline,
        entrytimestamp,
        updatetimestamp
    )
values ('Immediate', now(), now());

Insert into
    PurchaseTimeLineTypes (
        purchasetimeline,
        entrytimestamp,
        updatetimestamp
    )
values ('1-3 Months', now(), now());

Insert into
    PurchaseTimeLineTypes (
        purchasetimeline,
        entrytimestamp,
        updatetimestamp
    )
values ('3-6 Months', now(), now());

Insert into
    PurchaseTimeLineTypes (
        purchasetimeline,
        entrytimestamp,
        updatetimestamp
    )
values ('6-12 Months', now(), now());

Insert into
    PurchaseTimeLineTypes (
        purchasetimeline,
        entrytimestamp,
        updatetimestamp
    )
values ('Other', now(), now());

create table PropertyTypes (
    propertytypeid int auto_increment not null,
    propertytype varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (propertytypeid)
);

Insert into
    PropertyTypes (
        propertytype,
        entrytimestamp,
        updatetimestamp
    )
values ('Single Family', now(), now());

Insert into
    PropertyTypes (
        propertytype,
        entrytimestamp,
        updatetimestamp
    )
values ('Condo', now(), now());

Insert into
    PropertyTypes (
        propertytype,
        entrytimestamp,
        updatetimestamp
    )
values ('Townhouse', now(), now());

Insert into
    PropertyTypes (
        propertytype,
        entrytimestamp,
        updatetimestamp
    )
values ('Multi Family', now(), now());

Insert into
    PropertyTypes (
        propertytype,
        entrytimestamp,
        updatetimestamp
    )
values ('Land', now(), now());

Insert into
    PropertyTypes (
        propertytype,
        entrytimestamp,
        updatetimestamp
    )
values ('Commercial', now(), now());

Insert into
    PropertyTypes (
        propertytype,
        entrytimestamp,
        updatetimestamp
    )
values ('Rental', now(), now());

Insert into
    PropertyTypes (
        propertytype,
        entrytimestamp,
        updatetimestamp
    )
values ('Other', now(), now());

create table LevelsOfService (
    levelofserviceid int auto_increment not null,
    levelofservice varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (levelofserviceid)
);

Insert into
    LevelsOfService (
        levelofservice,
        entrytimestamp,
        updatetimestamp
    )
values (
        'Full Service - Flat Fee',
        now(),
        now()
    );

Insert into
    LevelsOfService (
        levelofservice,
        entrytimestamp,
        updatetimestamp
    )
values (
        'Full Service - Percentage Fee',
        now(),
        now()
    );

Insert into
    LevelsOfService (
        levelofservice,
        entrytimestamp,
        updatetimestamp
    )
values (
        'Partial Service - Flat Fee',
        now(),
        now()
    );

Insert into
    LevelsOfService (
        levelofservice,
        entrytimestamp,
        updatetimestamp
    )
values (
        'Partial Service - Percentage Fee',
        now(),
        now()
    );

Insert into
    LevelsOfService (
        levelofservice,
        entrytimestamp,
        updatetimestamp
    )
values (
        'Contract Assistance Only - Flat Fee',
        now(),
        now()
    );

Insert into
    LevelsOfService (
        levelofservice,
        entrytimestamp,
        updatetimestamp
    )
values ('Other', now(), now());

create table BuyerPropertyURLs (
    buyerpropertyurlid int auto_increment not null,
    userid int not null,
    propertyurl varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (buyerpropertyurlid),
    foreign key (userid) references Agents (userid)
);

create table AgentReviews (
    agentreviewid int auto_increment not null,
    userid int not null,
    reviewdate date not null,
    reviewrating int not null,
    reviewcomment varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentreviewid),
    foreign key (userid) references Agents (userid)
);

create table SeekingAgentReviews (
    seekingagentreviewid int auto_increment not null,
    userid int not null,
    reviewdate date not null,
    reviewrating int not null,
    reviewcomment varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (seekingagentreviewid),
    foreign key (userid) references Agents (userid)
);

create table AgentMLSs (
    agentmlsid int auto_increment not null,
    userid int not null,
    mlsname varchar(255) not null,
    mlsnumber varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentmlsid),
    foreign key (userid) references Agents (userid)
);

CREATE table AgentTransactionHistory (
    agenttransactionid int auto_increment not null,
    userid int not null,
    transactiondate date not null,
    transactiontype varchar(255) not null,
    transactionamount decimal(10, 2) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agenttransactionid),
    foreign key (userid) references Agents (userid)
);

Create table AgentLicenseInfo (
    agentlicenseid int auto_increment not null,
    userid int not null,
    licensestate varchar(255) not null,
    licensenumber varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentlicenseid),
    foreign key (userid) references Agents (userid)
);

create table AgentOffices (
    agentofficeid int auto_increment not null,
    userid int not null,
    officename varchar(255) not null,
    officelicense varchar(255) not null,
    address varchar(255) not null,
    city varchar(255) not null,
    state varchar(255) not null,
    zip varchar(255) not null,
    phonenumber varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentofficeid),
    foreign key (userid) references Agents (userid)
);

Create table AgentApprovedBuyerForms (
    agentapprovedbuyerformid int auto_increment not null,
    userid int not null,
    formname varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentapprovedbuyerformid),
    foreign key (userid) references Agents (userid)
);

Create table AgentZipCodes (
    userzipcodeid int auto_increment not null,
    userid int not null,
    zipcode varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (userzipcodeid),
    foreign key (userid) references Agents (userid)
);

Create table ZipCodes (
    zipcodeid int auto_increment not null,
    zipcode varchar(255) not null,
    city varchar(255) not null,
    state varchar(255) not null,
    county varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (zipcodeid)
);

Create table AgentOffers (
    agentofferid int auto_increment not null,
    buyerrequestid int not null,
    buyerid int not null,
    agentid int not null,
    offertype varchar(255) not null,
    levelofservice varchar(255) not null,
    compensationtype varchar(255) not null,
    compensationamount decimal(10, 2) not null,
    retainerfee decimal(10, 2) not null,
    retainercredited boolean not null,
    lengthofservice varchar(255) not null,
    expirationcompensation decimal(10, 2) not null,
    expirationcomptimeframe varchar(255) not null,
    offerdesc varchar(1000) not null,
    offertimestamp timestamp not null,
    offerstatus varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentofferid),
    foreign key (buyerid) references Agents (userid),
    foreign key (agentid) references Agents (userid)
);

create table OfferTypes (
    offertypeid int auto_increment not null,
    offertype varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (offertypeid)
);

Insert into
    OfferTypes (
        offertype,
        entrytimestamp,
        updatetimestamp
    )
values ('Exclusive', now(), now());

Insert into
    OfferTypes (
        offertype,
        entrytimestamp,
        updatetimestamp
    )
values ('Non-Exclusive', now(), now());

create table CompensationTypes (
    compensationtypeid int auto_increment not null,
    compensationtype varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (compensationtypeid)
);

insert into
    CompensationTypes (
        compensationtype,
        entrytimestamp,
        updatetimestamp
    )
values ('Flat Fee', now(), now());

insert into
    CompensationTypes (
        compensationtype,
        entrytimestamp,
        updatetimestamp
    )
values (
        'Percentage of Sale Price',
        now(),
        now()
    );

insert into
    CompensationTypes (
        compensationtype,
        entrytimestamp,
        updatetimestamp
    )
values ('Hourly', now(), now());

insert into
    CompensationTypes (
        compensationtype,
        entrytimestamp,
        updatetimestamp
    )
values ('Other', now(), now());

create table OfferStatus (
    offerstatusid int auto_increment not null,
    offerstatus varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (offerstatusid)
);

insert into
    OfferStatus (
        offerstatus,
        entrytimestamp,
        updatetimestamp
    )
values ('Accepted', now(), now());

insert into
    OfferStatus (
        offerstatus,
        entrytimestamp,
        updatetimestamp
    )
values ('Declined', now(), now());

insert into
    OfferStatus (
        offerstatus,
        entrytimestamp,
        updatetimestamp
    )
values ('Expired', now(), now());

insert into
    OfferStatus (
        offerstatus,
        entrytimestamp,
        updatetimestamp
    )
values ('Submitted', now(), now());

CREATE TABLE `AgentDetails` (
  `userid` int NOT NULL AUTO_INCREMENT,
  `userphoto` varchar(255) NOT NULL,
  `languages` varchar(200) DEFAULT NULL,
  `bio` text,
  `entrytimestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatetimestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userid`),
  KEY `email` (`email`)
) ENGINE=InnoDB
;

CREATE TABLE `BuyerTypes` (
    buyerTypeId INT PRIMARY KEY AUTO_INCREMENT,
    buyerType VARCHAR(255) NOT NULL
    entrytimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    updatedtimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
    ENGINE=InnoDB DEFAULT CHARSET=utf8;


delimiter ;;
create trigger seekingagents.update_BuyerTypes
BEFORE UPDATE on seekingagents.BuyerTypes
for each row BEGIN
    SET NEW.updatetimestamp = CURRENT_TIMESTAMP;
end
;;
delimiter ;


delimiter ;;
create trigger seekingagents.update_Buyers
BEFORE UPDATE on seekingagents.Buyers
for each row BEGIN
    SET NEW.updatetimestamp = CURRENT_TIMESTAMP;
end
;;
delimiter ;

