Create table Users
(
    userid       int auto_increment not null,
    usertype      varchar(255) not null,
    firstname     varchar(255) not null,
    lastname      varchar(255) not null,
    address       varchar(255) not null,
    city          varchar(255) not null,
    state         varchar(255) not null,
    zip           varchar(255) not null,
    email         varchar(255) not null,
    phonenumber   varchar(255) not null,
    username      varchar(255) not null,
    emailverified boolean      not null, 
    userphoto     varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    password varchar(255) not null,
    primary key (userid)
);

create table BuyerRequestDetails
(
    buyerrequestid int auto_increment not null,
    userid         int not null,
    propertytype   varchar(255) not null,
    minprice       decimal(10,2) not null,
    maxprice       decimal(10,2) not null,
    minbedrooms    int not null,
    maxbedrooms    int not null,
    minbathrooms   int not null,
    maxbathrooms   int not null,
    minsqft        int not null,
    maxsqft        int not null,
    prequalified   boolean not null,
    purchasetimeline varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (buyerrequestid),
    foreign key (userid) references Users(userid)
);

create table AgentReviews
(
    agentreviewid int auto_increment not null,
    userid        int not null,
    reviewdate    date not null,
    reviewrating  int not null,
    reviewcomment varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentreviewid),
    foreign key (userid) references Users(userid)
);

create table SeekingAgentReviews
(
    seekingagentreviewid int auto_increment not null,
    userid               int not null,
    reviewdate           date not null,
    reviewrating         int not null,
    reviewcomment        varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (seekingagentreviewid),
    foreign key (userid) references Users(userid)
);

create table AgentMLSs
(
    agentmlsid int auto_increment not null,
    userid     int not null,
    mlsname    varchar(255) not null,
    mlsnumber  varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentmlsid),
    foreign key (userid) references Users(userid)
);

CREATE table AgentTransactionHistory
(
    agenttransactionid int auto_increment not null,
    userid             int not null,
    transactiondate    date not null,
    transactiontype    varchar(255) not null,
    transactionamount  decimal(10,2) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agenttransactionid),
    foreign key (userid) references Users(userid)
);



Create table AgentLicenseInfo
(
    agentlicenseid int auto_increment not null,
    userid         int not null,
    licensestate   varchar(255) not null,
    licensenumber  varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentlicenseid),
    foreign key (userid) references Users(userid)
);

create table AgentOffices
(
    agentofficeid int auto_increment not null,
    userid       int not null,
    officename   varchar(255) not null,
    officelicense varchar(255) not null,
    address      varchar(255) not null,
    city         varchar(255) not null,
    state        varchar(255) not null,
    zip          varchar(255) not null,
    phonenumber  varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentofficeid),
    foreign key (userid) references Users(userid)
);

Create table AgentApprovedBuyerForms
(
    agentapprovedbuyerformid int auto_increment not null,
    userid                   int not null,
    formname                 varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not not null,
    primary key (agentapprovedbuyerformid),
    foreign key (userid) references Users(userid)
);


Create table UserZipCodes
(
    userzipcodeid int auto_increment not null,
    userid         int not null,
    zipcode        varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (userzipcodeid),
    foreign key (userid) references Users(userid)
);

Create table ZipCodes
(
    zipcodeid int auto_increment not null,
    zipcode   varchar(255) not null,
    city      varchar(255) not null,
    state     varchar(255) not null,
    county    varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (zipcodeid)
);

Create table Agent