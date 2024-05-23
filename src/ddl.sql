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

