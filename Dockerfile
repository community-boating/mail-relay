FROM node:16
WORKDIR /app
COPY . .
RUN npm install
RUN cp private.ini.template private.ini
CMD sed -i 's%\$CBI_AUTH_TOKEN\$%'"$CBI_AUTH_TOKEN"'%' private.ini && \
sed -i 's%\$SENDGRID_TOKEN\$%'"$SENDGRID_TOKEN"'%' private.ini && \
sed -i 's%\$DB_HOST\$%'"$DB_HOST"'%' private.ini && \
sed -i 's%\$DB_SCHEMA\$%'"$DB_SCHEMA"'%' private.ini && \
sed -i 's%\$DB_USER\$%'"$DB_USER"'%' private.ini && \
sed -i 's%\$DB_PASSWORD\$%'"$DB_PASSWORD"'%' private.ini && \
exec node ./src/relay.js