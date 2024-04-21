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
    onlycommisionedproperties boolean not null,
    propertydesc   varchar(255) not null,
    levelofservice varchar(255) not null,
    prequalified   boolean not null,
    prequalifiedamount varchar(255) not null,
    prequalletter  BLOB null,
    purchasetimeline varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (buyerrequestid),
    foreign key (userid) references Users(userid)
);
create table PurchaseTimeLineTypes
(
    purchasetimelineid int auto_increment not null,
    purchasetimeline   varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (purchasetimelineid)
);

Insert into PurchaseTimeLineTypes (purchasetimeline, entrytimestamp, updatetimestamp) values ('Immediate', now(), now());
Insert into PurchaseTimeLineTypes (purchasetimeline, entrytimestamp, updatetimestamp) values ('1-3 Months', now(), now());
Insert into PurchaseTimeLineTypes (purchasetimeline, entrytimestamp, updatetimestamp) values ('3-6 Months', now(), now());
Insert into PurchaseTimeLineTypes (purchasetimeline, entrytimestamp, updatetimestamp) values ('6-12 Months', now(), now());
Insert into PurchaseTimeLineTypes (purchasetimeline, entrytimestamp, updatetimestamp) values ('Other', now(), now());


create table PropertyTypes
(
    propertytypeid int auto_increment not null,
    propertytype   varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (propertytypeid)
);

Insert into PropertyTypes (propertytype, entrytimestamp, updatetimestamp) values ('Single Family', now(), now());
Insert into PropertyTypes (propertytype, entrytimestamp, updatetimestamp) values ('Condo', now(), now());
Insert into PropertyTypes (propertytype, entrytimestamp, updatetimestamp) values ('Townhouse', now(), now());
Insert into PropertyTypes (propertytype, entrytimestamp, updatetimestamp) values ('Multi Family', now(), now());
Insert into PropertyTypes (propertytype, entrytimestamp, updatetimestamp) values ('Land', now(), now());
Insert into PropertyTypes (propertytype, entrytimestamp, updatetimestamp) values ('Commercial', now(), now());
Insert into PropertyTypes (propertytype, entrytimestamp, updatetimestamp) values ('Rental', now(), now());
Insert into PropertyTypes (propertytype, entrytimestamp, updatetimestamp) values ('Other', now(), now());

create table LevelsOfService
(
    levelofserviceid int auto_increment not null,
    levelofservice   varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (levelofserviceid)
);

Insert into LevelsOfService (levelofservice, entrytimestamp, updatetimestamp) values ('Full Service - Flat Fee', now(), now());
Insert into LevelsOfService (levelofservice, entrytimestamp, updatetimestamp) values ('Full Service - Percentage Fee', now(), now());
Insert into LevelsOfService (levelofservice, entrytimestamp, updatetimestamp) values ('Partial Service - Flat Fee', now(), now());
Insert into LevelsOfService (levelofservice, entrytimestamp, updatetimestamp) values ('Partial Service - Percentage Fee', now(), now());
Insert into LevelsOfService (levelofservice, entrytimestamp, updatetimestamp) values ('Contract Assistance Only - Flat Fee', now(), now());
Insert into LevelsOfService (levelofservice, entrytimestamp, updatetimestamp) values ('Other', now(), now());


create table BuyerPropertyURLs
(
    buyerpropertyurlid int auto_increment not null,
    userid             int not null,
    propertyurl        varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (buyerpropertyurlid),
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

Create table AgentOffers
(
    agentofferid int auto_increment not null,
    userid       int not null,
    offertype    varchar(255) not null,
    levelofservice varchar(255) not null,
    compensationtype varchar(255) not null,
    compensationamount decimal(10, 2) not null,
    retainerfee decimal(10, 2) not null,
    retainercredited boolean not null,
    lengthofservice varchar(255) not null,
    offerdesc varchar(1000) not null,
    offertimestamp    timestamp not null,
    offerstatus  varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (agentofferid),
    foreign key (userid) references Users(userid)
);

create table offertypes
(
    offertypeid int auto_increment not null,
    offertype   varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (offertypeid)
);

Insert into offertypes (offertype, entrytimestamp, updatetimestamp) values ('Exclusive', now(), now());
Insert into offertypes (offertype, entrytimestamp, updatetimestamp) values ('Non-Exclusive', now(), now());

create table compensationtypes
(
    compensationtypeid int auto_increment not null,
    compensationtype   varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (compensationtypeid)
);

insert into compensationtypes (compensationtype, entrytimestamp, updatetimestamp) values ('Flat Fee', now(), now());
insert into compensationtypes (compensationtype, entrytimestamp, updatetimestamp) values ('Percentage of Sale Price', now(), now());
insert into compensationtypes (compensationtype, entrytimestamp, updatetimestamp) values ('Hourly', now(), now());
insert into compensationtypes (compensationtype, entrytimestamp, updatetimestamp) values ('Other', now(), now());

create table offerstatus
(
    offerstatusid int auto_increment not null,
    offerstatus   varchar(255) not null,
    entrytimestamp timestamp not null,
    updatetimestamp timestamp not null,
    primary key (offerstatusid)
);

insert into offerstatus (offerstatus, entrytimestamp, updatetimestamp) values ('Accepted', now(), now());
insert into offerstatus (offerstatus, entrytimestamp, updatetimestamp) values ('Declined', now(), now());
insert into offerstatus (offerstatus, entrytimestamp, updatetimestamp) values ('Expired', now(), now());
insert into offerstatus (offerstatus, entrytimestamp, updatetimestamp) values ('Submitted', now(), now());

