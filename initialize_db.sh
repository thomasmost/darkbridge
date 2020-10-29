FILE=.env
if [ -f "$FILE" ]; then
    echo "$FILE exists."
    export $(cat .env | xargs)
fi
mysql -h $MYSQL_HOST --port=$MYSQL_PORT -u $MYSQL_USERNAME -p$MYSQL_PASSWORD -e "create schema demodb"
cat demodb.sql | mysql -h $MYSQL_HOST --port=$MYSQL_PORT -u $MYSQL_USERNAME -p$MYSQL_PASSWORD demodb
