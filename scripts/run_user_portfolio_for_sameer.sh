 #!/bin/bash

 set -x

 delta=$1

price=`echo "7348000 + $delta" | bc`
 ts-node src/client/main_create_user_portfolio.ts -i 7 -u sameer -n "Sameer Kulkarni" -e sameer@buybak.xyz -p 6306967660 -a "1 infinite loop, Naperville, IL" -s "COST" -f 15 -v $price
 price=`echo "1722800 + $delta" | bc`
 ts-node src/client/main_create_user_portfolio.ts -i 7 -u sameer -n "Sameer Kulkarni" -e sameer@buybak.xyz -p 6306967660 -a "1 infinite loop, Naperville, IL" -s "AAPL" -f 13 -v $price
price=`echo " 1708301 + $delta" | bc`
 ts-node src/client/main_create_user_portfolio.ts -i 7 -u sameer -n "Sameer Kulkarni" -e sameer@buybak.xyz -p 6306967660 -a "1 infinite loop, Naperville, IL" -s "TSLA" -f 21 -v $price
price=`echo " 541900 + $delta" | bc`
 ts-node src/client/main_create_user_portfolio.ts -i 7 -u sameer -n "Sameer Kulkarni" -e sameer@buybak.xyz -p 6306967660 -a "1 infinite loop, Naperville, IL" -s "FUTU" -f 11 -v $price
price=`echo " 907100  + $delta" | bc`
 ts-node src/client/main_create_user_portfolio.ts -i 7 -u sameer -n "Sameer Kulkarni" -e sameer@buybak.xyz -p 6306967660 -a "1 infinite loop, Naperville, IL" -s "SBUX" -f 45 -v $price
price=`echo " 3902800 + $delta" | bc`
 ts-node src/client/main_create_user_portfolio.ts -i 7 -u sameer -n "Sameer Kulkarni" -e sameer@buybak.xyz -p 6306967660 -a "1 infinite loop, Naperville, IL" -s "HD" -f 33 -v $price
price=`echo " 28820400  + $delta" | bc`
 ts-node src/client/main_create_user_portfolio.ts -i 7 -u sameer -n "Sameer Kulkarni" -e sameer@buybak.xyz -p 6306967660 -a "1 infinite loop, Naperville, IL" -s "CMG" -f 21 -v $price
price=`echo " 7706100  + $delta" | bc`
 ts-node src/client/main_create_user_portfolio.ts -i 7 -u sameer -n "Sameer Kulkarni" -e sameer@buybak.xyz -p 6306967660 -a "1 infinite loop, Naperville, IL" -s "LLY" -f 10 -v $price
